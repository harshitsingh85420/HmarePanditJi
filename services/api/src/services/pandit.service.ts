import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";

// ── Get pandit's puja services (public) ──────────────────────────────────────
// panditUserId: the User.id (from public route GET /pandits/:id/services)

export async function getPanditServices(panditUserId: string) {
  const panditProfile = await prisma.panditProfile.findUnique({
    where: { userId: panditUserId },
    select: { id: true },
  });
  if (!panditProfile) throw new AppError("Pandit not found", 404, "NOT_FOUND");

  return prisma.pujaService.findMany({
    where: { panditProfileId: panditProfile.id, isActive: true },
    orderBy: { pujaType: "asc" },
  });
}

// ── Get pandit's samagri packages (public) ───────────────────────────────────
// panditUserId: the User.id (from public route GET /pandits/:id/samagri-packages)

export async function getPanditSamagriPackages(panditUserId: string, pujaType?: string) {
  const panditProfile = await prisma.panditProfile.findUnique({
    where: { userId: panditUserId },
    select: { id: true },
  });
  if (!panditProfile) throw new AppError("Pandit not found", 404, "NOT_FOUND");

  const where: { panditId: string; pujaType?: string; isActive: boolean } = {
    panditId: panditProfile.id,
    isActive: true,
  };
  if (pujaType) where.pujaType = pujaType;

  return prisma.samagriPackage.findMany({
    where,
    orderBy: { fixedPrice: "asc" },
  });
}

// manageSamagriPackage lived here (create/update/delete on legacy columns —
// packageName/fixedPrice, hard-delete). KILLED with its routes (R-S6, ruled
// 2026-08-03): no app ever called them, and the tier-shaped writer in
// auth.controller (saveSamagriPackages) is THE ONE write path. The public
// reads above stay.
