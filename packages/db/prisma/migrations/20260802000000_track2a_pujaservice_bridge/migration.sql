-- ─────────────────────────────────────────────────────────────
-- TRACK 2A / OPTION A — M1 + M2.
--
-- M1: PujaService gains the compound unique the wizard's upsert needs.
--     Without it the write is a findFirst-then-branch that races two submits
--     into duplicate rows for the same (pandit, puja).
-- M2: durationHours becomes nullable. PoojaConfig — the wizard's own record —
--     has no duration field, so a wizard-written row has nothing truthful to
--     put there. Defaulting it to a constant would print an invented duration
--     on a public profile, which is the fabricated-not-empty class this
--     campaign exists to delete.
--
-- ORDER MATTERS: the dedupe runs BEFORE the constraint, because adding a
-- unique index to a table that already holds duplicates fails and leaves the
-- migration half-applied.
-- ─────────────────────────────────────────────────────────────

-- M2 first (unconditional, cannot fail on data)
ALTER TABLE "PujaService" ALTER COLUMN "durationHours" DROP NOT NULL;

-- DEDUPE PRE-FLIGHT. Keep the newest row per (panditProfileId, pujaType);
-- delete the rest. Expected to affect ZERO rows — only the seed has ever
-- written this table — but the constraint below cannot be trusted to a
-- prediction. An empty delete is the proof, not the assumption.
DELETE FROM "PujaService" a
USING "PujaService" b
WHERE a."panditProfileId" = b."panditProfileId"
  AND a."pujaType" = b."pujaType"
  AND (a."createdAt" < b."createdAt"
       OR (a."createdAt" = b."createdAt" AND a."id" < b."id"));

-- M1
CREATE UNIQUE INDEX "PujaService_panditProfileId_pujaType_key"
  ON "PujaService"("panditProfileId", "pujaType");
