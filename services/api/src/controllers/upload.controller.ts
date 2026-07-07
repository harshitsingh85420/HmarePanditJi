import { FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";
import { AppError } from "../middleware/errorHandler";
import { putObject, getPresignedGetUrl } from "../lib/storage";
import {
  buildUploadKey,
  canPresign,
  extForMime,
  isLegacyValue,
  isUploadCategory,
  IMAGE_MIMES,
  VIDEO_MIMES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "../lib/storage-keys";

export const handleUpload = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const file = await request.file();
    if (!file) {
      throw new AppError("No file uploaded", 400);
    }

    const userId = (request as any).user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const rawType = ((request.params as any).type || "photo") as string;
    // legacy route param values map onto the three storage categories
    const category = isUploadCategory(rawType) ? rawType : rawType.includes("aadhaar") ? "aadhaar" : rawType.includes("video") ? "video" : "photo";

    const mime = file.mimetype;
    const isImage = IMAGE_MIMES.includes(mime);
    const isVideo = VIDEO_MIMES.includes(mime);
    if (category === "video" ? !isVideo : !isImage) {
      throw new AppError(`Unsupported file type: ${mime}`, 415);
    }

    const ext = extForMime(mime);
    if (!ext) {
      throw new AppError(`Unsupported file type: ${mime}`, 415);
    }

    const fileBuffer = await file.toBuffer();
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (fileBuffer.length > maxBytes) {
      throw new AppError(`File too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)`, 413);
    }

    // Original filename is NEVER part of the key
    const key = buildUploadKey(userId, category, crypto.randomUUID().replace(/-/g, ""), ext);
    await putObject(key, fileBuffer, mime);

    // The KEY is what gets stored in DB fields (aadhaarDocUrl etc.).
    // `url` kept for backward compatibility with existing callers.
    return reply.send({ success: true, data: { key, url: key }, message: "File uploaded successfully" });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("File upload failed", 500);
  }
};

/**
 * GET /files/presign?key=...
 * PANDIT: only keys under uploads/{own userId}/ · ADMIN: any uploads/ key.
 * Legacy values ("/uploads/..." or "http...") are returned unchanged.
 */
export const presignFile = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  if (!user?.id) {
    return reply.status(401).send({ success: false, error: "Unauthorized" });
  }

  const key = (request.query as { key?: string }).key;
  if (!key) {
    return reply.status(400).send({ success: false, error: "key is required" });
  }

  if (isLegacyValue(key)) {
    return reply.send({ success: true, data: { url: key } });
  }

  if (!canPresign(user.role, user.id, key)) {
    return reply.status(403).send({ success: false, error: "Forbidden" });
  }

  const url = await getPresignedGetUrl(key, 900);
  return reply.send({ success: true, data: { url } });
};
