import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";
import { panditView, dbStatusesForView } from "./bookingStatus";
import {
  contactVisible,
  redactBookingForPandit,
  redactBookingForCustomer,
  redactBookingForRole,
  CONTACT_VISIBLE_DB_STATUSES,
} from "./bookingIdentity";

// ─────────────────────────────────────────────────────────────
// THE SYMMETRIC CONTACT RULE (Isj, 2026-07-29):
//
//   No customer identity field may ship to a pandit-facing response for a
//   booking that is not CONFIRMED — and vice versa.
//
// This guard is BEHAVIOURAL first and textual second, deliberately. The seven
// matcher-blindness instances in this campaign were all regex guards asserting
// on source; three more turned up in prose the same week. Where a rule can be
// executed, execute it — a function fed a real shape cannot mis-see its subject.
// The source assertions below exist only for the thing that cannot be executed:
// whether each call site actually CALLS the redactor.
// ─────────────────────────────────────────────────────────────

console.log("Running contact-gate guard (symmetric identity rule)…");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

// Every DB status the state machine knows, split by the ruling.
const ALL_DB = [
  "CREATED", "PANDIT_REQUESTED", "REQUESTED",
  "CONFIRMED", "ACCEPTED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED",
  "PUJA_IN_PROGRESS", "IN_PROGRESS", "COMPLETED",
  "CANCELLATION_REQUESTED", "CANCELLED", "REFUNDED", "REJECTED",
];
const SHOULD_SEE = new Set([
  "CONFIRMED", "ACCEPTED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED",
  "PUJA_IN_PROGRESS", "IN_PROGRESS", "COMPLETED",
]);

// A booking carrying EVERY identity field either side could leak. If a new
// identity column is added to the schema it belongs in this fixture too.
const fixture = (status: string) => ({
  id: "bk_1",
  status,
  bookingNumber: "HPJ-TEST-1",
  venueCity: "Varanasi",
  venuePincode: "221001",
  venueAddress: "12 Assi Ghat Road, near the temple",
  venueLatitude: 25.2677,
  venueLongitude: 82.9913,
  eventAddress: "12 Assi Ghat Road",
  customerName: "Ramesh Gupta",
  customerPhone: "+919876500042",
  customer: {
    id: "u_1", name: "Ramesh Gupta", phone: "+919876500042",
    email: "ramesh@example.com", role: "CUSTOMER", isActive: true,
    profileCompleted: true, language: "hi", createdAt: new Date(),
    customerProfile: { addressLine1: "12 Assi Ghat Road", city: "Varanasi" },
  },
  pandit: {
    id: "pp_1", userId: "u_2", hourlyRate: 2100,
    user: { id: "u_2", name: "Pt. Ramesh Sharma", phone: "+919876543210", email: "p@example.com" },
  },
});

const SECRETS = ["+919876500042", "Ramesh Gupta", "ramesh@example.com", "12 Assi Ghat Road", "82.9913"];
const PANDIT_SECRETS = ["+919876543210", "Pt. Ramesh Sharma", "p@example.com"];

// ── 1. THE RULE ITSELF, EXECUTED ON EVERY STATUS ─────────────
for (const status of ALL_DB) {
  const shouldSee = SHOULD_SEE.has(status);
  assert.strictEqual(
    contactVisible(status),
    shouldSee,
    `contactVisible("${status}") should be ${shouldSee}. The rule is: name and phone once the ` +
      `booking is CONFIRMED (and everything past it), never before, and not after a cancellation.`,
  );

  // ── pandit side ──
  const p = redactBookingForPandit(fixture(status));
  const pJson = JSON.stringify(p);
  if (shouldSee) {
    assert.strictEqual(p.customer.name, "Ramesh Gupta", `[${status}] pandit must SEE the name once confirmed`);
    assert.strictEqual(p.customer.phone, "+919876500042", `[${status}] pandit must SEE the phone once confirmed`);
    assert.ok(p.venueAddress, `[${status}] the full address returns on CONFIRMED — he is going there`);
  } else {
    assert.strictEqual(p.customer.name, null, `[${status}] customer NAME leaked to the pandit pre-CONFIRMED`);
    assert.strictEqual(p.customer.phone, null, `[${status}] customer PHONE leaked to the pandit pre-CONFIRMED`);
    assert.strictEqual(p.customerName, "", `[${status}] legacy customerName scalar leaked`);
    assert.strictEqual(p.customerPhone, "", `[${status}] legacy customerPhone scalar leaked`);
    assert.strictEqual(p.venueAddress, null, `[${status}] full street address leaked pre-CONFIRMED`);
    assert.strictEqual(p.venueLatitude, null, `[${status}] venue latitude leaked pre-CONFIRMED`);
    assert.strictEqual(p.venueLongitude, null, `[${status}] venue longitude leaked pre-CONFIRMED`);
    assert.strictEqual(p.eventAddress, "", `[${status}] eventAddress leaked pre-CONFIRMED`);
    for (const s of SECRETS) {
      assert.ok(
        !pJson.includes(s),
        `[${status}] the serialised pandit response still contains "${s}". A field-by-field check ` +
          `can miss a nested copy; this is the whole-payload sweep that catches it.`,
      );
    }
    // …but he must still be able to judge the journey.
    assert.strictEqual(p.venueCity, "Varanasi", `[${status}] city must SURVIVE — he judges travel by it`);
    assert.strictEqual(p.venuePincode, "221001", `[${status}] pincode is the "area" half of the ruling`);
  }

  // NEVER the whole User, in ANY state. This is the half that is not about
  // timing at all: email/role/isActive/customerProfile are never his business.
  assert.deepStrictEqual(
    Object.keys(p.customer).sort(),
    ["name", "phone"],
    `[${status}] the customer object must be exactly { name, phone }. It was the ENTIRE User row ` +
      `plus customerProfile in production on 2026-07-29.`,
  );

  // ── customer side (the mirror) ──
  const c = redactBookingForCustomer(fixture(status));
  const cJson = JSON.stringify(c);
  if (shouldSee) {
    assert.strictEqual(c.pandit.user.name, "Pt. Ramesh Sharma", `[${status}] customer must SEE the pandit's name`);
    assert.strictEqual(c.pandit.user.phone, "+919876543210", `[${status}] customer must SEE the pandit's phone`);
  } else {
    assert.strictEqual(c.pandit.user.name, null, `[${status}] pandit NAME leaked to the customer pre-CONFIRMED`);
    assert.strictEqual(c.pandit.user.phone, null, `[${status}] pandit PHONE leaked to the customer pre-CONFIRMED`);
    for (const s of PANDIT_SECRETS) {
      assert.ok(!cJson.includes(s), `[${status}] the serialised customer response still contains "${s}"`);
    }
  }
  assert.deepStrictEqual(
    Object.keys(c.pandit.user).sort(),
    ["name", "phone"],
    `[${status}] the pandit's user object must be exactly { name, phone } — never the whole User`,
  );
  // The professional listing is NOT identity and must survive.
  assert.strictEqual(c.pandit.hourlyRate, 2100, `[${status}] the pandit's rate is public listing data, not identity`);
}

// ── 1b. ONCE VISIBLE, ALWAYS VISIBLE ─────────────────────────
// Isj overruled my first reading, which made contact vanish the moment a
// confirmed booking was cancelled:
//
//   "The pandit whose booking just cancelled is precisely the person who needs
//    to call. Ops holding both numbers means Isj's phone rings instead — that
//    is the runbook GROWING, not shrinking."
//
// `acceptedAt` is the durable record that the booking was once real. A
// cancellation rewrites `status`; it cannot un-happen the acceptance.
for (const terminal of ["CANCELLED", "CANCELLATION_REQUESTED", "REFUNDED", "REJECTED"]) {
  const accepted = { ...fixture(terminal), acceptedAt: new Date("2026-07-29T10:00:00Z") };
  assert.ok(
    contactVisible(accepted),
    `a booking that was ACCEPTED and is now ${terminal} lost its contact details. The pandit whose ` +
      `booking just cancelled is exactly who needs to ring the yajman — withholding it routes that ` +
      `call to ops instead, which grows the manual runbook rather than shrinking it.`,
  );
  const p = redactBookingForPandit(accepted);
  assert.strictEqual(p.customer.name, "Ramesh Gupta", `[${terminal}+acceptedAt] name must survive`);
  assert.strictEqual(p.customer.phone, "+919876500042", `[${terminal}+acceptedAt] phone must survive`);
  assert.ok(p.venueAddress, `[${terminal}+acceptedAt] the address must survive too — he may be en route`);
  const c = redactBookingForCustomer(accepted);
  assert.strictEqual(
    c.pandit.user.phone, "+919876543210",
    `[${terminal}+acceptedAt] the MIRROR must hold: the customer keeps the pandit's number too`,
  );
}
// …but a booking that was NEVER accepted and is now cancelled stays hidden —
// the overrule widened one case, it did not delete the rule.
const neverAccepted = { ...fixture("CANCELLED"), acceptedAt: null };
assert.strictEqual(
  redactBookingForPandit(neverAccepted).customer.phone,
  null,
  "a booking cancelled BEFORE it was ever accepted now leaks the phone — `acceptedAt` is the " +
    "test, not the mere fact of being terminal.",
);

// ── 2. THE BOTH-VOCABULARIES INVARIANT ───────────────────────
// redactBookingForPandit reads `status`, and withPanditView REWRITES it. If the
// two ever run in the other order the gate must still be correct, so the
// visible-set has to mean the same thing in Machine-B (DB) and Machine-A (view)
// words. It does — but only by construction, so it is pinned here rather than
// left as a happy accident.
for (const status of ALL_DB) {
  assert.strictEqual(
    contactVisible(status),
    contactVisible(panditView(status)),
    `contactVisible disagrees with itself across the two vocabularies for "${status}" ` +
      `(view = "${panditView(status)}"). Redaction would then depend on whether it ran before or ` +
      `after withPanditView — an ordering nobody would think to test.`,
  );
}

// ── 3. FAIL CLOSED ON AN UNKNOWN ROLE ────────────────────────
const unknown = redactBookingForRole(fixture("CREATED"), "MARKETING_INTERN") as any;
assert.strictEqual(
  unknown.pandit.user.name,
  null,
  "an unrecognised role must fall to the CUSTOMER redaction, not to no redaction. Adding a " +
    "fourth role must not silently open both sides.",
);
const adminRow = redactBookingForRole(fixture("CREATED"), "ADMIN") as any;
assert.strictEqual(
  adminRow.customer.email,
  "ramesh@example.com",
  "ADMIN must stay UNREDACTED — the manual-ops runbook is built on ops seeing both sides.",
);

// ── 4. THE VISIBLE SET IS DERIVED, NOT HAND-LISTED ───────────
const derived = new Set([
  ...dbStatusesForView("ACCEPTED"),
  ...dbStatusesForView("IN_PROGRESS"),
  ...dbStatusesForView("COMPLETED"),
]);
assert.deepStrictEqual(
  [...CONTACT_VISIBLE_DB_STATUSES].sort(),
  [...derived].sort(),
  "CONTACT_VISIBLE_DB_STATUSES has drifted from the state machine it must be derived from",
);
assert.ok(!CONTACT_VISIBLE_DB_STATUSES.has("CREATED"));
assert.ok(!CONTACT_VISIBLE_DB_STATUSES.has("PANDIT_REQUESTED"));
assert.ok(!CONTACT_VISIBLE_DB_STATUSES.has("CANCELLED"));

// ── 5. EVERY CALL SITE ACTUALLY CALLS IT ─────────────────────
// The one thing that cannot be executed: whether the handlers are wired to the
// function this guard just proved correct. A perfect redactor nobody calls is
// the exact failure mode of the API having no onSend/preSerialization hook.
const SITES: Array<[string, RegExp, string]> = [
  ["services/api/src/controllers/auth.controller.ts", /\.map\(redactBookingForPandit\)/,
    "GET /pandit/bookings (the list the pandit app actually calls)"],
  ["services/api/src/controllers/auth.controller.ts", /\.\.\.redactBookingForPandit\(booking\)/,
    "GET /pandit/bookings/:id (the detail the pandit app actually calls)"],
  ["services/api/src/routes/pandit.routes.ts", /sendSuccess\(res, redactBookingForPandit\(booking\)\)/,
    "GET /pandits/bookings/:bookingId — the route that shipped the whole User row"],
  ["services/api/src/routes/pandit.routes.ts", /sendPaginated\(res, redactManyForPandit\(bookings\)/,
    "GET /pandits/bookings"],
  ["services/api/src/routes/pandit.routes.ts", /sendSuccess\(res, redactManyForPandit\(pendingRequests\)\)/,
    "GET /pandits/pending-requests — pre-CONFIRMED by definition"],
  ["services/api/src/routes/pandit.routes.ts", /contactVisible\(b\)/,
    "GET /pandits/calendar — a hand-built literal, gated directly"],
  ["services/api/src/routes/booking.routes.ts", /redactManyForPandit\(bookings as any\[\]\)/,
    "GET /bookings/pandit/my — the bulk full-User path"],
  ["services/api/src/routes/booking.routes.ts", /redactManyForRole\(bookings as any\[\], req\.user!\.role\)/,
    "GET /bookings/my — no roleGuard, dispatches on the token's role"],
  ["services/api/src/routes/booking.routes.ts", /redactManyForCustomer\(bookings as any\[\]\)/,
    "GET /bookings/customer/my"],
  ["services/api/src/routes/booking.routes.ts", /redactBookingForRole\(booking as any, req\.user!\.role\)/,
    "GET /bookings/:id — serves all three roles from one handler"],
];
for (const [file, re, what] of SITES) {
  assert.ok(
    re.test(read(file)),
    `${what} no longer passes through the contact gate (${file}). This API has no onSend, no ` +
      `preSerialization, no response schema and no Prisma $extends — an unredacted send is a leak, ` +
      `and nothing downstream will catch it.`,
  );
}

// ── 6. AND THE QUERIES STAY NARROW ───────────────────────────
// Defence in depth: even an unredacted path must not be able to leak a column
// nobody chose to expose.
const SVC = read("services/api/src/services/booking.service.ts");
assert.ok(
  !/include:\s*\{\s*customer:\s*true/.test(SVC),
  "booking.service.ts selects the whole customer User again (`customer: true`). Narrow it to " +
    "{ name, phone } — that was the widest exposure in the 2026-07-29 trace.",
);
assert.ok(
  !/pandit:\s*\{\s*include:\s*\{\s*user:\s*true/.test(SVC),
  "booking.service.ts selects the whole pandit User again (`user: true`)",
);
const PR = read("services/api/src/routes/pandit.routes.ts");
assert.ok(
  !/customer:\s*\{\s*include:\s*\{\s*customerProfile:\s*true/.test(PR),
  "pandit.routes.ts joins the entire customerProfile again — that is the exact shape proven " +
    "leaking against production on 2026-07-29",
);

// ── PROVE-TO-FAIL (law G2) ───────────────────────────────────
// The behavioural assertions above cannot be blind — they run the real code.
// The SOURCE matchers can be, so each is shown able to match its real subject.
const mustMatch: Array<[string, RegExp, string]> = [
  ["the list redaction, as written", /\.map\(redactBookingForPandit\)/,
    "    data: bookings.map(redactBookingForPandit).map(withPanditView)"],
  ["the detail spread, as written", /\.\.\.redactBookingForPandit\(booking\)/,
    "        ...redactBookingForPandit(booking),"],
  ["the plural-route send, as written", /sendSuccess\(res, redactBookingForPandit\(booking\)\)/,
    "      sendSuccess(res, redactBookingForPandit(booking));"],
  ["the role dispatch, as written", /redactBookingForRole\(booking as any, req\.user!\.role\)/,
    '      return sendSuccess(res, { booking: redactBookingForRole(booking as any, req.user!.role) }, "Booking detail");'],
  ["the calendar gate, as written", /contactVisible\(b\)/,
    "          customerName: contactVisible(b) ? (b.customer?.name || \"Customer\") : \"यजमान\""],
  ["the whole-User regression, verbatim", /include:\s*\{\s*customer:\s*true/,
    "        include: { customer: true },"],
  ["the customerProfile regression, verbatim", /customer:\s*\{\s*include:\s*\{\s*customerProfile:\s*true/,
    "          customer: { include: { customerProfile: true } },"],
  ["the whole pandit-User regression, verbatim", /pandit:\s*\{\s*include:\s*\{\s*user:\s*true/,
    "      pandit: { include: { user: true } },  // pandit is the PanditProfile"],
];
for (const [what, re, subject] of mustMatch) {
  assert.ok(
    re.test(subject),
    `MATCHER BLIND (law G2): the pattern for "${what}" cannot match the shape it hunts.\n` +
      `  pattern: ${re}\n  subject: ${subject}`,
  );
}

// The fixture itself must be able to fail: if redactBookingForPandit were a
// no-op, section 1 must catch it. Prove that by running the un-redacted row
// through the same whole-payload sweep.
const raw = JSON.stringify(fixture("CREATED"));
assert.ok(
  SECRETS.every((s) => raw.includes(s)),
  "the fixture no longer carries the very fields this guard exists to catch — the whole-payload " +
    "sweep would pass on any implementation, including a no-op.",
);

console.log(
  `contact-gate guard ✅ — ${ALL_DB.length} statuses × both directions executed; ` +
    `visible=[${[...CONTACT_VISIBLE_DB_STATUSES].sort().join(", ")}]; ` +
    `${SITES.length} call sites wired; fail-closed on unknown role; ` +
    `${mustMatch.length} source matchers proven able to fail`,
);
