// Vercel Serverless Function - Polymarket Proxy

module.exports = async (req, res) => {
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

  try {
    const url = 'https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=50&order=volume&ascending=false';
    const resp = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    if (!resp.ok) throw new Error(`Polymarket ${resp.status}`);
    const data = await resp.json();
    return res.status(200).json({ markets: Array.isArray(data) ? data : data?.markets || [] });
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).json({ markets: [], error: 'Polymarket unavailable' });
  }
};
