---
description: How to run the full HmarePanditJi project locally
---

# Run HmarePanditJi Locally

## Prerequisites
- Docker Desktop (for PostgreSQL)
- Node.js 18+
- pnpm 9+

## Step 1: Start PostgreSQL via Docker
// turbo
```
docker-compose up -d postgres
```

## Step 2: Install dependencies (if not done)
// turbo
```
pnpm install
```

## Step 3: Generate Prisma client
// turbo
```
pnpm db:generate
```

## Step 4: Push schema to database
```
pnpm db:push
```

## Step 5: Seed the database
```
pnpm db:seed
```

## Step 6: Start all services
// turbo
```
pnpm dev
```

This starts all 4 services simultaneously via Turborepo:
- **Customer Website**: http://localhost:3000
- **Pandit Dashboard**: http://localhost:3001
- **Admin Panel**: http://localhost:3002
- **API Server**: http://localhost:4000

## Optional: View database with pgAdmin
```
docker-compose up -d pgadmin
```
Then open http://localhost:5050 (login: admin@hmarepanditji.com / admin123)

## Optional: View database with Prisma Studio
// turbo
```
pnpm db:studio
```
Opens at http://localhost:5555
