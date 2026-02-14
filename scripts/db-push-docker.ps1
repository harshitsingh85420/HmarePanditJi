# Run Prisma DB Push from within Docker network
# This workaround is needed because Windows host cannot connect to Docker PostgreSQL

Write-Host "Running Prisma DB Push through Docker..." -ForegroundColor Cyan

docker run --rm --network hmarepanditji_default -v ${PWD}:/app -w /app node:20-alpine sh -c "npm install -g pnpm@9.15.9 && cd /app && pnpm install --frozen-lockfile && cd /app/packages/db && DATABASE_URL='postgresql://hmarepanditji:hmarepanditji_secret@hmarepanditji-postgres:5432/hmarepanditji?schema=public' npx prisma generate && DATABASE_URL='postgresql://hmarepanditji:hmarepanditji_secret@hmarepanditji-postgres:5432/hmarepanditji?schema=public' npx prisma db push"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push database schema" -ForegroundColor Red
    exit 1
}

