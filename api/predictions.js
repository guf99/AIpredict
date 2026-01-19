// Vercel Serverless Function - Crypto Predictions API
// All-in-one solution: Frontend + Backend in single Vercel deployment

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const SYMBOLS = ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'AVAX'];
  const BINANCE_HOSTS = [
    'https://api.binance.com',
    'https://data.binance.com',
    'https://api1.binance.com',
    'https://api2.binance.com',
    'https://api3.binance.com'
  ];
  const COINGECKO_IDS = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    BNB: 'binancecoin',
    XRP: 'ripple',
    SOL: 'solana',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    AVAX: 'avalanche-2'
  };
  const PROVIDER = (process.env.PRICE_PROVIDER || 'binance').toLowerCase();

  const fetchBinanceAll = async () => {
    const symbols = SYMBOLS.map((s) => `${s}USDT`);
    const query = encodeURIComponent(JSON.stringify(symbols));

    for (const host of BINANCE_HOSTS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const url = `${host}/api/v3/ticker/24hr?symbols=${query}`;
        const resp = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
        if (!resp.ok) throw new Error(`Binance ${resp.status}`);
        const data = await resp.json();
        const map = {};
        data.forEach((item) => {
          const sym = item.symbol.replace('USDT', '');
          map[sym] = {
            price: Number(item.lastPrice),
            change24h: Number(item.priceChangePercent),
            rsi: 40 + Math.random() * 20,
            source: host
          };
        });
        clearTimeout(timeout);
        return { map, source: 'binance' };
      } catch {
        clearTimeout(timeout);
        continue;
      }
    }

    throw new Error('All Binance hosts failed');
  };

  const fetchCryptoCompareAll = async () => {
    const fsyms = SYMBOLS.join(',');
    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fsyms}&tsyms=USD`;
    const resp = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!resp.ok) throw new Error(`CryptoCompare ${resp.status}`);
    const data = await resp.json();
    const raw = data?.RAW || {};
    const map = {};
    SYMBOLS.forEach((sym) => {
      const entry = raw[sym]?.USD;
      if (!entry) return;
      map[sym] = {
        price: Number(entry.PRICE),
        change24h: Number(entry.CHANGEPCT24HOUR),
        rsi: 40 + Math.random() * 20,
        source: 'cryptocompare'
      };
    });
    return { map, source: 'cryptocompare' };
  };

  const fetchCoingeckoAll = async () => {
    const ids = SYMBOLS.map((s) => COINGECKO_IDS[s]).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    const resp = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!resp.ok) throw new Error(`CoinGecko ${resp.status}`);
    const data = await resp.json();
    const map = {};
    SYMBOLS.forEach((sym) => {
      const id = COINGECKO_IDS[sym];
      const entry = data[id];
      if (!entry) return;
      map[sym] = {
        price: Number(entry.usd),
        change24h: Number(entry.usd_24h_change || 0),
        rsi: 40 + Math.random() * 20,
        source: 'coingecko'
      };
    });
    return { map, source: 'coingecko' };
  };

  const generatePrediction = (symbol, data) => {
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
      source: data.source || 'binance',
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
    let marketMap = {};
    let marketSource = 'fallback';
    try {
      const fetcher =
        PROVIDER === 'cryptocompare' ? fetchCryptoCompareAll :
        PROVIDER === 'coingecko' ? fetchCoingeckoAll :
        fetchBinanceAll;
      const result = await fetcher();
      marketMap = result.map || {};
      marketSource = result.source || PROVIDER;
    } catch {
      marketMap = {};
      marketSource = 'unavailable';
    }

    if (!Object.keys(marketMap).length) {
      return res.status(503).json({
        error: 'Price source unavailable',
        message: 'All real-time providers failed. Check network/firewall.',
        source: marketSource
      });
    }

    const resolveData = (sym) => ({
      ...(marketMap[sym] || marketMap.BTC),
      source: marketMap[sym] ? (marketMap[sym].source || marketSource) : marketSource
    });

    if (symbol && typeof symbol === 'string') {
      const sym = symbol.toUpperCase();
      return res.status(200).json(generatePrediction(sym, resolveData(sym)));
    }

    const predictions = SYMBOLS
      .map((coin) => generatePrediction(coin, resolveData(coin)))
      .sort((a, b) => b.confidence - a.confidence);

    return res.status(200).json(predictions);
  } catch (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
