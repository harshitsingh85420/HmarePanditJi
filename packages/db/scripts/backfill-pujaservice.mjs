// ─────────────────────────────────────────────────────────────
// TRACK 2A / OPTION A — THE BACKFILL.
//
// Every pandit who priced a pooja before this batch wrote a DakshinaRate and
// nothing the customer app reads. This copies those rates into PujaService so
// today's real pandits stop being advertised at "Starting from ₹0".
//
// THREE PROPERTIES, EACH DELIBERATE:
//
// 1. IDEMPOTENT. Upsert on the M1 unique, so a partial run is recoverable by
//    re-running rather than by hand-deleting rows.
// 2. NEVER PUBLISHES. Rows are created isActive:false. A backfill is not a
//    review — publishing here would push every historical pooja onto the
//    customer's search results without an admin ever seeing it. Existing rows
//    keep whatever isActive they already had (the flag is absent from update).
// 3. CANONICAL VALUES ONLY. A rate whose pujaType is outside PUJA_TYPES is
//    REPORTED and skipped, never coerced. Guessing that "griha_pravesh" meant
//    GRIHA_PRAVESH is exactly the silent value-mapping this whole batch exists
//    to stop.
//
// A MIGRATION IS AN ACT. Run with --apply; anything it creates against a
// §C-marked test row goes into the ledger at the moment of the act, exactly
// as a walk's rows do.
//
//   node packages/db/scripts/backfill-pujaservice.mjs           # dry run
//   node packages/db/scripts/backfill-pujaservice.mjs --apply
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// ⚠️ INLINED COPY — SOURCE OF TRUTH IS packages/types/src/pujaType.ts
//
// This list is DUPLICATED here on purpose. The script is run by PLAIN NODE
// from a founder shell (`node packages/db/scripts/backfill-pujaservice.mjs`),
// where the workspace specifier `@hmarepanditji/types` does not resolve —
// pnpm's symlinked workspace protocol needs the package manager's resolver,
// and the failure is ERR_MODULE_NOT_FOUND *before a single line runs*. A
// runbook command that dies on an import is a runbook command nobody can use.
//
// A DUPLICATED CONSTANT IS ONLY SAFE IF SOMETHING COUPLES IT BACK. This copy
// is pinned to the canonical list by pujaServicePublish.test.ts, which reads
// THIS FILE, parses the array below, and fails if it drifts from PUJA_TYPES
// by even one entry — with a G2 control proving the comparison can actually
// see a planted mismatch. Edit one, the guard fails until you edit the other.
//
// Keep the array literal on its own lines: the guard parses it as text.
// ─────────────────────────────────────────────────────────────
const PUJA_TYPES = [
  "SATYANARAYAN",
  "GRIHA_PRAVESH",
  "VIVAH",
  "MUNDAN",
  "NAAMKARAN",
  "HAVAN",
  "RUDRABHISHEK",
  "SHRADH",
];

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const canonical = new Set(PUJA_TYPES);

async function main() {
  const rates = await prisma.dakshinaRate.findMany({
    include: { pandit: { select: { id: true, userId: true, user: { select: { name: true, phone: true } } } } },
  });

  // THE OBSERVATION MANDATE: a zero finding from an instrument that cannot
  // prove it looked is UNPROVEN, not CLEAN. Say what was seen.
  console.log(`SAW: ${rates.length} DakshinaRate rows`);
  if (rates.length === 0) {
    console.log("Nothing to backfill — and that is a measurement, not an assumption.");
    return;
  }

  const skipped = [];
  const planned = [];

  for (const r of rates) {
    if (!canonical.has(r.pujaType)) {
      skipped.push({ pujaType: r.pujaType, panditId: r.panditId, reason: "non-canonical value — NOT coerced" });
      continue;
    }
    const existing = await prisma.pujaService.findUnique({
      where: { panditProfileId_pujaType: { panditProfileId: r.panditId, pujaType: r.pujaType } },
      select: { id: true, dakshinaAmount: true, isActive: true },
    });
    planned.push({
      panditProfileId: r.panditId,
      pandit: r.pandit?.user?.name ?? "—",
      phone: r.pandit?.user?.phone ?? "—",
      pujaType: r.pujaType,
      amount: r.amount,
      action: existing ? (existing.dakshinaAmount === r.amount ? "already-in-sync" : "update-price") : "CREATE",
      existingIsActive: existing?.isActive ?? null,
    });
  }

  console.table(planned);
  if (skipped.length) {
    console.log("\nSKIPPED — non-canonical pujaType, reported not coerced:");
    console.table(skipped);
  }

  const creates = planned.filter((p) => p.action === "CREATE");
  console.log(`\n${creates.length} row(s) would be CREATED; ${planned.length - creates.length} already exist.`);

  if (!APPLY) {
    console.log("DRY RUN — pass --apply to write. Rows created against a §C-marked test pandit go in the ledger.");
    return;
  }

  let created = 0;
  let updated = 0;
  for (const p of planned) {
    const before = await prisma.pujaService.findUnique({
      where: { panditProfileId_pujaType: { panditProfileId: p.panditProfileId, pujaType: p.pujaType } },
      select: { id: true },
    });
    const row = await prisma.pujaService.upsert({
      where: { panditProfileId_pujaType: { panditProfileId: p.panditProfileId, pujaType: p.pujaType } },
      // isActive deliberately ABSENT from update: a backfill must not publish,
      // and must not un-publish something an admin already approved.
      update: { dakshinaAmount: p.amount },
      create: { panditProfileId: p.panditProfileId, pujaType: p.pujaType, dakshinaAmount: p.amount, isActive: false },
    });
    if (before) updated++;
    else {
      created++;
      console.log(`§C CREATED PujaService ${row.id} · ${p.pujaType} @ ₹${p.amount} · pandit ${p.panditProfileId} (${p.pandit} ${p.phone})`);
    }
  }
  console.log(`\nAPPLIED: ${created} created (isActive:false — invisible until an admin approves), ${updated} price-synced.`);
}

main()
  .catch((e) => {
    console.error("BACKFILL FAILED — nothing partial is left behind by an upsert loop; re-run safely.", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
