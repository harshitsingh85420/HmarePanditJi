# OWED MIGRATION — aadhaarConsentAt + accommodationPrefs

**Branch `fix/owed-migration` (do NOT merge without applying deliberately).**
Migrations touch the prod DB; this is a founder-applied step, not an auto-deploy.

## What drifted, and why

`PanditProfile.aadhaarConsentAt` (`DateTime?`) and `accommodationPrefs` (`Json?`)
were added to `schema.prisma` and pushed to prod via `prisma db push` — **with no
migration file.** `travelPrefs`/`foodPrefs` (added at the same time) DO have one
(`20260708120000_booking_readiness`); these two slipped the net. Grep-confirmed:

```
aadhaarConsentAt:   0 migrations   ← drift
accommodationPrefs: 0 migrations   ← drift
travelPrefs:        1 migration
foodPrefs:          1 migration
```

## What this branch adds

1. `migrations/20260723000000_pandit_identity_consent_accommodation/migration.sql`
   — `ADD COLUMN IF NOT EXISTS` for both, JSONB / TIMESTAMP(3) (matching the
   booking_readiness convention). Both nullable + additive → **zero data loss,
   no table rewrite.**
2. `migrations/migration_lock.toml` — was **missing** (it blocked all `prisma
   migrate` tooling with "could not determine the connector"). Now `provider =
   "postgresql"`, so migrate commands work again.

Verified offline: `prisma validate` → schema valid. The SQL is idempotent, so it
is safe under either apply path below.

## How to apply on PROD (the columns ALREADY exist there)

Because db-push already created these columns on prod, a plain migration would
collide — but `IF NOT EXISTS` makes it a no-op. Two safe paths:

- **Canonical (recommended): mark it applied without running it.**
  ```bash
  pnpm --filter @hmarepanditji/db exec prisma migrate resolve \
    --applied 20260723000000_pandit_identity_consent_accommodation
  ```
  Records it in `_prisma_migrations` so history is consistent and future
  `migrate deploy` skips it.
- **Or just deploy** — `prisma migrate deploy` runs it; the `IF NOT EXISTS`
  guards make it harmless on prod.

**Note on the current prod apply path:** Render's start command uses
`prisma db push` (per render.yaml), so migrations are NOT the prod apply
mechanism today — prod schema is synced directly. This migration restores the
**replayable history** for a fresh environment, an audit, or the day the project
moves to `migrate deploy` (T21/T37). Applying it on prod is therefore optional
now but should be done so `_prisma_migrations` matches reality.

## Final verification (founder — needs a scratch Postgres)

I could not run the shadow-DB replay (no local Postgres). Confirm no *remaining*
drift with a throwaway DB:
```bash
pnpm --filter @hmarepanditji/db exec prisma migrate diff \
  --from-migrations ./prisma/migrations \
  --to-schema-datamodel ./prisma/schema.prisma \
  --shadow-database-url "postgres://…scratch…" --script
```
Empty output = migrations now fully reproduce `schema.prisma` (drift closed). If
it prints anything, there is *further* db-push drift beyond these two fields —
report it before merging.
