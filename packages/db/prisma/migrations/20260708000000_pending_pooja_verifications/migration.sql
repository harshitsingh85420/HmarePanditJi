-- F29: newly added poojas await verification; signup poojas stay verified
ALTER TABLE "PanditProfile" ADD COLUMN "pendingPoojaVerifications" TEXT[] NOT NULL DEFAULT '{}';
