import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
// F12-02: the item shape lives in ONE place. Do not re-declare the field list here.
import { validateSamagriItems } from "../lib/samagriItem";

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

// ── Manage samagri packages (authenticated pandit) ────────────────────────────
// panditProfileId: PanditProfile.id (from authenticated /me routes)

export async function manageSamagriPackage(
  action: "create" | "update" | "delete",
  panditProfileId: string,
  data: any,
  packageId?: string,
) {
  // F12-02: every item must carry quantity AND a company/brand name. Enforced
  // here rather than at the route so the rule holds for any caller of this
  // service, not only the two routes that happen to run the zod preHandler.
  if ((action === "create" || action === "update") && data?.items !== undefined) {
    const itemsCheck = validateSamagriItems(data.items);
    if (!itemsCheck.ok) throw new AppError(itemsCheck.message, 400);
    data = { ...data, items: itemsCheck.items };
  }

  if (action === "create") {
    const existing = await prisma.samagriPackage.findFirst({
      where: {
        panditId: panditProfileId,
        pujaType: data.pujaType,
        packageName: data.packageName,
      },
    });

    if (existing) {
      throw new AppError(`Package for ${data.pujaType} (${data.packageName}) already exists`, 400);
    }

    return prisma.samagriPackage.create({
      data: {
        panditId: panditProfileId,
        packageName: data.packageName,
        packageType: data.packageType,
        pujaType: data.pujaType,
        fixedPrice: data.fixedPrice,
        items: data.items,
        isActive: data.isActive ?? true,
      },
    });
  }

  if (action === "update" && packageId) {
    const pkg = await prisma.samagriPackage.findUnique({ where: { id: packageId } });
    if (!pkg || pkg.panditId !== panditProfileId) {
      throw new AppError("Package not found or unauthorized", 404);
    }

    return prisma.samagriPackage.update({
      where: { id: packageId },
      data: { ...data },
    });
  }

  if (action === "delete" && packageId) {
    const pkg = await prisma.samagriPackage.findUnique({ where: { id: packageId } });
    if (!pkg || pkg.panditId !== panditProfileId) {
      throw new AppError("Package not found or unauthorized", 404);
    }

    return prisma.samagriPackage.delete({ where: { id: packageId } });
  }

  throw new AppError("Invalid operation", 400);
}
