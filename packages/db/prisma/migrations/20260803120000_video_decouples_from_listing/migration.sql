-- VIDEO DECOUPLES FROM LISTING (Isj's सही, 2026-08-03).
--
-- 1. The column default flips to false: a writer that forgets the field must
--    UNpublish, not publish. (The old default(true) let the caller-less
--    onboardingStep2 publish ₹0 rows silently — W6, closed in the same
--    change.)
ALTER TABLE "PujaService" ALTER COLUMN "isActive" SET DEFAULT false;

-- 2. Every EXISTING row was a pandit's own declaration (the wizard, the
--    readiness rate mirror, or the backfill over DakshinaRate rows the pandit
--    himself set) — under the new model a declaration LISTS. Rows an admin
--    had un-published by rejecting a VIDEO stay listed too: rejecting a video
--    must not unlist a bookable pooja. Exposure is still gated by F-B3-1
--    (only VERIFIED pandits are listed at all).
UPDATE "PujaService" SET "isActive" = true;
