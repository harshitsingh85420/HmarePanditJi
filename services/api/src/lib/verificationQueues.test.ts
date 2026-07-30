import assert from "node:assert";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";
import {
  IDENTITY_REJECTION_REASONS,
  VIDEO_REJECTION_REASONS,
  OTHER_CODE,
  resolveRejectionText,
  videoRejectionMessage,
  identityRejectionMessage,
} from "@hmarepanditji/types";

// ─────────────────────────────────────────────────────────────
// EVERY VERIFICATION CLAIM NEEDS A SCREEN, AND EVERY REJECTION
// NEEDS A SENTENCE THE PANDIT CAN READ.
//
// Two failures this pins, both found live:
//
// 1. THE PER-POOJA QUEUE HAD NO UI. GET /admin/pooja-verifications and
//    its approve/reject siblings existed for weeks and ZERO admin files
//    called them — so Isj could not mark a single pooja verified, while
//    the customer app rendered "पूजा सत्यापन बाकी" on every service and
//    the badge had no way of ever becoming true. A claim the product
//    makes must have a place where a human makes it.
//
// 2. REJECTION REASONS WERE FREE TEXT, interpolated verbatim into a
//    Devanagari sentence on a 62-year-old's phone. Every register guard
//    here inspects strings IN THE REPO; a reason typed at runtime is
//    invisible to all of them. "photo blurry" typed in a hurry ships
//    roman English into Hindi.
// ─────────────────────────────────────────────────────────────

console.log("Running verification-queues guard…");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (["node_modules", ".next", "dist"].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}
const ADMIN_SRC = walk(join(REPO, "apps/admin/src"))
  .map((f) => codeOnly(readFileSync(f, "utf8")))
  .join("\n");

// ── 1. THE CLASS RULE — every queue endpoint has a caller ─────
// Stated as a LIST so a third verification claim cannot be added
// without either a screen or a deliberate edit to this array.
const QUEUES: Array<[string, RegExp]> = [
  ["identity (KYC) queue", /admin\/kyc\/queue/],
  ["identity approve", /admin\/pandits\/\$\{[^}]*\}\/approve|admin\/pandits\/.*\/approve/],
  ["identity reject", /admin\/pandits\/.*\/reject/],
  ["per-pooja queue", /admin\/pooja-verifications/],
  ["per-pooja approve", /pooja-verifications\/.*\/approve/],
  ["per-pooja reject", /pooja-verifications\/.*\/reject/],
];
for (const [what, re] of QUEUES) {
  assert.ok(
    re.test(ADMIN_SRC),
    `no admin screen calls the ${what}. A verification the product CLAIMS must have a place where ` +
      `a human makes it — the per-pooja endpoints existed for weeks with no caller, so the badge ` +
      `they control could never become true.`,
  );
}

// ── 2. THE TWO QUEUES STAY DISTINCT ───────────────────────────
const POOJA_UI = read("apps/admin/src/app/verifications/PoojaQueue.tsx");
assert.ok(
  !/\bVerified\b|\bverified\b/.test(POOJA_UI.replace(/pooja-verifications/g, "").replace(/poojaVerification/gi, "")),
  'the ceremony-video screen uses the word "verified". That word belongs to identity alone — the ' +
    "video is the family's judgement, not the platform's claim.",
);

// ── 3. REASONS ARE PRESET, AND THE ENDPOINTS DEMAND A CODE ────
for (const [file, fn] of [
  ["services/api/src/controllers/poojaVerification.controller.ts", "isVideoReasonCode"],
  ["services/api/src/routes/admin.routes.ts", "isIdentityReasonCode"],
] as const) {
  const src = read(file);
  assert.ok(
    new RegExp(`${fn}\\(reasonCode\\)`).test(src),
    `${file} no longer validates the rejection reason against the preset set. Free text bypasses ` +
      `every register guard in this repo, because those guards read the repo and a typed reason is ` +
      `not in it.`,
  );
  assert.ok(
    !/\{ reason \}/.test(src),
    `${file} accepts a bare \`reason\` string again`,
  );
}

// ── 4. THE PRESET STRINGS PASS THE REGISTER ───────────────────
// Same rules the pandit app's own copy must satisfy: Devanagari only,
// आप never तुम, कीजिए never करो.
const ROMAN = /[A-Za-z]/;
for (const set of [IDENTITY_REJECTION_REASONS, VIDEO_REJECTION_REASONS]) {
  for (const r of set) {
    if (r.code === OTHER_CODE) {
      assert.strictEqual(r.panditText, "", "OTHER must carry no canned text — ops supplies it");
      continue;
    }
    assert.ok(r.panditText.length > 0, `${r.code} has no pandit-facing sentence`);
    assert.ok(
      !ROMAN.test(r.panditText),
      `${r.code} contains roman characters in the text the PANDIT reads: "${r.panditText}". He ` +
        `reads Devanagari; roman English inside a Hindi sentence is unreadable to him.`,
    );
    assert.ok(
      !/\bतुम\b|\bकरो\b/.test(r.panditText),
      `${r.code} uses तुम/करो — the register is आप and कीजिए, to a man who is usually older than us`,
    );
  }
}

// ── 5. NO PROMISED DURATION IN THE REJECTION COPY ─────────────
// The draft said "दो मिनट लगेंगे". Dropped: never promise a length you
// cannot guarantee (the payout-timing law). Say it is EASY, not FAST.
const idMsg = identityRejectionMessage("कागज़ की तस्वीर साफ़ नहीं आई।");
assert.ok(
  !/मिनट|सेकंड|घंटे|जल्दी|तुरंत/.test(idMsg.body),
  `the identity rejection promises a duration or a speed: "${idMsg.body}". For a 62-year-old with ` +
    `large thumbs a re-upload is not two minutes, and the promise turns a small task into a small ` +
    `failure.`,
);
assert.ok(/आसान/.test(idMsg.body), "the identity rejection no longer says the re-upload is EASY");

// ── 6. THE VIDEO SCOPE LINE MUST BE CONDITIONAL ───────────────
// Telling a pandit whose KYC is still PENDING that "आपकी पहचान सत्यापित
// है" is a lie in the very sentence whose job is reassurance.
const verified = videoRejectionMessage("गृह प्रवेश", "आवाज़ नहीं आ रही।", true);
const pending = videoRejectionMessage("गृह प्रवेश", "आवाज़ नहीं आ रही।", false);
assert.notStrictEqual(
  verified.body,
  pending.body,
  "the video rejection reads identically whether or not the pandit's identity is verified — the " +
    "scope line is asserting a verification state it has not read",
);
assert.ok(
  /आपकी पहचान सत्यापित है/.test(verified.body),
  "the verified variant no longer reassures that identity is intact",
);
assert.ok(
  !/आपकी पहचान सत्यापित है/.test(pending.body),
  "the NOT-verified variant claims his identity is verified. It is not, and a video can be " +
    "rejected in that state — this is the exact false assertion the conditional exists to prevent.",
);
assert.ok(
  /जाँच अलग चलती है/.test(pending.body),
  "the not-verified variant must still say the identity check runs separately",
);

// ── 7. THE CALLER READS THE REAL STATE ────────────────────────
const PV = read("services/api/src/controllers/poojaVerification.controller.ts");
assert.ok(
  /verificationStatus === KYC_APPROVE_WRITE_STATUS/.test(PV),
  "the video-rejection notifier no longer reads the pandit's real identity status before choosing " +
    "the scope line — it would be guessing",
);

// ── PROVE-TO-FAIL (law G2) ───────────────────────────────────
assert.ok(ROMAN.test("photo blurry"), "MATCHER BLIND: the roman check cannot see roman text");
assert.ok(!ROMAN.test("कागज़ की तस्वीर साफ़ नहीं आई।"), "MATCHER BLIND: the roman check flags clean Devanagari");
assert.ok(/मिनट/.test("दोबारा भेजिए — दो मिनट लगेंगे।"), "MATCHER BLIND: the duration check cannot see the removed promise");
assert.strictEqual(resolveRejectionText("video", "NOPE_NOT_A_CODE"), null, "an unknown code must not resolve");
assert.strictEqual(resolveRejectionText("video", OTHER_CODE, "   "), null, "OTHER with blank text must not resolve");
assert.strictEqual(resolveRejectionText("video", OTHER_CODE, "वीडियो अधूरा है"), "वीडियो अधूरा है");

console.log(
  `verification-queues guard ✅ — ${QUEUES.length} queue endpoints have callers, queues distinct, ` +
    `${IDENTITY_REJECTION_REASONS.length}+${VIDEO_REJECTION_REASONS.length} preset reasons pass the ` +
    `register, no duration promised, scope line conditional on the real identity state`,
);
