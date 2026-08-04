/**
 * BACKFILL — payout credentials to AES-256-GCM (ruled order #2, Isj 2026-08-04)
 *
 *   DRY RUN (default, writes NOTHING):
 *     pnpm --filter @hmarepanditji/api exec tsx scripts/backfill-payout-credentials.ts
 *
 *   APPLY (Isj's hand, after he has read the dry run):
 *     pnpm --filter @hmarepanditji/api exec tsx scripts/backfill-payout-credentials.ts --apply
 *
 * WHY A SCRIPT AND NOT SQL: re-encryption needs the ENCRYPTION_KEY and AES in
 * application code, so the migration 20260804120000_payout_credentials_aes only
 * ADDS the columns. This moves the data.
 *
 * WHAT IT PRINTS: counts BY FORMAT — raw plaintext / base64 / already-AES /
 * unrecoverable — and a per-row line naming the pandit, never the credential.
 * No account number, no UPI id, and no ciphertext is ever logged.
 *
 * FAIL-CLOSED: a row that cannot be recovered is left with NULL new columns.
 * The reader treats that as bank-details-absent, the pandit is told plainly on
 * his own सत्यापन screen, and the operator sees him named on the payout screen
 * before anyone is paid.
 *
 * THE AFTER-COUNT IS THE PROOF. Re-run with no flag after applying: a clean
 * migration reads zero raw and zero base64. No guard can prove this — only
 * this count can.
 */

import { prisma } from "@hmarepanditji/db";
import {
  classifyLegacyBankValue,
  classifyLegacyUpiValue,
  recoverLegacyValue,
  encryptPayoutField,
  bankAccountLast4,
  maskUpiId,
  type LegacyFormat,
} from "../src/utils/payoutCredentials";

const APPLY = process.argv.includes("--apply");

type Row = {
  id: string;
  bankAccountNumber: string | null;
  upiId: string | null;
  bankAccountEncrypted: string | null;
  upiIdEncrypted: string | null;
  user: { name: string | null; phone: string | null } | null;
};

async function main() {
  console.log(APPLY ? "▶ APPLY — this WILL write" : "▶ DRY RUN — nothing will be written");

  const rows = (await prisma.panditProfile.findMany({
    select: {
      id: true,
      bankAccountNumber: true,
      upiId: true,
      bankAccountEncrypted: true,
      upiIdEncrypted: true,
      user: { select: { name: true, phone: true } },
    },
  })) as unknown as Row[];

  const tally: Record<string, Record<LegacyFormat, number>> = {
    bank: { aes: 0, plaintext: 0, base64: 0, unrecoverable: 0 },
    upi: { aes: 0, plaintext: 0, base64: 0, unrecoverable: 0 },
  };
  const unrecoverable: string[] = [];
  let migrated = 0;

  for (const r of rows) {
    const who = `${r.user?.name ?? "(no name)"} [${r.id.slice(0, 8)}]`;
    const hasBank = !!r.bankAccountNumber;
    const hasUpi = !!r.upiId;
    if (!hasBank && !hasUpi) continue;

    const bankFmt: LegacyFormat | null = hasBank ? classifyLegacyBankValue(r.bankAccountNumber) : null;
    const upiFmt: LegacyFormat | null = hasUpi ? classifyLegacyUpiValue(r.upiId) : null;
    if (bankFmt) tally.bank[bankFmt]++;
    if (upiFmt) tally.upi[upiFmt]++;

    const bankPlain = hasBank ? recoverLegacyValue(r.bankAccountNumber, "bank") : null;
    const upiPlain = hasUpi ? recoverLegacyValue(r.upiId, "upi") : null;

    const bankLost = hasBank && bankPlain === null;
    const upiLost = hasUpi && upiPlain === null;
    if (bankLost || upiLost) {
      unrecoverable.push(`${who} — ${bankLost ? "bank UNRECOVERABLE " : ""}${upiLost ? "upi UNRECOVERABLE" : ""}`.trim());
    }

    console.log(
      `  ${who}: bank=${bankFmt ?? "—"}${bankLost ? " ✗" : ""}  upi=${upiFmt ?? "—"}${upiLost ? " ✗" : ""}`,
    );

    if (!APPLY) continue;

    const data: Record<string, string | null> = {};
    if (bankPlain) {
      data.bankAccountEncrypted = encryptPayoutField(bankPlain);
      data.bankAccountLast4 = bankAccountLast4(bankPlain);
    }
    if (upiPlain) {
      data.upiIdEncrypted = encryptPayoutField(upiPlain);
      data.upiIdMasked = maskUpiId(upiPlain);
    }
    // the legacy columns are emptied as we go — the DROP rides the next
    // migration, but no readable legacy value is left sitting behind it.
    data.bankAccountNumber = null;
    data.upiId = null;

    await prisma.panditProfile.update({ where: { id: r.id }, data: data as never });
    migrated++;
  }

  console.log("\n══ COUNTS BY FORMAT ══");
  console.table(tally);
  console.log(`profiles scanned: ${rows.length}`);
  if (APPLY) console.log(`profiles written: ${migrated}`);

  if (unrecoverable.length) {
    console.log(`\n🔴 UNRECOVERABLE (${unrecoverable.length}) — these pandits must re-enter their details:`);
    for (const u of unrecoverable) console.log(`  · ${u}`);
    console.log("  They are told plainly on their own सत्यापन screen, and named on the admin payout screen.");
  } else {
    console.log("\n✅ no unrecoverable rows");
  }

  const legacyLeft = tally.bank.plaintext + tally.bank.base64 + tally.upi.plaintext + tally.upi.base64;
  console.log(
    APPLY
      ? "\nRe-run WITHOUT --apply to read the after-count. THE PROOF IS ZERO raw and ZERO base64."
      : `\nAFTER-COUNT READING: ${legacyLeft} legacy (raw+base64) values remain. Clean = 0.`,
  );

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("backfill failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
