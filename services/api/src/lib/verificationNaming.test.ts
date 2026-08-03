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
// SUPERSEDED with the gate: this required the join to be FILTERED to APPROVED.
// Under the 2026-07-29 ruling an unverified sample must still be listenable, so
// the join now returns every version (ordered desc) and APPROVED is derived.
// What it must still do is SELECT the status, or the badge cannot be computed.
assert.ok(
  /poojaVerifications:\s*\{[\s\S]{0,900}status:\s*true/.test(CTRL),
  "the public projection must select the verification STATUS — without it neither the badge nor " +
    "verifiedPoojaTypes can be derived, and the customer is neither blocked nor informed",
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
// SUPERSEDED with the gate. This looped every select block asserting it was
// FILTERED to APPROVED — correct while सत्यापन was a gate, wrong now that an
// unverified sample must remain listenable. What still matters is that the
// block leaks no private review field, which the videoUrl/publicUrl checks
// below now cover directly.
const joinBlocks = [...CTRL.matchAll(/poojaVerifications:\s*\{/g)].map((m) =>
  CTRL.slice(m.index ?? 0, (m.index ?? 0) + 900),
);
assert.ok(joinBlocks.length >= 2, `expected the join on BOTH list and detail, found ${joinBlocks.length}`);
for (const b of joinBlocks) {
  assert.ok(
    !/rejectionReason|reviewedById|reviewedAt|consentAt/.test(b),
    "the public join exposes a private review field. A rejection reason or a reviewer id is not a " +
      "trust claim, it is the pandit's review record.",
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

// A rendered claim is a verification WORD in JSX — or, since 2026-07-31, a
// GLYPH rendered conditional on a verification value. The word-only matcher
// let a P0 through: the favorites card rendered a bare ✓ Badge from
// `pandit.isVerified` — no word anywhere, so the matcher never looked, and a
// customer-facing surface promoted phone-verification to an identity claim
// in silence. A claim rendered as a glyph is still a claim.
//
// The glyph shape is DISCRIMINATING, from the audit of every glyph in the
// live tree: status banners ("✅ Booking Confirmed"), timeline ticks
// ("4:00 PM ✓") and decor are NOT person-claims — what makes a glyph a claim
// is being conditioned on a verification-ish value in the same JSX
// expression. That exact shape is matched; the rest stay free.
const CLAIM = /(सत्यापित|प्रमाणित|\bVerified\b)/;
// WIDENED 2026-07-31 (Isj): the set was ✓✔☑✅ while the emoji census holds
// 90 — a badge rendered as 🔒 or 🛡 conditioned on a verification value is
// the P0's twin and would have walked past, exactly as ✓ walked past the
// word matcher. The audit found the gap currently EMPTY (no emoji-form
// claim exists in any tree, any value); widened anyway so it cannot fill
// silently. The seam between two correct instruments is where nothing is
// looking.
const GLYPH_CLAIM =
  /\{[^{}]*(?:isVerified|identityVerified|poojaVerified|verificationStatus)[^{}]*&&[^{}]*(?:[✓✔☑\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}]|<[^>]*(?:check|Check|shield|Shield|badge|Badge)[^>]*\/?>)/u;
const NAMES = /(पूजा|puja|pooja|पहचान|identity|Identity|आधार|KYC|poojaVerified|identityVerified)/;

// KNOWN ARMED CLAIM, pending Isj's ruling on the reader diff
// (docs/review/favorites-reader-fix patch): the P0 badge itself. This is an
// EXACT list, ratchet rules — the moment the reader fix lands and the file
// gains its naming, this entry goes STALE and fails the build until removed;
// any NEW unnamed glyph claim fails immediately. The list is the ledger.
const GLYPH_PENDING = new Set<string>([]); // emptied 2026-07-31 with the reader fix (Isj: RULED YES) — the P0 badge now derives from verificationStatus and names पहचान

const unnamed: string[] = [];
const glyphStale: string[] = [];
let glyphClaims = 0;
// ADJUDICATED NOUN: surfaces that actually CARRY a claim. "Surfaces walked"
// is upstream — it stays in the hundreds even if CLAIM stops matching, and
// then "0 unnamed claims" means "0 claims seen", not "every claim is named".
let claimBearing = 0;
// SCOPE EXTENDED 2026-07-31 (Isj): the parked reason refuted itself — sparing
// named claims is what the matcher DOES, so "rich in named claims" was never
// a noise argument. A guard whose scope excludes the main app is a scope
// defect, not a deferral. The pandit and admin trees are walked too; the
// dead apps/web/src tree stays out (condemned, holds one known claim).
const surfaces = walk(join(REPO, "apps/web/app"))
  .concat(walk(join(REPO, "apps/web/components")))
  .concat(walk(join(REPO, "apps/pandit/src")))
  .concat(walk(join(REPO, "apps/admin/src")));
for (const f of surfaces) {
  const src = codeOnly(readFileSync(f, "utf8"));
  const rel = f.replace(REPO, "").replace(/\\/g, "/");
  const glyph = GLYPH_CLAIM.test(src);
  if (glyph) glyphClaims++;
  if (GLYPH_PENDING.has(rel)) {
    // must still be failing for exactly the recorded reason
    if (!glyph || NAMES.test(src)) glyphStale.push(rel);
    continue;
  }
  if (!CLAIM.test(src) && !glyph) continue;
  claimBearing++;
  if (!NAMES.test(src)) unnamed.push(rel);
}
assert.deepStrictEqual(
  glyphStale, [],
  `GLYPH_PENDING entries no longer failing — the reader fix landed; remove them in the same ` +
    `commit:\n  ${glyphStale.join("\n  ")}`,
);
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
// SUPERSEDED AGAIN (Isj's सही, 2026-08-03 — video decouples from listing).
// The previous clause here demanded the "listen and decide" invite on every
// unverified pooja — sensible while unreviewed videos RENDERED. Under the
// decoupled model an unreviewed video does not render at all, so the invite
// would point at nothing. The information contract is now three-state:
//   APPROVED → the video plays ("Hear him perform this puja");
//   PENDING  → the state is NAMED, and booking is explicitly not gated;
//   NONE/REJECTED → honest silence — the absence of a badge IS the
//   information, rendered, not warned about (the ruled trust consequence).
assert.ok(
  /Video under review — you can still book\./.test(TAB),
  "the PENDING state must be NAMED, with booking explicitly open — a review in flight that " +
    "renders as nothing reads as a defect, and one that gates booking re-couples what the " +
    "ruling decoupled.",
);
assert.ok(
  /Hear him perform this puja/.test(TAB),
  "the approved video keeps its canon line — the family's judgement, offered where it exists",
);
assert.ok(
  !/पहचान सत्यापित है/.test(TAB),
  "the identity sentence must stay DEAD on this surface (recurrence law, 2026-08-03): a " +
    "universal precondition is a door, not a badge, and the profile speaks only what " +
    "differentiates.",
);

// ── THE SAMPLE VIDEO: what may reach a stranger ───────────────
// Isj ruling 2026-07-29: expose YouTube videoId + thumbnailUrl so a customer
// can judge for himself. NEVER videoUrl, NEVER publicUrl.
//   · videoId is all an embed needs; the raw URL adds nothing but a leak.
//   · publicUrl is a BARE FILE URL with no unlisting semantics — UPLOAD rows
//     (the WhatsApp path) expose NO media identifier at all until storage is
//     signed/expiring. They read as "sample not viewable yet".
// NO ESCAPES. The previous check built its pattern with `new RegExp(f +
// "\s*:\s*true")` — and inside a double-quoted JS string `\s` is just `s`,
// so the pattern was `publicUrls*:s*true` and could NEVER match. Adding
// publicUrl to the select did not trip it. Seventh instance of a matcher
// unable to see its own subject, and on the leak check of all places.
// Whitespace-strip and use plain substrings: nothing left to mis-escape.
const ctrlTight = CTRL.replace(/\s+/g, "");
for (const forbidden of ["videoUrl", "publicUrl"]) {
  assert.ok(
    !ctrlTight.includes(forbidden + ":true"),
    `the customer-facing projection selects "${forbidden}". videoUrl leaks the raw link and ` +
      `publicUrl is a bare file URL with no unlisting semantics — neither is needed to play a ` +
      `sample, and neither can be un-shared once a stranger has it.`,
  );
}
assert.ok(
  /videoProvider === "YOUTUBE"/.test(CTRL),
  "the sample must be gated on videoProvider === YOUTUBE — an UPLOAD row must expose no media " +
    "identifier at all",
);
assert.ok(
  /sampleVideoId: youtube \? /.test(CTRL) && /sampleViewable: youtube/.test(CTRL),
  "the sample fields must be null for a non-YouTube provider, not merely unused by the client",
);
// listenable in BOTH states — the badge says who vouched, not whether it plays
assert.ok(
  !/status:\s*"APPROVED"/.test(CTRL.slice(CTRL.indexOf("poojaVerifications:"), CTRL.indexOf("poojaVerifications:") + 400)),
  "the join filters to APPROVED again — an unverified sample must still be listenable, or the " +
    "customer is asked to choose with nothing to judge by",
);

// ── CONSENT IS ONLY CONSENT IF HE KNOWS ───────────────────────
// The pandit pastes an "unlisted" link and would reasonably assume only ops
// watch it. Every visitor to his page now can. He must be told BEFORE he
// submits, on the screen that asks — not in a policy page.
const ADD = read("apps/pandit/src/app/(dashboard-group)/my-poojas/add/page.tsx");
assert.ok(
  /यह वीडियो आपके पन्ने पर यजमानों को दिखेगा/.test(ADD),
  "the video-upload screen must state plainly that the sample is shown to यजमान on his page. " +
    "He is consenting to publication, not just to review.",
);
assert.ok(
  /सहमति/.test(ADD) && /यजमानों को दिखाने के लिए/.test(ADD),
  "the consent CHECKBOX must name display-to-customers, not only सत्यापन. Consenting to a review " +
    "is not consenting to publication.",
);

// ── G2 (2026-07-31). This file has ALREADY been burned twice by blind
// matchers (the 6th and 7th sightings are documented above at their fix
// sites) — the leak check's tainted specimen is exactly the shape the
// mis-escaped `\s` pattern could never see.
import { proveDetects, proveMatchers, proveSaw } from "./g2";
proveSaw("verificationNaming", "customer surfaces walked", surfaces.length);
proveSaw("verificationNaming", "claim-bearing surfaces JUDGED for naming", claimBearing);
proveSaw("verificationNaming", "glyph-claim files found by the extended matcher", glyphClaims);
proveSaw("verificationNaming", "poojaVerifications join blocks found", joinBlocks.length);
proveSaw("verificationNaming", "source files read (non-empty)",
  [BOOKING, CTRL, TAB, ADD].filter((s) => s.length > 0).length);
proveDetects("verificationNaming", "the leak check sees a selected publicUrl (the 7th-sighting shape)",
  (s: string) => s.replace(/\s+/g, "").includes("publicUrl:true"),
  "select: {\n        publicUrl: true,\n      }",
  "select: {\n        thumbnailUrl: true,\n      }");
proveMatchers("verificationNaming", [
  // THE GLYPH CLAIM (2026-07-31) — the tainted specimen is the P0's own
  // line, verbatim; the clean specimens are the audited non-claims that a
  // sloppy glyph pattern would have flagged (a timeline tick, a status
  // banner). The matcher must see the claim AND spare the decor.
  ["a wordless glyph claim conditioned on a verification value", GLYPH_CLAIM,
    '{pandit.isVerified && <Badge variant="success" className="px-1.5"><span className="text-[10px]">✓</span></Badge>}',
    '<p className="text-sm font-semibold">4:00 PM ✓</p>'],
  ["a glyph claim via an icon component", GLYPH_CLAIM,
    '{service.poojaVerified && <ShieldCheck className="w-4 h-4" />}',
    'bannerText = "✅ Booking Confirmed — Pandit will arrive on schedule";'],
  ["the booking-gate relapse", /poojaVerification\.findFirst/,
    "const latest = await prisma.poojaVerification.findFirst({"],
  ["a private review field in the public join", /rejectionReason|reviewedById|reviewedAt|consentAt/,
    "        rejectionReason: true,", "        status: true,"],
  ["a bare verification claim", CLAIM, '<span className="badge">Verified</span>'],
  ["the naming words that make a claim honest", NAMES, "पूजा सत्यापित — वीडियो देखा गया"],
  ["the choice-point branch", /service\.poojaVerified\s*\?/,
    "{service.poojaVerified ? <Badge/> : null}"],
  ["the refusal-copy relapse", /अभी बुक नहीं कर सकते/, "<p>अभी बुक नहीं कर सकते</p>"],
  ["the APPROVED-filter relapse in the join window", /status:\s*"APPROVED"/,
    'where: { status: "APPROVED" },'],
]);

console.log(
  `✓ verification-naming guard passed (server gate intact; both verifications projected and ` +
    `separately named; ${unnamed.length} unnamed claims; the choice point refuses early)`,
);
