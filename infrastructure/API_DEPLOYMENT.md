# API Service Deployment Guide - HmarePanditJi

## Overview

This guide covers deployment of the API service (`services/api/`) to Render/Railway for production.

---

## 🚀 Deployment Options

### Option 1: Render (Recommended)

**Why Render:**
- Auto-deploy from GitHub
- Free tier available
- Built-in HTTPS
- PostgreSQL support
- India region (via AWS)

**Pricing:**
- Free tier: 750 hours/month
- Starter: $7/month (always-on)
- Standard: $25/month (production)

### Option 2: Railway

**Why Railway:**
- Simple deployment
- $5 free credit/month
- Auto-scaling
- Good for startups

### Option 3: Vercel Serverless Functions

**Why Vercel Functions:**
- Same deployment as frontend
- No separate service
- Auto-scaling
- Pay per execution

**Limitations:**
- 10 second timeout (Hobby)
- 60 second timeout (Pro)
- Not suitable for long-running tasks

---

## 📦 Pre-Deployment Checklist

### 1. Environment Variables

Set these in Render/Railway dashboard:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/hmarepanditji

# Auth
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-min-64-chars
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=30d
ENCRYPTION_KEY=32-byte-hex-key-for-aes256

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# MSG91 (SMS)
MSG91_AUTH_KEY=xxxxx
MSG91_SENDER_ID=HMPANDIT
MSG91_OTP_TEMPLATE_ID=xxxxx

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=hmarepanditji
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hmarepanditji.iam.gserviceaccount.com

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
S3_BUCKET_NAME=hmarepanditji-uploads
CLOUDFRONT_URL=https://xxxxx.cloudfront.net

# App URLs
WEB_URL=https://hmarepanditji.com
PANDIT_URL=https://pandit.hmarepanditji.com
ADMIN_URL=https://admin.hmarepanditji.com
API_URL=https://api.hmarepanditji.com

# CORS
ALLOWED_ORIGINS=https://hmarepanditji.com,https://pandit.hmarepanditji.com,https://admin.hmarepanditji.com

# Platform Config
PLATFORM_COMMISSION_PERCENT=20
GST_PERCENT=18
MIN_BOOKING_ADVANCE_HOURS=48

# Node Environment
NODE_ENV=production
PORT=8080
```

### 2. Build Configuration

**Render:**
```yaml
# render.yaml (already created)
services:
  - type: web
    name: hmarepanditji-api
    runtime: node
    region: oregon  # Closest free tier to India
    plan: starter
    buildCommand: cd services/api && npm install && npx prisma generate && npm run build
    startCommand: node services/api/dist/index.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
```

**Railway:**
```yaml
# railway.tomc
[build]
builder = "NIXPACKS"
buildCommand = "cd services/api && npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "node services/api/dist/index.js"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
```

---

## 🔧 Deployment Steps

### Render Deployment

#### Step 1: Connect GitHub Repository

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect repository: `hmarepanditji`

#### Step 2: Configure Service

```
Name: hmarepanditji-api
Region: Oregon (closest free tier)
Branch: main
Root Directory: services/api
Runtime: Node
Build Command: npm install && npx prisma generate --schema=../../packages/db/prisma/schema.prisma && npm run build
Start Command: node dist/index.js
```

#### Step 3: Set Environment Variables

Copy all variables from `.env.example` to Render dashboard.

#### Step 4: Deploy

Click "Create Web Service" → Deployment starts automatically.

### Railway Deployment

#### Step 1: Connect GitHub

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repository: `hmarepanditji`

#### Step 2: Configure

```
Root Directory: services/api
Build Command: npm install && npx prisma generate && npm run build
Start Command: node dist/index.js
```

#### Step 3: Add Variables

Add all environment variables in Railway dashboard.

#### Step 4: Deploy

Click "Deploy" → Automatic deployment.

---

## 🔍 Health Checks

### Endpoint: `/health`

```typescript
// GET /api/v1/health
{
  status: 'ok',
  timestamp: '2026-03-27T10:30:00.000Z',
  uptime: 86400,
  database: 'connected',
  redis: 'connected',
  version: '1.0.0'
}
```

### Endpoint: `/ready`

```typescript
// GET /api/v1/ready
{
  ready: true,
  checks: {
    database: true,
    redis: true,
    externalApis: true
  }
}
```

---

## 📊 Monitoring

### Render Dashboard

- **Metrics**: CPU, Memory, Request Count, Response Time
- **Logs**: Real-time log streaming
- **Alerts**: Configure via webhook

### Railway Dashboard

- **Metrics**: CPU, Memory, Network
- **Logs**: Real-time log viewing
- **Alerts**: Email notifications

### Custom Monitoring

```typescript
// services/api/src/middleware/metrics.ts
import { PrometheusClient } from 'prom-client'

const metrics = {
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  }),
  
  httpRequestsTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  }),
}

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', PrometheusClient.register.contentType)
  res.end(await PrometheusClient.register.metrics())
})
```

---

## 🔄 CI/CD Pipeline

### Automatic Deployment

```yaml
# .github/workflows/deploy-api.yml
name: Deploy API Service

on:
  push:
    branches: [main]
    paths: ['services/api/**', 'packages/db/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm test
        working-directory: services/api

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### Manual Trigger

```bash
# Trigger deployment via CLI
render-cli redeploy --service hmarepanditji-api
```

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Symptoms:**
```
Error: Cannot find module '@hmarepanditji/db'
```

**Solution:**
```bash
# Ensure Prisma client is generated
cd packages/db
pnpm prisma generate

# Check package.json dependencies
cat services/api/package.json | grep -A 5 dependencies
```

### Issue: Database Connection Timeout

**Symptoms:**
```
Error: connect ETIMEDOUT
```

**Solution:**
1. Check DATABASE_URL is correct
2. Verify database allows connections from Render IP
3. Add connection pooling (PgBouncer)
4. Increase connection timeout

### Issue: High Memory Usage

**Symptoms:**
- Memory > 80% consistently
- OOM kills

**Solution:**
```typescript
// Optimize Prisma queries
const results = await prisma.model.findMany({
  take: 100,  // Add pagination
  select: {   // Select only needed fields
    id: true,
    name: true,
  },
})

// Enable connection pooling
// Use PgBouncer in front of database
```

---

## 📈 Scaling Strategy

### Current (Startup: 10-100 users)
- Render Free/Starter ($0-7/month)
- Single instance
- Basic monitoring

### Growth (1,000-10,000 users)
- Render Standard ($25/month)
- Auto-scaling (2-5 instances)
- Load balancer
- Redis caching

### Scale (100,000+ users)
- AWS ECS/Fargate
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- CloudWatch monitoring
- Auto-scaling (5-50 instances)

---

## 🚀 Production Checklist

- [ ] API deployed and accessible
- [ ] Health check endpoint working
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry) integrated
- [ ] Monitoring dashboard created
- [ ] Alert thresholds configured
- [ ] Backup strategy implemented
- [ ] SSL certificate valid
- [ ] Load testing complete

---

**Last Updated**: March 27, 2026  
**Maintained By**: DevOps Team
