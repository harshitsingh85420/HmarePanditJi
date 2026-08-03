import { prisma } from "@hmarepanditji/db";

// ─────────────────────────────────────────────────────────────
// PRESENCE — AN ASSERTION BECOMES A COMPUTATION OVER FACTS
// (Isj's isOnline law, ruled 2026-08-03).
//
// The stored isOnline flag is the pandit's INTENT (his toggle). It is not
// evidence: nothing ever flipped it false without a tap — no heartbeat,
// no lastSeen, no logout hook — so a pandit who uninstalled the app
// stayed "online" in the database forever, and the profile's green dot
// could lie for weeks. THE CLAIM the customer sees is therefore DERIVED
// at read time from intent AND evidence:
//
//     EFFECTIVE ONLINE = isOnline && (now − lastSeenAt) < 90s
//
// 90s = three missed beats of the pandit app's existing 30s home poll,
// which is the heartbeat (no new timer, no new endpoint — the
// authenticated poll's handler touches lastSeenAt).
//
// FAIL-STALE, NEVER FAIL-ONLINE: until Isj's hand runs the lastSeenAt
// migration on Neon, the column does not exist and both helpers below
// swallow their own errors — the touch no-ops and the read returns null,
// so EVERY pandit computes offline. A missing column may hide a truth;
// it must never fabricate a presence.
// ─────────────────────────────────────────────────────────────

export const PRESENCE_TTL_MS = 90_000;

/** The pure predicate — the ONE place the claim is computed. */
export function effectiveOnline(
  isOnline: boolean,
  lastSeenAt: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!isOnline) return false;
  if (!lastSeenAt) return false;
  return now.getTime() - lastSeenAt.getTime() < PRESENCE_TTL_MS;
}

/** Heartbeat write — fire-and-forget, fail-soft (pre-migration no-op). */
export async function touchLastSeen(panditProfileId: string): Promise<void> {
  try {
    await prisma.panditProfile.update({
      where: { id: panditProfileId },
      data: { lastSeenAt: new Date() } as never,
    });
  } catch {
    /* pre-migration or transient — the beat is best-effort by design */
  }
}

/** Evidence read — fail-soft: a missing column reads as "never seen". */
export async function readLastSeen(panditProfileId: string): Promise<Date | null> {
  try {
    const row = await prisma.panditProfile.findUnique({
      where: { id: panditProfileId },
      select: { lastSeenAt: true } as never,
    });
    return ((row as { lastSeenAt?: Date | null } | null)?.lastSeenAt as Date | null) ?? null;
  } catch {
    return null;
  }
}
