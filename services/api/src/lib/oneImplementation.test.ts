import assert from "node:assert";
import { proveMatchers, proveSaw } from "./g2";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";
import { ACCEPTABLE_DB_STATUSES } from "./bookingStatus";

// ─────────────────────────────────────────────────────────────
// ONE IMPLEMENTATION PER STATE TRANSITION — Isj, 2026-07-29.
//
// The route inventory found FOUR resources served twice, each with its own
// independent implementation, both live and both reachable by any authenticated
// pandit. The app called one; nothing stopped anyone calling the other.
//
// WHAT THE TWINS DID DIFFERENTLY — this is why it was a money bug and not a
// tidiness complaint:
//
//   complete  the twin flipped to COMPLETED and set payoutStatus PENDING but
//             NEVER CREATED THE PAYOUT ROW. The pandit is owed money and no
//             payout record exists. It also allowed completion straight from
//             CONFIRMED with NO journeyStep check — closing a puja he never
//             travelled to, which is exactly what the canonical handler's
//             `journeyStep: 3` condition exists to prevent.
//   accept    the twin hard-coded `status: "PANDIT_REQUESTED"`, so it never saw
//             ACCEPTABLE_DB_STATUSES — the derived set created this same week
//             precisely to stop two files disagreeing about acceptability.
//   decline   the twin flipped to CANCELLATION_REQUESTED; the canonical handler
//             flips to CANCELLED. Two terminal states for one user action, and
//             only one of them tells the customer his slot is free.
//   earnings  two money projections answering one question.
//
//   journey   a FIFTH family, ruled separately: the trio wrote
//             PANDIT_EN_ROUTE / PANDIT_ARRIVED / PUJA_IN_PROGRESS and NEVER
//             set journeyStep, while canonical advanced journeyStep and wrote
//             "IN_PROGRESS" — a status the LIVE customer tree has no case for.
//             Canonical now owns the journey AND writes the three statuses the
//             surfaces actually render.
//
// All five now DELEGATE to the canonical handler. This guard pins that they
// stay delegations, and that the payout row keeps exactly one writer.
// ─────────────────────────────────────────────────────────────

console.log("Running one-implementation guard (state transitions + payout)…");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

const PR = read("services/api/src/routes/pandit.routes.ts");
const AUTH = read("services/api/src/controllers/auth.controller.ts");

// ── 1. the four routes are DELEGATIONS, not implementations ──
const DELEGATED: Array<[string, string]> = [
  ['fastify.post("/bookings/:id/accept"', "acceptBooking"],
  ['fastify.post("/bookings/:id/decline"', "rejectBooking"],
  ['fastify.post("/bookings/:id/complete"', "completeBooking"],
  ['fastify.get("/earnings/summary"', "getPanditEarningsSummary"],
];
for (const [decl, handler] of DELEGATED) {
  const i = PR.indexOf(decl);
  assert.ok(i > 0, `${decl} is gone from pandit.routes.ts — the delegation was removed, not the twin`);
  const tail = PR.slice(i, i + 260);
  assert.ok(
    new RegExp(`\\}, ${handler}\\);`).test(tail),
    `${decl} no longer delegates to ${handler}. A second implementation of a state transition is ` +
      `how the payout row went missing: the twin marked bookings COMPLETED and created no Payout.`,
  );
  // …and carries no body of its own.
  assert.ok(
    !/async \(request/.test(tail),
    `${decl} has grown an inline handler again — that IS a second implementation`,
  );
}

// ── 2. the plugin performs NO booking state transitions at all ─
// Any `booking.update*` inside pandit.routes.ts is by definition a second
// writer of the state machine, wherever it sits.
// The journey trio was the FIFTH twin family, ruled on separately and now
// unified too — so this is back to ZERO. See section 2b for what the
// unification had to preserve.
const bookingWrites = [...PR.matchAll(/prisma\.booking\.(update|updateMany|create)\(/g)].map((m) => m[0]);
assert.deepStrictEqual(
  bookingWrites,
  [],
  `pandit.routes.ts writes Booking directly (${bookingWrites.join(", ")}). Every booking state ` +
    `transition belongs to the canonical controller; a write here is a second state machine.`,
);

// ── 2b. THE JOURNEY IS ONE MACHINE, AND IT ALWAYS ADVANCES journeyStep ──
// The trio (start-journey / arrived / start-puja) used to write
// PANDIT_EN_ROUTE / PANDIT_ARRIVED / PUJA_IN_PROGRESS and NEVER set
// journeyStep, while canonical advanced journeyStep and wrote a status nothing
// rendered. Both halves are now in one place.
for (const [route, step] of [["start-journey", 1], ["arrived", 2], ["start-puja", 3]] as const) {
  const i = PR.indexOf(`fastify.post("/bookings/:id/${route}"`);
  assert.ok(i > 0, `the journey route ${route} is gone or still on the :bookingId param`);
  const tail = PR.slice(i, i + 420);
  assert.ok(
    new RegExp(`step: ${step}`).test(tail) && /return postBookingJourney\(request, reply\);/.test(tail),
    `${route} no longer delegates to postBookingJourney with step ${step}. completeBooking ` +
      `requires journeyStep 3 — a journey route that does not advance the step strands the ` +
      `pandit at a booking he cannot be paid for.`,
  );
}
// STATUS AND journeyStep MOVE TOGETHER, always. A step that advances without a
// status leaves every customer tracking surface blank; a status without a step
// leaves the payout unreachable. They are written in one object for that reason.
const journeyIdx = AUTH.indexOf("const JOURNEY_STATUS");
assert.ok(journeyIdx > 0, "the per-step status map is gone from postBookingJourney");
const journeyBody = AUTH.slice(journeyIdx, journeyIdx + 900);
for (const s of ["PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"]) {
  assert.ok(
    journeyBody.includes(s),
    `the journey no longer writes ${s}. The LIVE customer tree switches on exactly these three ` +
      `(apps/web/app/dashboard/bookings/[bookingId]/page.tsx:110-112) and has NO case for ` +
      `"IN_PROGRESS" — dropping them blanks the banner, the contact reveal and the timeline.`,
  );
}
assert.ok(
  /advanceData: any = \{ journeyStep: targetStep/.test(AUTH) && /advanceData\.status = JOURNEY_STATUS\[targetStep\]/.test(AUTH),
  "journeyStep and status are no longer set in the same advance object — they must move together",
);

// ── 3. THE PAYOUT ROW HAS EXACTLY ONE PANDIT-REACHABLE WRITER ──
// This is the assertion that would have caught the original bug. The admin
// panel is a separate, deliberate writer (ops issuing a payout by hand).
assert.ok(
  /tx\.payout\.create\(/.test(AUTH),
  "the canonical completeBooking no longer creates the payout inside its transaction — a booking " +
    "can now be COMPLETED with no Payout row, which is what the deleted twin did",
);
assert.ok(
  !/payout\.create\(/.test(PR),
  "pandit.routes.ts creates a Payout row. There must be exactly one pandit-reachable payout " +
    "writer, inside the same transaction as the COMPLETED flip.",
);
// The payout must stay INSIDE the atomic flip — a payout created outside the
// conditional update is a double-payout on a retry.
const completeIdx = AUTH.indexOf("export const completeBooking");
const completeBody = AUTH.slice(completeIdx, completeIdx + 3000);
assert.ok(
  /tx\.booking\.updateMany\(/.test(completeBody) && /tx\.payout\.create\(/.test(completeBody),
  "the COMPLETED flip and the payout creation are no longer in the same transaction — a retry " +
    "after a lost response would create a second payout for one puja",
);
assert.ok(
  /journeyStep: 3/.test(completeBody),
  "completeBooking no longer requires journeyStep 3 — this is the check that stops a payout " +
    "unlocking for a journey the pandit never performed. The twin lacked it.",
);

// ── 4. accept still derives its acceptable set ────────────────
assert.ok(
  /const PENDING = \[\.\.\.ACCEPTABLE_DB_STATUSES\]/.test(AUTH),
  "acceptBooking hand-lists statuses again. With the twin delegating here, this is now the ONLY " +
    "accept path — a hand-listed set here is unguarded by anything.",
);
assert.ok(ACCEPTABLE_DB_STATUSES.length > 0 && !ACCEPTABLE_DB_STATUSES.includes("CREATED"));

// ── PROVE-TO-FAIL (law G2) ───────────────────────────────────
// Every matcher above is shown able to match the REAL shape it hunts — for the
// negative assertions, the real shape of the code that was just removed.
const mustMatch: Array<[string, RegExp, string]> = [
  ["a delegation, as written", /\}, completeBooking\);/,
    "  }, completeBooking);"],
  ["an inline handler regrowing (the regression)", /async \(request/,
    "  }, async (request: any, reply: any) => {"],
  ["the twin's booking write, verbatim from the deleted code", /prisma\.booking\.(update|updateMany|create)\(/,
    "      const flipped = await prisma.booking.updateMany({"],
  ["the payout create inside the tx, as written", /tx\.payout\.create\(/,
    "      await tx.payout.create({"],
  ["a payout writer in the routes file (the regression)", /payout\.create\(/,
    "      await prisma.payout.create({"],
  ["the journeyStep condition, as written", /journeyStep: 3/,
    "      where: { id, panditId: profile.id, status: { not: \"COMPLETED\" }, journeyStep: 3 },"],
  ["the derived PENDING, as written", /const PENDING = \[\.\.\.ACCEPTABLE_DB_STATUSES\]/,
    "  const PENDING = [...ACCEPTABLE_DB_STATUSES];"],
  ["a journey delegation, as written", /return postBookingJourney\(request, reply\);/,
    "    return postBookingJourney(request, reply);"],
  ["the injected step, as written", /step: 2/,
    "    request.body = { ...(request.body ?? {}), step: 2 };"],
  ["the status+step advance object, as written", /advanceData: any = \{ journeyStep: targetStep/,
    "  const advanceData: any = { journeyStep: targetStep, travelNotes: JSON.stringify(timestamps) };"],
];
proveMatchers("oneImplementation", mustMatch);
// The delegation check is a COMPOUND — prove the negative half rejects a real
// inline handler, using the exact text of the twin that was removed.
const realTwin = `fastify.post("/bookings/:id/complete", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    const flipped = await prisma.booking.updateMany({`;
assert.ok(
  /async \(request/.test(realTwin),
  "MATCHER BLIND: the inline-handler check cannot see the actual twin it exists to reject",
);

console.log(
  `one-implementation guard ✅ — ${DELEGATED.length} transitions delegate, ` +
    `${bookingWrites.length} booking writes left in the routes plugin, ` +
    `payout has one writer inside the flip, ` +
    `${mustMatch.length + 1} matchers proven able to fail`,
);

// G2 observation (2026-07-31).
proveSaw("oneImplementation", "source files read (non-empty)",
  [PR, AUTH].filter((s) => s.length > 0).length);
