# Database Connection Troubleshooting Guide

## ⚠️ Current Issue

Prisma is unable to connect to PostgreSQL running in Docker from the Windows host machine.

**Error:** `Database credentials for hmarepanditji are not valid`

**Root Cause:** Likely a Docker Desktop networking issue where port 5432 is not properly exposed to `localhost`.

---

## 🔧 Solution Options

### Option 1: Use Docker Internal Network (Recommended)

Instead of using `localhost`, use the Docker internal IP or the container name.

1. **Find Docker container IP:**
   ```powershell
   docker inspect hmarepanditji-postgres -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}"
   ```

2. **Update `.env` files** with the Docker IP (e.g., `172.17.0.2`):
   
   **Root `.env`:**
   ```env
   DATABASE_URL="postgresql://hmarepanditji:hmarepanditji_secret@172.17.0.2:5432/hmarepanditji?schema=public"
   ```
   
   **`packages/db/.env`:**
   ```env
   DATABASE_URL=postgresql://hmarepanditji:hmarepanditji_secret@172.17.0.2:5432/hmarepanditji?schema=public
   ```

3. **Retry:**
   ```powershell
   pnpm db:push
   ```

---

### Option 2: Fix Docker Desktop Networking

1. **Open Docker Desktop Settings**
2. Go to **Settings** → **Resources** → **Network**
3. Ensure **"Use kernel networking for UDP"** is DISABLED (if present)
4. **Restart Docker Desktop**
5. **Restart containers:**
   ```powershell
   docker compose down
   docker compose up -d
   ```
6. **Retry:**
   ```powershell
   pnpm db:push
   ```

---

### Option 3: Use Host Network Mode (Windows WSL2)

If you're using Docker Desktop with WSL2 backend:

1. **Update `docker-compose.yml`:**
   ```yaml
   services:
     postgres:
       # ... existing config ...
       extra_hosts:
         - "host.docker.internal:host-gateway"
   ```

2. **Update `.env` to use host.docker.internal:**
   ```env
   DATABASE_URL="postgresql://hmarepanditji:hmarepanditji_secret@host.docker.internal:5432/hmarepanditji?schema=public"
   ```

3. **Restart:**
   ```powershell
   docker compose  down
   docker compose up -d
   pnpm db:push
   ```

---

### Option 4: Run Everything in Docker

The most reliable option - run the entire stack in Docker.

1. **Create a Dockerfile for the API** (already exists in `services/api/Dockerfile`)
2. **Update `docker-compose.yml`** to include all services
3. **Run everything with:**
   ```powershell
   docker compose up -d
   ```

---

## ✅ Manual Workaround (Quick Test)

If you just want to test the application NOW:

1. **Install PostgreSQL locally** (outside Docker):
   - Download from https://www.postgresql.org/download/windows/
   - Install with user: `hmarepanditji`, password: `hmarepanditji_secret`
   - Create database: `hmarepanditji`

2. **Update `.env` files** to use local PostgreSQL:
   ```env
   DATABASE_URL="postgresql://hmarepanditji:hmarepanditji_secret@localhost:5433/hmarepanditji?schema=public"
   ```
   (Use port 5433 to avoid conflict with Docker)

3. **Run commands:**
   ```powershell
   pnpm db:push
   pnpm db:seed
   pnpm dev
   ```

---

## 🧪 Diagnostic Commands

Check if Docker is healthy:
```powershell
# 1. Check containers
docker ps

# 2. Check if PostgreSQL is responding inside container
docker exec hmarepanditji-postgres pg_isready -U hmarepanditji

# 3. Connect to database from inside container
docker exec -it hmarepanditji-postgres psql -U hmarepanditji -d hmarepanditji

# 4. Try to connect from host
# Install PostgreSQL client tools first, then:
psql -h localhost -p 5432 -U hmarepanditji -d hmarepanditji
```

Check networking:
```powershell
# 1. Check if port is listening
netstat -ano | findstr :5432

# 2. Test port connectivity
Test-NetConnection -ComputerName localhost -Port 5432

# 3. Get container IP
docker inspect hmarepanditji-postgres -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}"
```

---

## 📝 What I Tried (Log for Reference)

1. ✅ Docker Desktop is running
2. ✅ Containers started successfully (`docker compose up -d`)
3. ✅ PostgreSQL is healthy inside container (`pg_isready`)
4. ✅ Can connect to database from inside container (`psql`)
5. ❌ Cannot connect from host (Prisma `db push` fails)
6. ❌ Port 5432 test fails from host (`Test-NetConnection`)

This indicates a **Docker networking issue**, not a PostgreSQL configuration issue.

---

## 🎯 Recommended Next Steps

**For immediate testing (easiest):**
1. Try **Option 1** above (use Docker internal IP)
2. If that fails, try **Option 2** (fix Docker Desktop networking)

**For production setup:**
1. Deploy to a cloud provider where networking is simpler:
   - Vercel (for Next.js apps)
   - Railway (for PostgreSQL + API)
   - Or use the included `render.yaml`

---

## 🆘 If Nothing Works

Run Prisma inside Docker:

```powershell
# 1. Create a temporary container with Node.js
docker run --rm -it --network hmarepanditji_default -v ${PWD}:/app -w /app/packages/db node:20-alpine sh

# 2. Inside the container:
npm install -g pnpm
pnpm install
export DATABASE_URL="postgresql://hmarepanditji:hmarepanditji_secret@hmarepanditji-postgres:5432/hmarepanditji?schema=public"
npx prisma db push
npx tsx prisma/seed.ts
exit

# 3. Then from Windows terminal:
pnpm dev
```

---

**Current Status:** Database is running, but host cannot connect. Needs networking fix.

**Last Updated:** February 13, 2026, 9:00 PM
