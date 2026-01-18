#!/usr/bin/env node

/**
 * Simple development server for local testing
 * Serves index.html and API functions
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const HOST = 'localhost';

// Mock API endpoints for local testing
const mockEndpoints = {
  '/api/health': () => ({
    status: 'ok',
    version: '5.0',
    service: 'Professional Crypto Prediction API',
    environment: 'development',
    timestamp: new Date().toISOString()
  }),
  '/api/predictions': () => {
    // Mock predictions data matching frontend schema
    const coins = ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'AVAX'];
    const basePrices = { BTC: 98612, ETH: 3545, BNB: 612, XRP: 2.45, SOL: 195, ADA: 1.05, DOGE: 0.42, AVAX: 35 };

    return coins.map((coin) => {
      const basePrice = basePrices[coin];
      const change24h = (Math.random() - 0.5) * 5;
      const currentPrice = basePrice * (1 + change24h / 100);
      const momentum = (Math.random() - 0.5) * 40;
      const confidence = 55 + Math.random() * 35;
      const direction = momentum > 10 ? 'LONG' : momentum < -10 ? 'SHORT' : 'HOLD';
      const signal = Math.abs(momentum) > 15 ? 'STRONG' : Math.abs(momentum) > 7 ? 'MODERATE' : 'WEAK';
      const entry = currentPrice * 0.98;
      const stoploss = currentPrice * 1.05;
      const tp1 = currentPrice * 1.025;
      const tp2 = currentPrice * 1.035;
      const tp3 = currentPrice * 1.05;

      return {
        pair: `${coin}/USDT`,
        currentPrice: Number(currentPrice.toFixed(2)),
        change24h: Number(change24h.toFixed(2)),
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
          volatility: Number(Math.abs(change24h).toFixed(2)),
          volumeStrength: Number((50 + Math.random() * 50).toFixed(1))
        },
        timestamp: new Date().toISOString()
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }
};

const server = http.createServer((req, res) => {
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

  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // API endpoints
  if (pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify(mockEndpoints['/api/health']()));
    return;
  }

  if (pathname === '/api/predictions') {
    res.writeHead(200);
    if (query.symbol) {
      const predictions = mockEndpoints['/api/predictions']();
      const filtered = predictions.find(p => p.pair.startsWith(query.symbol));
      res.end(JSON.stringify(filtered || predictions[0]));
    } else {
      res.end(JSON.stringify(mockEndpoints['/api/predictions']()));
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

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║        🚀 CRYPTO PREDICTION PLATFORM - LOCAL DEV SERVER                       ║
║        Professional All-in-One Deployment                                     ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

✅ Server running!

Dashboard:    http://${HOST}:${PORT}
API Health:   http://${HOST}:${PORT}/api/health
Predictions:  http://${HOST}:${PORT}/api/predictions
Single Coin:  http://${HOST}:${PORT}/api/predictions?symbol=BTC

Press Ctrl+C to stop
`);
});
