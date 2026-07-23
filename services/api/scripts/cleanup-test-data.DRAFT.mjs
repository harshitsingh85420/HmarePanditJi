// ─────────────────────────────────────────────────────────────
// DRAFT — TEST-DATA CLEANUP (prod).  *** NOT YET RUN. NOT YET REVIEWED. ***
// Written by the 2026-07-23 test-data audit. Founder (Isj) must read every
// line, run --dry-run first, take a fresh backup, and only then consider
// --confirm. This file is deliberately untracked / uncommitted.
//
// WHAT IT TARGETS (inventory reconstructed from the scripts that created it):
//   A. SEED SET (packages/db/prisma/seed.ts) — if it ever ran against prod:
//      admin +919000000001, customers +919000000002..4,
//      pandits +919876543210..214 ("Pt. Ramesh Sharma"… fake ratings),
//      bookings HPJ-001..HPJ-006, 1 review, 3 favorites, 5 notifications.
//   B. STAGED PILOT SET (services/api/scripts/stage-pilot-fixtures.mjs,
//      scratchpad stage-verified-puja.mjs, P-PAY E2E):
//      pandit +919876500050 (VERIFIED, aadhaar images in R2, upiId set),
//      customer +919876500011, bookings HPJ-2026-19502 / -44592 / -80714.
//   C. QA-RANGE ACCOUNTS created through the real registration flow during
//      QA sessions: +919876500010, +919876500013 (possibly others in
//      +9198765000xx — the dry run enumerates what actually exists).
//   D. Loose test residue: OTP rows for test phones, PanditMilestone /
//      Payout / CustomerRating / SupportTicket rows keyed to deleted ids,
//      ShishyaExchange + FeedbackUnanswered telemetry (optional flag).
//
// WHAT IT ALWAYS PRESERVES:
//   - Ritual, MuhuratDate, CityDistance  → reference data the live booking
//     wizard depends on (deleting rituals breaks POST /bookings).
//   - ANY row touching a phone OUTSIDE the test ranges → listed LOUDLY as
//     POSSIBLY-REAL and never deleted.
//   - The ADMIN user (+919000000001) by default (admin login is env
//     email+password, but AdminLog/notification rows may reference the row —
//     verify before ever passing --delete-admin).
//   - The PILOT SET (B) by default — deleting the pilot pandit is a
//     BUSINESS decision; pass --delete-pilot only after Isj decides.
//     Even with the pilot kept, --delete-pilot-bookings removes just his
//     three fake bookings (recommended before launch).
//
// MODES:
//   node cleanup-test-data.DRAFT.mjs                     → dry-run (default; writes nothing)
//   node cleanup-test-data.DRAFT.mjs --confirm --backup <file.json>
//        → deletes, but ONLY after verifying <file.json> exists, parses, and
//          was produced by backup-prod.mjs less than 24h ago.
//   flags: --delete-pilot | --delete-pilot-bookings | --delete-admin
//          --purge-telemetry (ShishyaExchange+FeedbackUnanswered wipe)
//          --purge-r2-list   (PRINT R2 keys to delete; never deletes R2 itself)
//
// RUN (founder only, from services/api, prod DATABASE_URL in env):
//   DATABASE_URL='<prod>' node --import tsx scripts/cleanup-test-data.DRAFT.mjs
// NEVER prints the connection string. Prints row PKs before deleting them.
// ─────────────────────────────────────────────────────────────
import { prisma } from "@hmarepanditji/db";
import { readFileSync, statSync } from "node:fs";

const ARGS = new Set(process.argv.slice(2));
const CONFIRM = ARGS.has("--confirm");
const DELETE_PILOT = ARGS.has("--delete-pilot");
const DELETE_PILOT_BOOKINGS = ARGS.has("--delete-pilot-bookings") || DELETE_PILOT;
const DELETE_ADMIN = ARGS.has("--delete-admin");
const PURGE_TELEMETRY = ARGS.has("--purge-telemetry");
const PURGE_R2_LIST = ARGS.has("--purge-r2-list");

// ── the sanctioned test identities ───────────────────────────────────────────
const SEED_PHONES = [
  "+919000000001", // admin (KEEP unless --delete-admin)
  "+919000000002", "+919000000003", "+919000000004", // seed customers
  "+919876543210", "+919876543211", "+919876543212", "+919876543213", "+919876543214", // seed pandits
];
const PILOT_PHONES = ["+919876500050", "+919876500011"]; // KEEP unless --delete-pilot
const QA_RANGE_PREFIX = "+9198765000"; // +919876500000..99 — QA sessions registered accounts here
const SEED_BOOKING_NUMBERS = ["HPJ-001", "HPJ-002", "HPJ-003", "HPJ-004", "HPJ-005", "HPJ-006"];
const PILOT_BOOKING_NUMBERS = ["HPJ-2026-19502", "HPJ-2026-44592", "HPJ-2026-80714"];

function dbTargetKind() {
  const url = process.env.DATABASE_URL || "";
  if (!url) return "(unset)";
  const host = (url.match(/^[a-z]+:\/\/[^@]*@?([^:/?]+)/i) || [])[1] || "";
  if (/neon\.tech|\.render\.com|amazonaws|supabase/i.test(host)) return "PROD (neon/cloud)";
  if (/localhost|127\.0\.0\.1/.test(host)) return "LOCAL";
  return "OTHER-REMOTE";
}

function requireFreshBackup() {
  const i = process.argv.indexOf("--backup");
  const file = i > -1 ? process.argv[i + 1] : null;
  if (!file) throw new Error("--confirm requires --backup <backup-prod.mjs output.json>");
  const st = statSync(file); // throws if missing
  if (Date.now() - st.mtimeMs > 24 * 60 * 60 * 1000) throw new Error("backup older than 24h — take a fresh one (scripts/backup-prod.mjs)");
  const dump = JSON.parse(readFileSync(file, "utf8"));
  if (!dump?._meta?.models?.length) throw new Error("backup file does not look like a backup-prod.mjs dump");
  for (const m of dump._meta.models) {
    if (dump[m] && !Array.isArray(dump[m])) throw new Error(`backup INCOMPLETE for model ${m} — do not delete against it`);
  }
  console.log(`backup OK: ${file} (${dump._meta.models.length} models)`);
}

async function main() {
  console.log(`\nTEST-DATA CLEANUP — DB target: ${dbTargetKind()}  mode: ${CONFIRM ? "CONFIRM (will delete)" : "DRY-RUN (read-only)"}`);
  if (!process.env.DATABASE_URL) { console.log("DATABASE_URL not set — stop."); process.exit(1); }
  if (CONFIRM) requireFreshBackup();

  // ── 1. resolve which test users actually exist ─────────────────────────────
  const qaUsers = await prisma.user.findMany({
    where: { phone: { startsWith: QA_RANGE_PREFIX } },
    select: { id: true, phone: true, name: true, role: true, createdAt: true },
  });
  const seedUsers = await prisma.user.findMany({
    where: { phone: { in: SEED_PHONES } },
    select: { id: true, phone: true, name: true, role: true, createdAt: true },
  });
  const label = (u) =>
    PILOT_PHONES.includes(u.phone) ? "PILOT (keep unless --delete-pilot)"
    : u.phone === "+919000000001" ? "SEED-ADMIN (keep unless --delete-admin)"
    : SEED_PHONES.includes(u.phone) ? "SEED"
    : "QA-RANGE";
  console.log(`\nTest users found: ${seedUsers.length + qaUsers.length}`);
  for (const u of [...seedUsers, ...qaUsers]) console.log(`  ${u.phone}  ${u.role.padEnd(8)}  ${String(u.name).slice(0, 24).padEnd(24)}  created ${u.createdAt.toISOString().slice(0, 10)}  [${label(u)}]  id=${u.id}`);

  // build the delete set
  const deletable = [...seedUsers, ...qaUsers].filter((u) => {
    if (PILOT_PHONES.includes(u.phone)) return DELETE_PILOT;
    if (u.phone === "+919000000001") return DELETE_ADMIN;
    return true;
  });
  const userIds = deletable.map((u) => u.id);

  // ── 2. bookings in scope ───────────────────────────────────────────────────
  const profiles = await prisma.panditProfile.findMany({ where: { userId: { in: userIds } }, select: { id: true, userId: true, aadhaarFrontUrl: true, aadhaarBackUrl: true, aadhaarDocUrl: true, profilePhotoUrl: true } });
  const profileIds = profiles.map((p) => p.id);
  const pilotUsers = await prisma.user.findMany({ where: { phone: { in: PILOT_PHONES } }, select: { id: true } });
  const pilotProfile = await prisma.panditProfile.findFirst({ where: { user: { phone: "+919876500050" } }, select: { id: true } });

  const bookingWhere = {
    OR: [
      { bookingNumber: { in: SEED_BOOKING_NUMBERS } },
      { customerId: { in: userIds } },
      { panditId: { in: profileIds } },
      ...(DELETE_PILOT_BOOKINGS ? [{ bookingNumber: { in: PILOT_BOOKING_NUMBERS } }] : []),
      ...(DELETE_PILOT_BOOKINGS && pilotProfile ? [{ panditId: pilotProfile.id }] : []),
    ],
  };
  const bookings = await prisma.booking.findMany({ where: bookingWhere, select: { id: true, bookingNumber: true, status: true, paymentStatus: true, grandTotal: true, panditPayout: true, customerId: true, panditId: true, razorpayOrderId: true } });
  const bookingIds = bookings.map((b) => b.id);
  console.log(`\nBookings in scope: ${bookings.length}`);
  for (const b of bookings) console.log(`  ${b.bookingNumber}  ${b.status}/${b.paymentStatus}  grand=${b.grandTotal} payout=${b.panditPayout}  rzp=${b.razorpayOrderId || "-"}`);

  // ── 3. POSSIBLY-REAL tripwire — refuse anything that touches a non-test id ─
  const testUserIdSet = new Set([...userIds, ...pilotUsers.map((u) => u.id)]);
  const testProfileIdSet = new Set([...profileIds, ...(pilotProfile ? [pilotProfile.id] : [])]);
  const foreign = bookings.filter((b) => !testUserIdSet.has(b.customerId) || !testProfileIdSet.has(b.panditId));
  if (foreign.length) {
    console.log(`\n⚠ POSSIBLY-REAL rows touch this delete set — HUMAN REVIEW REQUIRED, aborting:`);
    for (const b of foreign) console.log(`  ${b.bookingNumber} customer=${b.customerId} pandit=${b.panditId}`);
    process.exit(3);
  }
  // Payments actually CAPTURED through a real (non-manual) Razorpay order get a second look:
  const realCaptured = bookings.filter((b) => b.paymentStatus === "CAPTURED" && b.razorpayOrderId && !/manual|notifyproof|pilot/.test(b.razorpayOrderId));
  if (realCaptured.length) console.log(`\n⚠ ${realCaptured.length} booking(s) captured via a REAL Razorpay order — confirm they are test-mode before deleting:\n  ${realCaptured.map((b) => b.bookingNumber).join(", ")}`);

  // ── 4. dependent-row inventory (FK-safe order) ─────────────────────────────
  const customerProfiles = await prisma.customerProfile.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
  const customerProfileIds = customerProfiles.map((c) => c.id);
  const counts = {
    payout:              await prisma.payout.count({ where: { bookingId: { in: bookingIds } } }),
    customerRating:      await prisma.customerRating.count({ where: { bookingId: { in: bookingIds } } }),
    review:              await prisma.review.count({ where: { OR: [{ bookingId: { in: bookingIds } }, { reviewerId: { in: userIds } }, { revieweeId: { in: userIds } }] } }),
    bookingStatusUpdate: await prisma.bookingStatusUpdate.count({ where: { OR: [{ bookingId: { in: bookingIds } }, { updatedById: { in: userIds } }] } }),
    booking:             bookings.length,
    notification:        await prisma.notification.count({ where: { userId: { in: userIds } } }),
    favoritePandit:      await prisma.favoritePandit.count({ where: { OR: [{ customerId: { in: userIds } }, { panditId: { in: userIds } }] } }),
    familyMember:        await prisma.familyMember.count({ where: { userId: { in: userIds } } }),
    address:             await prisma.address.count({ where: { customerProfileId: { in: customerProfileIds } } }),
    customerProfile:     customerProfiles.length,
    pujaService:         await prisma.pujaService.count({ where: { panditProfileId: { in: profileIds } } }),
    dakshinaRate:        await prisma.dakshinaRate.count({ where: { panditId: { in: profileIds } } }),
    samagriPackage:      await prisma.samagriPackage.count({ where: { panditId: { in: profileIds } } }),
    poojaVerification:   await prisma.poojaVerification.count({ where: { panditProfileId: { in: profileIds } } }),
    poojaConfig:         await prisma.poojaConfig.count({ where: { panditProfileId: { in: profileIds } } }),
    blockedDate:         await prisma.blockedDate.count({ where: { panditId: { in: profileIds } } }),
    panditMilestone:     await prisma.panditMilestone.count({ where: { panditId: { in: profileIds } } }),
    panditProfile:       profiles.length,
    otp:                 await prisma.oTP.count({ where: { phone: { in: deletable.map((u) => u.phone) } } }),
    user:                deletable.length,
  };
  console.log(`\nRows that would be deleted (FK order):`);
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(20)} ${v}`);
  if (PURGE_TELEMETRY) {
    console.log(`  shishyaExchange      ${await prisma.shishyaExchange.count()}  (ALL rows — telemetry wipe)`);
    console.log(`  feedbackUnanswered   ${await prisma.feedbackUnanswered.count()}  (ALL rows — telemetry wipe)`);
  }

  // ── 5. R2 objects referenced by deleted profiles (print-only, always) ─────
  if (PURGE_R2_LIST || CONFIRM) {
    console.log(`\nR2 objects to delete MANUALLY in Cloudflare (this script never touches R2):`);
    for (const p of profiles) {
      for (const k of ["aadhaarFrontUrl", "aadhaarBackUrl", "aadhaarDocUrl", "profilePhotoUrl"]) if (p[k]) console.log(`  ${p[k]}   (profile ${p.id})`);
      console.log(`  + everything under prefix uploads/${p.userId}/   (covers retry-orphaned aadhaar objects)`);
    }
  }

  if (!CONFIRM) {
    console.log(`\nDRY RUN complete — nothing deleted. Re-run with --confirm --backup <fresh.json> to execute.`);
    return;
  }

  // ── 6. delete, inside one transaction, in FK order ─────────────────────────
  console.log(`\nDeleting…`);
  await prisma.$transaction([
    prisma.payout.deleteMany({ where: { bookingId: { in: bookingIds } } }),
    prisma.customerRating.deleteMany({ where: { bookingId: { in: bookingIds } } }),
    prisma.review.deleteMany({ where: { OR: [{ bookingId: { in: bookingIds } }, { reviewerId: { in: userIds } }, { revieweeId: { in: userIds } }] } }),
    prisma.bookingStatusUpdate.deleteMany({ where: { OR: [{ bookingId: { in: bookingIds } }, { updatedById: { in: userIds } }] } }),
    prisma.booking.deleteMany({ where: { id: { in: bookingIds } } }),
    prisma.notification.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.favoritePandit.deleteMany({ where: { OR: [{ customerId: { in: userIds } }, { panditId: { in: userIds } }] } }),
    prisma.familyMember.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.address.deleteMany({ where: { customerProfileId: { in: customerProfileIds } } }),
    prisma.customerProfile.deleteMany({ where: { id: { in: customerProfileIds } } }),
    prisma.pujaService.deleteMany({ where: { panditProfileId: { in: profileIds } } }),
    prisma.dakshinaRate.deleteMany({ where: { panditId: { in: profileIds } } }),
    prisma.samagriPackage.deleteMany({ where: { panditId: { in: profileIds } } }),
    prisma.poojaVerification.deleteMany({ where: { panditProfileId: { in: profileIds } } }),
    prisma.poojaConfig.deleteMany({ where: { panditProfileId: { in: profileIds } } }),
    prisma.blockedDate.deleteMany({ where: { panditId: { in: profileIds } } }),
    prisma.panditMilestone.deleteMany({ where: { panditId: { in: profileIds } } }),
    prisma.panditProfile.deleteMany({ where: { id: { in: profileIds } } }),
    prisma.oTP.deleteMany({ where: { phone: { in: deletable.map((u) => u.phone) } } }),
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
    ...(PURGE_TELEMETRY ? [prisma.shishyaExchange.deleteMany({}), prisma.feedbackUnanswered.deleteMany({})] : []),
  ]);
  console.log(`done. Re-run without --confirm to verify zero remaining.`);
}

main()
  .catch((e) => { console.error("cleanup FAILED:", e?.message || e); process.exit(2); })
  .finally(() => prisma.$disconnect());
