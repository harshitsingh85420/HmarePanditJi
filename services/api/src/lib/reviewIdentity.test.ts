import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { revieweeUserIdFromProfileId } from "./reviewIdentity";

// ─────────────────────────────────────────────────────────────
// ONE ID LAW guard (harsh-QA PAGE 16, Isj order 2026-07-27).
// Review.revieweeId is a USER id (real FK). The writer used
// booking.panditId, a PanditProfile id — the FK rejected it, so no
// review could ever be created and the ⭐ rating could never render.
// This guard pins reader/writer AGREEMENT so the two vocabularies
// cannot drift apart again.
// ─────────────────────────────────────────────────────────────

console.log("Running review-identity (one id law) guard...");

// the resolver maps profile id -> user id (this file compiles to CJS, so
// the async assertions live in a main() the script awaits at the end)
async function resolverTests() {
  const db = {
    panditProfile: {
      async findUnique(args: { where: { id: string } }) {
        return args.where.id === "profile-1" ? { userId: "user-9" } : null;
      },
    },
  };
  assert.strictEqual(await revieweeUserIdFromProfileId(db, "profile-1"), "user-9");
  assert.strictEqual(await revieweeUserIdFromProfileId(db, "missing"), null);
  assert.strictEqual(await revieweeUserIdFromProfileId(db, ""), null);
}

// the WRITER goes through the resolver and never writes a profile id
{
  const src = readFileSync(join(__dirname, "..", "services", "review.service.ts"), "utf8");
  assert.ok(
    /revieweeUserIdFromProfileId\(prisma, booking\.panditId\)/.test(src),
    "createReview must resolve the USER id through the single source",
  );
  assert.ok(
    !/const revieweeId = booking\.panditId/.test(src),
    "createReview must never key a review by the PROFILE id again",
  );
}

// the READERS stay user-id keyed (they always were — pin it)
{
  const stats = readFileSync(join(__dirname, "..", "controllers", "auth.controller.ts"), "utf8");
  const fn = stats.slice(stats.indexOf("export const getPanditStats"), stats.indexOf("export const getPanditStats") + 1400);
  assert.ok(
    /revieweeId: userId/.test(fn),
    "getPanditStats must aggregate reviews by USER id",
  );
}

// the schema itself is the authority: revieweeId references User
{
  const schema = readFileSync(
    join(__dirname, "..", "..", "..", "..", "packages", "db", "prisma", "schema.prisma"),
    "utf8",
  );
  assert.ok(
    /reviewee\s+User\s+@relation\("ReviewsReceived", fields: \[revieweeId\], references: \[id\]\)/.test(schema),
    "Review.revieweeId must still be a User FK — if this changes, the law changes with it",
  );
}

resolverTests().then(
  () => console.log("✓ review-identity guard passed"),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
