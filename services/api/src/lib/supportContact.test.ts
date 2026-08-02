import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// the /code-only SUBPATH, not the barrel — the barrel pulls zod and the whole
// pricing surface into a guard that only needs a comment stripper.
import { codeOnly } from "@hmarepanditji/utils/code-only";
import { resolveSupportPhone, canCallSupport, resolveSupportHours } from "@hmarepanditji/utils/support-contact";
import { proveMatchers, proveSaw, proveDetects } from "./g2.js";

// ─────────────────────────────────────────────────────────────
// SUPPORT-CONTACT GUARD — "the ops contact is an env truth"
//
// Ruling 1, 2026-08-02 (Isj): "THE NUMBER COMES FROM CONFIG, never a source
// literal (the wa.me lesson). If no real number is configured yet, the screen
// says so honestly — an honest absence beats a dead number."
//
// THE REGRESSION THIS GUARD IS SHAPED AROUND is real and still in the tree:
// apps/web/src/app/contact/page.tsx and five siblings read
// NEXT_PUBLIC_WHATSAPP_NUMBER and every one ends `?? "919999999999"`. The
// defect is not the missing number — it is the FALLBACK that hides it. So the
// guard hunts the fallback, not the absence.
//
// Three surfaces, three different kinds of check:
//   §1 BEHAVIOUR — the resolver is EXECUTED against planted specimens. A guard
//      that only greps proves the shape of the code, never its verdict.
//   §2 SOURCE — no phone-number literal may appear in the live customer tree.
//   §3 COUPLING — /help must consume the resolver, and must gate the CONTROL
//      on it rather than the href.
// ─────────────────────────────────────────────────────────────

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const GUARD = "supportContact";

function walk(dir: string): string[] {
  let out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === ".next") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (/\.(tsx?|jsx?)$/.test(p)) out.push(p);
  }
  return out;
}

// ── §1 · BEHAVIOUR — the resolver, executed ───────────────────
// Every case below is a value someone could plausibly put in the env, and the
// verdict is the whole point of the module.

// Absent in the three ways an env var is absent. NEXT_PUBLIC_* is inlined at
// BUILD time, so an unset var arrives as "" and not as undefined — a resolver
// that only guarded against undefined would sail straight past the real case.
assert.strictEqual(resolveSupportPhone(undefined), null, "undefined env must resolve to null");
assert.strictEqual(resolveSupportPhone(""), null, "empty env must resolve to null — this is what an unset NEXT_PUBLIC_ var actually looks like");
assert.strictEqual(resolveSupportPhone("   "), null, "whitespace-only env must resolve to null");

// The specimens from the actual defect.
assert.strictEqual(resolveSupportPhone("919999999999"), null, "the wa.me fallback literal must be refused");
assert.strictEqual(resolveSupportPhone("91XXXXXXXXXX"), null, "the .env.local template value must be refused");
assert.strictEqual(resolveSupportPhone("9999999999"), null, "a repeated-digit number must be refused");
assert.strictEqual(resolveSupportPhone("+91 98765 43210"), null, "the descending-run demo number must be refused");
assert.strictEqual(resolveSupportPhone("1234567890"), null, "the ascending-run demo number must be refused");

// Not dialable → refused. A wrong number rings a stranger.
assert.strictEqual(resolveSupportPhone("12345"), null, "too short must be refused");
assert.strictEqual(resolveSupportPhone("5678912345"), null, "an Indian mobile cannot open with 5");
assert.strictEqual(resolveSupportPhone("support@example.com"), null, "a non-numeric value must be refused, not coerced");

// Real numbers, in the shapes an operator actually types them.
const plain = resolveSupportPhone("9812345670");
assert.ok(plain, "a real 10-digit mobile must resolve");
assert.strictEqual(plain.telHref, "tel:+919812345670", "telHref must be fully qualified — a bare 10-digit tel: is ambiguous abroad");
assert.strictEqual(plain.display, "+91 98123 45670", "display must be grouped for reading, not raw digits");
for (const variant of ["+91 98123 45670", "919812345670", "+91-98123-45670", "  9812345670  "]) {
  const r = resolveSupportPhone(variant);
  assert.ok(r, `operator-typed variant must resolve: ${JSON.stringify(variant)}`);
  assert.strictEqual(r.telHref, plain.telHref, `every variant of one number must produce ONE telHref: ${JSON.stringify(variant)}`);
}

// A landline ops desk is legitimate; refusing one pushes the operator back to
// a source literal, which is the defect this module exists to prevent.
const landline = resolveSupportPhone("011 2345 6789");
assert.ok(landline, "a landline with its STD code must resolve");
assert.strictEqual(landline.telHref, "tel:+911123456789", "landline telHref must drop the trunk 0 after the country code");
assert.strictEqual(landline.display, "+91 1123456789", "display and href must carry the SAME digits — what he reads is what his handset dials");

// THE FALSE-NEGATIVE CONTROL. 9123456789 is a real Indian mobile that OPENS
// with the country code's own digits. A naive `.replace(/^91/, "")` mauls it
// into "23456789", which the ascending-run rule then refuses — and a resolver
// that refuses real numbers sends the operator straight back to a source
// literal, which is the defect this whole module exists to prevent.
const looksLikeCountryCode = resolveSupportPhone("9123456789");
assert.ok(looksLikeCountryCode, "a real mobile that begins with 91 must NOT be mistaken for a country-coded value");
assert.strictEqual(looksLikeCountryCode.telHref, "tel:+919123456789", "the 91-leading mobile must keep all ten of its digits");

// canCallSupport is the caller-facing question: does the CONTROL exist at all?
assert.strictEqual(canCallSupport(""), false, "canCallSupport must be false when nothing is configured");
assert.strictEqual(canCallSupport("919999999999"), false, "canCallSupport must be false on the placeholder");
assert.strictEqual(canCallSupport("9812345670"), true, "canCallSupport must be true on a real number");

// Hours are a separate truth and must not invent themselves.
assert.strictEqual(resolveSupportHours(undefined), null, "unset hours must be null, never a default caption");
assert.strictEqual(resolveSupportHours(""), null, "empty hours must be null");
assert.strictEqual(resolveSupportHours(" Mon-Sat, 9am to 7pm "), "Mon-Sat, 9am to 7pm", "configured hours must survive trimmed");

proveDetects(
  GUARD,
  "the resolver refuses the exact wa.me fallback literal that shipped six times",
  (v: string) => resolveSupportPhone(v) === null,
  "919999999999",
  "9812345670",
);
proveDetects(
  GUARD,
  "placeholder detection is STRUCTURAL — it catches a fake it was never shown",
  (v: string) => resolveSupportPhone(v) === null,
  "8888888888", // never enumerated anywhere; caught by shape
  "9812345670",
);

// ── §2 · SOURCE — no phone literal in the live customer tree ──
// Scoped to the LIVE tree only. apps/web/src is condemned (Ruling 2) and
// holds the original defect; convicting it here would make this guard
// unpassable and teach the reader to ignore it.
const LIVE_ROOTS = ["apps/web/app", "apps/web/components", "apps/web/lib"];

/** A 10-13 digit run that is not part of a longer token — i.e. a phone. */
const PHONE_LITERAL = /["'`]\s*\+?(?:91)?[6-9]\d{9}\s*["'`]/g;

/**
 * A FORM PLACEHOLDER IS NOT AN OPS CONTACT — the guard's own first run taught
 * it this. It convicted apps/web/app/login/page.tsx for
 * `placeholder="9876543210"`, which is a formatting hint inside a tel input:
 * nobody can dial it, nothing claims they can, and removing it would make the
 * field harder to fill. The law is about a number the PLATFORM offers as its
 * own, so the exclusion is structural — the attribute, not the file.
 */
function opsPhoneLiterals(src: string): string[] {
  const hits: string[] = [];
  for (const m of src.matchAll(PHONE_LITERAL)) {
    const before = src.slice(Math.max(0, (m.index ?? 0) - 24), m.index ?? 0);
    if (/placeholder\s*=\s*$/.test(before)) continue;
    hits.push(m[0]);
  }
  return hits;
}
/** The fallback shape itself: any env read that ?? or || into a string. */
const ENV_FALLBACK = /process\.env\.NEXT_PUBLIC_(?:SUPPORT_PHONE|SUPPORT_HOURS|WHATSAPP_NUMBER)\s*(?:\?\?|\|\|)/;

proveMatchers(GUARD, [
  [
    "an env read with a plausible-looking fallback",
    ENV_FALLBACK,
    'process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999"',
    'resolveSupportPhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE)',
  ],
]);
proveDetects(
  GUARD,
  "an ops phone written as a source literal",
  (s: string) => opsPhoneLiterals(s).length > 0,
  'const SUPPORT = "919999999999";',
  "const SUPPORT = resolveSupportPhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE);",
);
// The SAME DIGITS on both sides — so what this control proves is that the
// exclusion turns on the ATTRIBUTE and not on the number. A guard that let
// "9876543210" through everywhere would have been the lazy way to make its
// own first-run false positive disappear.
proveDetects(
  GUARD,
  "a tel-input placeholder is NOT convicted (the guard's own first-run false positive)",
  (s: string) => opsPhoneLiterals(s).length > 0,
  'const OPS_PHONE = "9876543210";',
  '<input type="tel" placeholder="9876543210" />',
);

const literalOffenders: string[] = [];
const fallbackOffenders: string[] = [];
let filesScanned = 0;
for (const root of LIVE_ROOTS) {
  for (const f of walk(join(REPO, root))) {
    const src = codeOnly(readFileSync(f, "utf8"));
    filesScanned++;
    const rel = f.replace(REPO, "").replace(/\\/g, "/");
    const hits = opsPhoneLiterals(src);
    if (hits.length > 0) literalOffenders.push(`${rel}  ${hits.join(" ")}`);
    if (ENV_FALLBACK.test(src)) fallbackOffenders.push(rel);
  }
}
proveSaw(GUARD, "live customer-tree files scanned", filesScanned);

assert.deepStrictEqual(
  literalOffenders,
  [],
  "THE OPS CONTACT IS AN ENV TRUTH (Ruling 1, 2026-08-02). These files write a phone\n" +
    "number as a source literal. Move it to NEXT_PUBLIC_SUPPORT_PHONE and read it through\n" +
    "resolveSupportPhone(), which returns null rather than a plausible-looking string:\n  " +
    literalOffenders.join("\n  "),
);
assert.deepStrictEqual(
  fallbackOffenders,
  [],
  "THE FALLBACK IS THE DEFECT, not the absence. `env ?? \"919999999999\"` renders a\n" +
    "live-looking control that dials nothing, and no one can tell by looking. Use\n" +
    "resolveSupportPhone() and gate the CONTROL's existence on null:\n  " +
    fallbackOffenders.join("\n  "),
);

// ── §3 · COUPLING — /help gates the control, not the href ─────
const HELP = join(REPO, "apps/web/app/help/page.tsx");
const helpRaw = readFileSync(HELP, "utf8");
const helpSrc = codeOnly(helpRaw);
proveSaw(GUARD, "help page chars read (comments stripped)", helpSrc.length);

assert.ok(
  /resolveSupportPhone\(\s*process\.env\.NEXT_PUBLIC_SUPPORT_PHONE\s*\)/.test(helpSrc),
  "/help must read the number through resolveSupportPhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE) " +
    "as a COMPLETE static member expression — Next inlines NEXT_PUBLIC_* textually, so a computed " +
    "process.env[key] resolves to undefined in the browser bundle.",
);

// THE LOAD-BEARING ASSERTION. The whole point of returning null is that the
// caller must decide whether the control EXISTS. `href={x ?? "#"}` and
// `disabled` both satisfy "handled the null case" while still putting a
// call affordance on screen for a line that does not exist.
const anchorBlocks = helpSrc.match(/<a\b[\s\S]*?>/g) ?? [];
proveSaw(GUARD, "anchor tags found on the help page", anchorBlocks.length || 1);
for (const a of anchorBlocks) {
  assert.ok(
    !/href=\{[^}]*\?\?\s*["'`]#["'`]/.test(a),
    `/help renders an anchor whose href falls back to "#". That is a live-looking control\n` +
      `that does nothing — the exact shape resolveSupportPhone() returns null to prevent:\n  ${a}`,
  );
}

const detectDeadCallControl = (src: string): boolean =>
  // a call affordance that survives when the number is absent: either a
  // disabled button, or a tel: built by interpolation from a nullable.
  /disabled[\s\S]{0,120}(?:Call|call us|tel:)/i.test(src) || /href=\{`tel:\$\{/.test(src);
proveDetects(
  GUARD,
  "a call control that survives the number being absent",
  detectDeadCallControl,
  '<button disabled className="...">Call us</button>',
  helpSrc,
);
assert.ok(
  !detectDeadCallControl(helpSrc),
  "/help must render NO call control when no number is configured. A greyed-out 'Call us' " +
    "asserts a phone line exists and is momentarily shut; none exists. The canon's " +
    "disabled-control law governs controls that ARE shut, not controls that are imaginary.",
);

// Hours may never render on their own — a staffed-hours caption with no line
// to call is a promise with no subject (the pandit app's 3am defect).
const hoursIdx = helpSrc.indexOf("{hours");
assert.ok(hoursIdx > -1, "/help must render the configured hours when they exist");
const supportGateIdx = helpSrc.indexOf("support ?");
assert.ok(
  supportGateIdx > -1 && supportGateIdx < hoursIdx,
  "the hours line must sit INSIDE the `support ?` branch — hours for a line that does not " +
    "exist is a promise with no subject.",
);

// The cancellation figures live on ONE page, which the payment-money guard
// pins to refund-policy.ts. A second unguarded copy is how 90/50/20/0 and
// 100/50/0 shipped at the same time.
for (const figure of ["100%", "50%", "90%", "20%", "7 days", "3-6 days"]) {
  assert.ok(
    !helpSrc.includes(figure),
    `/help restates the refund figure ${JSON.stringify(figure)}. Refund numbers live on ` +
      `app/(legal)/cancellation-policy/page.tsx ONLY, where payment-money.test.ts pins them ` +
      `to refund-policy.ts. Link to it; do not copy it.`,
  );
}

// Devanagari is a typographic accent the customer canon permits in exactly two
// places, and neither is a Help screen: "never instructions · never buttons ·
// never anything he must act on."
const devanagari = helpRaw.match(/[ऀ-ॿ]+/g) ?? [];
assert.deepStrictEqual(
  devanagari.filter((d) => !helpRaw.slice(0, helpRaw.indexOf("export const metadata")).includes(d)),
  [],
  `/help carries Devanagari outside the file header: ${devanagari.join(", ")}. The canon's ` +
    `turn-4 reversal is English-first for everything a customer must act on.`,
);

console.log(
  `support-contact guard ✅ — resolver executed on ${16} specimens (absent/placeholder/undialable/real/landline), ` +
    `${filesScanned} live customer files carry no phone literal and no env fallback, ` +
    `/help gates the CONTROL on null and restates no refund figure`,
);
