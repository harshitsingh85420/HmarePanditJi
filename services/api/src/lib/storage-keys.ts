// Pure helpers for upload key construction + presign authorization.
// Kept dependency-free so they can be unit-tested without a DB or R2.

export const UPLOAD_CATEGORIES = ["aadhaar", "photo", "video"] as const;
export type UploadCategory = (typeof UPLOAD_CATEGORIES)[number];

export function isUploadCategory(v: string): v is UploadCategory {
  return (UPLOAD_CATEGORIES as readonly string[]).includes(v);
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
export const VIDEO_MIMES = ["video/mp4", "video/webm"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // 40 MB

export function extForMime(mime: string): string | null {
  return EXT_BY_MIME[mime] ?? null;
}

// ── Canonical per-(pandit, kind) keys ─────────────────────────────────────────
// A pandit has exactly ONE object per KIND (aadhaar-front, aadhaar-back, …).
// The key is DETERMINISTIC — no random id, no extension — so a re-upload
// OVERWRITES the same R2 object in place instead of minting a new key and
// orphaning the old bytes. The stored Content-Type carries the format; presign
// and <img> rendering never need a file extension.
export const UPLOAD_KINDS = [
  "aadhaar-front",
  "aadhaar-back",
  "profile-photo",
  "kyc-video",
  "photo",
  "video",
] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export function isUploadKind(v: string): v is UploadKind {
  return (UPLOAD_KINDS as readonly string[]).includes(v);
}

export function isVideoKind(kind: UploadKind): boolean {
  return kind === "kyc-video" || kind === "video";
}

/** Map a legacy route param (`aadhaar`, `photo`, `video`, or a kind) to a KIND. */
export function resolveKind(rawType: string | undefined): UploadKind {
  const t = (rawType || "photo").toLowerCase();
  if (isUploadKind(t)) return t;
  if (t.includes("aadhaar")) return t.includes("back") ? "aadhaar-back" : "aadhaar-front";
  if (t.includes("video")) return "kyc-video";
  if (t.includes("profile")) return "profile-photo";
  return "photo";
}

// ── F-J7-2 / SHAPE B · THE TWO LIFECYCLES, NAMED ─────────────────────────────
//
// THE DEFECT (F-J7-2, J7 walk): a pandit whose documents had already been
// reviewed could open the identity step, attach a different file, and NEVER
// press पूरा कीजिए — and the bytes at the approved key were replaced anyway.
// The database pointer stayed identical, so nothing anywhere could tell. That
// is why the class is POINTER-INTEGRITY IS NOT CONTENT-INTEGRITY: a clean row
// can sit on top of a swapped object.
//
// THE RULING (Isj, Shape B): dedup stays while the profile is a DRAFT; once
// verificationStatus LEAVES PENDING the key gains a suffix, so the reviewed
// object becomes IMMUTABLE BY CONSTRUCTION — there is no longer a key an
// abandoned form can land on.
//
// THE PREDICATE IS "LEAVES PENDING", NOT "IS APPROVED", and the distinction is
// deliberate: DOCUMENTS_SUBMITTED is already too late to overwrite in place,
// because the pandit has handed the file to a reviewer even if no reviewer has
// opened it yet. Versioning at approval would leave the whole submitted-but-
// unreviewed window unprotected — which is precisely the window J7 walked.
//
// THE SUFFIX IS THE UPLOAD MOMENT, not the approval moment. Every upload after
// the draft phase lands on its own key, so no post-draft object is ever
// overwritten by anything. The cost is orphaned bytes with no DB pointer; the
// reaping rule is a NAMED FUTURE, not a silent gap.
export const DRAFT_EPOCH = "draft";

/**
 * Which epoch does an upload belong to?
 *
 * @param verificationStatus the profile's CURRENT status, read at upload time.
 * @param nowMs injectable so the whole law stays unit-testable without a clock —
 *   this module's stated property is that it needs neither a DB nor R2.
 */
export function uploadEpoch(verificationStatus: string, nowMs: number = Date.now()): string {
  if (verificationStatus === "PENDING") return DRAFT_EPOCH;
  // Seconds, not milliseconds: 10 digits stays well clear of the surviving
  // no-random-id clause, which refuses any hex-ish run of 16+ characters.
  return `r${Math.floor(nowMs / 1000)}`;
}

/** uploads/{userId}/{kind}[-{epoch}] — ONE canonical object per
 *  (pandit, kind) WHILE THE PROFILE IS A DRAFT. Deterministic in that phase:
 *  re-upload replaces it, never orphans. Once the profile leaves PENDING the
 *  key carries its epoch and the previous object can no longer be reached.
 *  Original filename and extension are NEVER part of the key. */
export function buildUploadKey(
  userId: string,
  kind: UploadKind,
  epoch: string = DRAFT_EPOCH,
): string {
  const base = `uploads/${userId}/${kind}`;
  return epoch === DRAFT_EPOCH ? base : `${base}-${epoch}`;
}

/**
 * Presign authorization: a PANDIT may only presign keys under their own
 * uploads/{userId}/ prefix; an ADMIN may presign any uploads/ key.
 */
export function canPresign(role: string, userId: string, key: string): boolean {
  if (!key.startsWith("uploads/")) return false;
  if (key.includes("..")) return false;
  if (role === "ADMIN") return true;
  if (role === "PANDIT") return key.startsWith(`uploads/${userId}/`);
  return false;
}

/** Legacy values ("/uploads/..." local paths or absolute http URLs) pass through unchanged. */
export function isLegacyValue(v: string): boolean {
  return v.startsWith("/uploads/") || v.startsWith("http");
}
