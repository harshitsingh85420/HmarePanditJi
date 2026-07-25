// PAYOUT-MOMENT freshness (PAGE 11 findings, Isj order 2026-07-25).
// Single source for "which PAID rows are freshly paid since the last visit":
//   • stored === null (FIRST-EVER visit): seed silently to the newest paidAt
//     and celebrate NOTHING — history must never replay as "just paid".
//   • otherwise: fresh = rows with paidAt strictly newer than the stored
//     epoch-millis; the celebration amount is their exact sum (conservation).
// The key stores EPOCH MILLIS as a string (Number()-parseable — an ISO
// string here would NaN every comparison; pinned by the guard).

export interface PaidRowLike {
  paidAt?: string | null;
  amount: number;
}

export function computeFreshPaid(
  paid: PaidRowLike[],
  stored: string | null,
): { fresh: number | null; nextSeen: number } {
  const newest = Math.max(0, ...paid.map((p) => (p.paidAt ? new Date(p.paidAt).getTime() : 0)));
  if (stored === null) {
    return { fresh: null, nextSeen: newest }; // first visit: calm + seed
  }
  const lastSeen = Number(stored) || 0;
  const freshRows = paid.filter((p) => p.paidAt && new Date(p.paidAt).getTime() > lastSeen);
  const nextSeen = Math.max(lastSeen, newest);
  if (freshRows.length === 0) return { fresh: null, nextSeen };
  return { fresh: freshRows.reduce((s, p) => s + p.amount, 0), nextSeen };
}
