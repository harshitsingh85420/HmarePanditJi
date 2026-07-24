-- OWED MIGRATION (founder order, 2026-07-23).
-- PanditProfile.aadhaarConsentAt (DateTime?) and PanditProfile.accommodationPrefs
-- (Json?) were added to schema.prisma and pushed to prod via `prisma db push`
-- with NO migration file — a hole in the replayable history (T21/T37 depend on
-- it). travelPrefs/foodPrefs already have one (20260708120000_booking_readiness);
-- these two did not. This backfills them, matching that migration's conventions
-- (JSONB for Json?, TIMESTAMP(3) for DateTime?).
--
-- PROD-SAFE + IDEMPOTENT: `IF NOT EXISTS` makes it a NO-OP on prod (the columns
-- already exist from db push) and a clean CREATE on a fresh DB. Both columns are
-- NULLABLE and additive → zero data loss, zero table rewrite, whether this is
-- applied by `migrate deploy` or reconciled by `migrate resolve --applied`.
-- See docs/review/owed-migration.md for the exact apply steps on prod.

ALTER TABLE "PanditProfile" ADD COLUMN IF NOT EXISTS "aadhaarConsentAt" TIMESTAMP(3);
ALTER TABLE "PanditProfile" ADD COLUMN IF NOT EXISTS "accommodationPrefs" JSONB;
