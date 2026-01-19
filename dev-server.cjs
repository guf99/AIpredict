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
    const url = 'https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=50&order=volume&ascending=false';
    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    };

    const fetchJsonNative = (apiUrl) => new Promise((resolve, reject) => {
      const urlObj = new URL(apiUrl);
      const req = https.request({
        method: 'GET',
        hostname: urlObj.hostname,
        path: `${urlObj.pathname}${urlObj.search}`,
        headers,
        timeout: 8000
      }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => {
          if (resp.statusCode !== 200) return reject(new Error(`HTTP ${resp.statusCode}`));
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy(new Error('Timeout'));
      });
      req.end();
    });

    const fetchJsonPowerShell = (apiUrl) => new Promise((resolve, reject) => {
      const args = [
        '-Command',
        `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest '${apiUrl}' -Headers @{"User-Agent"="Mozilla/5.0";"Accept"="application/json"} -UseBasicParsing | Select-Object -ExpandProperty Content`
      ];
      execFile('powershell', args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
        if (err) return reject(err);
        try { resolve(JSON.parse(stdout)); } catch (e) { reject(e); }
      });
    });

    try {
      return await fetchJsonNative(url);
    } catch {
      return await fetchJsonPowerShell(url);
    }
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
