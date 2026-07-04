-- Schema deduplication:
--  * PanditBlockedDate merged into BlockedDate (canonical; gains "reason")
--  * Booking.panditUserId dropped — Booking.panditId (-> PanditProfile.id) is canonical
--  * SamagriPackage.panditProfileId dropped — SamagriPackage.panditId is canonical

-- ── BlockedDate absorbs PanditBlockedDate ────────────────────────────────────
ALTER TABLE "BlockedDate" ADD COLUMN "reason" TEXT;

INSERT INTO "BlockedDate" ("id", "panditId", "date", "reason")
SELECT pbd."id", pbd."panditProfileId", pbd."date", pbd."reason"
FROM "PanditBlockedDate" pbd
ON CONFLICT ("panditId", "date") DO NOTHING;

DROP TABLE "PanditBlockedDate";

CREATE INDEX "BlockedDate_date_idx" ON "BlockedDate"("date");

-- ── Booking: canonicalise panditId to PanditProfile.id ──────────────────────
-- Legacy rows stored a User.id in panditId; remap them to the profile id.
UPDATE "Booking" b
SET "panditId" = pp."id"
FROM "PanditProfile" pp
WHERE pp."userId" = b."panditId";

-- Rows that only had panditUserId set: backfill panditId from it.
UPDATE "Booking" b
SET "panditId" = pp."id"
FROM "PanditProfile" pp
WHERE pp."userId" = b."panditUserId"
  AND (b."panditId" = '' OR b."panditId" NOT IN (SELECT "id" FROM "PanditProfile"));

ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_panditUserId_fkey";
DROP INDEX IF EXISTS "Booking_panditUserId_idx";
ALTER TABLE "Booking" DROP COLUMN "panditUserId";

CREATE INDEX "Booking_panditId_idx" ON "Booking"("panditId");

-- ── SamagriPackage: single pandit relation ───────────────────────────────────
-- Backfill canonical panditId from the legacy column where it was never set.
UPDATE "SamagriPackage"
SET "panditId" = "panditProfileId"
WHERE ("panditId" = '' OR "panditId" IS NULL)
  AND "panditProfileId" IS NOT NULL;

ALTER TABLE "SamagriPackage" DROP CONSTRAINT IF EXISTS "SamagriPackage_panditProfileId_fkey";
DROP INDEX IF EXISTS "SamagriPackage_panditProfileId_idx";
ALTER TABLE "SamagriPackage" DROP COLUMN "panditProfileId";

CREATE INDEX "SamagriPackage_panditId_idx" ON "SamagriPackage"("panditId");
