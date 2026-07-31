import assert from "node:assert";
import { proveMatchers, proveSaw } from "./g2";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";

// ─────────────────────────────────────────────────────────────
// ONE BOOKING, ONE RAZORPAY ORDER.
//
// WHAT HAPPENED. Every booking made through the wizard minted TWO orders:
//   1. POST /bookings calls createRazorpayOrder inline (booking.routes.ts) and
//      returns it to the client as `order`.
//   2. The wizard then calls POST /payments/create-order (booking-wizard-
//      client.tsx) and mints a SECOND order, whose id overwrites the first on
//      the booking row.
// The first order stays open at Razorpay's end for the same receipt — never
// paid, never cancelled, never reconciled. A CAPTURED branch already guarded
// the paid case; nothing guarded the unpaid one, which is the common one.
//
// It also blocked orphan recovery: HPJ-2026-19028 sat with razorpayOrderId
// NULL, and any retry would have stacked another order rather than settling
// the row.
//
// THE FIX IS IDEMPOTENCY, NOT REMOVING A CALL SITE. Either call site could
// legitimately be first (the wizard's, a retry, a resumed checkout), so the
// invariant belongs in the service both of them go through.
// ─────────────────────────────────────────────────────────────

console.log("Running order-idempotency guard (one booking, one order)…");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));
const SVC = read("services/api/src/services/payment.service.ts");

const fnIdx = SVC.indexOf("export async function createRazorpayOrder");
assert.ok(fnIdx > 0, "createRazorpayOrder is gone — this guard has lost its subject");
const body = SVC.slice(fnIdx, fnIdx + 2600);

// ── 1. the unpaid-order reuse branch exists ──────────────────
assert.ok(
  /if \(booking\.razorpayOrderId\) \{/.test(body),
  "createRazorpayOrder no longer returns an EXISTING order when the booking already has one. " +
    "Every wizard booking mints two orders again — POST /bookings creates one and the wizard " +
    "immediately creates another, abandoning the first at Razorpay for the same receipt.",
);

// ── 2. …and it returns BEFORE the network call ───────────────
// A reuse branch placed after createOrder() would still mint the duplicate.
const reuseIdx = body.indexOf("if (booking.razorpayOrderId) {");
const createIdx = body.indexOf("await createOrder(");
assert.ok(createIdx > 0, "createOrder call not found inside createRazorpayOrder");
assert.ok(
  reuseIdx < createIdx,
  "the existing-order branch sits AFTER the createOrder() call — it would return early only " +
    "after already minting the duplicate it exists to prevent.",
);

// ── 3. the CAPTURED guard is still there ─────────────────────
assert.ok(
  /paymentStatus === "CAPTURED"/.test(body),
  "the paid-booking guard is gone — a captured booking would be issued a fresh order",
);

// ── 4. the amount is re-derived from the ROW, never the caller ──
// The reuse branch must not echo a client-supplied amount back as if the server
// had authorised it (display=charge).
const reuseBlock = body.slice(reuseIdx, reuseIdx + 420);
assert.ok(
  /amountInRupees/.test(reuseBlock),
  "the reuse branch does not derive its amount from the booking row. Every rupee the client is " +
    "shown must come from the server's own figure — display=charge.",
);
assert.ok(
  !/input\.|req\.body|request\.body/.test(reuseBlock),
  "the reuse branch reads a caller-supplied value",
);

// ── 5. fail-closed in production is UNTOUCHED ────────────────
assert.ok(
  /PAYMENTS_NOT_CONFIGURED/.test(SVC) && /NODE_ENV === "production"/.test(SVC),
  "the production fail-closed posture is gone — a missing key would mint a mock order id onto a " +
    "real booking, simulating a payment path that does not exist",
);

// ── PROVE-TO-FAIL (law G2) ───────────────────────────────────
const mustMatch: Array<[string, RegExp, string]> = [
  ["the reuse branch, as written", /if \(booking\.razorpayOrderId\) \{/,
    "  if (booking.razorpayOrderId) {"],
  ["the createOrder call it must precede", /await createOrder\(/,
    "  const order = await createOrder({"],
  ["the CAPTURED guard, as written", /paymentStatus === "CAPTURED"/,
    '  if (booking.paymentStatus === "CAPTURED") {'],
  ["the fail-closed code, as written", /PAYMENTS_NOT_CONFIGURED/,
    '      throw new AppError("…", 503, "PAYMENTS_NOT_CONFIGURED");'],
  ["a caller-supplied amount leaking in (the regression)", /input\.|req\.body|request\.body/,
    "      amount: input.amount,"],
];
proveMatchers("orderIdempotency", mustMatch);
// The ordering assertion is positional, not textual — prove it can fail by
// checking the inverse ordering on a synthetic body.
const badOrder = 'const order = await createOrder({});\n  if (booking.razorpayOrderId) {';
assert.ok(
  badOrder.indexOf("if (booking.razorpayOrderId) {") > badOrder.indexOf("await createOrder("),
  "MATCHER BLIND: the ordering check cannot detect a reuse branch placed after createOrder()",
);

console.log(
  `order-idempotency guard ✅ — reuse branch precedes the network call, CAPTURED guard intact, ` +
    `amount derived from the row, fail-closed preserved, ${mustMatch.length + 1} matchers proven able to fail`,
);

// G2 observation (2026-07-31).
proveSaw("orderIdempotency", "source files read (non-empty)",
  [SVC].filter((s) => s.length > 0).length);
