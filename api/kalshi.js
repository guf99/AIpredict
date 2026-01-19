/**
 * Kalshi API Integration
 * Fetches prediction market data from Kalshi platform
 */

const KALSHI_API = 'https://api.kalshi.com/trade-api/v2';

/**
 * Fetch markets from Kalshi
 * @returns {Promise<Array>} Array of market objects
 */
async function fetchKalshiMarkets() {
    try {
        // Kalshi markets endpoint
        const response = await fetch(`${KALSHI_API}/markets`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Kalshi API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform Kalshi data to match our format
        return transformKalshiData(data.markets || []);
    } catch (error) {
        console.error('Kalshi API fetch error:', error);
        return generateMockKalshiData();
    }
}

/**
 * Transform Kalshi data format to standardized format
 * @param {Array} kalshiMarkets - Raw Kalshi market data
 * @returns {Array} Standardized market objects
 */
function transformKalshiData(kalshiMarkets) {
    return kalshiMarkets.slice(0, 20).map(market => ({
        id: market.id || market.ticker,
        question: market.title || market.subtitle,
        title: market.title,
        slug: market.ticker,
        category: market.category || 'General',
        outcomes: ['Yes', 'No'],
        outcomePrices: [
            market.yes_price ? (market.yes_price / 100).toFixed(2) : '0.50',
            market.no_price ? (market.no_price / 100).toFixed(2) : '0.50'
        ],
        volume: market.volume ? Math.floor(market.volume / 1000) * 1000 : 50000,
        volumeNum: market.volume || 50000,
        liquidity: market.liquidity || 10000,
        liquidityNum: market.liquidity || 10000,
        active: market.state === 'open',
        closed: market.state !== 'open',
        icon: 'https://kalshi.com/favicon.ico',
        image: 'https://kalshi.com/favicon.ico',
        description: market.subtitle || 'Kalshi market',
        platform: 'kalshi',
        createdAt: market.created_at,
        expiration: market.expiration_date,
    }));
}

/**
 * Generate mock Kalshi data for testing
 * @returns {Array} Mock market data
 */
function generateMockKalshiData() {
    const mockMarkets = [
        {
            question: 'Will the Federal Reserve raise rates in February 2026?',
            title: 'Fed Rate Hike February',
            slug: 'fed-rate-feb-2026',
            category: 'Finance',
            yes_price: 35,
            no_price: 65,
            volume: 8500000,
            liquidity: 1200000,
            state: 'open',
            ticker: 'FRED1',
        },
        {
            question: 'Will BTC close above $95,000 on January 24?',
            title: 'Bitcoin $95k Close',
            slug: 'btc-95k-jan24',
            category: 'Crypto',
            yes_price: 72,
            no_price: 28,
            volume: 12000000,
            liquidity: 2500000,
            state: 'open',
            ticker: 'BTCUSD1',
        },
        {
            question: 'Will the S&P 500 close higher on Friday?',
            title: 'S&P 500 Friday Close',
            slug: 'sp500-friday',
            category: 'Finance',
            yes_price: 58,
            no_price: 42,
            volume: 6000000,
            liquidity: 950000,
            state: 'open',
            ticker: 'SPX1',
        },
    ];

    return transformKalshiData(mockMarkets);
}

/**
 * Get single market details from Kalshi
 * @param {String} marketId - Market ID or ticker
 * @returns {Promise<Object>} Market details
 */
async function getKalshiMarketDetails(marketId) {
    try {
        const response = await fetch(`${KALSHI_API}/markets/${marketId}`);
        const data = await response.json();
        return transformKalshiData([data.market])[0];
    } catch (error) {
        console.error('Failed to fetch Kalshi market details:', error);
        return null;
    }
}

module.exports = {
    fetchKalshiMarkets,
    getKalshiMarketDetails,
    transformKalshiData,
};
