# Database Setup Guide - HmarePanditJi

## Overview

This guide covers database setup for the Pandit application using **Neon** (serverless PostgreSQL) for production and local PostgreSQL for development.

---

## 🗄️ Database Options

### Option 1: Neon (Recommended for Production)

**Why Neon:**
- Serverless PostgreSQL (scales to zero)
- Built-in connection pooling
- Branching for preview environments
- Free tier: 0.5 GB storage, unlimited compute hours
- India region available (AWS ap-south-1)

**Setup:**
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project: `hmarepanditji`
4. Select region: `AWS (ap-south-1) - Mumbai`
5. Get connection string from Dashboard

### Option 2: Supabase

**Why Supabase:**
- PostgreSQL + Real-time subscriptions
- Built-in authentication
- Auto-generated APIs
- Free tier: 500 MB storage

**Setup:**
1. Go to https://supabase.com
2. Create new project
3. Select region: `Singapore (ap-southeast-1)` (closest to India)
4. Get connection string from Settings → Database

### Option 3: Railway

**Why Railway:**
- Simple deployment
- PostgreSQL managed service
- Free tier available

**Setup:**
1. Go to https://railway.app
2. New Project → PostgreSQL
3. Deploy in Mumbai region
4. Get connection string

---

## 🔧 Local Development Setup

### Prerequisites
- Docker installed
- Docker Compose installed

### Step 1: Start Local Database

```bash
# From project root
docker-compose up -d postgres
```

### Step 2: Run Migrations

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (dev only)
pnpm db:push

# Or run migrations (production)
pnpm db:migrate
```

### Step 3: Seed Database (Optional)

```bash
pnpm db:seed
```

---

## 📊 Connection Pooling

### Why Connection Pooling?

Serverless functions (Vercel) create many concurrent connections. Without pooling:
- Database connection limits reached
- Slow connection establishment
- Potential database crashes

### PgBouncer Setup (Neon includes this)

Neon automatically provides connection pooling. Connection string format:

```
postgresql://user:password@ep-xxx.ap-south-1.aws.neon.tech/hmarepanditji?sslmode=require&pgbouncer=true
```

### Manual PgBouncer (if needed)

```yaml
# docker-compose.yml
services:
  pgbouncer:
    image: bitnami/pgbouncer:latest
    environment:
      - POSTGRESQL_HOST=postgres
      - POSTGRESQL_PORT=5432
      - POSTGRESQL_USERNAME=hpj_user
      - POSTGRESQL_PASSWORD=hpj_password_dev
      - POSTGRESQL_DATABASE=hmarepanditji
      - PGBOUNCER_PORT=6432
      - PGBOUNCER_BIND_ADDRESS=0.0.0.0
      - PGBOUNCER_POOL_MODE=transaction
      - PGBOUNCER_MAX_CLIENT_CONN=1000
      - PGBOUNCER_DEFAULT_POOL_SIZE=50
    ports:
      - "6432:6432"
    depends_on:
      - postgres
```

---

## 🔄 Database Migrations with Prisma

### Migration Workflow

```bash
# 1. Update schema.prisma
# Edit packages/db/prisma/schema.prisma

# 2. Create migration
cd packages/db
pnpm prisma migrate dev --name add_pandit_profile

# 3. Review migration SQL
# Check packages/db/prisma/migrations/[timestamp]_migration_name/migration.sql

# 4. Apply to production
pnpm prisma migrate deploy
```

### Production Migration Script

```bash
#!/bin/bash
# scripts/migrate-prod.sh

set -e

echo "Running production migrations..."

# Get DATABASE_URL from Vercel
DATABASE_URL=$(vercel env pull --environment production | grep DATABASE_URL | cut -d '=' -f2)

export DATABASE_URL

# Run migrations
cd packages/db
pnpm prisma migrate deploy

echo "Migrations complete!"
```

---

## 💾 Backup Strategy

### Automated Backups

#### Neon (Automatic)
- Point-in-time recovery (7 days on free tier)
- Automatic daily backups
- No additional setup needed

#### Manual Backups

```bash
#!/bin/bash
# scripts/backup-db.sh

# Backup to S3
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Upload to S3
aws s3 cp backup-*.sql.gz s3://hmarepanditji-backups/

# Keep only last 30 days
aws s3 ls s3://hmarepanditji-backups/ | \
  awk '{print $4}' | \
  sort | \
  head -n -30 | \
  xargs -I {} aws s3 rm s3://hmarepanditji-backups/{}
```

### Backup Schedule

| Frequency | Retention | Method |
|-----------|-----------|--------|
| Real-time | 7 days | Neon PITR |
| Daily | 30 days | S3 backup |
| Monthly | 1 year | S3 Glacier |

---

## 🔐 Security

### Connection String Security

**DO:**
- Store in Vercel environment variables
- Use `.env` file (gitignored)
- Rotate secrets quarterly

**DON'T:**
- Commit `.env` to git
- Share connection strings in Slack
- Use production DB in development

### Database User Permissions

```sql
-- Create read-only user for analytics
CREATE USER reader WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE hmarepanditji TO reader;
GRANT USAGE ON SCHEMA public TO reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reader;

-- Create app user (limited permissions)
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE hmarepanditji TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

---

## 📈 Monitoring

### Database Metrics to Monitor

| Metric | Warning | Critical |
|--------|---------|----------|
| **Connection Count** | > 80% limit | > 95% limit |
| **Query Latency (p95)** | > 100ms | > 500ms |
| **CPU Usage** | > 70% | > 90% |
| **Storage** | > 70% used | > 90% used |
| **Replication Lag** | > 10s | > 60s |

### Query Performance

```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## 🚀 Production Checklist

- [ ] Database created in production (Neon/Supabase)
- [ ] Connection string added to Vercel env vars
- [ ] Connection pooling configured
- [ ] Migrations applied to production
- [ ] Backup strategy implemented
- [ ] Monitoring dashboard created
- [ ] Alert thresholds configured
- [ ] Security permissions set
- [ ] Disaster recovery tested

---

## 📞 Support

| Issue | Contact |
|-------|---------|
| Database connection issues | DevOps Lead |
| Migration failures | Backend Lead |
| Performance issues | Database Admin |
| Security concerns | Security Team |

---

**Last Updated**: March 27, 2026  
**Maintained By**: DevOps Team
