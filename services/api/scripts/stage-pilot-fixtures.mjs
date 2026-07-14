// ─────────────────────────────────────────────────────────────
// PHASE-4 PILOT FIXTURES — stage a real, bookable test pandit + customer +
// ONE booking left in PANDIT_REQUESTED, so the money-path scenarios (C2/C3/E3)
// can be forced LIVE on the real dashboard.
//
// THE BB1 LESSON, honored: the booking is created through the REAL code path —
// booking.service.createBooking() (status CREATED) then
// payment.service.processPaymentSuccess() (flips to PANDIT_REQUESTED, computes
// payout, fires notifications) — NEVER a hand-written PANDIT_REQUESTED row.
// Hand-written rows in the handler's preferred shape are exactly what hid the
// state-schism for weeks. Pandit/customer identities are idempotent upserts
// (fixtures, not a state machine).
//
// RUN (from services/api, with the PROD DATABASE_URL in the environment):
//   npx tsx scripts/stage-pilot-fixtures.mjs --confirm
// It reads DATABASE_URL from the process env (same as the API). It prints the
// DB HOST (redacted) and REFUSES to write without --confirm, so you can verify
// you are pointed at prod before anything is created. It NEVER prints secrets.
//
// Idempotent: re-running reuses the existing pandit/customer and, if a
// PANDIT_REQUESTED booking already exists for the pair, reuses it.
// ─────────────────────────────────────────────────────────────
import { prisma } from "@hmarepanditji/db";
// Namespace imports — robust against the tsx ESM/CJS named-export interop quirk
// when a .mjs pulls a transpiled .ts service.
import * as bookingService from "../src/services/booking.service";
import * as paymentService from "../src/services/payment.service";

// tsx may surface the transpiled service under the namespace OR its .default
// (CJS↔ESM interop). Resolve the real fns robustly — still the REAL code path.
const createBooking = bookingService.createBooking ?? bookingService.default?.createBooking;
const processPaymentSuccess = paymentService.processPaymentSuccess ?? paymentService.default?.processPaymentSuccess;

// ── Test data (sanctioned range only) ─────────────────────────────────────────
const PANDIT_PHONE = "+919876500050"; // founder's designated test pandit
const PANDIT_NAME = "रमेश शर्मा";
const CUSTOMER_PHONE = "+919876500011"; // test customer (in the sanctioned range)
const CUSTOMER_NAME = "परीक्षण यजमान";

// Classify the target WITHOUT revealing the host/endpoint (the connection
// string is a secret — never print any part of it).
function dbTargetKind() {
  const url = process.env.DATABASE_URL || "";
  if (!url) return "(unset)";
  const host = (url.match(/^[a-z]+:\/\/[^@]*@?([^:/?]+)/i) || [])[1] || "";
  if (/neon\.tech|\.render\.com|amazonaws|supabase/i.test(host)) return "PROD (neon/cloud)";
  if (/localhost|127\.0\.0\.1/.test(host)) return "LOCAL";
  return "OTHER-REMOTE";
}

async function upsertUser(phone, role, name, extra = {}) {
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { role, name: existing.name || name, isVerified: true, isActive: true, ...extra },
    });
  }
  return prisma.user.create({ data: { phone, role, name, isVerified: true, isActive: true, ...extra } });
}

async function main() {
  const confirmed = process.argv.includes("--confirm");
  console.log(`\nPHASE-4 pilot fixtures`);
  console.log(`DB target: ${dbTargetKind()}  (must be PROD before --confirm)`);
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not set — export the prod string first. Stopping.");
    process.exit(1);
  }
  if (!confirmed) {
    console.log("\nDRY RUN — pass --confirm to actually create the pandit/customer/booking.");
    console.log("Would stage: pandit", PANDIT_PHONE, "(VERIFIED) + customer", CUSTOMER_PHONE, "+ 1 booking → PANDIT_REQUESTED.");
    process.exit(0);
  }

  // ── (i) VERIFIED, booking-ready pandit ──────────────────────────────────────
  const panditUser = await upsertUser(PANDIT_PHONE, "PANDIT", PANDIT_NAME);
  const panditProfile = await prisma.panditProfile.upsert({
    where: { userId: panditUser.id },
    update: { verificationStatus: "VERIFIED", location: "New Delhi" },
    create: { userId: panditUser.id, verificationStatus: "VERIFIED", location: "New Delhi" },
  });
  console.log(`pandit ready: user=${panditUser.id.slice(0, 8)} profile=${panditProfile.id.slice(0, 8)} status=VERIFIED`);

  // ── (ii) test customer ──────────────────────────────────────────────────────
  const customerUser = await upsertUser(CUSTOMER_PHONE, "CUSTOMER", CUSTOMER_NAME);
  await prisma.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: { userId: customerUser.id },
  });
  console.log(`customer ready: user=${customerUser.id.slice(0, 8)}`);

  // ── (iii) ONE booking via the REAL path, left in PANDIT_REQUESTED ───────────
  const existing = await prisma.booking.findFirst({
    where: { panditId: panditProfile.id, customerId: customerUser.id, status: "PANDIT_REQUESTED" },
    orderBy: { createdAt: "desc" },
  });
  let booking = existing;
  if (existing) {
    console.log(`reusing existing PANDIT_REQUESTED booking: ${existing.id} (#${existing.bookingNumber})`);
  } else {
    // createBooking = the exact function POST /bookings calls (status CREATED).
    if (typeof createBooking !== "function" || typeof processPaymentSuccess !== "function") {
      throw new Error(`service fns unresolved (createBooking=${typeof createBooking}, processPaymentSuccess=${typeof processPaymentSuccess})`);
    }
    const created = await createBooking({
      customerId: customerUser.id,
      panditId: panditUser.id, // NOTE: createBooking expects the pandit's USER id
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days, no conflict
      eventType: "सत्यनारायण कथा",
      venueAddress: "12, टेस्ट मार्ग, लाजपत नगर",
      venueCity: "New Delhi",
      venuePincode: "110024",
      dakshinaAmount: 2100,
      travelCost: 0,
      foodAllowanceDays: 0,
    });
    // processPaymentSuccess = the exact function the Razorpay verify/webhook
    // calls: CREATED → PANDIT_REQUESTED (payout computed, notifications fired).
    booking = await processPaymentSuccess(created.id, "pay_pilot_manual", "order_pilot_manual");
    console.log(`booking created via real path: ${booking.id} (#${booking.bookingNumber}) status=${booking.status}`);
  }

  // ── (b) how to self-serve a warm token in future sessions ───────────────────
  console.log("\n── pandit login (dev OTP) ──");
  console.log(`  1. open the pandit app → login → phone ${PANDIT_PHONE}`);
  console.log(`  2. OTP is 123456 (dev/mock). Endpoints: POST /api/v1/auth/otp/send {phone,role:"PANDIT"} then`);
  console.log(`     POST /api/v1/auth/otp/verify {phone,otp:"123456"} → returns { token } for Authorization: Bearer`);
  console.log(`  3. the staged booking (${booking?.id}) shows in his New tab (PANDIT_REQUESTED → "REQUESTED" via the bookingStatus adapter).`);
  console.log("\ndone. (no secrets printed)\n");
}

main()
  .catch((e) => { console.error("stage-pilot-fixtures FAILED:", e?.message || e); process.exit(2); })
  .finally(() => prisma.$disconnect());
