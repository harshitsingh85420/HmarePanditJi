import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// Comments are stripped by the ONE shared implementation. See
// packages/utils/src/code-only.ts for why this is a scanner and not a
// regex, and for the single documented raw-source exception.
import { codeOnly } from "@hmarepanditji/utils/code-only";
// (the /code-only SUBPATH, not the barrel: the barrel re-exports
//  auth-context.tsx, which requires React — unresolvable in bare node+tsx.)

// ─────────────────────────────────────────────────────────────
// RESPONSE-SHAPE CONTRACT GUARD  (contract class, 9th sighting)
// Isj order, 2026-07-28.
//
// THE BREAK THIS EXISTS FOR: POST /bookings replies
//     sendSuccess(res, { booking, order })
// so the id lives at `data.booking.id`. The customer wizard read
// `data.id` — one level too high, therefore undefined. JSON.stringify
// dropped the key, create-order 400'd on "bookingId is required", the
// wizard threw, and RazorpayCheckout never mounted — while the booking row
// and the Razorpay order had ALREADY been created. Every attempt orphaned
// an unpaid booking and NO CUSTOMER COULD EVER PAY. Nothing failed at build
// time, because `undefined` is a perfectly legal value.
//
// THE GENERIC SHAPE: for each contract below we read the ACTUAL
// `sendSuccess(...)` literal out of the handler, extract its top-level keys,
// and assert the client reads through one of those keys rather than past
// them. A new key added or removed server-side fails the build on the
// client that reads it.
// ─────────────────────────────────────────────────────────────

console.log("Running response-shape contract guard...");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

/**
 * Pull the top-level keys out of the object literal a handler hands to
 * sendSuccess. Returns null when the payload is not an object literal
 * (e.g. `sendSuccess(res, order)`) — those carry their fields flat and are
 * asserted differently.
 */
function sendSuccessKeys(src: string, nearMarker: string): string[] | null {
  const at = src.indexOf(nearMarker);
  assert.ok(at > -1, `marker not found in handler: ${nearMarker}`);
  // The marker is the MESSAGE argument, i.e. it sits at the END of the call —
  // so walk BACKWARD to the enclosing sendSuccess. Searching forward finds the
  // next unrelated call and silently audits the wrong contract.
  const openAt = src.lastIndexOf("sendSuccess(", at);
  assert.ok(openAt > -1, `no sendSuccess( precedes marker: ${nearMarker}`);
  const call = src.slice(openAt, at);
  const m = /sendSuccess\(\s*\w+\s*,\s*\{([^}]*)\}/.exec(call);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((s) => s.trim().split(":")[0].trim())
    .filter((s) => /^[a-zA-Z_][\w]*$/.test(s));
}

// ── CONTRACT 1: POST /bookings → the customer booking wizard ──
const BOOKING_ROUTES = read("services/api/src/routes/booking.routes.ts");
const WIZARD = read("apps/web/app/booking/new/booking-wizard-client.tsx");

const keys = sendSuccessKeys(BOOKING_ROUTES, "Booking created");
assert.ok(keys, "POST /bookings must still reply with an object literal");
assert.deepStrictEqual(
  [...keys!].sort(),
  ["booking", "order"],
  `POST /bookings now replies with keys ${JSON.stringify(keys)}; the customer wizard reads data.booking / data.order and must be updated with it`,
);

// the client must read THROUGH the wrapper key, not past it
assert.ok(
  /payload\.booking\s*\?\?/.test(WIZARD),
  "the booking wizard must read the id through `payload.booking` — reading data.id directly is the P0 that stopped every payment",
);
assert.ok(
  !/const\s+booking\s*=\s*bookingJson\.data\s*\?\?\s*bookingJson\s*;/.test(WIZARD),
  "the booking wizard is back to treating the whole envelope as the booking — data.id is undefined and create-order will 400",
);

// and it must never send an undefined bookingId onward
const payBlock = WIZARD.slice(WIZARD.indexOf("payments/create-order"));
assert.ok(
  /JSON\.stringify\(\{\s*bookingId\s*\}\)/.test(payBlock),
  "create-order still posts { bookingId } — keep it, but the value must come from payload.booking.id",
);

// ── CONTRACT 2: POST /payments/create-order → the same wizard ──
// This one hands a FLAT object (sendSuccess(res, order)), so the client is
// right to read data.orderId directly. Pinned so the two shapes are not
// "fixed" into each other by someone who only remembers contract 1.
const PAYMENT_ROUTES = read("services/api/src/routes/payment.routes.ts");
const flat = sendSuccessKeys(PAYMENT_ROUTES, "Razorpay order created");
assert.strictEqual(
  flat,
  null,
  "POST /payments/create-order now wraps its payload; the wizard reads data.orderId flat and must be updated with it",
);
assert.ok(
  /payData\.orderId/.test(WIZARD),
  "the wizard must read the order id flat off data for create-order",
);

// ── CONTRACT 3: GET /bookings/:id → the admin booking console ──
// Same wrapper trap, second surface. This one was masked: the admin token key
// was wrong, so the fetch 401'd, `if (res.ok)` swallowed it, and the operator
// saw a hard-coded MOCK booking under a real booking's URL. Fixing the token
// alone would have converted the fake page into a TypeError white screen —
// which is why the token and this envelope shipped in one commit.
const ADMIN_BOOKING = read("apps/admin/src/app/bookings/[id]/page.tsx");
const detailKeys = sendSuccessKeys(BOOKING_ROUTES, "Booking detail");
assert.deepStrictEqual(
  [...(detailKeys || [])].sort(),
  ["booking"],
  `GET /bookings/:id now replies with keys ${JSON.stringify(detailKeys)}; its readers unwrap data.booking`,
);
assert.ok(
  /json\.data\?\.booking/.test(ADMIN_BOOKING),
  "the admin booking console must unwrap data.booking — reading data directly makes every field undefined and throws on first render",
);
// and it must never seed operator state with an invented booking
assert.ok(
  !/useState<Booking>\(MOCK\)/.test(ADMIN_BOOKING),
  "the admin booking console is seeding state with MOCK again — a failed fetch would show a fabricated booking under a real booking's URL",
);

// ── THE STANDING RULE ─────────────────────────────────────────
// Any handler that wraps its payload in a NAMED object is a trap for a
// client that assumes the envelope IS the entity. Enumerate them so the
// next one is a deliberate decision rather than an accident.
const WRAPPED = [
  { file: "services/api/src/routes/booking.routes.ts", marker: "Booking created", keys: ["booking", "order"] },
];
for (const w of WRAPPED) {
  const k = sendSuccessKeys(read(w.file), w.marker);
  assert.deepStrictEqual(
    [...(k || [])].sort(),
    [...w.keys].sort(),
    `${w.file} (${w.marker}) changed its wrapper keys — every client reading it must be re-checked`,
  );
}

console.log("✓ response-shape contract guard passed");
