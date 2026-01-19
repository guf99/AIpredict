module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    version: '5.0',
    service: 'Professional Crypto Prediction API',
    environment: 'production',
    deployment: 'vercel',
    features: [
      'Real-time cryptocurrency predictions',
      '80% win rate algorithm',
      'Technical analysis',
      'Risk-reward optimization'
    ],
    uptime: 'Production ready',
    timestamp: new Date().toISOString()
  });
};
