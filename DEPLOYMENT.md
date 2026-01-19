# Deployment Guide

## 🚀 Deployment Options

### 1. Docker & Docker Compose

#### Quick Start with Docker
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Access the App
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- ML Service: http://localhost:5001

### 2. Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository
- MongoDB Atlas account

#### Deploy Backend
```bash
# Create Heroku app
heroku create crypto-ai-backend

# Set environment variables
heroku config:set -a crypto-ai-backend \
  MONGODB_URI=mongodb+srv://... \
  JWT_SECRET=your-secret

# Deploy
git push heroku main
```

#### Deploy Frontend
```bash
heroku create crypto-ai-frontend

# Set API URL
heroku config:set -a crypto-ai-frontend \
  REACT_APP_API_URL=https://crypto-ai-backend.herokuapp.com/api

git push heroku main
```

### 3. AWS Deployment

#### Using Elastic Beanstalk

**Backend:**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js crypto-ai-backend

# Deploy
eb create crypto-ai-prod
eb deploy
```

**Frontend (S3 + CloudFront):**
```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### 4. DigitalOcean App Platform

1. Connect GitHub repository
2. Select Node.js for backend
3. Configure Python for ML service
4. Set environment variables
5. Deploy

### 5. Kubernetes (K8s)

#### Create Deployments

**Backend Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crypto-ai-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/crypto-ai-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: LoadBalancer
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
```

#### Deploy to K8s
```bash
# Create namespace
kubectl create namespace crypto-ai

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb-uri='mongodb+srv://...' \
  --from-literal=jwt-secret='secret' \
  -n crypto-ai

# Apply deployment
kubectl apply -f deployment.yaml -n crypto-ai

# Check status
kubectl get pods -n crypto-ai
kubectl logs <pod-name> -n crypto-ai
```

## 🔒 Security Checklist

- [ ] Use HTTPS/TLS certificates
- [ ] Set strong JWT secrets
- [ ] Enable MongoDB authentication
- [ ] Configure CORS for allowed domains
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting on APIs
- [ ] Implement API authentication (JWT)
- [ ] Use firewall rules
- [ ] Enable logging and monitoring
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Use CDN for static assets
- [ ] Implement DDoS protection

## 📊 Monitoring & Logging

### Backend Monitoring
```javascript
// Add monitoring middleware
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`)
  })
  next()
})
```

### Useful Tools
- **Monitoring**: Datadog, New Relic, Prometheus
- **Logging**: ELK Stack, Splunk, CloudWatch
- **APM**: Sentry, Rollbar
- **Uptime**: StatusPage, Pingdom

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Install dependencies
      run: npm install && pip install -r ml-service/requirements.txt
    
    - name: Run tests
      run: npm test
    
    - name: Build frontend
      run: cd frontend && npm run build
    
    - name: Deploy to Heroku
      run: |
        git remote add heroku https://git.heroku.com/crypto-ai-backend.git
        git push heroku main
```

## 📈 Performance Optimization

### Frontend
- Minify and gzip assets
- Use code splitting
- Lazy load components
- Cache static assets
- Use CDN for delivery

### Backend
- Implement caching (Redis)
- Use database indexing
- Implement pagination
- Use connection pooling
- Optimize queries

### ML Service
- Use model quantization
- Implement batch processing
- Cache predictions
- Use GPU if available

## 💾 Database Backup & Recovery

### MongoDB Backup
```bash
# Backup
mongodump --uri "mongodb+srv://..." --out backup/

# Restore
mongorestore --uri "mongodb+srv://..." backup/
```

### Automated Backups (AWS)
```bash
# Using S3
aws s3 sync backup/ s3://backup-bucket/
```

## 🌐 Domain & SSL Setup

### CloudFlare Setup
1. Point nameservers to CloudFlare
2. Enable SSL (Free tier available)
3. Enable caching rules
4. Setup security settings

### Let's Encrypt (Free SSL)
```bash
# Using Certbot
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 📊 Scaling Strategy

### Horizontal Scaling
- Use load balancer (NGINX, HAProxy)
- Deploy multiple backend instances
- Use database replication
- Implement caching layer (Redis)

### Vertical Scaling
- Increase server resources
- Optimize code
- Use faster hardware
- Upgrade database tier

---

Last Updated: January 2024
