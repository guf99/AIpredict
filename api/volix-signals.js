/**
 * VOLIX AI Predictions API Endpoint
 * Serves VOLIX AI signals combined from Polymarket and Kalshi
 */

const fs = require('fs');
const path = require('path');

// Try to require market integration if available
let marketIntegration = null;
try {
    marketIntegration = require('./market-integration');
} catch (e) {
    console.log('Market integration module not available');
}

// Mock prediction data fallback
const mockPredictions = [
    {
        id: 'btc-100k',
        question: 'Will Bitcoin reach $100,000?',
        platform: 'polymarket+kalshi',
        signal: 'STRONG_BUY',
        recommendation: 'BUY',
        confidence: 0.82,
        yesProbability: 0.78,
        noProbability: 0.22,
        riskLevel: 'LOW',
        volume: 12500000,
        liquidity: 3750000,
        arbitrage: {
            detected: true,
            yesDiff: 0.08,
            noDiff: 0.08,
            opportunity: 'medium'
        },
        platforms: {
            polymarket: { yes: 0.75, no: 0.25 },
            kalshi: { yes: 0.81, no: 0.19 }
        },
        category: 'Crypto',
        timestamp: new Date().toISOString(),
        potentialReturn: 35.5
    },
    {
        id: 'ethereum-next-quarter',
        question: 'Will Ethereum outperform Bitcoin next quarter?',
        platform: 'polymarket+kalshi',
        signal: 'BUY_YES',
        recommendation: 'BUY',
        confidence: 0.68,
        yesProbability: 0.62,
        noProbability: 0.38,
        riskLevel: 'MEDIUM',
        volume: 8300000,
        liquidity: 2490000,
        arbitrage: {
            detected: false,
            yesDiff: 0.03,
            noDiff: 0.03,
            opportunity: 'low'
        },
        platforms: {
            polymarket: { yes: 0.61, no: 0.39 },
            kalshi: { yes: 0.63, no: 0.37 }
        },
        category: 'Crypto',
        timestamp: new Date().toISOString(),
        potentialReturn: 22.3
    },
    {
        id: 'fed-rate-decision',
        question: 'Will the Fed cut rates in February?',
        platform: 'polymarket+kalshi',
        signal: 'BUY_NO',
        recommendation: 'BUY',
        confidence: 0.71,
        yesProbability: 0.35,
        noProbability: 0.65,
        riskLevel: 'MEDIUM',
        volume: 15200000,
        liquidity: 4560000,
        arbitrage: {
            detected: true,
            yesDiff: 0.12,
            noDiff: 0.12,
            opportunity: 'high'
        },
        platforms: {
            polymarket: { yes: 0.32, no: 0.68 },
            kalshi: { yes: 0.38, no: 0.62 }
        },
        category: 'Finance',
        timestamp: new Date().toISOString(),
        potentialReturn: 28.9
    },
    {
        id: 'us-gdp-growth',
        question: 'Will US GDP growth exceed 3% next quarter?',
        platform: 'polymarket',
        signal: 'HOLD',
        recommendation: 'NEUTRAL',
        confidence: 0.52,
        yesProbability: 0.51,
        noProbability: 0.49,
        riskLevel: 'HIGH',
        volume: 3200000,
        liquidity: 960000,
        arbitrage: { detected: false },
        platforms: {
            polymarket: { yes: 0.51, no: 0.49 },
            kalshi: null
        },
        category: 'Finance',
        timestamp: new Date().toISOString(),
        potentialReturn: 8.5
    },
    {
        id: 'trump-policy',
        question: 'Will Trump implement tariffs in Q1 2026?',
        platform: 'polymarket+kalshi',
        signal: 'STRONG_BUY',
        recommendation: 'STRONG_BUY',
        confidence: 0.89,
        yesProbability: 0.87,
        noProbability: 0.13,
        riskLevel: 'LOW',
        volume: 22500000,
        liquidity: 6750000,
        arbitrage: { detected: false },
        platforms: {
            polymarket: { yes: 0.85, no: 0.15 },
            kalshi: { yes: 0.89, no: 0.11 }
        },
        category: 'Politics',
        timestamp: new Date().toISOString(),
        potentialReturn: 42.1
    }
];

/**
 * Handler for predictions endpoint
 */
async function handlePredictionsRequest(req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Cache-Control', 'public, max-age=30');

        // Check query parameters
        const { limit = 10, signal, confidence } = req.query || {};

        let predictions = mockPredictions;

        // If market integration is available, use real data
        if (marketIntegration && marketIntegration.getCombinedMarkets) {
            try {
                const markets = await marketIntegration.getCombinedMarkets();
                const signals = marketIntegration.getTopSignals(markets, 100);
                predictions = signals.map(s => ({
                    ...s,
                    timestamp: new Date().toISOString()
                }));
            } catch (e) {
                console.log('Using mock predictions:', e.message);
            }
        }

        // Apply filters
        if (signal && signal !== 'all') {
            predictions = predictions.filter(p => p.signal === signal);
        }

        if (confidence) {
            const confThreshold = parseFloat(confidence);
            predictions = predictions.filter(p => p.confidence >= confThreshold);
        }

        // Sort by confidence
        predictions = predictions.sort((a, b) => b.confidence - a.confidence);

        // Limit results
        const limitNum = Math.min(parseInt(limit) || 10, 100);
        predictions = predictions.slice(0, limitNum);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                count: predictions.length,
                timestamp: new Date().toISOString(),
                predictions
            })
        };

    } catch (error) {
        console.error('Predictions error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}

/**
 * Handler for signal statistics endpoint
 */
async function handleSignalStatsRequest(req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        let predictions = mockPredictions;

        // Get stats
        const stats = {
            totalSignals: predictions.length,
            averageConfidence: (predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length).toFixed(4),
            signalDistribution: {},
            riskDistribution: {},
            topOpportunities: [],
            arbitrageDetected: 0
        };

        predictions.forEach(p => {
            stats.signalDistribution[p.signal] = (stats.signalDistribution[p.signal] || 0) + 1;
            stats.riskDistribution[p.riskLevel] = (stats.riskDistribution[p.riskLevel] || 0) + 1;
            if (p.arbitrage?.detected) stats.arbitrageDetected += 1;
        });

        stats.topOpportunities = predictions
            .filter(p => p.arbitrage?.detected && p.arbitrage?.opportunity === 'high')
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5)
            .map(p => ({
                question: p.question,
                confidence: p.confidence,
                arbitrageDiff: p.arbitrage?.maxDiff
            }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                stats,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Stats error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}

/**
 * Handler for single prediction endpoint
 */
async function handlePredictionDetailRequest(marketId, req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const predictions = mockPredictions;
        const prediction = predictions.find(p => 
            p.id === marketId || p.question.toLowerCase().includes(marketId.toLowerCase())
        );

        if (!prediction) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    error: 'Prediction not found'
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                prediction,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Detail error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}

// Export for serverless and local use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handlePredictionsRequest,
        handleSignalStatsRequest,
        handlePredictionDetailRequest,
        predictions: mockPredictions
    };
}
