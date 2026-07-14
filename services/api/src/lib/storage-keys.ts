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

/** uploads/{userId}/{kind} — ONE canonical object per (pandit, kind).
 *  Deterministic: re-upload replaces it, never orphans. Original filename and
 *  extension are NEVER part of the key. */
export function buildUploadKey(userId: string, kind: UploadKind): string {
  return `uploads/${userId}/${kind}`;
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
