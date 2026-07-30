import assert from "node:assert";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";

// ─────────────────────────────────────────────────────────────
// CUSTOMER DESIGN FOUNDATION — the five rules that can regress.
//
// Source: Claude Design project a708fb60, turn 4 (English-first
// rebuild). The audit that preceded it found 183 controls that look
// live and do nothing; the design independently reached the same
// figure and made "183 lying controls → 0" its headline. These guards
// exist so that number cannot drift back up silently.
// ─────────────────────────────────────────────────────────────

console.log("Running customer design-foundation guard…");

const REPO = join(__dirname, "..", "..", "..", "..");
const DS = "apps/web/components/design-system";
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

const BUTTON = read(`${DS}/Button.tsx`);
const VERIF = read(`${DS}/Verification.tsx`);
const CARD = read(`${DS}/PanditCard.tsx`);
const TOKENS = read(`${DS}/tokens.css`);
const MONEY = read(`${DS}/MoneyTwoZone.tsx`);

// ── 1. DISABLED ALWAYS PRINTS A REASON THAT NAMES THE UNLOCK ──
// Enforced by TYPE, not by discipline: there is no `disabled` boolean
// on the props, so the silent form is unrepresentable.
assert.ok(
  /disabledReason\?: string \| null/.test(BUTTON),
  "Button lost its disabledReason prop — a disabled control with no reason is exactly the shape " +
    "the audit found 13 times, and a customer cannot debug a form.",
);
assert.ok(
  !/\bdisabled\?: boolean/.test(BUTTON),
  "Button gained a plain `disabled?: boolean`. That makes the SILENT disable representable again — " +
    "the reason must be the only way to disable.",
);
assert.ok(
  /aria-describedby=\{disabledReason/.test(BUTTON),
  "the reason is printed but not announced — a screen reader must reach it the same way an eye does",
);

// ── 2. NO VERIFICATION CLAIM WITHOUT NAMING WHICH — PER CLAIM ──
// The previous guard matched per FILE: a file that mentioned "पूजा"
// anywhere passed, even where an individual badge rendered a bare
// "Verified". That granularity bug is why the live pandit detail header
// still shows an unnamed tick. This checks each CLAIM SITE.
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
const NAMES = /(identity|Identity|Aadhaar|पहचान|puja|Puja|pooja|ceremony|video)/;
const bareClaims: string[] = [];
for (const f of walk(join(REPO, DS))) {
  const src = codeOnly(readFileSync(f, "utf8"));
  // a CLAIM SITE is a rendered string containing the word, taken with a
  // tight window — not the whole file
  for (const m of src.matchAll(/["'>][^"'<>]{0,60}\b(Verified|verified)\b[^"'<>]{0,60}["'<]/g)) {
    const claim = m[0];
    if (/verified_user|--hpj-verified|hpj-verified/.test(claim)) continue; // icon / token name
    if (!NAMES.test(claim)) bareClaims.push(`${f.replace(REPO, "")}  →  ${claim.trim().slice(0, 80)}`);
  }
}
assert.deepStrictEqual(
  bareClaims,
  [],
  "these claim sites render 'Verified' without naming WHICH verification:\n  " +
    bareClaims.join("\n  ") +
    "\nIdentity (Aadhaar, checked by us) and the per-ceremony sample video are different promises.",
);

// ── 3. THE WORD "VERIFIED" MAY NEVER TOUCH A VIDEO ────────────
// The design states it as law: "'Verified' is a word the platform may
// only say about identity. The word never touches a video."
const videoWindows = [...VERIF.matchAll(/[^]{0,160}videocam[^]{0,300}/g)].map((m) => m[0]);
assert.ok(videoWindows.length > 0, "no video block found in Verification.tsx — guard lost its subject");
for (const w of videoWindows) {
  assert.ok(
    !/\bVerified\b|\bverified\b(?!_user)/.test(w.replace(/verified_user/g, "").replace(/--hpj-verified\w*/g, "")),
    "the word 'verified' appears in the sample-video block. Identity is our claim; the video is the " +
      "family's judgement, and borrowing the word collapses the two promises the product depends on.",
  );
}
assert.ok(
  /listen and decide for yourself/.test(VERIF),
  "the unreviewed-video copy no longer invites the family to judge — on day one EVERY video is " +
    "unreviewed, so this state is normal and must never read as a warning about the pandit",
);

// ── 4. 360 IS THE DESIGN WIDTH — structurally, not by luck ────
assert.ok(
  /\.hpj-root \{[^}]*max-width: 100%/.test(TOKENS) && /box-sizing: border-box/.test(TOKENS),
  "the root container no longer caps its width — a card wider than 360 clips on the target device",
);
assert.ok(
  /overflow-wrap: anywhere/.test(TOKENS),
  "overflow-wrap was removed. A long unbroken society or pandit name is the realistic string that " +
    "breaks a 360 card, and it is not hypothetical — the live list already carries Devanagari names.",
);
assert.ok(
  /\.hpj-root \* \{[^}]*max-width: 100%/.test(TOKENS),
  "descendants are no longer capped; a single wide child still overflows the capped root",
);

// ── 5. NOTHING FROM "THE CUT" MAY RETURN — BUILD-FAILING ──────
// The design deleted these and named honest replacements for each.
// Re-introducing any of them re-creates fabricated capability.
const CUT: Array<[string, RegExp]> = [
  ["map / live tracking", /\bmapbox\b|google\.maps|leaflet|<Map\b|liveTracking|trackPandit/i],
  ["PDF / document generation", /jspdf|pdfmake|html2canvas|generatePdf|downloadReceipt|\.pdf['"]/i],
  ["travel / PNR", /\bPNR\b|bookFlight|bookTrain|travelBooking/i],
  ["muhurat", /muhurat|auspiciousDate|shubhMuhurat/i],
  ["ratings / reviews", /starRating|<Rating\b|ratingValue|totalReviews|photoUpload/i],
  ["chat", /openChat|<Chat\b|sendMessage\(|messageThread/i],
  ["favourites / notifications / addresses / payment methods",
    /toggleFavourite|toggleFavorite|savedAddresses|paymentMethods|notificationPrefs/i],
];
const dsFiles = walk(join(REPO, DS));
for (const [label, re] of CUT) {
  for (const f of dsFiles) {
    const src = codeOnly(readFileSync(f, "utf8"));
    assert.ok(
      !re.test(src),
      `${label} was reintroduced in ${f.replace(REPO, "")}. The design cut it and named an honest ` +
        `replacement; re-adding it re-creates the fabricated capability this rebuild exists to delete.`,
    );
  }
}

// ── 6. THE FABRICATED RATING MUST NOT REACH A CARD ────────────
// The live API returns rating 4.8 / totalReviews 47 while the Review
// table is EMPTY and completedBookings is 0 for every pandit. The card
// props deliberately do not carry it.
assert.ok(
  !/rating|totalReviews/i.test(CARD),
  "PanditCard now accepts or renders a rating. The live API serves fabricated seed ratings " +
    "(4.8/47, 4.7/15 …) against an empty Review table — rendering them is the exact class of lie " +
    "this redesign removes. Structural absence, not a remembered omission.",
);
assert.ok(
  /No reviews yet/.test(VERIF),
  "the honest day-one line was removed — absence must be admitted, not left blank",
);

// ── 7. MONEY: DISPLAY = CHARGE, AND THE SEAM IS PRINTED ───────
assert.ok(
  /Nothing else will be asked of you/.test(MONEY),
  "the anti-ambush promise was removed from the money block. It answers the exact fear that makes " +
    "this category distrusted, and it is only worth saying because it is true.",
);
assert.ok(
  /Goes entirely to Pandit ji/.test(MONEY),
  "the dakshina line no longer states that the pandit receives all of it (Ruling #7)",
);
assert.ok(
  /totalNow/.test(MONEY) && !/dakshina \+ platformFee/.test(MONEY),
  "the total is being COMPUTED in the component. It must be the server's grandTotal — display=charge, " +
    "and a client-side sum is how display and charge drift apart.",
);

// ─────────────────────────────────────────────────────────────
// PROVE-TO-FAIL (law G2) — every matcher shown able to match the REAL
// shape it hunts, including the verbatim shape of each regression.
// ─────────────────────────────────────────────────────────────
const mustMatch: Array<[string, RegExp, string]> = [
  ["the reason prop, as written", /disabledReason\?: string \| null/, "  disabledReason?: string | null;"],
  ["a plain boolean disable (the regression)", /\bdisabled\?: boolean/, "  disabled?: boolean;"],
  ["the aria wiring, as written", /aria-describedby=\{disabledReason/, "        aria-describedby={disabledReason ? `x` : undefined}"],
  ["a bare Verified claim (the regression)", /["'>][^"'<>]{0,60}\b(Verified|verified)\b[^"'<>]{0,60}["'<]/, '>Verified<'],
  ["the root cap, as written", /\.hpj-root \{[^}]*max-width: 100%/, ".hpj-root {\n  max-width: 100%;\n  box-sizing: border-box;\n}"],
  ["overflow-wrap, as written", /overflow-wrap: anywhere/, "  overflow-wrap: anywhere;"],
  ["a rating reaching the card (the regression)", /rating|totalReviews/i, "  rating: number; totalReviews: number;"],
  ["a map reintroduction (the regression)", /\bmapbox\b|google\.maps|leaflet|<Map\b/i, 'import mapboxgl from "mapbox-gl";'],
  ["a pdf reintroduction (the regression)", /jspdf|pdfmake|generatePdf|downloadReceipt/i, "const doc = new jsPDF();"],
  ["the anti-ambush line, as written", /Nothing else will be asked of you/, "Nothing else will be asked of you."],
];
for (const [what, re, subject] of mustMatch) {
  assert.ok(
    re.test(subject),
    `MATCHER BLIND (law G2): the pattern for "${what}" cannot match its real subject.\n` +
      `  pattern: ${re}\n  subject: ${subject}`,
  );
}
// The per-claim check is a COMPOUND — prove the NAMES filter actually
// rescues a properly-named claim, or the guard would reject correct code.
assert.ok(
  NAMES.test(">Identity verified<") && !NAMES.test(">Verified<"),
  "MATCHER BLIND: the naming filter cannot tell a named claim from a bare one — it would either " +
    "pass everything or fail correct code",
);

console.log(
  `customer design-foundation guard ✅ — disable-needs-reason enforced by type, ` +
    `${bareClaims.length} bare verification claims, "verified" absent from the video block, ` +
    `360 caps structural, ${CUT.length} cut capabilities barred, rating unrepresentable, ` +
    `${mustMatch.length + 1} matchers proven able to fail`,
);
