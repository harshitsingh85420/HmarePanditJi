import { prisma } from "@hmarepanditji/db";
import { KYC_REJECT_WRITE_STATUS } from "@hmarepanditji/types";

/* ─────────────────────────────────────────────────────────────
   THE ONLY PLACE THAT MAY MARK A PANDIT'S IDENTITY REJECTED.

   THE CHOKEPOINT LAW APPLIES TO NEGATIVE CLAIMS TOO.

   verificationWriter exists because VERIFIED is the platform saying, in
   its own voice, that a human looked at a real person's identity
   document — and a claim with no author is a rumour. REJECTED is the
   same sentence with the sign flipped: the platform telling a real
   person, on his phone, in Hindi, that his identity was refused. It was
   written INLINE, with a reason and nothing else — no author, no
   timestamp, no chokepoint — and reached production that way.

   Found 2026-07-31 while diagnosing the approve button. The asymmetry
   was never in authentication (one preHandler covers both legs); it was
   in AUTHORSHIP and in FRICTION:
     · approve recorded verifiedById + verifiedAt; reject recorded nothing
     · approve was gated on a confirmation; reject was one click
   So the DESTRUCTIVE leg was the cheap one. This file closes the first
   half; the in-page confirmation modal closes the second.

   WHY NO FK ON rejectedById — the same reason verifiedById has none: the
   ops session is the env-login (ADMIN_EMAIL + ADMIN_PASSWORD_HASH,
   author id the literal "admin"), which is not backed by a User row. A
   foreign key here would refuse every real rejection. The column records
   WHICH SESSION acted, and that is what is available to record today.

   ONE UPDATE, NOT TWO — the onboardingStep5 atomicity rule: the status,
   the reason and the authorship are one fact about one decision. A
   failure between them would produce a REJECTED row with no reason, or a
   reason with no rejection, and ops could not tell either from a real
   one.
   ───────────────────────────────────────────────────────────── */

export class RejectionAuthorMissing extends Error {
  constructor() {
    super(
      "Refusing to mark an identity REJECTED without an authenticated admin id. " +
        "Rejection is an ops action and the row must record whose action it was.",
    );
    this.name = "RejectionAuthorMissing";
  }
}

export class RejectionReasonMissing extends Error {
  constructor() {
    super(
      "Refusing to mark an identity REJECTED without the resolved Hindi reason. " +
        "The pandit reads this text verbatim; a rejection he cannot act on is a dead end.",
    );
    this.name = "RejectionReasonMissing";
  }
}

/**
 * Mark a pandit's identity REJECTED — the single writer.
 *
 * @param panditProfileId PanditProfile.id
 * @param adminUserId     the id of the ops session doing it. No default,
 *                        no "admin" literal fallback — fail closed.
 * @param reasonText      the RESOLVED Hindi text (from the preset codes in
 *                        packages/types), exactly as the pandit will read it.
 */
export async function markPanditRejected(
  panditProfileId: string,
  adminUserId: string | undefined | null,
  reasonText: string | undefined | null,
) {
  // FAIL CLOSED, both ways. An unauthored rejection is indistinguishable
  // from a real one and cannot be traced when it turns out to be a
  // misclick; a reasonless one leaves a real person told "no" with no way
  // forward.
  if (!adminUserId || typeof adminUserId !== "string" || !adminUserId.trim()) {
    throw new RejectionAuthorMissing();
  }
  if (!reasonText || typeof reasonText !== "string" || !reasonText.trim()) {
    throw new RejectionReasonMissing();
  }

  return prisma.panditProfile.update({
    where: { id: panditProfileId },
    data: {
      verificationStatus: KYC_REJECT_WRITE_STATUS,
      rejectionReason: reasonText,
      // WHO and WHEN — in the SAME statement as the claim, so a rejected
      // row without an author cannot exist going forward.
      rejectedById: adminUserId,
      rejectedAt: new Date(),
    },
  });
}
