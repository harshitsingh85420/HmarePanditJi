import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { calculateGrandTotal } from "../utils/pricing";
import { calculateBookingFinancials } from "../services/booking.service";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — P-PAY money laws.
// 1. CONSERVATION: what the customer pays minus what the pandit is owed
//    must equal the platform's revenue (fees + GST) — for EVERY shape of
//    booking (with/without travel, food, accommodation). The old dual-math
//    bug charged a food-less grandTotal but paid a food-ful payout.
// 2. ONE SOURCE: booking financial columns come only from the pricing
//    module via calculateBookingFinancials — no caller-supplied overrides.
// 3. CHARGE SOURCE: the Razorpay order amount comes from booking.grandTotal
//    (server-side), never from a request body.
// 4. VERIFY-BEFORE-TRUST: /payments/verify checks the signature BEFORE
//    processPaymentSuccess; createOrder FAILS CLOSED in prod without keys.
// ─────────────────────────────────────────────────────────────

console.log("Running payment-money guard (conservation + one source + fail-closed)…");

// 1) conservation invariant across booking shapes
const CASES = [
  { dakshinaAmount: 5000 },
  { dakshinaAmount: 5000, travelCost: 800 },
  { dakshinaAmount: 5000, travelCost: 800, foodAllowanceAmount: 2000 },
  { dakshinaAmount: 11000, foodAllowanceAmount: 3000, accommodationCost: 1500 },
  { dakshinaAmount: 101, travelCost: 33, foodAllowanceAmount: 1000 }, // rounding case
];
for (const c of CASES) {
  const b = calculateGrandTotal(c);
  // ── 100% TO PANDIT, SEPARATE CUSTOMER FEE (FOUNDER DECISION 2026-07-21,
  // CONFLICT_RULINGS #7): the पंडित जी keeps the WHOLE dakshina — कोई कटौती.
  // The platform's take is a SEPARATE PLATFORM_FEE_PERCENT-of-dakshina fee
  // charged to the CUSTOMER, added ON TOP; it never reduces the payout. This
  // supersedes the earlier single-sided model. Changing these lines = changing
  // the business model — founder sign-off required.
  const platformTake = b.platformFee;
  // CONSERVATION (unchanged in FORM): what the customer pays minus what the
  // pandit receives IS the platform's take.
  assert.strictEqual(
    b.grandTotal - b.panditPayout,
    platformTake,
    `conservation broken for ${JSON.stringify(c)}: collected−payout=${b.grandTotal - b.panditPayout}, platform take=${platformTake}`,
  );
  // the customer charge is dakshina + the platform fee (ON TOP) + pass-throughs
  assert.strictEqual(
    b.grandTotal,
    b.dakshinaAmount + b.platformFee + b.travelCost + b.foodAllowanceAmount + b.accommodationCost,
    `customer charge drifted for ${JSON.stringify(c)} — fee-on-top law violated`,
  );
  // no SECOND fee / GST lines exist — the platform fee is the ONE customer charge
  assert.strictEqual(b.travelServiceFee + b.platformFeeGst + b.travelServiceFeeGst, 0, "no second charge / tax lines on the customer");
  // the pandit receives the FULL dakshina (100%) + pass-throughs — fee NEVER
  // subtracted (the property that matters; also pinned in commission-consistency).
  assert.strictEqual(
    b.panditPayout,
    b.dakshinaAmount + b.travelCost + b.foodAllowanceAmount + b.accommodationCost,
    `payout composition drifted for ${JSON.stringify(c)} — pandit must keep 100%`,
  );
}

// 1b) the delegate returns the SAME numbers as the source (no drift)
const viaDelegate = calculateBookingFinancials(5000, 800, 2000, 0);
const viaSource = calculateGrandTotal({ dakshinaAmount: 5000, travelCost: 800, foodAllowanceAmount: 2000 });
assert.strictEqual(viaDelegate.grandTotal, viaSource.grandTotal, "delegate grandTotal must equal pricing source");
assert.strictEqual(viaDelegate.panditPayout, viaSource.panditPayout, "delegate panditPayout must equal pricing source");

const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf8");
const bookingSvc = read("services/booking.service.ts");
const paymentSvc = read("services/payment.service.ts");
const paymentRoutes = read("routes/payment.routes.ts");

// 2) no caller-supplied financial overrides in createBooking
for (const bad of ["input.grandTotal", "input.platformFee", "input.panditPayout", "input.travelServiceFee"]) {
  assert.ok(!bookingSvc.includes(bad), `${bad} must not exist — financials come only from the money source`);
}
assert.ok(/grandTotal:\s*fin\.grandTotal/.test(bookingSvc), "grandTotal column must be written from fin.grandTotal");
assert.ok(/panditPayout:\s*fin\.panditPayout/.test(bookingSvc), "panditPayout column must be written from fin.panditPayout");

// 3) the Razorpay charge comes from booking.grandTotal; the route takes only bookingId
assert.ok(/booking\.grandTotal/.test(paymentSvc), "createRazorpayOrder must charge booking.grandTotal");
assert.ok(
  /const \{ bookingId \} = req\.body/.test(paymentRoutes),
  "/payments/create-order must read ONLY bookingId from the body (amount is server-derived)",
);
assert.ok(!/req\.body[\s\S]{0,80}amount/.test(paymentRoutes.slice(0, paymentRoutes.indexOf("verifySchema"))), "no client-supplied amount near create-order");

// 4) verify-before-trust + prod fail-closed
const verifyIdx = paymentRoutes.indexOf("verifyRazorpaySignature(");
const processIdx = paymentRoutes.indexOf("processPaymentSuccess(", verifyIdx);
assert.ok(verifyIdx > 0 && processIdx > verifyIdx, "/payments/verify must check the signature BEFORE processPaymentSuccess");
assert.ok(
  /NODE_ENV === "production"[\s\S]{0,300}PAYMENTS_NOT_CONFIGURED/.test(paymentSvc),
  "createOrder must FAIL CLOSED in production when Razorpay keys are missing (no mock orders in prod)",
);

// 5) DISPLAY = CHARGE (founder decision 2b, updated 2026-07-21): the wizard's
//    PAY-NOW total is composed of EXACTLY the server-charged components. Founder
//    CONFLICT_RULINGS #7: the platform fee is now charged to the CUSTOMER on top
//    of the dakshina, so pay-now = dakshina + platformFee + travel + food.
//    samagri / add-ons / accommodation are "settled at booking" and excluded.
//    The Razorpay modal amount comes from the SERVER order. Both sides move
//    together — this must mirror pricing.calculateGrandTotal.
const wizard = readFileSync(
  join(SRC, "..", "..", "..", "apps", "web", "app", "booking", "new", "booking-wizard-client.tsx"),
  "utf8",
);
assert.ok(
  /const payNow = form\.dakshina \+ platformFee \+ effectiveTravelCost \+ foodAllowance;/.test(wizard),
  "wizard payNow must be dakshina + platformFee + travel + food (fee charged on top, mirrors server grandTotal)",
);
assert.ok(
  /const platformFee = Math\.round\(\(form\.dakshina \* PLATFORM_FEE_PERCENT\) \/ 100\);/.test(wizard),
  "wizard must compute the platform fee from PLATFORM_FEE_PERCENT (the customer-side fee, on top)",
);
assert.ok(
  !/const payNow =[^;]*(samagri|addon|accommodation)/i.test(wizard),
  "settled-at-booking items (samagri/add-ons/accommodation) must NOT be in the pay-now total",
);
assert.ok(
  /amount=\{form\.orderAmount\}/.test(wizard),
  "the Razorpay modal amount must come from the SERVER order (form.orderAmount)",
);
assert.ok(
  /razorpayKey=\{form\.orderKeyId\}/.test(wizard),
  "the Razorpay key must come from the SERVER create-order response",
);

console.log("payment-money guard: conservation holds, one money source, server-derived charge, display=charge, prod fail-closed ✅");
