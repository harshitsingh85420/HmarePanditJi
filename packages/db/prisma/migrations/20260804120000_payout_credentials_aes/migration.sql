-- RULED ORDER #2 (Isj, 2026-08-04) — payout credentials become real AES-256-GCM.
--
-- WHY: bankAccountNumber held three formats at once — base64 from
-- onboarding.controller.ts and readiness.controller.ts, and RAW PLAINTEXT
-- from pandit.routes.ts and voice.routes.ts. upiId was plaintext throughout.
-- The function performing the base64 was named encrypt().
--
-- THIS MIGRATION ONLY ADDS COLUMNS. It moves no data: re-encryption needs
-- the ENCRYPTION_KEY and AES in application code, so the backfill is
-- scripts/backfill-payout-credentials.mjs (dry-run first, Isj's hand).
--
-- THE DROP OF THE OLD COLUMNS RIDES THE NEXT MIGRATION, after the backfill's
-- after-count reads zero non-AES rows. Until then the old columns sit dead:
-- no writer, no reader, tripwired in schema.prisma and pinned by
-- payoutCredentials.test.ts.

ALTER TABLE "PanditProfile" ADD COLUMN "bankAccountEncrypted" TEXT;
ALTER TABLE "PanditProfile" ADD COLUMN "bankAccountLast4" TEXT;
ALTER TABLE "PanditProfile" ADD COLUMN "upiIdEncrypted" TEXT;
ALTER TABLE "PanditProfile" ADD COLUMN "upiIdMasked" TEXT;
