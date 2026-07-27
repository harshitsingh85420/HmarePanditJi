// ─────────────────────────────────────────────────────────────
// REVIEW IDENTITY — ONE ID LAW (harsh-QA PAGE 16, fixed 2026-07-27).
//
// `Review.revieweeId` is a **USER id** — the schema says so with a real
// foreign key (`reviewee User @relation("ReviewsReceived", fields:
// [revieweeId], references: [id])`, schema.prisma:541-542). Every reader
// obeys that: getPanditStats aggregates `revieweeId: userId` (with a
// comment naming the trap), and the public profile/review endpoints use
// `params.id` which they resolve as a User id elsewhere in the same
// handler.
//
// The WRITER did not: `createReview` set `revieweeId = booking.panditId`,
// and `Booking.panditId` is a **PanditProfile id** (schema.prisma:84-85).
// Because the column is a real FK to User, Postgres REJECTS that write —
// so this was not a silent mis-key that filled a table nobody read: no
// review could be created at all. (Which also answers the migration
// question: no mis-keyed row can exist, so there is nothing to remap.)
//
// Same class as the two-detect-maps and the pooja key trap: two vocabularies
// for one concept. The cure is the same — ONE resolver, used by the writer,
// and a guard that fails if reader and writer ever disagree again.
// ─────────────────────────────────────────────────────────────

/** Minimal shape so this stays unit-testable without a live prisma. */
export interface ProfileLookup {
  panditProfile: {
    findUnique(args: {
      where: { id: string };
      select: { userId: true };
    }): Promise<{ userId: string } | null>;
  };
}

/**
 * The pandit's USER id for a booking — the only correct key for
 * `Review.revieweeId`, `PanditProfile.update({where:{userId}})` and
 * `notify({userId})`.
 * @param profileId a `Booking.panditId` (PanditProfile id)
 */
export async function revieweeUserIdFromProfileId(
  db: ProfileLookup,
  profileId: string,
): Promise<string | null> {
  if (!profileId) return null;
  const row = await db.panditProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });
  return row?.userId ?? null;
}
