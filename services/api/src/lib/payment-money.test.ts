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

// 6) FEE DISCLOSURE (founder P0, 2026-07-23): the customer must SEE the fee.
//    Live incident: the sticky Pay-Now box said "Platform Fees & Taxes: ₹0 —
//    included in dakshina" while payNow CHARGED the fee — a false statement on
//    a payment screen, left over from the pre-Ruling-#7 included-fee model.
//    These assertions pin: (a) the lie can never return; (b) no invented tax
//    line; (c) the fee is NAMED with its real amount wherever a customer-facing
//    total is rendered (wizard, confirmation, dashboard card — the cancel page
//    already itemises it); (d) non-refundability is disclosed BEFORE payment.
const WEB = join(SRC, "..", "..", "..", "apps", "web");
const bookingConfirmed = readFileSync(join(WEB, "app", "booking-confirmed", "[bookingId]", "page.tsx"), "utf8");
const bookingCard = readFileSync(join(WEB, "app", "dashboard", "components", "BookingCard.tsx"), "utf8");

assert.ok(!wizard.includes("included in dakshina"), "the '₹0 — included in dakshina' false fee line must never return");
assert.ok(!wizard.includes("Platform Fees & Taxes"), "no 'Taxes' line — no GST is computed/remitted (legal question, never an invented line)");
assert.ok(/प्लेटफ़ॉर्म शुल्क/.test(wizard), "the sticky Pay-Now box must NAME the platform fee");
assert.ok(/प्लेटफ़ॉर्म शुल्क[^<]*\(वापस नहीं होगा\)[\s\S]{0,200}\{fmt\(platformFee\)\}/.test(wizard), "the named fee must carry its REAL amount and its non-refundability BEFORE payment");
assert.ok(/\{fmt\(paySubtotal\)\}/.test(wizard), "row 1 must show the fee-EXCLUDED subtotal (label = dakshina + travel + food)");
assert.ok(/const paySubtotal = payNow - platformFee;/.test(wizard), "paySubtotal must be derived from payNow so display rows always sum to the charge");
assert.ok(/प्लेटफ़ॉर्म शुल्क शामिल है/.test(bookingConfirmed), "booking-confirmed must name the fee beside the Amount Paid total");
assert.ok(/प्लेटफ़ॉर्म शुल्क शामिल है/.test(bookingCard), "the dashboard BookingCard must name the fee beside its total");

// 7) REFUND POLICY = ONE SOURCE + PROMISE TRUTH (founder rulings, 2026-07-23).
//    Live incident: the legal /cancellation-policy page said 90/50/20/0 while
//    the dashboard cancel screen computed 100/50/0 — two live documents
//    disagreeing about refunds. RULE: the CODE is the source of truth; both
//    pages must render from src/lib/refund-policy.ts, and the canonical numbers
//    are pinned HERE (changing them = business decision, founder sign-off).
const refundPolicy = readFileSync(join(WEB, "src", "lib", "refund-policy.ts"), "utf8");
const cancelPage = readFileSync(join(WEB, "app", "dashboard", "bookings", "[bookingId]", "cancel", "page.tsx"), "utf8");
const policyPage = readFileSync(join(WEB, "app", "(legal)", "cancellation-policy", "page.tsx"), "utf8");
const landing = readFileSync(join(WEB, "app", "page.tsx"), "utf8");

// the canonical tiers live in ONE module, with the exact ruling numbers.
// BOUNDARY (founder ruling 2026-07-23): CUSTOMER-FAVOURABLE — exactly 7 days
// out is 100% ("7 दिन या उससे पहले"); ambiguity resolves against the platform.
assert.ok(/daysUntilEvent >= 7\) return 100;/.test(refundPolicy), "refund tier ≥7 days must be 100% (customer-favourable boundary — never >7)");
assert.ok(/daysUntilEvent >= 3\) return 50;/.test(refundPolicy), "refund tier ≥3 days must be 50%");
assert.ok(/return 0;/.test(refundPolicy), "refund tier <3 days must be 0%");
assert.ok(refundPolicy.includes("7 दिन या उससे पहले"), "the DISCLOSED wording must state the ≥7 boundary exactly as computed");

// WHO INITIATED (founder ruling 2026-07-23): both refund cases NAMED —
// customer cancellation keeps the fee; a pandit NO-SHOW refunds 100% of the
// WHOLE charge INCLUDING the fee (keeping it would be charging for a failure).
assert.ok(/CUSTOMER_CANCELLATION:\s*\{\s*feeRefunded:\s*false/.test(refundPolicy), "customer cancellation: fee non-refundable, named explicitly");
assert.ok(/PANDIT_NO_SHOW:\s*\{\s*feeRefunded:\s*true[^}]*percentOfWholeCharge:\s*100/.test(refundPolicy), "pandit no-show: 100% of the WHOLE charge incl. fee, named explicitly");
// both pages consume the module — they can never disagree again
assert.ok(/from ["'][./]*src\/lib\/refund-policy["']/.test(cancelPage) && /refundPercent\(/.test(cancelPage), "the cancel screen must compute from refund-policy.ts");
assert.ok(/from ["'][./]*src\/lib\/refund-policy["']/.test(policyPage) && /REFUND_TIERS\.map/.test(policyPage), "the legal policy page must RENDER from refund-policy.ts");
// the stale legal-page literals must never return
assert.ok(!/90% of total/.test(policyPage) && !/20%/.test(policyPage), "the old 90/20 refund tiers must not reappear on the legal page");

// PROMISE TRUTH: removed falsehoods stay removed (F25 backup not built; no
// automated travel engine, D-06; no third-party background checks).
for (const [file, banned] of [
  [landing, "Uptime Backup"],
  [landing, "standby Pandit network"],
  [landing, "automated logistics platform"],
  [landing, "Guaranteed Travel"],
  [landing, "Background Check"],
] as const) {
  assert.ok(!file.includes(banned), `landing-page falsehood "${banned}" must not return (unbuilt feature)`);
}

// 8) THE NUMBER ISJ REFUNDS = THE NUMBER THE CUSTOMER SAW (founder ruling,
//    2026-07-23). Closed chain: cancel-request COMPUTES via the API's
//    refund-policy module (exact mirror of the web module — pinned here) and
//    PERSISTS booking.refundAmount; cancel-approve pays the persisted/policy
//    number and accepts a client amount ONLY with an explicit overrideReason;
//    the admin page prefers the persisted number and its fallback math runs the
//    RULED tiers with the REAL fee (it previously ran a retired 90/50/20/0
//    policy with a 15% "approx" fee — three divergent computations total).
const apiRefundPolicy = readFileSync(join(SRC, "lib", "refund-policy.ts"), "utf8");
const bookingRoutes = readFileSync(join(SRC, "routes", "booking.routes.ts"), "utf8");
const adminRoutes = readFileSync(join(SRC, "routes", "admin.routes.ts"), "utf8");
const adminCancelPage = readFileSync(join(SRC, "..", "..", "..", "apps", "admin", "src", "app", "cancellations", "page.tsx"), "utf8");

// API module mirrors the web module (tiers + ceil + fee-excluded + named cases)
assert.ok(/daysUntilEvent >= 7\) return 100;/.test(apiRefundPolicy), "API refund tier ≥7 must be 100% (mirror of web)");
assert.ok(/daysUntilEvent >= 3\) return 50;/.test(apiRefundPolicy), "API refund tier ≥3 must be 50% (mirror of web)");
assert.ok(/Math\.ceil\(/.test(apiRefundPolicy), "API day-count must ceil (customer-favourable, mirror of web)");
assert.ok(/grandTotal - booking\.platformFee/.test(apiRefundPolicy), "API refundable base must exclude the fee");
assert.ok(/PANDIT_NO_SHOW:\s*\{\s*feeRefunded:\s*true/.test(apiRefundPolicy), "API module must name the no-show case (fee refunded)");

// cancel-request computes via the module and PERSISTS what the customer saw
assert.ok(/computeCustomerCancellationRefund\(/.test(bookingRoutes), "cancel-request must compute via refund-policy, not inline math");
assert.ok(/refundAmount:\s*refundEstimate,\s*\n\s*refundStatus:\s*"PENDING"/.test(bookingRoutes), "cancel-request must PERSIST the estimate (refundAmount + PENDING)");
assert.ok(!/Simple placeholder logic/.test(bookingRoutes), "the placeholder refund math must not return");

// ownership: customers cancel only their own bookings
assert.ok(/req\.user!\.role !== "ADMIN" && existing\.customerId !== req\.user!\.id/.test(bookingRoutes), "/:id/cancel must check ownership (was: any customer could cancel any booking)");

// cancel-approve: policy/persisted number unless an explicit reasoned override
assert.ok(/const isOverride = typeof req\.body\.overrideReason === "string"/.test(adminRoutes), "cancel-approve must gate client amounts behind an explicit overrideReason");
// anchored to the DB WRITE (first proof-of-teeth attempt was toothless: the
// notification line also mentions finalRefundAmount, so a loose regex matched
// it and missed a reverted DB write). The write block must use the resolved
// amount, and the raw client value must never reach a DB write directly.
assert.ok(/status:\s*"CANCELLED",\s*\n\s*refundAmount:\s*finalRefundAmount/.test(adminRoutes), "cancel-approve's DB WRITE must use the policy/override-resolved amount");
assert.ok(!/refundAmount:\s*req\.body\.refundAmount/.test(adminRoutes), "the raw client refundAmount must never be written directly (only via the override-gated finalRefundAmount)");

// admin page: persisted-first, ruled tiers, real fee — retired literals banned
assert.ok(/refundAmount > 0 \? [a-zA-Z.]*refundAmount/.test(adminCancelPage), "admin page must PREFER the persisted refundAmount");
for (const stale of ["0.15", "percent = 0.9", "percent = 0.2", "90%", "20%"]) {
  assert.ok(!adminCancelPage.includes(stale), `admin page stale policy literal "${stale}" must not return`);
}

console.log("payment-money guard: conservation holds, one money source, server-derived charge, display=charge, fee DISCLOSED on every total, refund policy ONE source + PERSISTED + operator-safe, promises truthful, prod fail-closed ✅");
