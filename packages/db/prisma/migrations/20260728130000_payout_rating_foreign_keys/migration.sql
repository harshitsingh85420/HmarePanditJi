-- ORPHANED MONEY RECORDS BECOME IMPOSSIBLE (Isj ruling, 2026-07-28)
--
-- `Payout.bookingId` and `Payout.panditId` were required String columns with
-- NO referential integrity. A Payout is a MONEY RECORD, and
-- services/api/src/routes/admin.routes.ts:222 creates one ON DEMAND inside
-- mark-paid when none is found — so a stale or wrong bookingId minted a payout
-- attached to nothing and the database never objected.
--
-- `CustomerRating` rides along: three bare ids, same shape, same silent-orphan
-- class. It is not itself money, but the cost of fixing it here is zero.
--
-- WHY NOW: the Booking table is empty (verified by Isj in the Neon console,
-- 2026-07-28 — bookings 0, muhurat 0, payouts 0, reviews 0). On an empty table
-- the orphan check below is trivially satisfied. This is the cheapest this
-- constraint will ever be; after the pilot it needs a data migration over live
-- money.
--
-- FAIL LOUD, NEVER GUESS. CustomerRating's row count was NOT verified in that
-- console check, so this migration refuses to add a constraint it cannot
-- honour: any orphan aborts the whole transaction and nothing is applied.

-- ── Step 1: refuse to proceed if any orphan exists ──────────────────────────
DO $$
DECLARE
  orphan_payout_booking INT;
  orphan_payout_pandit  INT;
  orphan_rating         INT;
BEGIN
  SELECT COUNT(*) INTO orphan_payout_booking
    FROM "Payout" p LEFT JOIN "Booking" b ON b.id = p."bookingId" WHERE b.id IS NULL;
  SELECT COUNT(*) INTO orphan_payout_pandit
    FROM "Payout" p LEFT JOIN "PanditProfile" pp ON pp.id = p."panditId" WHERE pp.id IS NULL;
  SELECT COUNT(*) INTO orphan_rating
    FROM "CustomerRating" cr
    LEFT JOIN "Booking" b        ON b.id  = cr."bookingId"
    LEFT JOIN "PanditProfile" pp ON pp.id = cr."panditId"
    LEFT JOIN "User" u           ON u.id  = cr."customerId"
    WHERE b.id IS NULL OR pp.id IS NULL OR u.id IS NULL;

  IF orphan_payout_booking > 0 OR orphan_payout_pandit > 0 OR orphan_rating > 0 THEN
    RAISE EXCEPTION
      'FK migration ABORTED — orphans exist: % payout(s) with no booking, % payout(s) with no pandit, % rating(s) with a missing parent. These are exactly the records this constraint exists to prevent; resolve them by hand before constraining.',
      orphan_payout_booking, orphan_payout_pandit, orphan_rating;
  END IF;
END $$;

-- ── Step 2: the constraints ────────────────────────────────────────────────
-- ON DELETE RESTRICT is deliberate and matches Review / BookingStatusUpdate:
-- deleting a Booking that still has a payout must FAIL, not cascade. Money
-- records are not swept away as a side effect of removing their parent.
ALTER TABLE "Payout"
  ADD CONSTRAINT "Payout_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payout"
  ADD CONSTRAINT "Payout_panditId_fkey"
  FOREIGN KEY ("panditId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CustomerRating"
  ADD CONSTRAINT "CustomerRating_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CustomerRating"
  ADD CONSTRAINT "CustomerRating_panditId_fkey"
  FOREIGN KEY ("panditId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CustomerRating"
  ADD CONSTRAINT "CustomerRating_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Step 3: indexes on the FK columns Prisma does not create implicitly ─────
-- bookingId is already @unique on both tables, so only the non-unique ones.
CREATE INDEX IF NOT EXISTS "Payout_panditId_idx"         ON "Payout"("panditId");
CREATE INDEX IF NOT EXISTS "CustomerRating_panditId_idx" ON "CustomerRating"("panditId");
CREATE INDEX IF NOT EXISTS "CustomerRating_customerId_idx" ON "CustomerRating"("customerId");
