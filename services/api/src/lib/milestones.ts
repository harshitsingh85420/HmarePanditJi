import { prisma } from "@hmarepanditji/db";

// Dignity-first milestones. 5/11/21/51 are shubh sankhya — intentional,
// do not "round" them to 10/25/50.
export const BOOKING_MILESTONES: Array<{ kind: string; count: number }> = [
  { kind: "FIRST_BOOKING", count: 1 },
  { kind: "BOOKINGS_5", count: 5 },
  { kind: "BOOKINGS_11", count: 11 },
  { kind: "BOOKINGS_21", count: 21 },
  { kind: "BOOKINGS_51", count: 51 },
];

export const EARNING_MILESTONES: Array<{ kind: string; amount: number }> = [
  { kind: "EARNED_11K", amount: 11_000 },
  { kind: "EARNED_51K", amount: 51_000 },
  { kind: "EARNED_1L", amount: 100_000 },
];

/** Pure core: which milestones are newly crossed given current stats. */
export function computeNewMilestones(
  completedCount: number,
  earnedTotal: number,
  alreadyAwarded: ReadonlySet<string>,
): string[] {
  const crossed: string[] = [];
  for (const m of BOOKING_MILESTONES) {
    if (completedCount >= m.count && !alreadyAwarded.has(m.kind)) crossed.push(m.kind);
  }
  for (const m of EARNING_MILESTONES) {
    if (earnedTotal >= m.amount && !alreadyAwarded.has(m.kind)) crossed.push(m.kind);
  }
  return crossed;
}

/**
 * Compute which milestones a pandit has crossed and insert any new ones.
 * Idempotent twice over: computeNewMilestones skips already-awarded kinds,
 * and the [panditId, kind] unique constraint + skipDuplicates guards races.
 * Returns the kinds newly awarded in this call.
 */
export async function checkAndAwardMilestones(panditId: string): Promise<string[]> {
  const [completedCount, payoutSum, existing] = await Promise.all([
    prisma.booking.count({ where: { panditId, status: "COMPLETED" } }),
    prisma.payout.aggregate({ where: { panditId }, _sum: { amount: true } }),
    prisma.panditMilestone.findMany({ where: { panditId }, select: { kind: true } }),
  ]);

  const have = new Set(existing.map((m: { kind: string }) => m.kind));
  const crossed = computeNewMilestones(completedCount, payoutSum._sum.amount ?? 0, have);

  if (crossed.length === 0) return [];

  await prisma.panditMilestone.createMany({
    data: crossed.map((kind) => ({ panditId, kind })),
    skipDuplicates: true,
  });

  return crossed;
}
