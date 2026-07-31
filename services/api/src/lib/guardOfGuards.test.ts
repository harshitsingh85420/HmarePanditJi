import assert from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { proveDetects, proveSaw } from "./g2";

// ─────────────────────────────────────────────────────────────
// THE GUARD OF GUARDS — G2 as a ratchet, not a practice.
//
// Isj, 2026-07-31: "A guard that cannot demonstrate its own failure is
// decoration. Until this lands, '61/61 green' is a sentence of unproven
// meaning." Across two turns SIX instruments failed silently (CRLF read
// nothing; stale dist; tsbuildinfo emitted nothing; indexOf misattributed;
// unanchored counting; a half-dead audit loop) and not one was caught by a
// green run — every one was caught by a deliberately planted failure.
//
// So: every guard in this suite must EXECUTE a positive control — plant its
// own subject, prove its matcher fires — via ./g2 (proveMatchers /
// proveDetects) or the in-file mustMatch loop ("MATCHER BLIND"). A guard
// that can do neither carries `G2-UNPROVABLE: <reason>` and is listed as
// unproven in the ledger.
//
// THE RATCHET: guards not yet converted are named in UNPROVEN_BASELINE.
// That list may only SHRINK —
//   · a NEW guard without an executable proof fails the build immediately;
//   · a listed guard that gains a proof MUST be removed from the list in the
//     same commit (a stale entry fails), so the list is always the truth;
//   · growing the list is impossible without editing this file, which is a
//     visible act in review, not a silent omission.
// ─────────────────────────────────────────────────────────────

console.log("Running guard-of-guards (G2 ratchet)…");

const LIB = __dirname;

// The conversion queue — guards with no executable positive control yet.
// Started 2026-07-31 at 52; payment-money, webhook-auth and dakshinaFloor
// converted the same day (money first). Every name removed from this list is
// a conversion landed. Adding a name is forbidden by construction (a new
// guard must ship proven).
const UNPROVEN_BASELINE = new Set([
  "aadhaar-consent.test.ts",
  "accommodation-column.test.ts",
  "adminBreakdownSums.test.ts",
  "adminStatusSets.test.ts",
  "api-base-normalized.test.ts",
  "apiBaseContract.test.ts",
  "authRouting.test.ts",
  "body-contract.test.ts",
  "booking-alert.test.ts",
  "bookingStatus.test.ts",
  "brandTokens.test.ts",
  "commission-consistency.test.ts",
  "conformance-f09.test.ts",
  "cors-origin.test.ts",
  "displayChargeBoundary.test.ts",
  "displayReadsStored.test.ts",
  "earnings.test.ts",
  "empty-body-parser.test.ts",
  "encryption-key-guard.test.ts",
  "feeSnapshot.test.ts",
  "kycContract.test.ts",
  "milestones.test.ts",
  "mutate-idempotency.test.ts",
  "noAwaitedReplyChainable.test.ts",
  "notify-user-id.test.ts",
  "pandit-stats.test.ts",
  "panditIdentityReads.test.ts",
  "pooja-gate.test.ts",
  "poojaRemovalGuard.test.ts",
  "poojaRules.test.ts",
  "public-pandit-access.test.ts",
  "public-pandit-projection.test.ts",
  "publicPanditReads.test.ts",
  "razorpayMockGate.test.ts",
  "responseShape.test.ts",
  "reviewIdentity.test.ts",
  "route-audit.test.ts",
  "samagriItem.test.ts",
  "shishyaFacts.test.ts",
  "storage-keys.test.ts",
  "storage-safe-auth.test.ts",
  "storage.test.ts",
  "tokenKeyContract.test.ts",
  "travel-mode-enum.test.ts",
  "trust-proxy.test.ts",
  "verification-resubmit.test.ts",
  "verificationNaming.test.ts",
  "vocabularyBoundaries.test.ts",
  "webhook-registration.test.ts",
]);

// content → classification. Exported shape kept simple so the self-proof
// below can aim at it.
//
// PATTERN + EXECUTION, two halves of one verdict (Isj, 2026-07-31): this
// classifier is pattern-based — it matches marker strings and executes
// nothing, so on its own it is fooled by a comment containing the marker.
// The RUNNER closes that half: every prove* call EMITS a `G2-EXECUTED` line
// on stdout, and run-guard-tests.mjs fails any file that carries the proven
// pattern but emitted nothing. The legacy `MATCHER BLIND` mustMatch loops
// were converted to proveMatchers the same day precisely so that ONE
// emission format covers the suite — the legacy branch is deliberately GONE
// from this classifier, and the specimen below proves prose alone no longer
// counts.
type Verdict = "proven" | "waived" | "unproven";
function classify(content: string): Verdict {
  if (/proveMatchers\(|proveDetects\(/.test(content)) return "proven";
  if (/G2-UNPROVABLE:/.test(content)) return "waived";
  return "unproven";
}

// ── G2 for the classifier itself ─────────────────────────────
proveDetects("guardOfGuards", "a guard using the g2 harness reads as proven",
  (s: string) => classify(s) === "proven",
  'import { proveDetects } from "./g2";\nproveDetects("x", "y", f, tainted);',
  "const x = 1; assert.ok(x);");
proveDetects("guardOfGuards", "MATCHER-BLIND prose alone no longer counts as proven",
  (s: string) => classify(s) === "unproven",
  '// this file mentions MATCHER BLIND (law G2) in a comment and runs nothing',
  'proveMatchers("x", mustMatch);');
proveDetects("guardOfGuards", "a waiver reads as waived, not proven",
  (s: string) => classify(s) === "waived",
  "// G2-UNPROVABLE: this guard asserts on live env vars, no specimen exists",
  "// G2 is a nice idea");

// ── the sweep ────────────────────────────────────────────────
const guardFiles = readdirSync(LIB).filter((f) => f.endsWith(".test.ts"));
proveSaw("guardOfGuards", "guard files swept", guardFiles.length);
assert.ok(guardFiles.length >= 60, `only ${guardFiles.length} guard files found — the sweep reached nothing`);

const nowUnproven: string[] = [];
const staleBaseline: string[] = [];
const newUnproven: string[] = [];
const waived: string[] = [];

for (const f of guardFiles) {
  const v = classify(readFileSync(join(LIB, f), "utf8"));
  if (v === "waived") { waived.push(f); continue; }
  if (v === "proven") {
    if (UNPROVEN_BASELINE.has(f)) staleBaseline.push(f);
    continue;
  }
  nowUnproven.push(f);
  if (!UNPROVEN_BASELINE.has(f)) newUnproven.push(f);
}

assert.deepStrictEqual(
  newUnproven, [],
  `NEW guard(s) with no executable positive control:\n  ${newUnproven.join("\n  ")}\n` +
    `Every new guard ships with its proof: import { proveMatchers, proveDetects } from "./g2" ` +
    `and plant the defect the guard hunts. A guard that cannot demonstrate its own failure is ` +
    `decoration. (Adding to UNPROVEN_BASELINE is not an option — the list only shrinks.)`,
);
assert.deepStrictEqual(
  staleBaseline, [],
  `Guard(s) now proven but still listed in UNPROVEN_BASELINE:\n  ${staleBaseline.join("\n  ")}\n` +
    `Remove them from the list in this same commit — the list is the ledger of unproven guards ` +
    `and a stale entry makes it lie in the safe direction, which is still lying.`,
);

console.log(
  `guard-of-guards ✅ — ${guardFiles.length} guards: ` +
    `${guardFiles.length - nowUnproven.length - waived.length} proven, ${waived.length} waived, ` +
    `${nowUnproven.length} unproven (baseline ${UNPROVEN_BASELINE.size}, may only shrink)`,
);
