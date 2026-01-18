// Vercel Serverless Function - Crypto Predictions API
// All-in-one solution: Frontend + Backend in single Vercel deployment

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const MARKET_DATA = {
    BTC: { price: 98612, change24h: 2.45, rsi: 56 },
    ETH: { price: 3545, change24h: 1.82, rsi: 52 },
    BNB: { price: 612, change24h: 3.12, rsi: 58 },
    XRP: { price: 2.48, change24h: 1.23, rsi: 54 },
    SOL: { price: 195, change24h: 5.67, rsi: 62 },
    ADA: { price: 1.05, change24h: -0.45, rsi: 48 },
    DOGE: { price: 0.42, change24h: 2.1, rsi: 55 },
    AVAX: { price: 35, change24h: 1.95, rsi: 60 }
  };

  const generatePrediction = (symbol) => {
    const data = MARKET_DATA[symbol] || MARKET_DATA.BTC;
    const momentum = (Math.random() - 0.5) * 40;
    const confidence = 55 + Math.random() * 35;
    const direction = momentum > 10 ? 'LONG' : momentum < -10 ? 'SHORT' : 'HOLD';
    const signal = Math.abs(momentum) > 15 ? 'STRONG' : Math.abs(momentum) > 7 ? 'MODERATE' : 'WEAK';

    const entry = data.price * 0.98;
    const stoploss = data.price * 1.05;
    const tp1 = data.price * 1.025;
    const tp2 = data.price * 1.035;
    const tp3 = data.price * 1.05;

    return {
      pair: `${symbol}/USDT`,
      currentPrice: Number(data.price.toFixed(2)),
      change24h: Number(data.change24h.toFixed(2)),
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
        rsi: Number((data.rsi + (Math.random() - 0.5) * 10).toFixed(2)),
        momentum: Number(momentum.toFixed(3)),
        volatility: Number(Math.abs(data.change24h).toFixed(2)),
        volumeStrength: Number((50 + Math.random() * 50).toFixed(1))
      },
      timestamp: new Date().toISOString()
    };
  };

  try {
    const { symbol } = req.query || {};
    if (symbol && typeof symbol === 'string') {
      return res.status(200).json(generatePrediction(symbol.toUpperCase()));
    }

    const predictions = Object.keys(MARKET_DATA)
      .map((coin) => generatePrediction(coin))
      .sort((a, b) => b.confidence - a.confidence);

    return res.status(200).json(predictions);
  } catch (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
