#!/usr/bin/env node

/**
 * Simple development server for local testing
 * Serves index.html and API functions
 */

const http = require('http');
const https = require('https');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 5173;
const PORT_CANDIDATES = Array.from({ length: 10 }, (_, idx) => PORT + idx);
const HOST = '127.0.0.1';

// Helper function to generate market data
const generateMarkets = (type = 'polymarket', count = 50) => {
  const polymarketQuestions = [
    'Will Bitcoin reach $100k by end of 2025?',
    'Will Ethereum reach $5k by mid 2025?',
    'US Inflation Rate Q1 2025 >3.5%?',
    'Will Fed make 3+ rate cuts in 2025?',
    'Will Solana reach top 5 by market cap in 2025?',
    'Will Trump implement tariffs within 100 days?',
    'Will XRP get regulatory clarity in US by Q2 2025?',
    'Will AI chips see 10x speed improvement in 2025?',
    'Will US GDP growth exceed 3% in Q1 2025?',
    'Will crypto market cap hit $5 trillion in 2025?',
    'Will Iran nuclear deal be renegotiated by June 2025?',
    'Will Tesla stock reach $500 by December 2025?',
    'Will Olympics 2026 have record viewership?',
    'Will Bitcoin ETF see $50B+ inflows in 2025?',
    'Will Greenland move towards independence in 2025?',
    'Will Solana reach $500 in 2025?',
    'Will Cardano exceed $1 by end of 2025?',
    'Will Ripple XRP ETF be approved in 2025?',
    'Will Amazon stock hit new ATH by Q2 2025?',
    'Will Meta reach $500 billion market cap in 2025?',
    'Will nuclear power increase allocation in portfolios by 2025?',
    'Will Israel-Hamas conflict resolution by end of 2025?',
    'Will Ukraine conflict scale down by mid-2025?',
    'Will US approve natural gas pipelines in 2025?',
    'Will Bitcoin mining become carbon neutral by 2025?',
    'Will Web3 adoption exceed 10% of internet users by 2025?',
    'Will quantum computing have practical applications in 2025?',
    'Will major US city adopt crypto as payment by 2025?',
    'Will DeepSeek surpass ChatGPT in users by 2025?',
    'Will SpaceX establish lunar mining operations by 2025?',
    'Will DeFi TVL exceed $100 billion by end of 2025?',
    'Will SEC approve spot Ethereum ETF by Q1 2025?',
    'Will MicroStrategy Bitcoin holdings exceed $20B by 2025?',
    'Will Nvidia stock price reach $300 by 2025?',
    'Will OpenAI reach $100B valuation in 2025?',
    'Will Japan increase crypto regulation in 2025?',
    'Will Germany approve crypto banking in 2025?',
    'Will FIFA World Cup see crypto sponsorship in 2026?',
    'Will Layer 2 networks process 90% of transactions by 2025?',
    'Will central bank digital currencies launch in 5+ nations by 2025?',
    'Will metaverse gaming exceed $50B market by 2025?',
    'Will NFT market recover to $40B+ in 2025?',
    'Will Dogecoin reach $1 by end of 2025?',
    'Will Polkadot ecosystem exceed 1000 parachains by 2025?',
    'Will Chainlink TVL exceed $50B by 2025?',
    'Will Uniswap volume exceed $5 trillion annually by 2025?',
    'Will Bitcoin hash rate hit 1000 exahashes by 2025?',
    'Will global crypto adoption reach 15% by 2025?',
    'Will El Salvador add more Bitcoin to reserves in 2025?',
    'Will Indonesia launch national blockchain by 2025?'
  ];
  
  const kalshiQuestions = [
    'Will Fed cut rates in March 2025?',
    'Will S&P 500 close above 6500 by Q1 end?',
    'US Unemployment Rate Q1 2025 <4%?',
    'Will Crude Oil trade above $80 by Q1 end?',
    'Will Bitcoin ETF see net inflows in Q1?',
    'Will Nasdaq-100 hit new all-time high in Q1?',
    'Will CPI inflation fall below 3% in Q1 2025?',
    'Will US housing starts exceed 1.4M in Q1 2025?',
    'Will US Dollar Index exceed 105 in Q1?',
    'Will Gold price exceed $2100 per oz in Q1?',
    'Will Nikkei 225 exceed 34,000 in Q1 2025?',
    'Will VIX average above 20 in Q1 2025?',
    'Will Fed meeting see hawkish commentary in Feb?',
    'Will unemployment claims fall below 200K weekly?',
    'Will oil inventory levels exceed 400M barrels?',
    'Will retail sales growth exceed 3% in Q1?',
    'Will durable goods orders rise 5%+ in Feb?',
    'Will ISM manufacturing PMI exceed 50 in Q1?',
    'Will consumer confidence index exceed 110 in Q1?',
    'Will initial jobless claims average below 210K?',
    'Will existing home sales rise 2%+ in Feb?',
    'Will new home sales exceed 600K in Q1?',
    'Will mortgage rates fall below 6.5% by March?',
    'Will 10-year Treasury yield exceed 4.5% in Q1?',
    'Will Fed funds rate remain at 4.75-5% through Q1?',
    'Will commercial real estate prices fall 5%+ in Q1?',
    'Will corporate earnings growth exceed 8% in Q1?',
    'Will tech stock valuations contract by 10% in Q1?',
    'Will oil prices exceed $90/barrel in Q1?',
    'Will natural gas prices fall below $2.50/MMBtu?',
    'Will copper prices exceed $4/lb in Q1?',
    'Will lithium prices fall 20%+ in Q1 2025?',
    'Will auto sales exceed 15M units in Q1?',
    'Will commercial airline capacity utilization exceed 85%?',
    'Will hotel occupancy rates exceed 70% in Q1?',
    'Will credit card default rates rise above 2.5%?',
    'Will student loan delinquencies exceed 3%?',
    'Will corporate bond spreads tighten by 50bps?',
    'Will high yield bond spreads exceed 350bps?',
    'Will emerging market currencies strengthen vs USD?',
    'Will EEM (emerging markets ETF) exceed $40 in Q1?',
    'Will China GDP growth exceed 4% in Q1?',
    'Will Euro reach parity with USD by March?',
    'Will commodity index CRB exceed 250 by Q1?',
    'Will agricultural commodity prices rise 10%+?',
    'Will steel prices exceed $800/ton in Q1?',
    'Will aluminum prices rise above $2.50/lb?',
    'Will freight rates fall 30%+ in Q1 2025?',
    'Will shipping container shortage emerge by March?',
    'Will supply chain delays increase 25%+ in Q1?'
  ];
  
  const questions = type === 'polymarket' ? polymarketQuestions : kalshiQuestions;
  const categories = type === 'polymarket' 
    ? ['Crypto', 'Finance', 'Politics', 'Tech', 'Sports', 'Geopolitics']
    : ['Finance'];
  
  return Array.from({ length: Math.min(count, questions.length) }, (_, i) => ({
    id: `${type}-${i + 1}`,
    slug: questions[i].toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50),
    title: questions[i],
    description: `${type} prediction market for ${questions[i].slice(0, 30)}...`,
    outcomes: ['Yes', 'No'],
    outcomePrices: [
      Math.random() * 0.7 + 0.2,
      Math.random() * 0.7 + 0.2
    ],
    volume: Math.floor(Math.random() * 3000000) + 500000,
    liquidity: Math.floor(Math.random() * 1000000) + 200000,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + Math.random() * 300 * 24 * 60 * 60 * 1000).toISOString(),
    category: categories[Math.floor(Math.random() * categories.length)]
  }));
};

// API endpoints for local testing (real-time with fallback)
const mockEndpoints = {
  '/api/health': () => ({
    status: 'ok',
    version: '5.0',
    service: 'Professional Crypto Prediction API',
    environment: 'development',
    timestamp: new Date().toISOString()
  }),
  '/api/polymarket': async () => {
    try {
      // Try real API first (with 5 second timeout)
      const url = 'https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=50&order=volume&ascending=false';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(timeoutId);
      
      if (resp.ok) {
        const data = await resp.json();
        const markets = Array.isArray(data) ? data : data?.markets || generateMarkets('polymarket', 50);
        return { markets };
      }
    } catch (e) {
      // Fallback to generated mock data if API fails
    }
    
    return { markets: generateMarkets('polymarket', 50) };
  },
  '/api/kalshi': async () => {
    return { markets: generateMarkets('kalshi', 50) };
  },
  '/api/predictions': async () => {
    const coins = ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'AVAX'];
    const provider = (process.env.PRICE_PROVIDER || '').toLowerCase();

    const REQUEST_HEADERS = {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    };
    const CRYPTOCOMPARE_KEY = process.env.CRYPTOCOMPARE_API_KEY;
    const COINGECKO_KEY = process.env.COINGECKO_API_KEY;

    const fetchJsonNative = (apiUrl, headers = {}) => new Promise((resolve, reject) => {
      const urlObj = new URL(apiUrl);
      const req = https.request({
        method: 'GET',
        hostname: urlObj.hostname,
        path: `${urlObj.pathname}${urlObj.search}`,
        headers
      }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => {
          if (resp.statusCode !== 200) return reject(new Error('HTTP error'));
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.end();
    });

    const fetchJsonPowerShell = (apiUrl, headers = {}) => new Promise((resolve, reject) => {
      const headerPairs = Object.entries(headers)
        .map(([k, v]) => `'${k}'='${String(v).replace(/'/g, "''")}'`)
        .join('; ');
      const headerExpr = headerPairs ? `-Headers @{${headerPairs}}` : '';
      const args = [
        '-Command',
        `Invoke-WebRequest '${apiUrl}' ${headerExpr} -UseBasicParsing | Select-Object -ExpandProperty Content`
      ];
      execFile('powershell', args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
        if (err) return reject(err);
        try { resolve(JSON.parse(stdout)); } catch (e) { reject(e); }
      });
    });

    const fetchJson = async (apiUrl, headers = {}) => {
      try {
        return await fetchJsonNative(apiUrl, headers);
      } catch {
        return await fetchJsonPowerShell(apiUrl, headers);
      }
    };

    const fetchCryptoCompareAll = async () => {
      const fsyms = coins.join(',');
      const headers = {
        ...REQUEST_HEADERS,
        ...(CRYPTOCOMPARE_KEY ? { authorization: `Apikey ${CRYPTOCOMPARE_KEY}` } : {})
      };
      const data = await fetchJson(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fsyms}&tsyms=USD`, headers);
      const raw = data?.RAW || {};
      const map = {};
      coins.forEach((sym) => {
        const entry = raw[sym]?.USD;
        if (!entry) return;
        map[sym] = {
          price: Number(entry.PRICE),
          change24h: Number(entry.CHANGEPCT24HOUR),
          source: 'cryptocompare'
        };
      });
      return map;
    };

    const fetchCoingeckoAll = async () => {
      const ids = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        BNB: 'binancecoin',
        XRP: 'ripple',
        SOL: 'solana',
        ADA: 'cardano',
        DOGE: 'dogecoin',
        AVAX: 'avalanche-2'
      };
      const list = coins.map((s) => ids[s]).join(',');
      const headers = {
        ...REQUEST_HEADERS,
        ...(COINGECKO_KEY ? { 'x-cg-pro-api-key': COINGECKO_KEY } : {})
      };
      const data = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${list}&vs_currencies=usd&include_24hr_change=true`, headers);
      const map = {};
      coins.forEach((sym) => {
        const entry = data[ids[sym]];
        if (!entry) return;
        map[sym] = {
          price: Number(entry.usd),
          change24h: Number(entry.usd_24h_change || 0),
          source: 'coingecko'
        };
      });
      return map;
    };

    let marketMap = {};
    try {
      if (provider === 'coingecko') {
        marketMap = await fetchCoingeckoAll();
      } else if (provider === 'cryptocompare') {
        marketMap = await fetchCryptoCompareAll();
      } else {
        marketMap = await fetchCryptoCompareAll();
        if (!Object.keys(marketMap).length) {
          marketMap = await fetchCoingeckoAll();
        }
      }
    } catch {
      marketMap = {};
    }

    if (!Object.keys(marketMap).length) {
      return [];
    }

    const predictions = await Promise.all(
      coins.map(async (coin) => {
        const market = marketMap[coin];
        if (!market) {
          return null;
        }

        const momentum = (Math.random() - 0.5) * 40;
        const confidence = 55 + Math.random() * 35;
        const direction = momentum > 10 ? 'LONG' : momentum < -10 ? 'SHORT' : 'HOLD';
        const signal = Math.abs(momentum) > 15 ? 'STRONG' : Math.abs(momentum) > 7 ? 'MODERATE' : 'WEAK';

        const entry = market.price * 0.98;
        const stoploss = market.price * 1.05;
        const tp1 = market.price * 1.025;
        const tp2 = market.price * 1.035;
        const tp3 = market.price * 1.05;

        return {
          pair: `${coin}/USDT`,
          currentPrice: Number(market.price.toFixed(2)),
          change24h: Number(market.change24h.toFixed(2)),
          source: market.source || 'cryptocompare',
          direction,
          signal,
          confidence: Math.round(confidence),
          entry: Number(entry.toFixed(4)),
          stoploss: Number(stoploss.toFixed(4)),
          riskReward: 2.5,
          takeProfitLevels: {
            tp1: { price: Number(tp1.toFixed(4)), percentGain: 2.5 },
            tp2: { price: Number(tp2.toFixed(4)), percentGain: 3.5 },
            tp3: { price: Number(tp3.toFixed(4)), percentGain: 5.0 }
          },
          technicalIndicators: {
            rsi: Number((40 + Math.random() * 20).toFixed(2)),
            momentum: Number(momentum.toFixed(3)),
            volatility: Number(Math.abs(market.change24h).toFixed(2)),
            volumeStrength: Number((50 + Math.random() * 50).toFixed(1))
          },
          timestamp: new Date().toISOString()
        };
      })
    );

    return predictions.filter(Boolean).sort((a, b) => b.confidence - a.confidence);
  }
};

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL (WHATWG URL API)
  const parsedUrl = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = parsedUrl.pathname;
  const query = Object.fromEntries(parsedUrl.searchParams.entries());

  // API endpoints
  if (pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify(mockEndpoints['/api/health']()));
    return;
  }

  if (pathname === '/api/polymarket') {
    try {
      const data = await mockEndpoints['/api/polymarket']();
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.writeHead(200);
      res.end(JSON.stringify({ markets: Array.isArray(data) ? data : data?.markets || [] }));
    } catch (error) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.writeHead(200);
      res.end(JSON.stringify({ markets: [], error: 'Polymarket unavailable' }));
    }
    return;
  }

  if (pathname === '/api/kalshi') {
    try {
      const data = await mockEndpoints['/api/kalshi']();
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.writeHead(200);
      res.end(JSON.stringify({ markets: Array.isArray(data) ? data : data?.markets || [] }));
    } catch (error) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.writeHead(200);
      res.end(JSON.stringify({ markets: [], error: 'Kalshi unavailable' }));
    }
    return;
  }

  if (pathname === '/api/volix-signals') {
    const volixSignals = {
      success: true,
      count: 5,
      timestamp: new Date().toISOString(),
      predictions: [
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
          arbitrage: { detected: true, yesDiff: 0.08, noDiff: 0.08, opportunity: 'medium' },
          category: 'Crypto',
          potentialReturn: 35.5
        },
        {
          id: 'ethereum-quarter',
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
          arbitrage: { detected: false },
          category: 'Crypto',
          potentialReturn: 22.3
        },
        {
          id: 'fed-rate-cut',
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
          arbitrage: { detected: true, yesDiff: 0.12, noDiff: 0.12, opportunity: 'high' },
          category: 'Finance',
          potentialReturn: 28.9
        },
        {
          id: 'trump-tariffs',
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
          category: 'Politics',
          potentialReturn: 42.1
        },
        {
          id: 'sp500-close',
          question: 'Will S&P 500 close higher Friday?',
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
          category: 'Finance',
          potentialReturn: 8.5
        }
      ]
    };
    res.writeHead(200);
    res.end(JSON.stringify(volixSignals));
    return;
  }

  if (pathname === '/api/volix-stats') {
    const stats = {
      success: true,
      stats: {
        totalSignals: 156,
        averageConfidence: 0.7234,
        signalDistribution: {
          'STRONG_BUY': 34,
          'BUY_YES': 42,
          'BUY_NO': 38,
          'HOLD': 32,
          'SELL': 8,
          'STRONG_SELL': 2
        },
        riskDistribution: {
          'LOW': 45,
          'MEDIUM': 89,
          'HIGH': 22
        },
        arbitrageDetected: 18,
        topOpportunities: [
          { question: 'Will Trump implement tariffs in Q1?', confidence: 0.89, arbitrageDiff: 0.12 },
          { question: 'Will BTC reach $100,000?', confidence: 0.82, arbitrageDiff: 0.08 },
          { question: 'Will Fed cut rates in February?', confidence: 0.71, arbitrageDiff: 0.12 }
        ]
      },
      timestamp: new Date().toISOString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(stats));
    return;
  }

  if (pathname === '/api/predictions') {
    if (query.symbol) {
      const predictions = await mockEndpoints['/api/predictions']();
      if (!predictions.length) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: 'Price source unavailable' }));
        return;
      }
      const filtered = predictions.find(p => p.pair.startsWith(query.symbol));
      res.writeHead(200);
      res.end(JSON.stringify(filtered || predictions[0]));
    } else {
      const predictions = await mockEndpoints['/api/predictions']();
      if (!predictions.length) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: 'Price source unavailable' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify(predictions));
    }
    return;
  }

  // Serve static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If not found, serve index.html (SPA routing)
      fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Not Found' }));
          return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(data);
      });
      return;
    }

    // Set content type
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    res.writeHead(200);
    res.end(data);
  });
});

let portIndex = 0;

const listenOnPort = () => {
  const port = PORT_CANDIDATES[portIndex];
  if (!port) {
    console.error('No available ports found.');
    process.exit(1);
  }

  server.listen(port, HOST, () => {
    try {
      fs.writeFileSync(path.join(__dirname, 'live-port.txt'), String(port));
    } catch {}
    console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║        🚀 CRYPTO PREDICTION PLATFORM - LOCAL DEV SERVER                       ║
║        Professional All-in-One Deployment                                     ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

✅ Server running!

Dashboard:    http://${HOST}:${port}
API Health:   http://${HOST}:${port}/api/health
Predictions:  http://${HOST}:${port}/api/predictions
Single Coin:  http://${HOST}:${port}/api/predictions?symbol=BTC

Press Ctrl+C to stop
`);
  });
};

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    portIndex += 1;
    listenOnPort();
    return;
  }
  console.error(err);
  process.exit(1);
});

listenOnPort();
