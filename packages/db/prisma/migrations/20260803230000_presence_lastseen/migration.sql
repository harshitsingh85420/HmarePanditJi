-- PRESENCE EVIDENCE (Isj's isOnline law, 2026-08-03):
-- AN ASSERTION BECOMES A COMPUTATION OVER FACTS.
-- lastSeenAt is the heartbeat's landing column; the customer-facing claim
-- becomes effectiveOnline(isOnline, lastSeenAt) — intent AND evidence
-- within 90s. Until this runs, the deployed code FAILS STALE (every
-- pandit computes offline; the green dot stays dark) — a missing column
-- may hide a truth, never fabricate a presence.
--
-- FOR ISJ'S HAND ON NEON (Track 2A precedent — Render never migrates).

ALTER TABLE "PanditProfile" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
