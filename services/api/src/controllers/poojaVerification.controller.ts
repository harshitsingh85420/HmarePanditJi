import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { NotificationService } from "../services/notification.service";

const notifier = new NotificationService();

/** Parse a YouTube video id from common URL shapes (unlisted links included). */
export function extractYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const m =
    url.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    url.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function panditUserId(panditProfileId: string): Promise<string | null> {
  const p = await prisma.panditProfile.findUnique({ where: { id: panditProfileId }, select: { userId: true } });
  return p?.userId ?? null;
}

// ── PANDIT: submit / re-submit a pooja verification ───────────────────────────
// A re-submit creates a NEW row (version+1, PENDING) — history is never
// overwritten, and the puja becomes unbookable again until re-approved.
export const submitPoojaVerification = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id;
  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) return reply.status(404).send({ success: false, error: "Pandit profile not found" });

  const b = (request.body ?? {}) as {
    poojaType?: string; poojaName?: string; poojaDescription?: string;
    videoProvider?: string; videoUrl?: string; videoId?: string; thumbnailUrl?: string; publicUrl?: string;
    consent?: boolean;
  };
  if (!b.poojaType || !b.videoUrl) {
    return reply.status(400).send({ success: false, error: "poojaType and videoUrl are required" });
  }

  const latest = await prisma.poojaVerification.findFirst({
    where: { panditProfileId: profile.id, poojaType: b.poojaType },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const row = await prisma.poojaVerification.create({
    data: {
      panditProfileId: profile.id,
      poojaType: b.poojaType,
      poojaName: b.poojaName ?? null,
      poojaDescription: b.poojaDescription ?? null,
      videoProvider: b.videoProvider === "UPLOAD" ? "UPLOAD" : "YOUTUBE",
      videoUrl: b.videoUrl,
      videoId: b.videoId ?? extractYouTubeId(b.videoUrl),
      thumbnailUrl: b.thumbnailUrl ?? null,
      publicUrl: b.publicUrl ?? null,
      status: "PENDING",
      version: (latest?.version ?? 0) + 1,
      consentAt: b.consent ? new Date() : null,
    },
  });
  return reply.send({ success: true, data: { id: row.id, poojaType: row.poojaType, version: row.version, status: row.status } });
};

// ── PANDIT: my verifications (per-puja badge: प्रतीक्षा में / ✓ / ✗+reason) ─────
export const getMyPoojaVerifications = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id;
  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  const rows = await prisma.poojaVerification.findMany({
    where: { panditProfileId: profile.id },
    orderBy: [{ poojaType: "asc" }, { version: "desc" }],
  });
  // effective state per poojaType = the highest-version row
  const byType = new Map<string, any>();
  for (const r of rows) if (!byType.has(r.poojaType)) byType.set(r.poojaType, r);
  return reply.send({ success: true, data: { latest: [...byType.values()], history: rows } });
};

// ── PANDIT: per-puja config (team + dakshina + samagri supply mode) ────────────
export const savePoojaConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id;
  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) return reply.status(404).send({ success: false, error: "Pandit profile not found" });

  const b = (request.body ?? {}) as { poojaType?: string; teamSize?: number; dakshinaAmount?: number; supplyMode?: string };
  if (!b.poojaType) return reply.status(400).send({ success: false, error: "poojaType is required" });
  const supplyMode = b.supplyMode === "PLATFORM_SELLS" || b.supplyMode === "LIST_ONLY" ? b.supplyMode : "PANDIT_BRINGS";

  const row = await prisma.poojaConfig.upsert({
    where: { panditProfileId_poojaType: { panditProfileId: profile.id, poojaType: b.poojaType } },
    update: { teamSize: Math.max(1, b.teamSize ?? 1), dakshinaAmount: Math.max(0, b.dakshinaAmount ?? 0), supplyMode },
    create: { panditProfileId: profile.id, poojaType: b.poojaType, teamSize: Math.max(1, b.teamSize ?? 1), dakshinaAmount: Math.max(0, b.dakshinaAmount ?? 0), supplyMode },
  });
  return reply.send({ success: true, data: { poojaType: row.poojaType, teamSize: row.teamSize, dakshinaAmount: row.dakshinaAmount, supplyMode: row.supplyMode } });
};

export const getPoojaConfigs = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id;
  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  const rows = await prisma.poojaConfig.findMany({ where: { panditProfileId: profile.id }, orderBy: { poojaType: "asc" } });
  return reply.send({ success: true, data: rows });
};

// ── ADMIN: review queue ───────────────────────────────────────────────────────
export const listPoojaVerifications = async (request: FastifyRequest, reply: FastifyReply) => {
  const { status } = request.query as { status?: string };
  const rows = await prisma.poojaVerification.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    include: { pandit: { include: { user: { select: { name: true, phone: true } } } } },
  });
  return reply.send({ success: true, data: rows });
};

export const approvePoojaVerification = async (request: FastifyRequest, reply: FastifyReply) => {
  const adminId = (request as any).user?.id;
  const { id } = request.params as { id: string };
  const row = await prisma.poojaVerification.update({
    where: { id },
    data: { status: "APPROVED", reviewedById: adminId, reviewedAt: new Date(), rejectionReason: null },
  });
  const uid = await panditUserId(row.panditProfileId);
  if (uid) {
    await notifier.notify({
      userId: uid, type: "VERIFICATION",
      title: "पूजा प्रमाणित ✓",
      message: `आपकी "${row.poojaName || row.poojaType}" पूजा प्रमाणित हो गई है — अब यह बुकिंग के लिए उपलब्ध है।`,
      smsMessage: `HmarePanditJi: आपकी ${row.poojaType} पूजा प्रमाणित हो गई है।`,
    }).catch(() => {});
  }
  return reply.send({ success: true, data: { id: row.id, poojaType: row.poojaType, status: row.status } });
};

export const rejectPoojaVerification = async (request: FastifyRequest, reply: FastifyReply) => {
  const adminId = (request as any).user?.id;
  const { id } = request.params as { id: string };
  const { reason } = (request.body ?? {}) as { reason?: string };
  if (!reason || !reason.trim()) {
    return reply.status(400).send({ success: false, error: "A rejection reason is required" });
  }
  const row = await prisma.poojaVerification.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: reason.trim(), reviewedById: adminId, reviewedAt: new Date() },
  });
  const uid = await panditUserId(row.panditProfileId);
  if (uid) {
    await notifier.notify({
      userId: uid, type: "VERIFICATION",
      title: "पूजा अस्वीकृत",
      message: `आपकी "${row.poojaName || row.poojaType}" पूजा अभी स्वीकृत नहीं हुई। कारण: ${reason.trim()} — सुधार कर दोबारा भेजिए।`,
      smsMessage: `HmarePanditJi: आपकी ${row.poojaType} पूजा अस्वीकृत — कारण: ${reason.trim()}`,
    }).catch(() => {});
  }
  return reply.send({ success: true, data: { id: row.id, poojaType: row.poojaType, status: row.status, rejectionReason: row.rejectionReason } });
};
