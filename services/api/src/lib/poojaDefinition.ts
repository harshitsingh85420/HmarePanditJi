import { prisma } from "@hmarepanditji/db";

/**
 * ITEMS ARE THE POOJA'S DEFINITION — NO LIST, NO LISTING (Isj, 2026-08-03).
 *
 * THE ONE PREDICATE every listing writer reads: a pooja's definition exists
 * iff an ACTIVE BASIC samagri row with ≥1 item exists for (pandit, pooja).
 * BASIC is the definition slot (basic-suffices, ruled — the cumulative law
 * makes upper tiers additions, not requirements); an unpriced BASIC row
 * (price 0) is a definition without a deal, and counts.
 *
 * Writers: savePoojaConfig create, the auth dakshina-mirror create, the
 * /me/services create — all create `isActive: await hasPoojaDefinition(…)`.
 * The FLIP (both directions) has ONE owner: saveSamagriPackages, at the
 * moment items land or clear. Video verdicts and prices touch nothing.
 */
export async function hasPoojaDefinition(panditProfileId: string, pujaType: string): Promise<boolean> {
  const row = await prisma.samagriPackage.findFirst({
    where: { panditId: panditProfileId, pujaType, tier: "BASIC" as never, isActive: true },
    select: { items: true },
  });
  return Array.isArray(row?.items) && (row!.items as unknown[]).length > 0;
}
