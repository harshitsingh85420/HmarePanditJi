import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// Comments are stripped by the ONE shared implementation. See
// packages/utils/src/code-only.ts.
// (the /code-only SUBPATH, not the barrel: the barrel re-exports
//  auth-context.tsx, which requires React — unresolvable in bare node+tsx.)
import { codeOnly } from "@hmarepanditji/utils/code-only";
import { KYC_REVIEW_QUEUE_STATUSES } from "@hmarepanditji/types";
import { dbStatusesForView, CANCELLABLE_DB_STATUSES } from "./bookingStatus";

// ─────────────────────────────────────────────────────────────
// EVERY STATUS SET IN ADMIN, PINNED TO ITS SHARED SOURCE.
// Isj order, 2026-07-28: "the per-site approach has demonstrably failed
// four times."
//
// THE HISTORY THIS EXISTS TO END — one break, five survivals:
//   1. the KYC review vocabulary was fixed at the write site;
//   2. …it survived at the verifications SCREEN;
//   3. …it survived at the queue ENDPOINT;
//   4. …it survived in kycContract's own six-file pin list;
//   5. …it survived in admin.controller's dashboard counter, which kept
//      counting PENDING — the schema DEFAULT, DISJOINT from the real queue —
//      so the badge could never equal the length of the list it opens.
// A per-site fix cures a site. Only a derived set cures the class.
//
// THE RULE: no status set in any admin surface may be hand-written. Each must
// be DERIVED from the one source that owns that vocabulary:
//   · KYC / verification  → packages/types/src/verification.ts
//   · booking lifecycle   → services/api/src/lib/bookingStatus.ts + the Prisma
//                           enum in packages/db/prisma/schema.prisma
// ─────────────────────────────────────────────────────────────

console.log("Running admin status-set guard (every set derived, none hand-written)...");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

const ADMIN_API = [
  "services/api/src/controllers/admin.controller.ts",
  "services/api/src/routes/admin.routes.ts",
];

// ── 1. the Prisma enum is the floor for every booking-status literal ──
const SCHEMA = readFileSync(join(REPO, "packages/db/prisma/schema.prisma"), "utf8");
const enumBlock = /enum BookingStatus \{([^}]*)\}/.exec(SCHEMA);
assert.ok(enumBlock, "BookingStatus enum not found — the reader has rotted");
const LEGAL_BOOKING_STATUSES = new Set(
  enumBlock![1].split("\n").map((l) => l.trim()).filter((l) => /^[A-Z_]+$/.test(l)),
);
assert.ok(LEGAL_BOOKING_STATUSES.size >= 10, `only ${LEGAL_BOOKING_STATUSES.size} statuses parsed`);

// ── 2. THE BOUNDARY: the admin UI's override options vs the server's schema ──
// The dropdown writes; updateBookingSchema is what the server would accept.
// These are two sides of one contract, so compare them directly rather than
// checking either alone. "PENDING" sat in the dropdown and in NO enum.
const ROUTES = read("services/api/src/routes/admin.routes.ts");
const zodEnum = /updateBookingSchema[\s\S]*?z\s*\.\s*enum\(\[([^\]]*)\]\)/.exec(ROUTES);
assert.ok(zodEnum, "updateBookingSchema's z.enum([...]) not found");
const SERVER_ACCEPTS = new Set(
  zodEnum![1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean),
);
for (const s of SERVER_ACCEPTS) {
  assert.ok(
    LEGAL_BOOKING_STATUSES.has(s),
    `updateBookingSchema accepts "${s}", which is not a BookingStatus member — Prisma would throw`,
  );
}

const OVERRIDE_UI = read("apps/admin/src/app/bookings/[id]/page.tsx");
const optionArray = /\[((?:\s*["'][A-Z_]+["']\s*,?)+)\]\.map\(\(s\)/.exec(OVERRIDE_UI);
assert.ok(optionArray, "the Override Status option array was not found in the admin booking detail page");
const UI_OFFERS = optionArray![1]
  .split(",")
  .map((s) => s.trim().replace(/^["']|["']$/g, ""))
  .filter(Boolean);
assert.ok(UI_OFFERS.length >= 3, `only ${UI_OFFERS.length} override options parsed`);

for (const s of UI_OFFERS) {
  assert.ok(
    LEGAL_BOOKING_STATUSES.has(s),
    `the admin Override Status control offers "${s}", which is NOT a BookingStatus member.\n` +
      `Selecting it reaches Prisma, throws, and returns a 500 the UI never shows (the caller\n` +
      `is \`if (res.ok)\` with no else) — an ops control that silently does nothing.\n` +
      `Legal values: ${[...LEGAL_BOOKING_STATUSES].join(", ")}`,
  );
  assert.ok(
    SERVER_ACCEPTS.has(s),
    `the admin Override Status control offers "${s}", which updateBookingSchema does not accept.\n` +
      `The control and the schema are two sides of one contract and must agree.`,
  );
}

// ── 3. no admin API file hand-writes a KYC status set ──────────
// A bare verificationStatus literal is how this survived five times.
for (const f of ADMIN_API) {
  const src = read(f);
  const bare = [...src.matchAll(/verificationStatus:\s*["']([A-Z_]+)["']/g)].map((m) => m[1]);
  assert.deepStrictEqual(
    bare,
    [],
    `${f} hand-writes verificationStatus ${JSON.stringify(bare)}. Import the constant from\n` +
      `@hmarepanditji/types instead — this exact shape survived four per-site fixes.`,
  );
  const bareIn = [...src.matchAll(/verificationStatus:\s*\{\s*in:\s*\[\s*["']/g)];
  assert.deepStrictEqual(
    bareIn.map(() => f),
    [],
    `${f} hand-lists a verificationStatus \`in\` array. Spread the shared constant instead.`,
  );
}

// ── 4. the admin surfaces IMPORT the shared vocabularies ───────
assert.ok(
  /KYC_REVIEW_QUEUE_WHERE/.test(read("services/api/src/controllers/admin.controller.ts")),
  "admin.controller.ts must count the review queue from KYC_REVIEW_QUEUE_WHERE (the widened, " +
    "shared where) — the badge must open the list it counts",
);
assert.ok(
  /dbStatusesForView/.test(ROUTES),
  "admin.routes.ts must derive its cancellable set from bookingStatus.ts, not from literals",
);

// ── 5. THE DISJOINTNESS PROOF — the sighting-5 regression, verbatim ──
// The counter and the queue must select the SAME rows. PENDING is the schema
// default (a pandit who uploaded nothing) and is deliberately excluded from the
// queue set, so counting it produced a badge that could never equal its list.
assert.ok(
  !(KYC_REVIEW_QUEUE_STATUSES as readonly string[]).includes("PENDING"),
  "PENDING must stay OUT of the review queue set — it is the schema default, not a submission",
);
const CONTROLLER = read("services/api/src/controllers/admin.controller.ts");
assert.ok(
  !/verificationStatus:\s*["']PENDING["']/.test(CONTROLLER),
  "admin.controller.ts is counting PENDING again — the badge would show a number that can never\n" +
    "equal the length of the list it opens (they are disjoint sets).",
);

// ── 6. the cancellable set really covers what the product WRITES ──
// A derived set is only worth having if it contains the statuses bookings are
// actually born into. This is the CAPABILITY ≠ PATH check applied to a set.
// IMPORTED, not re-derived. This line used to build its own copy of the set:
//   new Set([...dbStatusesForView("REQUESTED"), ...dbStatusesForView("ACCEPTED")])
// which is the same derivation admin.routes.ts was doing — two copies of one
// rule. When CREATED was split out of "REQUESTED" (2026-07-29) the route was
// updated and this copy was not, so the guard failed on correct code while
// reporting that ops had lost the ability to cancel. A guard that keeps its own
// copy of the thing it is checking is checking itself.
const CANCELLABLE = CANCELLABLE_DB_STATUSES;
for (const born of ["CREATED", "PANDIT_REQUESTED", "CONFIRMED"]) {
  assert.ok(
    CANCELLABLE.has(born),
    `bookings are written as "${born}" but the admin cancel guard would reject it — ops could not\n` +
      `cancel a booking at all, which is exactly the break this set replaced.`,
  );
}
for (const tooLate of ["COMPLETED", "CANCELLED", "REFUNDED"]) {
  assert.ok(!CANCELLABLE.has(tooLate), `"${tooLate}" must not be admin-cancellable`);
}

// ── G2 (2026-07-31): hybrid — §6 already exercises the imported set
// behaviourally. The extractors and relapse detectors are proven here; the
// bare-literal detector's tainted specimen is the exact shape that survived
// four per-site fixes.
import { proveDetects, proveMatchers, proveSaw } from "./g2";
proveSaw("adminStatusSets", "BookingStatus enum members parsed", LEGAL_BOOKING_STATUSES.size);
proveSaw("adminStatusSets", "server-accepted override statuses parsed", SERVER_ACCEPTS.size);
proveSaw("adminStatusSets", "admin UI override options parsed", UI_OFFERS.length);
proveSaw("adminStatusSets", "cancellable statuses imported and exercised", CANCELLABLE.size);
proveDetects("adminStatusSets", "the bare-literal extractor sees a hand-written status",
  (s: string) => [...s.matchAll(/verificationStatus:\s*["']([A-Z_]+)["']/g)].length > 0,
  'where: { verificationStatus: "PENDING" },',
  "where: { verificationStatus: { in: [...KYC_REVIEW_QUEUE_STATUSES] } },");
proveMatchers("adminStatusSets", [
  ["a hand-listed in-array", /verificationStatus:\s*\{\s*in:\s*\[\s*["']/,
    'verificationStatus: { in: ["DOCUMENTS_SUBMITTED", "VIDEO_KYC_DONE"] },',
    "verificationStatus: { in: [...KYC_REVIEW_QUEUE_STATUSES] },"],
  ["the PENDING-counter relapse (sighting 5)", /verificationStatus:\s*["']PENDING["']/,
    'const pendingKyc = await prisma.panditProfile.count({ where: { verificationStatus: "PENDING" } });'],
  ["the zod enum extractor's anchor", /updateBookingSchema[\s\S]*?z\s*\.\s*enum\(\[([^\]]*)\]\)/,
    'const updateBookingSchema = z.object({ status: z.enum(["CONFIRMED", "CANCELLED"]) });'],
]);

console.log(
  `✓ admin status-set guard passed (${LEGAL_BOOKING_STATUSES.size} legal statuses; ` +
    `${UI_OFFERS.length} override options pinned to the server schema; ` +
    `${KYC_REVIEW_QUEUE_STATUSES.length}-status KYC queue shared; ` +
    `${CANCELLABLE.size} cancellable statuses derived)`,
);
