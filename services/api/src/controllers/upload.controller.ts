import { FastifyRequest, FastifyReply } from "fastify";
// F-J7-2/B made the upload key depend on the profile's lifecycle, so this
// controller talks to the database for the first time. The read is one column
// on one indexed row, in a path that is already writing megabytes to R2.
import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { putObject, getPresignedGetUrl } from "../lib/storage";
import {
  buildUploadKey,
  uploadEpoch,
  canPresign,
  isLegacyValue,
  resolveKind,
  isVideoKind,
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

    // kind may arrive as a route param (/upload/:type) or a query (?kind=…).
    const rawType = ((request.params as any).type || (request.query as any)?.kind) as string | undefined;
    const kind = resolveKind(rawType); // aadhaar-front | aadhaar-back | photo | …
    const wantsVideo = isVideoKind(kind);

    const mime = file.mimetype;
    const mimeOk = wantsVideo ? VIDEO_MIMES.includes(mime) : IMAGE_MIMES.includes(mime);
    if (!mimeOk) {
      throw new AppError(`Unsupported file type: ${mime}`, 415);
    }

    const fileBuffer = await file.toBuffer();
    const maxBytes = wantsVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (fileBuffer.length > maxBytes) {
      throw new AppError(`File too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)`, 413);
    }

    // F-J7-2 / SHAPE B — THE KEY DEPENDS ON THE LIFECYCLE, SO THE LIFECYCLE
    // IS READ. Clause 1: while the profile is PENDING nothing has been handed
    // to a reviewer, so a re-upload overwrites in place (the original DEDUP
    // LAW, unchanged — a pandit re-shooting a blurry Aadhaar leaves no
    // orphans). Clause 2: once it LEAVES PENDING the key carries its epoch, so
    // an abandoned upload cannot land on the object a reviewer was given.
    //
    // FAIL CLOSED. If the profile cannot be read we do NOT fall back to the
    // draft key: that fallback is exactly the defect this branch closes, and a
    // silent fallback would restore it on the one path where something is
    // already wrong.
    const profile = await prisma.panditProfile.findUnique({
      where: { userId },
      select: { verificationStatus: true },
    });
    if (!profile) {
      throw new AppError("Pandit profile not found", 404);
    }
    const key = buildUploadKey(userId, kind, uploadEpoch(profile.verificationStatus));
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
