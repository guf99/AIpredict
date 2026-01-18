# Project Index & Navigation Guide

Dokumentasi lengkap untuk navigasi project Crypto AI Prediction Platform.

## 🗺️ Peta Project

### 📌 **Start Here**
1. [README.md](README.md) - Project overview dan features
2. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete summary (BACA INI DULU!)
3. [QUICKSTART.md](QUICKSTART.md) - Cara mulai dalam 5 menit

### 📚 **Documentation**

#### Setup & Development
- [DEVELOPMENT.md](DEVELOPMENT.md) - Setup development environment
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [API_DOCS.md](API_DOCS.md) - Complete API reference

#### Technical Deep Dive
- [ML_MODEL_DOCS.md](ML_MODEL_DOCS.md) - AI model architecture
- [API_DOCS.md](API_DOCS.md) - API endpoints & examples

#### Deployment & Production
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guide

#### Project Planning
- [FEATURES_ROADMAP.md](FEATURES_ROADMAP.md) - Features & roadmap
- [LICENSE](LICENSE) - MIT License

---

## 🏗️ Project Structure Explanation

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # Top navigation
│   │   ├── PredictionCard.jsx # Prediction display
│   │   ├── ChartViewer.jsx  # Chart visualization
│   │   ├── AIInsights.jsx   # AI insights panel
│   │   ├── TradingMetrics.jsx # Performance metrics
│   │   └── AdvancedAnalysis.jsx # Technical indicators
│   │
│   ├── api/
│   │   └── client.js        # API client methods
│   │
│   ├── utils/
│   │   └── trading.js       # Trading calculations
│   │
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
│
├── index.html               # HTML template
├── vite.config.js           # Vite build config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
└── package.json
```

**Key Files:**
- [frontend/src/App.jsx](frontend/src/App.jsx) - Main application logic
- [frontend/src/components/PredictionCard.jsx](frontend/src/components/PredictionCard.jsx) - Prediction display
- [frontend/src/api/client.js](frontend/src/api/client.js) - API integration

---

### Backend (`backend/`)
```
backend/
├── routes/
│   ├── predictions.js       # Prediction endpoints
│   ├── charts.js            # Chart endpoints
│   └── trades.js            # Trading endpoints
│
├── server.js                # Express server
├── test.js                  # Integration tests
├── .env.example             # Environment template
└── package.json
```

**Key Files:**
- [backend/server.js](backend/server.js) - Express setup & configuration
- [backend/routes/predictions.js](backend/routes/predictions.js) - Prediction API

---

### ML Service (`ml-service/`)
```
ml-service/
├── predictor.py             # ML model implementation
├── main.py                  # Flask app
├── config.py                # Configuration
├── requirements.txt         # Python dependencies
├── .env.example             # Environment template
└── models/                  # Saved models
```

**Key Files:**
- [ml-service/predictor.py](ml-service/predictor.py) - Main ML model with 20+ indicators
- [ml-service/main.py](ml-service/main.py) - Flask API server

---

## 📖 How to Use Each Document

### For Getting Started
1. Read [README.md](README.md) first
2. Follow [QUICKSTART.md](QUICKSTART.md) for setup
3. Reference [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup

### For API Usage
1. Check [API_DOCS.md](API_DOCS.md) for endpoints
2. Review examples in the docs
3. Use API client in [frontend/src/api/client.js](frontend/src/api/client.js)

### For ML Model
1. Read [ML_MODEL_DOCS.md](ML_MODEL_DOCS.md)
2. Review [ml-service/predictor.py](ml-service/predictor.py)
3. Check feature list and indicators

### For Production
1. Review [DEPLOYMENT.md](DEPLOYMENT.md)
2. Choose deployment platform
3. Follow setup instructions

---

## 🔍 Finding Things

### "How do I...?"

**...start development?**
→ [QUICKSTART.md](QUICKSTART.md) & [DEVELOPMENT.md](DEVELOPMENT.md)

**...use the API?**
→ [API_DOCS.md](API_DOCS.md)

**...understand the ML model?**
→ [ML_MODEL_DOCS.md](ML_MODEL_DOCS.md)

**...add a new feature?**
→ [CONTRIBUTING.md](CONTRIBUTING.md)

**...deploy to production?**
→ [DEPLOYMENT.md](DEPLOYMENT.md)

**...see what features exist?**
→ [FEATURES_ROADMAP.md](FEATURES_ROADMAP.md)

---

## 🚀 Quick Navigation

### To Run the Project
```bash
# See QUICKSTART.md for detailed steps
npm run install-all
npm run dev  # Terminal 1
cd frontend && npm run dev  # Terminal 2
cd ml-service && python main.py  # Terminal 3
```

### To Access the Project
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api
- ML Service: http://localhost:5001/api

### To Test
```bash
node backend/test.js
```

### To Build for Production
```bash
cd frontend && npm run build
```

---

## 📋 File Quick Reference

| Document | Purpose | Read When |
|----------|---------|-----------|
| README.md | Project overview | First |
| PROJECT_SUMMARY.md | Complete implementation summary | Getting familiar |
| QUICKSTART.md | 5-minute setup | Want quick start |
| DEVELOPMENT.md | Development setup | Setting up locally |
| API_DOCS.md | API reference | Building frontend/integration |
| ML_MODEL_DOCS.md | ML model details | Understanding predictions |
| DEPLOYMENT.md | Production deployment | Ready for production |
| FEATURES_ROADMAP.md | Features & plans | Planning improvements |
| CONTRIBUTING.md | How to contribute | Want to contribute |

---

## 🎯 Common Tasks

### Setup Local Development
1. [QUICKSTART.md](QUICKSTART.md) - Step-by-step
2. [DEVELOPMENT.md](DEVELOPMENT.md) - Detailed instructions

### Make API Calls
1. [API_DOCS.md](API_DOCS.md) - Endpoint reference
2. [frontend/src/api/client.js](frontend/src/api/client.js) - Code examples

### Train ML Model
1. [ML_MODEL_DOCS.md](ML_MODEL_DOCS.md) - Model info
2. [ml-service/predictor.py](ml-service/predictor.py) - Implementation

### Deploy Application
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment options
2. Choose platform and follow steps

### Add New Feature
1. [CONTRIBUTING.md](CONTRIBUTING.md) - Guidelines
2. [FEATURES_ROADMAP.md](FEATURES_ROADMAP.md) - Planned features

---

## 💡 Tips

- **Start with README.md** for overview
- **Use QUICKSTART.md** to get running quickly
- **Reference API_DOCS.md** frequently
- **Check FEATURES_ROADMAP.md** for what's planned
- **Run verify-setup.js** to check installation

```bash
node verify-setup.js
```

---

## 🔗 File Relationships

```
README.md (Start)
    ↓
PROJECT_SUMMARY.md (Overview)
    ↓
QUICKSTART.md or DEVELOPMENT.md (Setup)
    ├→ API_DOCS.md (When building features)
    ├→ ML_MODEL_DOCS.md (Understanding AI)
    └→ DEPLOYMENT.md (Going to production)

FEATURES_ROADMAP.md (Planning)
CONTRIBUTING.md (Contributing)
```

---

## 📞 Need Help?

1. **Setup issues?** → Check [DEVELOPMENT.md](DEVELOPMENT.md)
2. **API questions?** → See [API_DOCS.md](API_DOCS.md)
3. **ML questions?** → Review [ML_MODEL_DOCS.md](ML_MODEL_DOCS.md)
4. **Contributing?** → Read [CONTRIBUTING.md](CONTRIBUTING.md)
5. **Feature ideas?** → Check [FEATURES_ROADMAP.md](FEATURES_ROADMAP.md)

---

## ✅ Verification Checklist

Before starting development:
- [ ] Read README.md
- [ ] Read PROJECT_SUMMARY.md
- [ ] Run QUICKSTART.md steps
- [ ] Run verify-setup.js
- [ ] Access http://localhost:5173
- [ ] Check all 3 services running

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅
