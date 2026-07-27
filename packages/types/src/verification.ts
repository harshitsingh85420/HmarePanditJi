// ============================================
// HmarePanditJi — IDENTITY (KYC) STATUS VOCABULARY
// THE ONE SOURCE. Every app and service that writes, queries or renders a
// pandit's identity-verification state imports from here.
//
// Why this file exists (QA, 2026-07-27): the pandit app wrote
// DOCUMENTS_SUBMITTED while the admin queue asked for PENDING, so a pandit
// who uploaded his Aadhaar DISAPPEARED from the only screen that could
// review him. Two apps, two vocabularies, nobody's build complained.
//
// Storage truth is packages/db/prisma/schema.prisma `enum VerificationStatus`.
// kycContract.test.ts fails the build if this list and that enum drift apart.
// ============================================

/** Every value the column can legally hold — must equal the Prisma enum. */
export const VERIFICATION_STATUSES = [
  "PENDING",
  "DOCUMENTS_SUBMITTED",
  "VIDEO_KYC_DONE",
  "VERIFIED",
  "REJECTED",
  "APPROVED",
] as const;

export type VerificationStatusValue = (typeof VERIFICATION_STATUSES)[number];

/**
 * NOTHING UPLOADED. This is the schema DEFAULT — it is set at registration
 * and means the pandit has not submitted anything and nobody is reviewing
 * him. No user-facing copy may describe this state as a review in progress.
 */
export const KYC_NOT_SUBMITTED_STATUSES = ["PENDING"] as const;

/**
 * REVIEWABLE — documents are in and a human decision is owed. This is the
 * admin review queue. PENDING is deliberately absent: there is nothing to
 * look at, and listing it invites approving an identity with no documents.
 */
export const KYC_REVIEW_QUEUE_STATUSES = [
  "DOCUMENTS_SUBMITTED",
  "VIDEO_KYC_DONE",
] as const;

/**
 * APPROVED — the pandit is verified. "APPROVED" is a legacy spelling that
 * exists in the Prisma enum and is still READ so old rows render correctly;
 * nothing may WRITE it (see KYC_APPROVE_WRITE_STATUS).
 */
export const KYC_APPROVED_STATUSES = ["VERIFIED", "APPROVED"] as const;

/** The value the pandit app's R5 submit writes. */
export const KYC_SUBMITTED_WRITE_STATUS: VerificationStatusValue = "DOCUMENTS_SUBMITTED";
/** The value an admin approval writes. */
export const KYC_APPROVE_WRITE_STATUS: VerificationStatusValue = "VERIFIED";
/** The value an admin rejection writes. */
export const KYC_REJECT_WRITE_STATUS: VerificationStatusValue = "REJECTED";

export function isKycNotSubmitted(s: string | null | undefined): boolean {
  return (KYC_NOT_SUBMITTED_STATUSES as readonly string[]).includes(String(s));
}
export function isKycUnderReview(s: string | null | undefined): boolean {
  return (KYC_REVIEW_QUEUE_STATUSES as readonly string[]).includes(String(s));
}
export function isKycApproved(s: string | null | undefined): boolean {
  return (KYC_APPROVED_STATUSES as readonly string[]).includes(String(s));
}
export function isKycRejected(s: string | null | undefined): boolean {
  return String(s) === KYC_REJECT_WRITE_STATUS;
}

/**
 * The identity document columns. Named here because the admin console used
 * to read `documentUrls` / `kycVideoUrl` / `aadhaarNumber` — three field
 * names that do not exist in the schema — and therefore rendered an
 * uploaded Aadhaar as "Not Uploaded".
 */
export const KYC_DOCUMENT_FIELDS = [
  "aadhaarFrontUrl",
  "aadhaarBackUrl",
  "videoKycUrl",
  "aadhaarLastFour",
] as const;
