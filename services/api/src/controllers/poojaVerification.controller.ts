import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { NotificationService } from "../services/notification.service";
import { checkDakshinaFloor } from "../lib/dakshinaFloor";
import { isVideoReasonCode, resolveRejectionText, videoRejectionMessage, KYC_APPROVE_WRITE_STATUS, isPujaType } from "@hmarepanditji/types";

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
    select: { version: true, status: true },
  });

  // RESUBMIT STATE GATE. Ownership is already established (the row is keyed
  // on THIS pandit's profile.id, resolved from the auth token — a pandit can
  // never touch another's verification). What this adds is the transition
  // rule: a new version may only be created for a FIRST submission or after
  // a REJECTION.
  //   PENDING  — a duplicate row would put two versions in the admin queue
  //              and the pandit could not tell which one was judged.
  //   APPROVED — a new version is PENDING, and the booking gate requires the
  //              LATEST to be APPROVED; so resubmitting would silently pull a
  //              live, bookable puja off the market. Deliberately blocked for
  //              the pilot. (To allow re-recording an approved puja later,
  //              relax THIS check and the guard together.)
  if (latest && latest.status !== "REJECTED") {
    const msg =
      latest.status === "PENDING"
        ? "यह पूजा पहले से जाँच में है — कृपया नतीजे का इंतज़ार करें।"
        : "यह पूजा पहले से प्रमाणित है — दोबारा भेजने की ज़रूरत नहीं।";
    throw new AppError(msg, 409, "VERIFICATION_NOT_RESUBMITTABLE");
  }

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

  // F11-04 floor (edge F11-2). The old `Math.max(0, …)` silently CLAMPED a bad
  // amount to a saved price — a mis-heard "ग्यारह सौ" became ₹11 and the pandit
  // was never told. Reject instead, naming the minimum. Floors: lib/dakshinaFloor.ts.
  const floorCheck = checkDakshinaFloor(b.poojaType, b.dakshinaAmount);
  if (!floorCheck.ok) {
    return reply.status(400).send({
      success: false,
      error: { code: "dakshina_below_floor", message: floorCheck.message, floor: floorCheck.floor },
    });
  }

  // ── TRACK 2A / OPTION A — ONE PATH WRITES BOTH VOCABULARIES ────────────────
  // Before this, finishing the पूजा जोड़िए wizard wrote PoojaConfig and
  // PoojaVerification and nothing the customer app reads. The reader's own
  // table (PujaService) had NO live writer at all — only the seed — so every
  // real pandit carried `pujaServices: []` and his public profile quoted
  // "Starting from ₹0" beside "No services listed yet".
  //
  // Now the same request writes the pandit's record AND the customer-readable
  // row, in ONE transaction, so the two can never again disagree by being
  // written at different times by different screens. (R1's two untransacted
  // client calls are the shape this deliberately avoids.)
  //
  // isActive: FALSE on create. Every customer read path already filters
  // isActive:true, so a newly added pooja is INVISIBLE until an admin approves
  // the verification — and `update` deliberately omits isActive so re-saving a
  // price can never publish an unapproved pooja, nor un-publish an approved one.
  const amount = Math.round(b.dakshinaAmount as number);
  const teamSize = Math.max(1, b.teamSize ?? 1);
  const canonical = isPujaType(b.poojaType);

  const row = await prisma.$transaction(async (tx) => {
    const cfg = await tx.poojaConfig.upsert({
      where: { panditProfileId_poojaType: { panditProfileId: profile.id, poojaType: b.poojaType as string } },
      update: { teamSize, dakshinaAmount: amount, supplyMode },
      create: { panditProfileId: profile.id, poojaType: b.poojaType as string, teamSize, dakshinaAmount: amount, supplyMode },
    });

    // Only canonical values cross to the customer side. A custom pooja is a
    // REQUEST (packages/types CUSTOM_PUJA_REQUEST) — it lives on
    // PoojaVerification with its own name and never enters a *Type column,
    // because a value outside PUJA_TYPES can be rendered but never filtered,
    // searched or priced.
    if (canonical) {
      await tx.pujaService.upsert({
        where: { panditProfileId_pujaType: { panditProfileId: profile.id, pujaType: b.poojaType as string } },
        update: { dakshinaAmount: amount },
        create: { panditProfileId: profile.id, pujaType: b.poojaType as string, dakshinaAmount: amount, isActive: false },
      });

      // specializations is the other customer-readable store (the card's
      // chips). Readiness R1 was its ONLY writer, which is why a pandit could
      // finish the wizard and still show no poojas at all.
      if (!profile.specializations.includes(b.poojaType as string)) {
        await tx.panditProfile.update({
          where: { id: profile.id },
          data: { specializations: { push: b.poojaType as string } },
        });
      }
    }
    return cfg;
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
  // ── TRACK 2A: APPROVAL IS THE PUBLISH ACTION ──────────────────────────────
  // This handler used to write the verification row and nothing else, then
  // send a notification saying "अब यह बुकिंग के लिए उपलब्ध है" — a claim no
  // read path could honour, because the customer side had no row to show.
  // Flipping isActive here is the line that makes the sentence true.
  //
  // THIS IS THE ONLY PATH TO isActive:true. The wizard creates rows false and
  // never updates the flag; reject sets it back to false. Guarded by
  // pujaServicePublish.test.ts.
  const row = await prisma.$transaction(async (tx) => {
    const v = await tx.poojaVerification.update({
      where: { id },
      data: { status: "APPROVED", reviewedById: adminId, reviewedAt: new Date(), rejectionReason: null },
    });
    await tx.pujaService.updateMany({
      where: { panditProfileId: v.panditProfileId, pujaType: v.poojaType },
      data: { isActive: true },
    });
    return v;
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
  // PRESET CODE, NOT FREE TEXT (Isj, 2026-07-30).
  //
  // This used to take `reason` as an arbitrary string and interpolate it
  // VERBATIM into the Devanagari message below. Every register guard in this
  // repo — the no-roman law, the तुम/करो ban — inspects strings IN THE REPO, so
  // an operator-typed reason bypassed all of them: "photo blurry" typed in a
  // hurry shipped roman English into a Hindi sentence on a 62-year-old's phone.
  // The reasons now live in packages/types where the guards can see them.
  const { reasonCode, otherText } = (request.body ?? {}) as { reasonCode?: string; otherText?: string };
  if (!reasonCode || !isVideoReasonCode(reasonCode)) {
    return reply.status(400).send({
      success: false,
      error: "reasonCode must be one of the preset video rejection reasons",
    });
  }
  const reasonText = resolveRejectionText("video", reasonCode, otherText);
  if (!reasonText) {
    return reply.status(400).send({
      success: false,
      error: "OTHER requires otherText, written in Hindi — it is shown to the pandit verbatim",
    });
  }

  // Symmetric with approve: rejection UN-publishes. Without this a pooja
  // approved once would stay bookable through a later rejection — and
  // un-publishing would be impossible, which it was before Track 2A.
  const row = await prisma.$transaction(async (tx) => {
    const v = await tx.poojaVerification.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: reasonText, reviewedById: adminId, reviewedAt: new Date() },
    });
    await tx.pujaService.updateMany({
      where: { panditProfileId: v.panditProfileId, pujaType: v.poojaType },
      data: { isActive: false },
    });
    return v;
  });

  const uid = await panditUserId(row.panditProfileId);
  if (uid) {
    // THE SCOPE LINE MUST READ THE REAL IDENTITY STATE. Telling a pandit whose
    // KYC is still PENDING that "आपकी पहचान सत्यापित है" would be a lie in the
    // very sentence whose job is reassurance.
    const profile = await prisma.panditProfile.findUnique({
      where: { id: row.panditProfileId },
      select: { verificationStatus: true },
    });
    const msg = videoRejectionMessage(
      row.poojaName || row.poojaType,
      reasonText,
      profile?.verificationStatus === KYC_APPROVE_WRITE_STATUS,
    );
    await notifier.notify({
      userId: uid, type: "VERIFICATION",
      title: msg.title,
      message: msg.body,
      smsMessage: `HmarePanditJi: ${msg.title} — ${reasonText}`,
    }).catch(() => {});
  }
  return reply.send({ success: true, data: { id: row.id, poojaType: row.poojaType, status: row.status, rejectionReason: row.rejectionReason } });
};
