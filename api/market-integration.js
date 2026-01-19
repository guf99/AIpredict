/**
 * Dual-Platform Market Integration
 * Combines Polymarket + Kalshi data with VOLIX AI predictions
 */

const polymarket = require('./polymarket');
const kalshi = require('./kalshi');

/**
 * Fetch and combine market data from both platforms
 * @returns {Promise<Array>} Combined market data
 */
async function getCombinedMarkets() {
    try {
        // Fetch from both platforms in parallel
        const [polymarketMarkets, kalshiMarkets] = await Promise.all([
            polymarket.fetchPolymarketMarkets().catch(() => []),
            kalshi.fetchKalshiMarkets().catch(() => [])
        ]);

        console.log(`Fetched ${polymarketMarkets.length} Polymarket + ${kalshiMarkets.length} Kalshi markets`);

        // Match and merge markets
        const combinedMarkets = [];
        const matchedKalshi = new Set();

        // Process Polymarket markets
        for (const pm of polymarketMarkets) {
            const kalshiMatch = findMatchingKalshi(pm, kalshiMarkets);
            
            const combined = {
                ...pm,
                platform: 'polymarket',
                id: pm.id || pm.slug,
                polymarketData: pm,
                kalshiData: kalshiMatch || null,
                hasArbitrage: kalshiMatch ? detectArbitrage(pm, kalshiMatch) : false,
            };

            combinedMarkets.push(combined);

            if (kalshiMatch) {
                matchedKalshi.add(kalshiMatch.id);
            }
        }

        // Add unmatched Kalshi markets
        for (const k of kalshiMarkets) {
            if (!matchedKalshi.has(k.id)) {
                combinedMarkets.push({
                    ...k,
                    platform: 'kalshi',
                    polymarketData: null,
                    kalshiData: k,
                    hasArbitrage: false,
                });
            }
        }

        return combinedMarkets;
    } catch (error) {
        console.error('Error fetching combined markets:', error);
        return [];
    }
}

/**
 * Find matching Kalshi market for a Polymarket market
 * @param {Object} pmMarket - Polymarket market
 * @param {Array} kalshiMarkets - Kalshi markets to search
 * @returns {Object|null} Matching Kalshi market or null
 */
function findMatchingKalshi(pmMarket, kalshiMarkets) {
    const pmQuestion = (pmMarket.question || pmMarket.title || '').toLowerCase();
    const pmSlug = (pmMarket.slug || '').toLowerCase();

    return kalshiMarkets.find(k => {
        const kalshiQuestion = (k.question || k.title || '').toLowerCase();
        
        // Try slug match first (most accurate)
        if (pmSlug && kalshiQuestion.includes(pmSlug.substring(0, 30))) return true;
        
        // Try question match
        const pmKeywords = pmQuestion.split(' ').filter(w => w.length > 4);
        const matchingKeywords = pmKeywords.filter(kw => kalshiQuestion.includes(kw));
        
        // Consider match if at least 2 keywords match
        return matchingKeywords.length >= 2;
    }) || null;
}

/**
 * Detect arbitrage opportunities between platforms
 * @param {Object} pmMarket - Polymarket market
 * @param {Object} kalshiMarket - Kalshi market
 * @returns {Object} Arbitrage details
 */
function detectArbitrage(pmMarket, kalshiMarket) {
    const pmPrices = Array.isArray(pmMarket.outcomePrices) 
        ? pmMarket.outcomePrices.map(p => Number(p) || 0) 
        : [0.5, 0.5];
    
    const kalshiPrices = Array.isArray(kalshiMarket.outcomePrices) 
        ? kalshiMarket.outcomePrices.map(p => Number(p) || 0) 
        : [0.5, 0.5];

    const yesDiff = Math.abs((pmPrices[0] || 0) - (kalshiPrices[0] || 0));
    const noDiff = Math.abs((pmPrices[1] || 0) - (kalshiPrices[1] || 0));

    return {
        detected: yesDiff > 0.05 || noDiff > 0.05,
        yesDiff: parseFloat(yesDiff.toFixed(4)),
        noDiff: parseFloat(noDiff.toFixed(4)),
        maxDiff: parseFloat(Math.max(yesDiff, noDiff).toFixed(4)),
        opportunity: Math.max(yesDiff, noDiff) > 0.15 ? 'high' : 
                    Math.max(yesDiff, noDiff) > 0.08 ? 'medium' : 'low'
    };
}

/**
 * Get weighted odds from both platforms
 * @param {Object} combined - Combined market data
 * @returns {Object} Weighted odds and analysis
 */
function getWeightedOdds(combined) {
    if (!combined.polymarketData) {
        // Use Kalshi data only
        const prices = Array.isArray(combined.kalshiData.outcomePrices)
            ? combined.kalshiData.outcomePrices.map(p => Number(p) || 0)
            : [0.5, 0.5];
        
        return {
            yesProbability: prices[0] || 0.5,
            noProbability: prices[1] || 0.5,
            weightedFrom: 'kalshi'
        };
    }

    if (!combined.kalshiData) {
        // Use Polymarket data only
        const prices = Array.isArray(combined.polymarketData.outcomePrices)
            ? combined.polymarketData.outcomePrices.map(p => Number(p) || 0)
            : [0.5, 0.5];
        
        return {
            yesProbability: prices[0] || 0.5,
            noProbability: prices[1] || 0.5,
            weightedFrom: 'polymarket'
        };
    }

    // Weight by volume
    const pmVolume = Number(combined.polymarketData.volumeNum || combined.polymarketData.volume || 1000);
    const kalshiVolume = Number(combined.kalshiData.volumeNum || combined.kalshiData.volume || 1000);
    const totalVolume = pmVolume + kalshiVolume;

    const pmWeight = pmVolume / totalVolume;
    const kalshiWeight = kalshiVolume / totalVolume;

    const pmPrices = Array.isArray(combined.polymarketData.outcomePrices)
        ? combined.polymarketData.outcomePrices.map(p => Number(p) || 0)
        : [0.5, 0.5];
    
    const kalshiPrices = Array.isArray(combined.kalshiData.outcomePrices)
        ? combined.kalshiData.outcomePrices.map(p => Number(p) || 0)
        : [0.5, 0.5];

    return {
        yesProbability: parseFloat(((pmPrices[0] || 0) * pmWeight + (kalshiPrices[0] || 0) * kalshiWeight).toFixed(4)),
        noProbability: parseFloat(((pmPrices[1] || 0) * pmWeight + (kalshiPrices[1] || 0) * kalshiWeight).toFixed(4)),
        pmWeight: parseFloat(pmWeight.toFixed(2)),
        kalshiWeight: parseFloat(kalshiWeight.toFixed(2)),
        pmVolume,
        kalshiVolume,
        weightedFrom: 'both'
    };
}

/**
 * Get comprehensive market analysis
 * @param {Object} combined - Combined market data
 * @returns {Object} Analysis with VOLIX signals
 */
function analyzeMarket(combined) {
    const odds = getWeightedOdds(combined);
    const arbitrage = combined.hasArbitrage;

    // Determine market trend
    const volume = Number(combined.volumeNum || combined.volume || 0);
    const liquidity = Number(combined.liquidityNum || combined.liquidity || 0);
    const trend = volume > liquidity ? 'strong' : (volume > liquidity * 0.5 ? 'moderate' : 'weak');

    // Calculate confidence
    const oddsDifference = Math.abs(odds.yesProbability - 0.5);
    const volumeConfidence = Math.min(volume / 5000000, 1);
    const arbitrageBoost = arbitrage.detected ? 0.05 : 0;
    const confidence = Math.min(oddsDifference + volumeConfidence + arbitrageBoost, 1);

    // Generate signal
    let signal = 'HOLD';
    let recommendation = 'NEUTRAL';

    if (odds.yesProbability > 0.65) {
        signal = 'BUY_YES';
        recommendation = confidence > 0.75 ? 'STRONG_BUY' : 'BUY';
    } else if (odds.yesProbability < 0.35) {
        signal = 'BUY_NO';
        recommendation = confidence > 0.75 ? 'STRONG_BUY' : 'BUY';
    } else if (arbitrage.detected && arbitrage.opportunity === 'high') {
        signal = 'ARBITRAGE';
        recommendation = 'BUY';
    }

    return {
        ...combined,
        odds,
        arbitrage,
        trend,
        volume,
        liquidity,
        confidence: parseFloat(confidence.toFixed(4)),
        signal,
        recommendation,
        platforms: combined.kalshiData ? 'polymarket+kalshi' : 'polymarket',
        analyzedAt: new Date().toISOString()
    };
}

/**
 * Get top signals sorted by confidence
 * @param {Array} markets - Combined market array
 * @param {number} limit - Number of signals to return
 * @returns {Array} Top signals
 */
function getTopSignals(markets, limit = 10) {
    return markets
        .map(m => analyzeMarket(m))
        .filter(m => m.signal !== 'HOLD')
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);
}

/**
 * Export functions for API usage
 */
module.exports = {
    getCombinedMarkets,
    findMatchingKalshi,
    detectArbitrage,
    getWeightedOdds,
    analyzeMarket,
    getTopSignals
};
