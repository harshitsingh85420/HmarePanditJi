-- THE SNAPSHOT INVARIANT (Ruling B, ops-configurable rate — Isj 2026-07-28)
--
-- Every booking freezes the platform-fee RATE in force at its creation, next
-- to the fee AMOUNT it already stored. Ops changing the default from 10% to
-- 12% must never retroactively alter a completed booking's arithmetic.
--
-- ─────────────────────────────────────────────────────────────────────────
-- CORRECTED TWICE — the history matters more than the current state.
--
-- v1 asserted "the bookings table is empty in production, so the backfill is a
--    formality". That was FALSE and NEVER VERIFIED — an assumption written as
--    a fact into the artifact that would act on it. Production held NINE rows,
--    EIGHT of them priced at 15%, so `DEFAULT 10` would have frozen a rate
--    those bookings never used: the snapshot invariant recording a fiction.
--
-- v2 (this file) keeps the two-source backfill below EVEN THOUGH the table is
--    now genuinely empty. The table is empty AND VERIFIED — Isj queried it in
--    the Neon console on 2026-07-28 and reported bookings 0, muhurat 0,
--    payouts 0, reviews 0, AFTER the nine rows were preserved to
--    docs/review/prod-bookings-2026-07-28.json. That is a human reading a live
--    console, not an inference from code — which is precisely the standard v1
--    failed to meet.
--
--    The derivation logic stays anyway. A backfill that is correct on an empty
--    table and ALSO correct on a populated one costs nothing extra and cannot
--    be invalidated by a restore, a replay against a snapshot, or a second
--    environment that is not empty. A migration should not depend on a fact
--    about one database at one instant.
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
