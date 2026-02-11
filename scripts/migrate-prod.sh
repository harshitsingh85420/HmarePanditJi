#!/bin/bash
# ─────────────────────────────────────────────────────────────
# migrate-prod.sh — Run Prisma migrations in production
#
# Usage:
#   DATABASE_URL=postgresql://... bash scripts/migrate-prod.sh
#
# Run this BEFORE deploying new app versions that include schema changes.
# ─────────────────────────────────────────────────────────────

set -euo pipefail

echo "🚀 Running Prisma DB migrations..."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ ERROR: DATABASE_URL is not set. Aborting."
  exit 1
fi

# Run from monorepo root
cd "$(dirname "$0")/.."

# Deploy migrations (non-interactive, safe for production)
pnpm --filter=@hmarepanditji/db exec prisma migrate deploy

echo "✅ Migrations complete."

# Optional: run a quick schema validation
pnpm --filter=@hmarepanditji/db exec prisma validate

echo "✅ Schema validated."
