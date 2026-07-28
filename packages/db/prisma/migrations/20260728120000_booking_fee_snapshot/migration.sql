-- THE SNAPSHOT INVARIANT (Ruling B, ops-configurable rate — Isj 2026-07-28)
--
-- Every booking freezes the platform-fee RATE in force at its creation, next
-- to the fee AMOUNT it already stored. Ops changing the default from 10% to
-- 12% must never retroactively alter a completed booking's arithmetic.
--
-- ─────────────────────────────────────────────────────────────────────────
-- CORRECTED 2026-07-28. The first version of this file asserted:
--     "the bookings table is empty in production, so the backfill is a
--      formality"
-- That was FALSE and never verified. Production holds NINE rows, and EIGHT of
-- them were priced at 15%, not 10%. A blanket `DEFAULT 10` backfill would have
-- frozen a rate those bookings never used — the snapshot invariant recording a
-- fiction, which is worse than having no snapshot at all.
--
-- The rate history:
--     < 2026-07-15   15%   (rows 1-8: the 8 July seed + the 14 July pilot proofs)
--    >= 2026-07-15   10%   (commit 0be83f5, "commission is ONE number (10%)")
--
-- TWO-SOURCE BACKFILL. Neither source is trusted alone:
--   SOURCE 1 (arithmetic)  ROUND(platformFee * 100.0 / dakshinaAmount)
--   SOURCE 2 (history)     the 2026-07-15 date boundary
-- The column is only made NOT NULL once both agree on every row. If they
-- disagree anywhere this migration FAILS LOUDLY rather than guessing — a wrong
-- frozen rate is silent and permanent.
-- ─────────────────────────────────────────────────────────────────────────

-- Step 1: nullable, so nothing is asserted before it is derived.
ALTER TABLE "Booking" ADD COLUMN "platformFeePercent" INTEGER;

-- Step 2: SOURCE 1 — derive each row's real rate from its own stored money.
-- Guarded against division by zero: a 0-dakshina row cannot imply a rate.
UPDATE "Booking"
SET "platformFeePercent" = ROUND("platformFee" * 100.0 / "dakshinaAmount")
WHERE "dakshinaAmount" > 0 AND "platformFee" > 0;

-- Step 3: SOURCE 2 — rows the arithmetic cannot speak for (dakshina 0, or a
-- fee of 0) fall back to the rate in force on their creation date.
UPDATE "Booking"
SET "platformFeePercent" = CASE WHEN "createdAt" < DATE '2026-07-15' THEN 15 ELSE 10 END
WHERE "platformFeePercent" IS NULL;

-- Step 4: CROSS-CHECK. Both sources must agree on every row where the
-- arithmetic is meaningful. Any disagreement aborts the migration.
DO $$
DECLARE mismatched INT;
BEGIN
  SELECT COUNT(*) INTO mismatched
  FROM "Booking"
  WHERE "dakshinaAmount" > 0
    AND "platformFee" > 0
    AND "platformFeePercent"
        IS DISTINCT FROM (CASE WHEN "createdAt" < DATE '2026-07-15' THEN 15 ELSE 10 END);
  IF mismatched > 0 THEN
    RAISE EXCEPTION
      'fee-snapshot backfill ABORTED: % row(s) where the derived rate disagrees with the date-boundary rate. Resolve by hand before freezing a rate that never applied.', mismatched;
  END IF;
END $$;

-- Step 5: only now is the value trustworthy enough to be required.
ALTER TABLE "Booking" ALTER COLUMN "platformFeePercent" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "platformFeePercent" SET DEFAULT 10;
