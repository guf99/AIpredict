# Development Setup Guide

## 🖥️ System Requirements

- **OS**: Windows 10+, macOS 10.13+, or Linux
- **Node.js**: 16+ (Recommended 18 LTS)
- **Python**: 3.10+
- **MongoDB**: 4.4+ (local or cloud)

## 📦 Installation Steps

### 1. Clone/Setup Project

```bash
cd Project23
```

### 2. Install Node Dependencies

#### Windows
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
cd frontend
npm install
cd ../backend
npm install
cd ..
```

#### macOS/Linux
```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 3. Setup Python Environment

#### Windows
```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
cd ml-service
pip install -r requirements.txt
cd ..
```

#### macOS/Linux
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
cd ml-service
pip install -r requirements.txt
cd ..
```

### 4. Configure Environment Files

**Backend (.env):**
```bash
cd backend
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Edit with your values
```

**Edit backend/.env:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crypto-ai
JWT_SECRET=your-super-secret-key-123456
FLASK_API_URL=http://localhost:5001
NODE_ENV=development
```

**ML Service (.env):**
```bash
cd ../ml-service
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux
```

**Edit ml-service/.env:**
```env
FLASK_PORT=5001
MODEL_PATH=./models/crypto_predictor.pkl
DEBUG=False
```

### 5. Create Models Directory

```bash
# In ml-service folder
mkdir models  # Windows: md models
```

## 🗄️ Database Setup

### Option 1: Local MongoDB

**Windows:**
```powershell
# Install MongoDB Community
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# Or as service (after installation)
net start MongoDB
```

**macOS:**
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
# Install
sudo apt-get install -y mongodb

# Start
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Update `MONGODB_URI` in backend/.env

## 🚀 Running Development Server

### Terminal 1 - Backend

```bash
cd backend
npm run dev  # With auto-reload
# or: npm start  # Without auto-reload
```

Output should show:
```
🚀 Backend server running on port 5000
📊 API available at http://localhost:5000/api
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Output should show:
```
  VITE v5.0.0  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Terminal 3 - ML Service

```bash
# Activate virtual environment first
# Windows: .\venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate

cd ml-service
python main.py
```

Output should show:
```
🚀 ML Service running on port 5001
```

## ✅ Verification

Visit these URLs to verify everything is working:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health
- **ML Service**: http://localhost:5001/api/health

All should return status `ok`

## 🛠️ Useful Development Commands

```bash
# Frontend
cd frontend
npm run build       # Build for production
npm run lint        # Run linter

# Backend
cd backend
npm run dev         # Start with nodemon
npm start           # Start server

# ML Service
python main.py      # Start server
```

## 📝 VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Python
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- Thunder Client (API testing)

## 🐛 Troubleshooting

### Port Already in Use

**Windows:**
```powershell
# Find process using port 5000
Get-Process | Where-Object { $_.Name -like "*node*" }

# Kill process
Stop-Process -Id <PID> -Force
```

**macOS/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh  # or: mongo

# Or restart service
# Windows: net restart MongoDB
# macOS: brew services restart mongodb-community
# Linux: sudo systemctl restart mongod
```

### Python Module Not Found

```bash
# Reactivate virtual environment
# Windows: .\venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate

# Reinstall requirements
pip install -r ml-service/requirements.txt
```

### Clear Node Cache

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

## 📚 Project File Structure

```
Project23/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                # Express API
│   ├── routes/            # API routes
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── ml-service/             # Python ML
│   ├── predictor.py       # ML model
│   ├── main.py            # Flask app
│   ├── config.py
│   ├── requirements.txt
│   └── models/            # Saved models
│
├── .github/
│   └── copilot-instructions.md
├── README.md
├── API_DOCS.md
├── ML_MODEL_DOCS.md
├── QUICKSTART.md
└── docker-compose.yml
```

## 🔐 Security Notes

- Never commit `.env` files
- Change default JWT_SECRET
- Use strong MongoDB passwords
- Enable HTTPS in production
- Validate all API inputs
- Use CORS whitelist in production

## 📞 Getting Help

- Check documentation files (README.md, QUICKSTART.md)
- Review API_DOCS.md for endpoint details
- Check ML_MODEL_DOCS.md for model info
- Look at error logs in console
- Check MongoDB logs: `mongod.log`

---

Happy coding! 🚀
