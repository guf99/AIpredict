/**
 * VOLIX AI Prediction Engine
 * Combines Polymarket + Kalshi data to generate trading signals
 * Uses statistical analysis and weighted odds for predictions
 */

class VOLIXPredictionEngine {
    constructor() {
        this.polymarketData = [];
        this.kalshiData = [];
        this.predictions = new Map();
        this.minConfidence = 0.55; // 55% minimum confidence threshold
    }

    /**
     * Initialize engine with market data
     * @param {Array} polymarketMarkets - Polymarket markets
     * @param {Array} kalshiMarkets - Kalshi markets
     */
    initialize(polymarketMarkets = [], kalshiMarkets = []) {
        this.polymarketData = polymarketMarkets;
        this.kalshiData = kalshiMarkets;
        this.predictions.clear();
        console.log(`VOLIX Engine initialized: ${polymarketMarkets.length} Polymarket + ${kalshiMarkets.length} Kalshi markets`);
    }

    /**
     * Parse probability from outcomes
     * @param {Array} outcomes - Outcome names
     * @param {Array} prices - Outcome prices (0-1 range)
     * @returns {Object} {yes: number, no: number}
     */
    parseProbabilities(outcomes, prices) {
        const probs = {
            yes: 0.5,
            no: 0.5,
        };

        if (!Array.isArray(prices) || prices.length < 2) {
            return probs;
        }

        try {
            const p1 = parseFloat(prices[0]) || 0.5;
            const p2 = parseFloat(prices[1]) || 0.5;

            probs.yes = Math.min(Math.max(p1, 0), 1);
            probs.no = Math.min(Math.max(p2, 0), 1);
        } catch (e) {
            console.error('Error parsing probabilities:', e);
        }

        return probs;
    }

    /**
     * Calculate weighted odds from multiple platforms
     * @param {Object} polyProbs - Polymarket probabilities
     * @param {Object} kalshiProbs - Kalshi probabilities
     * @param {Object} volumes - Platform volumes for weighting
     * @returns {Object} Weighted probabilities
     */
    calculateWeightedOdds(polyProbs, kalshiProbs, volumes = {}) {
        const polyWeight = (volumes.poly || 1000) / ((volumes.poly || 1000) + (volumes.kalshi || 1000));
        const kalshiWeight = 1 - polyWeight;

        return {
            yes: (polyProbs.yes * polyWeight) + (kalshiProbs.yes * kalshiWeight),
            no: (polyProbs.no * polyWeight) + (kalshiProbs.no * kalshiWeight),
        };
    }

    /**
     * Detect arbitrage opportunities between platforms
     * @param {Object} polyProbs - Polymarket probabilities
     * @param {Object} kalshiProbs - Kalshi probabilities
     * @returns {Object} Arbitrage data
     */
    detectArbitrage(polyProbs, kalshiProbs) {
        const yesDiff = Math.abs(polyProbs.yes - kalshiProbs.yes);
        const noDiff = Math.abs(polyProbs.no - kalshiProbs.no);
        const maxDiff = Math.max(yesDiff, noDiff);

        return {
            detected: maxDiff > 0.05, // 5% threshold
            yesDifference: yesDiff,
            noDifference: noDiff,
            maxDifference: maxDiff,
            opportunity: maxDiff > 0.15 ? 'high' : (maxDiff > 0.08 ? 'medium' : 'low'),
        };
    }

    /**
     * Calculate momentum based on volume and price movement
     * @param {Object} market - Market data
     * @returns {number} Momentum score (-1 to 1)
     */
    calculateMomentum(market) {
        try {
            const volume = Number(market.volumeNum || market.volume || 0);
            const liquidity = Number(market.liquidityNum || market.liquidity || 0);
            const volumeLiquidityRatio = volume > 0 ? liquidity / volume : 0;

            // High volume + good liquidity = strong momentum
            const volumeScore = Math.min(volume / 10000000, 1); // Normalize to 10M volume max
            const liquidityScore = Math.min(volumeLiquidityRatio, 0.5); // Normalize liquidity ratio

            return (volumeScore * 0.6) + (liquidityScore * 0.4);
        } catch (e) {
            return 0;
        }
    }

    /**
     * Generate VOLIX AI signal for a market
     * @param {String} marketId - Market identifier
     * @param {Object} market - Market data
     * @param {Object} polyProbs - Polymarket probabilities
     * @param {Object} kalshiProbs - Kalshi probabilities
     * @returns {Object} VOLIX prediction signal
     */
    generateSignal(marketId, market, polyProbs, kalshiProbs) {
        // Calculate weighted odds
        const weighted = this.calculateWeightedOdds(polyProbs, kalshiProbs, {
            poly: market.volumeNum || 1000,
            kalshi: market.volumeNum || 1000,
        });

        // Detect arbitrage
        const arbitrage = this.detectArbitrage(polyProbs, kalshiProbs);

        // Calculate momentum
        const momentum = this.calculateMomentum(market);

        // Get raw probability from market
        const yesProbability = weighted.yes;
        
        // Calculate confidence (distance from 50% = certainty)
        const rawConfidence = Math.abs(yesProbability - 0.5) * 2; // 0 to 1
        
        // Apply momentum multiplier
        const adjustedConfidence = rawConfidence * (0.5 + momentum * 0.5);
        
        // Convert to 0-100 scale and ensure reasonable bounds
        const confidencePercent = Math.round(adjustedConfidence * 100);
        const finalConfidence = Math.max(10, Math.min(95, confidencePercent)); // 10-95% range

        // Determine signal based on probability
        let signal = 'HOLD';
        let recommendation = 'NEUTRAL';

        if (yesProbability > 0.65) {
            signal = 'BUY_YES';
            recommendation = 'STRONG_BUY';
        } else if (yesProbability > 0.58) {
            signal = 'BUY_YES';
            recommendation = 'BUY';
        } else if (yesProbability < 0.35) {
            signal = 'BUY_NO';
            recommendation = 'STRONG_BUY';
        } else if (yesProbability < 0.42) {
            signal = 'BUY_NO';
            recommendation = 'BUY';
        }

        // Check for arbitrage signal
        if (arbitrage.detected && arbitrage.opportunity === 'high') {
            signal = 'ARBITRAGE';
            recommendation = 'ARBITRAGE_OPPORTUNITY';
        }

        // Calculate risk level
        const riskLevel = this.calculateRiskLevel(market, arbitrage, finalConfidence / 100);

        const prediction = {
            marketId,
            question: market.question || market.title,
            timestamp: new Date().toISOString(),
            
            // Core prediction
            signal,
            recommendation,
            yesProbability: yesProbability,
            noProbability: (1 - yesProbability),
            confidence: finalConfidence, // 0-100
            
            // Risk & metrics
            riskLevel,
            momentum: momentum,
            
            // Platform data
            platforms: {
                polymarket: {
                    yes: polyProbs.yes,
                    no: polyProbs.no,
                },
                kalshi: {
                    yes: kalshiProbs.yes,
                    no: kalshiProbs.no,
                },
            },
            
            // Arbitrage info
            arbitrage: {
                detected: arbitrage.detected,
                opportunity: arbitrage.opportunity,
                yesDifference: arbitrage.yesDifference,
                noDifference: arbitrage.noDifference,
            },
        };

        return prediction;
    }

    /**
     * Calculate risk level
     * @param {Object} market - Market data
     * @param {Object} arbitrage - Arbitrage data
     * @param {number} confidence - Confidence score
     * @returns {string} Risk level
     */
    calculateRiskLevel(market, arbitrage, confidence) {
        let risk = 'MEDIUM';
        
        const volume = Number(market.volumeNum || 0);
        const liquidity = Number(market.liquidityNum || 0);
        
        // Volume & liquidity assessment
        if (volume < 500000 || liquidity < 50000) {
            risk = 'HIGH'; // Low liquidity = high risk
        } else if (volume > 5000000 && liquidity > 1000000) {
            risk = 'LOW'; // High volume and liquidity = low risk
        }

        // Arbitrage increases risk
        if (arbitrage && arbitrage.opportunity === 'high') {
            risk = risk === 'LOW' ? 'MEDIUM' : 'HIGH';
        }

        // High confidence reduces risk
        if (confidence > 0.75) {
            risk = risk === 'HIGH' ? 'MEDIUM' : 'LOW';
        } else if (confidence < 0.55) {
            // Low confidence increases risk
            risk = 'HIGH';
        }

        return risk;
    }

    /**
     * Calculate potential return
     * @param {Object} market - Market data
     * @returns {number} Potential return percentage
     */
    calculatePotentialReturn(market) {
        const volume = Number(market.volumeNum || 0);
        const liquidity = Number(market.liquidityNum || 0);
        
        // Higher volume and lower liquidity = better returns
        if (volume === 0 || liquidity === 0) return 0;
        
        const ratio = Math.min(volume / liquidity, 10);
        return Math.max(5, Math.min(50, ratio * 10));
    }

    /**
     * Process all markets and generate predictions
     * @returns {Array} Array of predictions
     */
    processAllMarkets() {
        const predictions = [];

        // Match Polymarket and Kalshi markets by similarity
        for (const polyMarket of this.polymarketData) {
            try {
                const kalshiMatch = this.findMatchingMarket(polyMarket, this.kalshiData);
                
                const polyProbs = this.parseProbabilities(
                    polyMarket.outcomes,
                    polyMarket.outcomePrices
                );

                const kalshiProbs = kalshiMatch 
                    ? this.parseProbabilities(kalshiMatch.outcomes, kalshiMatch.outcomePrices)
                    : polyProbs; // Fallback to Polymarket data if no Kalshi match

                const marketId = `${polyMarket.slug || 'market'}_${Math.random().toString(36).substr(2, 9)}`;
                
                const prediction = this.generateSignal(
                    marketId,
                    polyMarket,
                    polyProbs,
                    kalshiProbs
                );

                // Add market question to prediction for matching
                prediction.question = polyMarket.question || polyMarket.title || '';
                prediction.marketId = polyMarket.slug || marketId;
                
                predictions.push(prediction);
            } catch (e) {
                console.error('Error processing market:', e);
            }
        }

        return predictions;
    }

    /**
     * Find matching market between platforms
     * @param {Object} market - Market to find match for
     * @param {Array} markets - Markets to search in
     * @returns {Object|null} Matching market or null
     */
    findMatchingMarket(market, markets) {
        const questionLower = (market.question || market.title || '').toLowerCase();
        
        return markets.find(m => {
            const mQuestionLower = (m.question || m.title || '').toLowerCase();
            // Simple similarity check
            return mQuestionLower.includes(questionLower.substring(0, 30)) ||
                   questionLower.includes(mQuestionLower.substring(0, 30));
        }) || null;
    }

    /**
     * Get predictions filtered by criteria
     * @param {Object} criteria - Filter criteria {minConfidence, riskLevel, signal, etc}
     * @returns {Array} Filtered predictions
     */
    getPredictions(criteria = {}) {
        let predictions = Array.from(this.predictions.values());

        if (criteria.minConfidence) {
            predictions = predictions.filter(p => p.confidence >= criteria.minConfidence);
        }

        if (criteria.riskLevel) {
            predictions = predictions.filter(p => p.riskLevel === criteria.riskLevel);
        }

        if (criteria.signal) {
            predictions = predictions.filter(p => p.signal === criteria.signal);
        }

        if (criteria.recommendation) {
            predictions = predictions.filter(p => p.recommendation === criteria.recommendation);
        }

        return predictions;
    }

    /**
     * Get top predictions sorted by confidence
     * @param {number} limit - Number of predictions to return
     * @returns {Array} Top predictions
     */
    getTopPredictions(limit = 10) {
        return Array.from(this.predictions.values())
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, limit);
    }

    /**
     * Get statistics about all predictions
     * @returns {Object} Statistics
     */
    getStatistics() {
        const predictions = Array.from(this.predictions.values());
        
        if (predictions.length === 0) {
            return { totalPredictions: 0, averageConfidence: 0 };
        }

        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
        const signalCounts = {};
        const riskCounts = {};

        predictions.forEach(p => {
            signalCounts[p.signal] = (signalCounts[p.signal] || 0) + 1;
            riskCounts[p.riskLevel] = (riskCounts[p.riskLevel] || 0) + 1;
        });

        return {
            totalPredictions: predictions.length,
            averageConfidence: parseFloat(avgConfidence.toFixed(4)),
            signalDistribution: signalCounts,
            riskDistribution: riskCounts,
            topPredictions: this.getTopPredictions(5),
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VOLIXPredictionEngine;
}
