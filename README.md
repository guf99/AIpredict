# Crypto AI Prediction Platform

🚀 **AI-Powered Cryptocurrency Price Prediction for Futures Trading**

Advanced machine learning platform for predicting cryptocurrency price movements with high accuracy. Features detailed trading analysis including entry prices, stop-loss levels, profit targets, and real-time chart visualization.

## 🎯 Features

- **AI-Powered Predictions** - Machine learning models trained on historical crypto data
- **High Accuracy Predictions** - Winrate-optimized algorithms
- **Detailed Trading Analysis**
  - Entry Price Points
  - Entry Reasoning & Explanation
  - Stop-Loss Levels
  - Profit Targets
  - Risk/Reward Ratios
- **Interactive Charts** - TradingView Lightweight Charts integration
- **Modern UI/UX** - Sleek black & white minimalist design
- **Real-time Data** - Live cryptocurrency price feeds
- **Web3 Ready** - Blockchain integration ready

## 📁 Project Structure

```
Project23/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── styles/       # CSS & styling
│   │   └── App.jsx
│   └── package.json
├── backend/              # Node.js Express API
│   ├── routes/           # API routes
│   ├── controllers/      # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── middleware/       # Custom middleware
│   ├── server.js
│   └── .env.example
├── ml-service/           # Python ML service
│   ├── models/           # Trained ML models
│   ├── predictor.py      # Prediction engine
│   ├── main.py
│   └── requirements.txt
├── .github/              # GitHub configuration
│   └── copilot-instructions.md
└── package.json
```

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TradingView Lightweight Charts** - Advanced charting
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Axios** - API calls

### ML Service
- **Python 3.10+** - ML framework
- **TensorFlow/Keras** - Deep learning
- **Scikit-learn** - ML algorithms
- **Pandas** - Data processing
- **Numpy** - Numerical computing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB running locally or MongoDB Atlas connection

### Installation

```bash
# Install all dependencies
npm run install-all

# Or manually:
npm install
cd frontend && npm install
pip install -r ml-service/requirements.txt
```

### Environment Setup

Create `.env` files:

**backend/.env:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crypto-ai
JWT_SECRET=your-secret-key
FLASK_API_URL=http://localhost:5001
```

**ml-service/.env:**
```
FLASK_PORT=5001
MODEL_PATH=./models/crypto_predictor.pkl
```

### Running the Application

```bash
# Terminal 1: Start Backend
npm start
# or with auto-reload: npm run dev

# Terminal 2: Start Frontend
npm run client

# Terminal 3: Start ML Service
npm run ml-service
```

Access the application at `http://localhost:5173`

## 📊 API Endpoints

### Predictions
- `GET /api/predictions/:pair` - Get current prediction
- `POST /api/predictions/analyze` - Analyze specific pair
- `GET /api/predictions/history/:pair` - Historical predictions

### Chart Data
- `GET /api/chart/:pair/:interval` - OHLCV chart data
- `GET /api/indicators/:pair` - Technical indicators

### Trading Data
- `GET /api/trade/:id` - Get trade details
- `POST /api/trade/backtest` - Backtest strategy

## 🤖 AI Model Details

### Input Features
- Price action (OHLCV)
- Volume patterns
- Technical indicators (RSI, MACD, Bollinger Bands)
- Market sentiment
- Support/Resistance levels

### Output Predictions
- Direction (Long/Short)
- Entry Price
- Stop-Loss Level
- Take-Profit Levels
- Confidence Score (0-100%)
- Risk/Reward Ratio

## 🎨 UI/UX Design

Modern black & white minimalist design featuring:
- Clean, non-monotonous interface
- High contrast for readability
- Intuitive prediction display cards
- Interactive chart visualization
- Real-time update indicators
- Responsive mobile design

## 📈 Performance Metrics

- Prediction Accuracy
- Win Rate
- Average Profit per Trade
- Risk/Reward Ratio
- Maximum Drawdown
- Sharpe Ratio

## 🔐 Security

- JWT token-based authentication
- HTTPS ready
- API rate limiting
- Secure environment variables
- Input validation & sanitization

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## 📧 Support

For issues and feature requests, please create an issue on GitHub.

---

**Built with ❤️ for the crypto community**
