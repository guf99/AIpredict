# Crypto AI Prediction Platform - Quick Start Guide

## 🚀 Mulai dengan Cepat

### 1. Setup Environment

```bash
# Copy environment files
cd backend
copy .env.example .env

cd ../ml-service
copy .env.example .env
```

### 2. Install Dependencies

**Windows PowerShell:**
```powershell
# Install all at once
npm run install-all

# Or step by step:
npm install
cd frontend; npm install; cd ..
pip install -r ml-service/requirements.txt
```

**Linux/Mac:**
```bash
npm run install-all
pip install -r ml-service/requirements.txt
```

### 3. Start Services

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or: npm run dev (with auto-reload)
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - ML Service:**
```bash
cd ml-service
python main.py
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **ML Service**: http://localhost:5001/api

## 📋 API Endpoints Reference

### Predictions
```
GET  /api/predictions/:pair          - Get current prediction
POST /api/predictions/analyze        - Analyze specific pair
GET  /api/predictions/:pair/history  - Historical predictions
```

### Charts
```
GET /api/chart/:pair/:interval       - Chart OHLCV data
GET /api/chart/indicators/:pair      - Technical indicators
```

### Trading
```
GET  /api/trade/:id                  - Trade details
POST /api/trade/backtest             - Backtest strategy
```

### ML Service
```
GET  /api/health                     - Service status
POST /api/predict                    - Get prediction
POST /api/backtest                   - Backtest strategy
POST /api/model/train                - Train model
GET  /api/model/info                 - Model info
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Change ports in:
# - frontend/vite.config.js (PORT)
# - backend/server.js (PROCESS.ENV.PORT)
# - ml-service/.env (FLASK_PORT)
```

### Dependencies Issues
```bash
# Clear node_modules
rm -r node_modules package-lock.json
npm install

# For Python
pip install --upgrade pip
pip install -r ml-service/requirements.txt
```

### MongoDB Connection
- Ensure MongoDB is running: `mongod`
- Or update `MONGODB_URI` in backend/.env

## 📚 Project Structure

```
.
├── frontend/                - React + Vite UI
│   ├── src/
│   │   ├── components/     - React components
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── backend/                - Node.js + Express API
│   ├── routes/
│   │   ├── predictions.js
│   │   ├── charts.js
│   │   └── trades.js
│   ├── server.js
│   └── package.json
├── ml-service/             - Python ML service
│   ├── predictor.py       - AI model
│   ├── main.py
│   └── requirements.txt
├── README.md
└── package.json
```

## 🎯 Next Steps

1. **Connect Real Data**: Replace mock data dengan real crypto APIs
2. **Train Model**: Use historical data to train ML model
3. **Setup Database**: Configure MongoDB with real schema
4. **Add Authentication**: Implement user login/registration
5. **Deploy**: Use Docker for containerization

---

Built with ❤️ for crypto traders
