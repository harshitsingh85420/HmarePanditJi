-- Booking-readiness (progressive onboarding).
-- Registration now creates an ACCOUNT only; booking capabilities are earned
-- via the resumable readiness flow (R1 pujas+dakshina, R2 samagri, R3 travel,
-- R4 food/stay, R5 payment+verification). readinessStep is the server-side
-- resume pointer; isBookingReady unlocks the dashboard's GO ONLINE surface
-- (still gated by admin verification as before).

-- R2 asks "can you bring samagri?" fresh — the old blanket default of TRUE
-- becomes tri-state: NULL = never asked.
ALTER TABLE "PanditProfile" ALTER COLUMN "canBringSamagri" DROP DEFAULT;
ALTER TABLE "PanditProfile" ALTER COLUMN "canBringSamagri" DROP NOT NULL;

ALTER TABLE "PanditProfile" ADD COLUMN "travelPrefs" JSONB;
ALTER TABLE "PanditProfile" ADD COLUMN "foodPrefs" JSONB;
ALTER TABLE "PanditProfile" ADD COLUMN "readinessStep" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PanditProfile" ADD COLUMN "isBookingReady" BOOLEAN NOT NULL DEFAULT false;
