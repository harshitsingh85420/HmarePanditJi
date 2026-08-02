// ─────────────────────────────────────────────────────────────
// RITUAL RENAME — "Satyanarayan Puja" → "Satyanarayan Katha" (ruled).
//
// WHY: the Ceremony guide matches Ritual rows to the canonical vocabulary by
// EXACT NAME, because coercing a near-name is the silent value-guessing this
// whole vocabulary campaign exists to stop. The row exists; only its spelling
// disagrees. So the fix is to correct the DATA, not to teach the code to guess.
//
// ⚠️ THE READERS THAT MATCH ON Ritual.name — enumerated BEFORE renaming under
// them, because a rename is invisible to every one of these until it breaks:
//
//   1. apps/web/app/ceremonies/page.tsx        r.name === PUJA_LABELS_EN[t]
//      → AFTER the rename this starts MATCHING. This is the point.
//
//   2. apps/web/app/booking/new/booking-wizard-client.tsx:427
//         rituals.find((r) => r.name === ritual)
//      → resolves a ceremony from a URL param / prior selection. A deep link
//        carrying the OLD name stops resolving after the rename. Old links in
//        the wild (WhatsApp shares, bookmarks) are the exposure.
//
//   3. same file :467   p.set("ritual", form.ritualName)
//      → sent to the pandit list as `ritual=`; getPandits reads `pujaType`, so
//        this parameter is ALREADY inert (a known dead filter). The rename
//        neither helps nor harms it.
//
//   4. same file :732   eventType: form.ritualName
//      → 🔴 THE ONE THAT MATTERS. Booking.eventType stores the ritual DISPLAY
//        NAME as a snapshot. Renaming the Ritual does NOT rewrite existing
//        Booking rows — and it must not: a booking records what was agreed at
//        the time. But it means booking history SPLITS at this rename:
//        rows before carry "Satyanarayan Puja", rows after "Satyanarayan Katha".
//
//   5. services/api/src/lib/poojaRules.ts  poojaBookingWhere()
//         OR: [{ eventType: poojaType }, { pujaType: poojaType }]
//      → the pooja-REMOVAL guard ("can this pandit delete this pooja?") matches
//        a booking by that same display string. A booking on the OLD name would
//        stop blocking removal of a pooja named the NEW way. That is the real
//        hazard, and it is why this script COUNTS those rows before touching
//        anything: if the count is zero, the split is theoretical.
//
// Dry run prints the counts and writes nothing.
//   node packages/db/scripts/rename-ritual.mjs
//   node packages/db/scripts/rename-ritual.mjs --apply
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

// Inlined, like the backfill: this runs under PLAIN NODE from a founder shell,
// where the pnpm workspace specifier does not resolve.
const OLD_NAME = "Satyanarayan Puja";
const NEW_NAME = "Satyanarayan Katha";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function main() {
  const rows = await prisma.ritual.findMany({ where: { name: OLD_NAME } });
  const already = await prisma.ritual.findMany({ where: { name: NEW_NAME } });

  console.log(`SAW: ${rows.length} Ritual row(s) named "${OLD_NAME}"`);
  console.log(`SAW: ${already.length} Ritual row(s) already named "${NEW_NAME}"`);

  if (already.length > 0 && rows.length > 0) {
    console.log(
      `\n⛔ BOTH NAMES EXIST. Renaming would create two rows with the same name.\n` +
        `   Decide which row survives by hand — this script will not merge them.`,
    );
    return;
  }
  if (rows.length === 0) {
    console.log("\nNothing to rename — and that is a measurement, not an assumption.");
    return;
  }

  // 🔴 THE BLAST-RADIUS COUNT. Bookings snapshot the display name; they are NOT
  // rewritten (a booking records what was agreed). This number is how many rows
  // end up on the far side of the split — and how many the removal guard would
  // stop matching.
  const oldBookings = await prisma.booking.count({ where: { eventType: OLD_NAME } });
  const oldPujaTypeRows = await prisma.booking.count({ where: { pujaType: OLD_NAME } });
  console.log(`\nBLAST RADIUS — bookings that will keep the OLD string (never rewritten):`);
  console.log(`  Booking.eventType = "${OLD_NAME}" : ${oldBookings}`);
  console.log(`  Booking.pujaType  = "${OLD_NAME}" : ${oldPujaTypeRows}`);
  if (oldBookings + oldPujaTypeRows === 0) {
    console.log(`  → ZERO. The history split is theoretical; nothing is orphaned.`);
  } else {
    console.log(
      `  → NON-ZERO. Those bookings keep the old name by design, but the pooja-\n` +
        `    removal guard (poojaRules.poojaBookingWhere) matches on this string,\n` +
        `    so it will no longer see them under the new name. Report before applying.`,
    );
  }

  // Other tables that carry the display string, for completeness.
  const svc = await prisma.pujaService.count({ where: { pujaType: OLD_NAME } });
  const dak = await prisma.dakshinaRate.count({ where: { pujaType: OLD_NAME } });
  const cfg = await prisma.poojaConfig.count({ where: { poojaType: OLD_NAME } });
  console.log(`\nOTHER TABLES holding "${OLD_NAME}" (untouched by this script):`);
  console.log(`  PujaService.pujaType : ${svc}`);
  console.log(`  DakshinaRate.pujaType: ${dak}`);
  console.log(`  PoojaConfig.poojaType: ${cfg}`);

  console.log(`\nPLANNED: rename ${rows.length} Ritual row(s) → "${NEW_NAME}"`);
  rows.forEach((r) => console.log(`  ${r.id}  ${r.name}  ${r.durationHours}h  ₹${r.basePriceMin}-${r.basePriceMax}`));

  if (!APPLY) {
    console.log("\nDRY RUN — pass --apply to write.");
    return;
  }

  const res = await prisma.ritual.updateMany({ where: { name: OLD_NAME }, data: { name: NEW_NAME } });
  console.log(`\nAPPLIED: ${res.count} row(s) renamed to "${NEW_NAME}".`);
  console.log(`The Ceremony guide's SATYANARAYAN card should now show its real hours and price.`);
}

main()
  .catch((e) => {
    console.error("RENAME FAILED — nothing partial: updateMany is one statement.", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
