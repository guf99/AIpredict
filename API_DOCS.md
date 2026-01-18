# API Documentation

## 📡 Base URLs

- **Backend**: `http://localhost:5000/api`
- **ML Service**: `http://localhost:5001/api`

---

## 🎯 Predictions Endpoints

### Get Current Prediction
```http
GET /predictions/:pair
```

**Parameters:**
- `pair` (string, required): Cryptocurrency pair (e.g., "BTC/USDT")

**Response:**
```json
{
  "pair": "BTC/USDT",
  "currentPrice": 45250.50,
  "entry": 45300.00,
  "stoploss": 43500.00,
  "takeProfit": [46000, 47000, 48000],
  "direction": "LONG",
  "confidence": 82.5,
  "reasoning": "Bullish divergence detected on 4H chart",
  "riskReward": 2.8,
  "timestamp": "2024-01-18T10:30:00Z"
}
```

### Analyze Specific Pair
```http
POST /predictions/analyze
Content-Type: application/json

{
  "pair": "ETH/USDT",
  "timeframe": "4H"
}
```

**Response:**
```json
{
  "pair": "ETH/USDT",
  "timeframe": "4H",
  "analysis": {
    "direction": "LONG",
    "strength": 8.5,
    "patterns": ["Bullish Divergence", "Support Level Break"],
    "indicators": {
      "rsi": 65,
      "macd": "positive",
      "bollinger": "above middle"
    }
  },
  "prediction": {
    "entry": 2450.00,
    "stoploss": 2380.00,
    "targets": [2520, 2600, 2680],
    "confidence": 82
  }
}
```

### Get Prediction History
```http
GET /predictions/:pair/history?limit=50
```

**Response:**
```json
[
  {
    "id": 0,
    "pair": "BTC/USDT",
    "timestamp": "2024-01-18T10:00:00Z",
    "prediction": "LONG",
    "entry": 45200.00,
    "result": "WIN",
    "profitLoss": 850.50
  },
  ...
]
```

---

## 📊 Chart Endpoints

### Get OHLCV Data
```http
GET /chart/:pair/:interval
```

**Parameters:**
- `pair`: Cryptocurrency pair
- `interval`: 1H, 4H, 1D, 1W, 1M

**Response:**
```json
{
  "pair": "BTC/USDT",
  "interval": "4H",
  "candles": [
    {
      "time": 1705568400000,
      "open": 45100.00,
      "high": 45500.00,
      "low": 44900.00,
      "close": 45300.00,
      "volume": 5234.50
    },
    ...
  ]
}
```

### Get Technical Indicators
```http
GET /chart/indicators/:pair
```

**Response:**
```json
{
  "pair": "BTC/USDT",
  "rsi": 65,
  "macd": {
    "line": 150,
    "signal": 145,
    "histogram": 5
  },
  "bollingerBands": {
    "upper": 46500,
    "middle": 45500,
    "lower": 44500
  },
  "movingAverages": {
    "ma20": 45200,
    "ma50": 45100,
    "ma200": 44900
  },
  "adx": 35,
  "stochastic": {
    "k": 75,
    "d": 72
  }
}
```

---

## 💼 Trading Endpoints

### Get Trade Details
```http
GET /trade/:id
```

**Response:**
```json
{
  "id": "trade_12345",
  "pair": "BTC/USDT",
  "direction": "LONG",
  "entry": 44900.00,
  "stoploss": 43500.00,
  "targets": [46000, 47500, 48500],
  "entryTime": "2024-01-18T10:30:00Z",
  "status": "ACTIVE",
  "currentPrice": 45800.00,
  "unrealizedPnL": 900.00,
  "unrealizedPnLPercent": 2.0,
  "riskReward": 2.5
}
```

### Backtest Strategy
```http
POST /trade/backtest
Content-Type: application/json

{
  "pair": "BTC/USDT",
  "strategy": "AIPredictor",
  "timeframe": "4H"
}
```

**Response:**
```json
{
  "pair": "BTC/USDT",
  "strategy": "AIPredictor",
  "timeframe": "4H",
  "results": {
    "totalTrades": 145,
    "winningTrades": 113,
    "losingTrades": 32,
    "winRate": 77.9,
    "totalProfit": 24500.00,
    "maxDrawdown": 8.2,
    "sharpeRatio": 2.45,
    "profitFactor": 3.2
  }
}
```

---

## 🤖 ML Service Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "ML Prediction Service",
  "model_trained": true
}
```

### Make Prediction
```http
POST /predict
Content-Type: application/json

{
  "pair": "BTC/USDT",
  "data": [
    {
      "time": 1705568400000,
      "open": 45100.00,
      "high": 45500.00,
      "low": 44900.00,
      "close": 45300.00,
      "volume": 5234.50
    },
    ...
  ]
}
```

**Response:**
```json
{
  "pair": "BTC/USDT",
  "timestamp": 1705568400000,
  "prediction": {
    "direction": "LONG",
    "confidence": 82.5,
    "probabilities": {
      "up": 82.5,
      "down": 17.5
    },
    "feature_importance": {
      "rsi_14": 0.145,
      "macd": 0.120,
      "bb_upper": 0.105
    }
  },
  "trading_levels": {
    "entry": 45302.50,
    "stoploss": 43500.25,
    "targets": [46005.00, 47007.50, 48010.00],
    "risk_reward": 2.8,
    "atr": 850.25
  }
}
```

### Backtest
```http
POST /backtest
Content-Type: application/json

{
  "data": [
    { "time": ..., "open": ..., "high": ..., "low": ..., "close": ..., "volume": ... },
    ...
  ]
}
```

**Response:**
```json
{
  "total_predictions": 1000,
  "correct_predictions": 779,
  "win_rate": 77.9,
  "average_confidence": 78.2
}
```

### Train Model
```http
POST /model/train
Content-Type: application/json

{
  "data": [
    { "time": ..., "open": ..., "high": ..., "low": ..., "close": ..., "volume": ... },
    ...
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Model trained and saved",
  "model_trained": true
}
```

### Get Model Info
```http
GET /model/info
```

**Response:**
```json
{
  "model_trained": true,
  "feature_names": ["rsi_14", "macd", "bb_upper", ...],
  "feature_importance": {
    "rsi_14": 0.145,
    "macd": 0.120,
    "bb_upper": 0.105
  },
  "model_path": "./models/crypto_predictor.pkl"
}
```

---

## 🔧 Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Missing required parameter: pair"
}
```

### 404 Not Found
```json
{
  "error": "Route not found"
}
```

### 500 Server Error
```json
{
  "error": "Something went wrong!",
  "message": "Internal server error details"
}
```

---

## 📝 Example Requests

### Using curl

**Get BTC Prediction:**
```bash
curl http://localhost:5000/api/predictions/BTC/USDT
```

**Analyze ETH:**
```bash
curl -X POST http://localhost:5000/api/predictions/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pair": "ETH/USDT",
    "timeframe": "4H"
  }'
```

**Get Chart Data:**
```bash
curl http://localhost:5000/api/chart/BTC/USDT/4H
```

### Using JavaScript/Fetch

```javascript
// Get prediction
fetch('http://localhost:5000/api/predictions/BTC/USDT')
  .then(res => res.json())
  .then(data => console.log(data))

// Analyze pair
fetch('http://localhost:5000/api/predictions/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pair: 'ETH/USDT',
    timeframe: '4H'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
```

---

Last Updated: January 2024
