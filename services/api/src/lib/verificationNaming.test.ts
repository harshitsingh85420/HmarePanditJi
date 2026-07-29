import assert from "node:assert";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";

// ─────────────────────────────────────────────────────────────
// NO VERIFICATION CLAIM WITHOUT NAMING WHICH VERIFICATION.
// PAGE 16's ruling — "identity ✓ and पूजा ✓ must read differently, never
// collapsed into one tick" — applied to the customer app, which never got
// walked until 2026-07-29.
//
// WHAT THE WALK FOUND. A customer saw a pandit badged **VERIFIED**, chose a
// puja, filled a 7-step wizard with 9 required fields, and was refused at
// submit:
//     400 POOJA_NOT_VERIFIED
//     यह पूजा अभी प्रमाणित नहीं है — पंडित जी को पहले वीडियो सत्यापन पूरा करना होगा।
// Six of six pandit-puja combinations. The badge he saw was IDENTITY (KYC).
// The gate he hit was PER-PUJA video सत्यापन. `cgrep` over all of apps/web
// returned ZERO matches for poojaVerification — the rule appeared on no
// customer surface at all. Two different verifications wearing one word.
//
// THE SERVER GATE IS NOT TOUCHED BY ANY OF THIS. booking.service.ts:116-125 is
// correct and it is the promise. This guard is about telling the truth EARLIER,
// never about loosening the check — and it asserts that too.
// ─────────────────────────────────────────────────────────────

console.log("Running verification-naming guard...");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

// ── 1. SUPERSEDED 2026-07-29 — सत्यापन INFORMS, IT DOES NOT GATE ──────
//
// This section asserted the OPPOSITE two turns ago: that createBooking must
// keep requiring an APPROVED latest PoojaVerification, and that "moving the
// refusal to the front NEVER means loosening the check". That was correct
// under the ruling then in force.
//
// Isj superseded it: ops DO review the video and "पूजा सत्यापित" IS a real
// platform claim, but it is INFORMATION, not permission — a customer may
// knowingly choose an unverified pandit. The gate also shut the shop: six of
// six pandit-puja combinations were unbookable on 2026-07-29 because no
// pandit had ever completed a verification.
//
// The assertions are NOT deleted — they are inverted and kept, so the reason
// is legible. The gate's absence is now pinned by pooja-gate.test.ts, which
// also pins that the INFORMATION replacing it is still produced.
const BOOKING = read("services/api/src/services/booking.service.ts");
assert.ok(
  !/poojaVerification\.findFirst/.test(BOOKING),
  "the सत्यापन booking GATE is back in createBooking. It is superseded: सत्यापन informs the " +
    "customer, it does not decide for him.",
);

// ── 2. the customer-visible projection CARRIES the per-puja state ──
const CTRL = read("services/api/src/controllers/pandit.controller.ts");
assert.ok(
  /poojaVerifications:\s*\{[\s\S]{0,120}status:\s*"APPROVED"/.test(CTRL),
  "the public pandit projection must select APPROVED pooja verifications — it is not sensitive, " +
    "it IS the trust claim, and without it the customer cannot be told before he commits",
);
// The capture must span the WHOLE block. An earlier version used
// `\{([\s\S]{0,200}?)\}` — non-greedy to the FIRST `}`, which closes the
// inner `where:` and never reaches `select:`. Adding rejectionReason to the
// select did NOT trip the guard. Law G2: a matcher must be able to see its
// own subject. Take a fixed window past the keyword instead.
// Anchor on the SELECT BLOCK only. Counting every occurrence also caught
// the two `: undefined` drops added below, whose windows contain no
// APPROVED filter — the guard then failed on its own correct code. Sixth
// instance of a matcher that cannot see its own subject.
const approvedOnly = [...CTRL.matchAll(/poojaVerifications:\s*\{/g)].map((m) => [
  m[0],
  CTRL.slice(m.index ?? 0, (m.index ?? 0) + 260),
]);
assert.ok(approvedOnly.length >= 2, `expected the join on BOTH list and detail, found ${approvedOnly.length}`);
for (const m of approvedOnly) {
  assert.ok(
    /status:\s*"APPROVED"/.test(m[1]),
    "a pooja-verification select is not filtered to APPROVED — a PENDING or REJECTED row would " +
      "be published as a verification claim",
  );
  assert.ok(
    !/videoUrl|publicUrl|rejectionReason|reviewedById|consentAt/.test(m[1]),
    "the public join must expose ONLY poojaType. A rejection reason or a raw video URL is not a " +
      "trust claim, it is the pandit's private review record.",
  );
}
// ── the RAW relation must never reach the wire ────────────────
// Both responses are built with a spread (`...p` / `...pandit`), so the
// selected relation lands in the payload unless it is explicitly dropped.
// It is derived-only. This matters more than it looks: today NOTHING is
// APPROVED, so a guest sees `poojaVerifications: []` — and an EMPTY ARRAY
// CANNOT PROVE ITS ELEMENT SHAPE. A live wire check would have looked
// clean while a widened `select` sat undetected behind it, ready to ship
// rejectionReason to strangers the day the first puja is approved.
// Dropping the array removes the question instead of guarding it.
for (const spread of ["poojaVerifications: undefined"]) {
  const hits = CTRL.split(spread).length - 1;
  assert.strictEqual(
    hits,
    2,
    `the raw poojaVerifications relation must be explicitly dropped from BOTH the list and 
     the detail response (found ${hits} of 2). Both are built with a spread, so a selected 
     relation ships by default — and an empty array on the wire proves nothing about what 
     it will contain once a row exists.`,
  );
}

for (const field of ["identityVerified", "verifiedPoojaTypes", "poojaVerified"]) {
  assert.ok(
    CTRL.includes(field),
    `the projection must expose "${field}" — the two verifications have to be separately nameable ` +
      `by any client, or a surface will collapse them again`,
  );
}

// ── 3. NO CUSTOMER SURFACE CLAIMS "VERIFIED" WITHOUT SAYING WHICH ──
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (["node_modules", ".next", "dist"].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(e) && !/\.test\./.test(e)) out.push(p);
  }
  return out;
}

// A rendered claim is a verification WORD in JSX. It is honest only if the same
// surface also names which verification it means.
const CLAIM = /(सत्यापित|प्रमाणित|\bVerified\b)/;
const NAMES = /(पूजा|puja|pooja|पहचान|identity|Identity|आधार|KYC|poojaVerified|identityVerified)/;

const unnamed: string[] = [];
for (const f of walk(join(REPO, "apps/web/app")).concat(walk(join(REPO, "apps/web/components")))) {
  const src = codeOnly(readFileSync(f, "utf8"));
  if (!CLAIM.test(src)) continue;
  if (!NAMES.test(src)) unnamed.push(f.replace(REPO, "").replace(/\\/g, "/"));
}
assert.deepStrictEqual(
  unnamed,
  [],
  `these customer surfaces render a verification claim without naming WHICH verification:\n  ` +
    unnamed.join("\n  ") +
    `\nIdentity (KYC) and per-puja सत्यापन are different promises. A bare "Verified" lets a ` +
    `customer believe the second when only the first is true — which is how six of six ` +
    `bookings were refused after a 7-step wizard.`,
);

// ── 4. the point of CHOICE must not start a journey it cannot finish ──
const TAB = read("apps/web/app/pandit/[id]/ServicesTab.tsx");
assert.ok(
  /service\.poojaVerified\s*\?/.test(TAB),
  "the services list must branch on service.poojaVerified — an unverified puja must be marked " +
    "at the point of CHOICE, not refused at submit",
);
// SUPERSEDED with section 1: this asserted the CTA must be DISABLED for an
// unverified puja. Under the ruling of 2026-07-29 सत्यापन INFORMS and does not
// block, so the control must WORK — the customer decides. Inverted and kept.
assert.ok(
  !/अभी बुक नहीं कर सकते/.test(TAB),
  "the Book CTA still refuses an unverified puja. सत्यापन informs; it does not decide.",
);
// …but the customer must still be TOLD, in words that trust him to choose.
assert.ok(
  /!service\.poojaVerified && \(/.test(TAB),
  "the unverified state renders nothing. Removing the gate was conditional on SHOWING the fact " +
    "instead — otherwise the customer is neither blocked nor informed.",
);
assert.ok(
  /आप ख़ुद सुनकर तय कीजिए/.test(TAB),
  "the unverified line must invite the customer to judge for himself, not warn him off — he is " +
    "being trusted with the decision",
);

console.log(
  `✓ verification-naming guard passed (server gate intact; both verifications projected and ` +
    `separately named; ${unnamed.length} unnamed claims; the choice point refuses early)`,
);
