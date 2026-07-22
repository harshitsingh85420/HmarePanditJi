// ─────────────────────────────────────────────────────────────
// PAYOUT INTEGRITY AUDIT (READ-ONLY). Founder-requested 2026-07-22.
//
// For EVERY Payout row, compares its `amount` against the booking's STORED
// `panditPayout` column. A mismatch means the payout was created from a value
// other than the frozen authoritative one — e.g. rows created during the
// EXPOSURE WINDOW between the money-model deploy (bf1797e) and the display/
// payout fix (cd4834c), when completeBooking created payouts from the
// recomputed 100% instead of the stored panditPayout.
//
// This script WRITES NOTHING. It only reads and reports.
//
// RUN (founder — needs the PROD DATABASE_URL in the environment; never commit it):
//   cd services/api
//   DATABASE_URL='<prod>' node --import tsx scripts/audit-payouts.mjs
// (or plain `node scripts/audit-payouts.mjs` if not using tsx)
//
// Reports, per mismatch: booking code, createdAt, stored panditPayout, payout
// amount, delta, and payout status. COMPLETED/PAID mismatches — money Isj may
// have ALREADY sent wrong — are listed LOUDLY in their own section.
// ─────────────────────────────────────────────────────────────

import { prisma } from "@hmarepanditji/db";

const INR = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;
const isPaid = (s) => s === "PAID" || s === "COMPLETED";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not set — export the PROD connection string first. Stopping (nothing read).");
    process.exit(1);
  }

  // Payout has only a scalar bookingId (no relation) — fetch the bookings
  // separately and join in code.
  const payouts = await prisma.payout.findMany({ orderBy: { createdAt: "asc" } });
  const bookingIds = [...new Set(payouts.map((p) => p.bookingId).filter(Boolean))];
  const bookings = bookingIds.length
    ? await prisma.booking.findMany({
        where: { id: { in: bookingIds } },
        select: { id: true, bookingNumber: true, createdAt: true, panditPayout: true, dakshinaAmount: true },
      })
    : [];
  const byId = new Map(bookings.map((b) => [b.id, b]));

  console.log(`\nPAYOUT INTEGRITY AUDIT — ${payouts.length} payout row(s) examined.\n`);

  const mismatches = [];
  const orphans = []; // payout with no booking (should not happen)
  for (const p of payouts) {
    const b = byId.get(p.bookingId);
    if (!b) { orphans.push(p); continue; }
    const stored = b.panditPayout;
    // A null/≤0 stored payout is its own anomaly (surfaced separately).
    const storedMissing = stored == null || stored <= 0;
    if (!storedMissing && Number(p.amount) !== Number(stored)) {
      mismatches.push({
        bookingNumber: b.bookingNumber,
        bookingCreatedAt: b.createdAt,
        storedPayout: stored,
        payoutAmount: p.amount,
        delta: Number(p.amount) - Number(stored),
        payoutStatus: p.status,
        storedMissing: false,
      });
    } else if (storedMissing) {
      mismatches.push({
        bookingNumber: b.bookingNumber,
        bookingCreatedAt: b.createdAt,
        storedPayout: stored,
        payoutAmount: p.amount,
        delta: null,
        payoutStatus: p.status,
        storedMissing: true,
      });
    }
  }

  const paidMismatches = mismatches.filter((m) => isPaid(m.payoutStatus) && !m.storedMissing);
  const pendingMismatches = mismatches.filter((m) => !isPaid(m.payoutStatus) && !m.storedMissing);
  const missingRows = mismatches.filter((m) => m.storedMissing);

  const row = (m) =>
    `  ${m.bookingNumber} | created ${new Date(m.bookingCreatedAt).toISOString().slice(0, 10)}` +
    ` | stored ${INR(m.storedPayout)} | payout ${INR(m.payoutAmount)}` +
    (m.delta == null ? "" : ` | delta ${m.delta > 0 ? "+" : ""}${INR(m.delta)}`) +
    ` | ${m.payoutStatus}`;

  if (paidMismatches.length) {
    console.log("‼️  ALREADY-PAID MISMATCHES — Isj may have sent the WRONG amount. INVESTIGATE:");
    paidMismatches.forEach((m) => console.log(row(m)));
    console.log("");
  }
  if (pendingMismatches.length) {
    console.log("⚠️  PENDING MISMATCHES — payout not yet sent; can be corrected before payment:");
    pendingMismatches.forEach((m) => console.log(row(m)));
    console.log("");
  }
  if (missingRows.length) {
    console.log("❓ STORED-PAYOUT MISSING/ZERO on the booking (cannot compare — needs a look):");
    missingRows.forEach((m) => console.log(row(m)));
    console.log("");
  }
  if (orphans.length) {
    console.log(`❓ ${orphans.length} payout row(s) with no booking link.`);
  }

  if (!mismatches.length && !orphans.length) {
    console.log("✅ CLEAN — every Payout.amount equals its booking's stored panditPayout. No exposure-window damage.");
  } else {
    console.log(
      `SUMMARY: ${paidMismatches.length} already-paid mismatch(es), ${pendingMismatches.length} pending mismatch(es), ` +
        `${missingRows.length} missing-stored, ${orphans.length} orphan(s). REPORT ONLY — no corrections made.`,
    );
  }
}

main()
  .catch((e) => {
    // NEVER leak the connection string, even on a Prisma init/connect error.
    const msg = String((e && e.message) || e).replace(/postgres(?:ql)?:\/\/\S+/gi, "[REDACTED-CONNSTR]");
    console.error("audit failed:", msg);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
