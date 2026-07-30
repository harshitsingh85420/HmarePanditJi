import { prisma } from "@hmarepanditji/db";
import { KYC_APPROVE_WRITE_STATUS } from "@hmarepanditji/types";

/* ─────────────────────────────────────────────────────────────
   THE ONLY PLACE THAT MAY MARK A PANDIT VERIFIED.

   Isj's ruling, 2026-07-30:

     "Aadhaar — ops looks at it. VERIFIED comes from ME marking it.
      Never automatically."

   VERIFIED is therefore an OPS ACTION, not a state a row can drift
   into. It is the platform saying, in its own voice, that a human
   looked at a real person's identity document. That sentence must have
   an author and a timestamp, or it is not a claim — it is a rumour.

   WHAT THIS REPLACES. Before this file, FOUR things could write it:
     1. POST  /admin/pandits/:id/approve       (admin.routes.ts, inline)
     2. PATCH /admin/pandits/:panditId/verify  (updatePanditVerification —
        an action-parameter override: APPROVE / REJECT / REQUEST_INFO,
        exactly the "status-override dropdown" the ruling forbids)
     3. POST  /admin/kyc/:panditId/review      (reviewKYC in kyc.service)
     4. packages/db/prisma/seed.ts × 5 rows — which is how five people
        nobody checked came to be VERIFIED in production.
   The admin UI used TWO OF THEM for the same button, on two different
   screens. Three implementations of one sentence is how the sentence
   stops meaning anything.

   THE AUDIT TRAIL IS NOT OPTIONAL. `verifiedById` must be a real user
   id. The previous inline path defaulted to the literal string
   "admin" when the request had no user — a non-id in an id column,
   which is precisely the dangling reference the schema sweep flagged.
   That fallback is gone: no admin id, no write.
   ───────────────────────────────────────────────────────────── */

export class VerificationAuthorMissing extends Error {
  constructor() {
    super(
      "Refusing to mark a pandit VERIFIED without an authenticated admin id. " +
        "VERIFIED is an ops action and the row must record whose action it was.",
    );
    this.name = "VerificationAuthorMissing";
  }
}

/**
 * Mark a pandit's identity VERIFIED — the single writer.
 *
 * @param panditProfileId PanditProfile.id
 * @param adminUserId     the REAL User.id of the ops person doing it.
 *                        No default, no "admin" literal, no fallback.
 */
export async function markPanditVerified(panditProfileId: string, adminUserId: string | undefined | null) {
  // FAIL CLOSED. An unauthored verification is worse than none: it looks
  // identical to a real one and cannot be traced when it turns out wrong.
  if (!adminUserId || typeof adminUserId !== "string" || !adminUserId.trim()) {
    throw new VerificationAuthorMissing();
  }

  return prisma.panditProfile.update({
    where: { id: panditProfileId },
    data: {
      verificationStatus: KYC_APPROVE_WRITE_STATUS,
      // WHO and WHEN — written in the same statement as the claim, so a
      // verified row without an author cannot exist going forward.
      verifiedById: adminUserId,
      verifiedAt: new Date(),
    },
  });
}
