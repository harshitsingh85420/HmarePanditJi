import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";

// ─────────────────────────────────────────────────────────────
// SUPERSEDED 2026-07-29 — सत्यापन IS INFORMATION, NOT A GATE (Isj ruling).
//
// WHAT THIS FILE USED TO ASSERT, and why it was right at the time:
//   createBooking() had to reject any booking whose poojaType lacked an
//   APPROVED (latest-version) PoojaVerification, BEFORE the row was created.
//   Six assertions pinned it — the query exists, it runs before
//   prisma.booking.create, it orders by version desc, it requires APPROVED,
//   and it throws POOJA_NOT_VERIFIED. That was the सत्यापन trust promise
//   enforced on the customer-called create path, and it worked exactly as
//   designed.
//
// WHY IT IS SUPERSEDED:
//   Ops DO review the video and "पूजा सत्यापित" IS a real platform claim — but
//   it is INFORMATION, not permission. A customer may knowingly choose an
//   unverified pandit; refusing the booking took the choice away from the
//   person whose money it is.
//
//   It also shut the shop. On 2026-07-29 the first end-to-end walk found SIX OF
//   SIX pandit-puja combinations returning POOJA_NOT_VERIFIED — production
//   could not take a single booking, because no seeded pandit had ever
//   completed a verification. Every piece of infrastructure was fixed and the
//   product still could not sell anything.
//
// THE HISTORY IS KEPT, NOT DELETED — same handling as
// public-pandit-access.test.ts when the public-read scope was widened. A
// superseded ruling that vanishes from the tree looks like a bug nobody
// reasoned about.
//
// WHAT THIS FILE ASSERTS NOW: the INVERSE. The gate must stay gone, AND the
// information that replaced it must still be produced — so a future edit can
// neither quietly re-close the shop nor silently drop the badge.
// ─────────────────────────────────────────────────────────────

console.log("Running pooja-gate guard (SUPERSEDED: सत्यापन informs, never blocks)…");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));
const SVC = read("services/api/src/services/booking.service.ts");

// ── 1. the gate must NOT return ────────────────────────────────
assert.strictEqual(
  SVC.indexOf("poojaVerification.findFirst"),
  -1,
  "createBooking queries PoojaVerification again — the booking GATE is back. सत्यापन is " +
    "INFORMATION, not permission (Isj, 2026-07-29): a customer may knowingly choose an " +
    "unverified pandit. This gate meant production took ZERO bookings, six of six.",
);
assert.ok(
  !/throw new AppError\([\s\S]{0,240}POOJA_NOT_VERIFIED/.test(SVC),
  "createBooking throws POOJA_NOT_VERIFIED again — the refusal is superseded. Show the customer " +
    "the state and let him choose.",
);

// ── 2. …and the INFORMATION that replaced it must still be produced ──
// Removing a gate is only safe while the fact it enforced is still shown. If
// the projection stops carrying it the customer is neither blocked NOR told —
// the worst of both, and the shape this ruling exists to prevent.
const CTRL = read("services/api/src/controllers/pandit.controller.ts");
for (const field of ["verifiedPoojaTypes", "poojaVerified", "identityVerified"]) {
  assert.ok(
    CTRL.includes(field),
    `the public projection no longer carries "${field}". The gate was removed on the promise that ` +
      `the customer would be TOLD instead — drop this and he is neither blocked nor informed.`,
  );
}
const TAB = read("apps/web/app/pandit/[id]/ServicesTab.tsx");
assert.ok(
  /service\.poojaVerified/.test(TAB),
  "the services list no longer reads service.poojaVerified — the badge that replaced the gate is gone",
);

// ── 3. the CTA must NOT be blocked by verification any more ────
// It was, until this ruling. Leaving it disabled would keep the shop shut by
// the front end after the back end stopped shutting it.
assert.ok(
  !/अभी बुक नहीं कर सकते/.test(TAB),
  "the Book CTA still refuses an unverified puja. The ruling moved सत्यापन from a GATE to " +
    "INFORMATION — a customer may knowingly book an unverified pandit, so the control must work.",
);

console.log("pooja-gate guard: SUPERSEDED — gate absent, information still shown, CTA not blocked ✅");
