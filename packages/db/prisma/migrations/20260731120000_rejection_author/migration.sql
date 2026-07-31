-- THE NEGATIVE CLAIM GETS AN AUTHOR (Isj ruling, 2026-07-31).
--
-- REJECTED was written inline with a reason and nothing else: the platform
-- told a real person, on his phone, in Hindi, that his identity was refused —
-- and kept no record of who decided it. An APPROVED with no author is
-- fabricated by definition; a REJECTED with no author is the same claim in
-- the negative. lib/rejectionWriter.ts now writes status + reason + author +
-- timestamp in ONE update (the onboardingStep5 atomicity rule).
--
-- ADDITIVE AND NULLABLE. Existing rows keep NULL stamps, which is the truth
-- about them: nobody knows who rejected them, and inventing an author would
-- be the fabrication this column exists to end.
--
-- NO FOREIGN KEY, deliberately — matching verifiedById. The ops session is
-- the env-login (ADMIN_EMAIL + ADMIN_PASSWORD_HASH, author id the literal
-- "admin"), which is not backed by a User row; a FK here would refuse every
-- real rejection.
ALTER TABLE "PanditProfile" ADD COLUMN "rejectedAt"   TIMESTAMP(3);
ALTER TABLE "PanditProfile" ADD COLUMN "rejectedById" TEXT;
