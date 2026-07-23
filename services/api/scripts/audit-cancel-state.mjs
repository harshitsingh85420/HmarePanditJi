// ─────────────────────────────────────────────────────────────
// READ-ONLY AUDIT — cancel-flow data state (founder directive, 2026-07-23).
// Context: the customer cancel page NEVER reached the server in prod until
// da8cd26 (URL doubled to /api/v1/api/… + wrong token key), and the server
// endpoint never persisted refund numbers. This script reports what the DB
// actually holds so every affected booking is flagged with its code.
//
// FOUNDER-RUN (needs prod DATABASE_URL, which only Isj holds):
//   cd services/api && DATABASE_URL=... node scripts/audit-cancel-state.mjs
// READ ONLY — no writes, no deletes. Never prints the connection string.
//
// HONEST LIMIT, stated up front: a cancel attempt that failed IN THE BROWSER
// (the 404 bug) left ZERO server trace — no row, no log. Those customers can
// only surface via support contacts or Razorpay disputes. The page did show
// "Failed to submit cancellation", but a customer who read the refund estimate
// and closed the tab believing it done is INVISIBLE to this audit.
// ─────────────────────────────────────────────────────────────
import { prisma } from "@hmarepanditji/db";

const TEST_PHONE = /^\+91(98765000\d{2}|9876543\d{3}|90000000\d{2})$/; // staging/seed ranges

function tag(customer) {
  const phone = customer?.phone ?? "";
  return TEST_PHONE.test(phone) ? "TEST-DATA" : "POSSIBLY-REAL ⚠";
}

function row(b) {
  return `  ${b.bookingNumber} | status=${b.status} | pay=${b.paymentStatus} | grand=₹${b.grandTotal} fee=₹${b.platformFee} | refundAmount=₹${b.refundAmount} refundStatus=${b.refundStatus} ref=${b.refundReference ?? "-"} | cancelledBy=${b.cancelledBy ?? "-"} requestedAt=${b.cancellationRequestedAt?.toISOString() ?? "-"} | customer=${b.customer?.name ?? "?"} (${tag(b.customer)})`;
}

const SELECT = {
  bookingNumber: true, status: true, paymentStatus: true, grandTotal: true,
  platformFee: true, refundAmount: true, refundStatus: true, refundReference: true,
  cancelledBy: true, cancellationRequestedAt: true, cancelledAt: true,
  customer: { select: { name: true, phone: true } },
};

try {
  // 1. Pending cancellation requests — the flow was broken, so ANY row here
  //    reached the API another way (staging scripts, direct calls, admin).
  const requested = await prisma.booking.findMany({
    where: { status: "CANCELLATION_REQUESTED" }, select: SELECT,
  });
  console.log(`\n[1] CANCELLATION_REQUESTED rows: ${requested.length}`);
  requested.forEach((b) => console.log(row(b)));

  // 2. THE MONEY COHORT: cancelled + customer's money captured + no refund
  //    recorded. Each of these is a person who paid and has nothing back.
  const cancelledNoRefund = await prisma.booking.findMany({
    where: {
      status: { in: ["CANCELLED", "REFUNDED"] },
      paymentStatus: "CAPTURED",
      OR: [{ refundAmount: { lte: 0 } }, { refundStatus: "NONE" }],
    },
    select: SELECT,
  });
  console.log(`\n[2] CANCELLED/REFUNDED with CAPTURED payment and NO refund recorded: ${cancelledNoRefund.length}  ← the loud list`);
  cancelledNoRefund.forEach((b) => console.log(row(b)));

  // 3. Refund claimed but no reference — "refunded" with nothing to show.
  const refundNoRef = await prisma.booking.findMany({
    where: { refundStatus: { in: ["PROCESSING", "COMPLETED"] }, refundReference: null },
    select: SELECT,
  });
  console.log(`\n[3] refundStatus PROCESSING/COMPLETED with NO refundReference: ${refundNoRef.length}`);
  refundNoRef.forEach((b) => console.log(row(b)));

  // 4. A request timestamp exists but the status moved elsewhere — an attempt
  //    that was later overwritten (accept/complete raced a cancellation).
  const orphanedAttempt = await prisma.booking.findMany({
    where: {
      cancellationRequestedAt: { not: null },
      status: { notIn: ["CANCELLED", "CANCELLATION_REQUESTED", "REFUNDED"] },
    },
    select: SELECT,
  });
  console.log(`\n[4] cancellationRequestedAt set but status moved on: ${orphanedAttempt.length}`);
  orphanedAttempt.forEach((b) => console.log(row(b)));

  // 5. Distribution for context.
  const dist = await prisma.booking.groupBy({ by: ["status", "refundStatus"], _count: true });
  console.log(`\n[5] status × refundStatus distribution:`);
  dist.forEach((d) => console.log(`  ${d.status} × ${d.refundStatus}: ${d._count}`));

  console.log(`\nDONE (read-only). POSSIBLY-REAL ⚠ rows are the ones with a real person behind them — contact each. Browser-failed attempts left no trace (see header).`);
} catch (err) {
  const msg = String(err?.message ?? err).replace(/postgres(ql)?:\/\/[^\s"']+/gi, "[redacted-db-url]");
  console.error("AUDIT FAILED:", msg);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
