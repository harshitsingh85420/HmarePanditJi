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

/** uploads/{userId}/{category}/{id}.{ext} — original filename NEVER used. */
export function buildUploadKey(userId: string, category: UploadCategory, id: string, ext: string): string {
  return `uploads/${userId}/${category}/${id}.${ext}`;
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
