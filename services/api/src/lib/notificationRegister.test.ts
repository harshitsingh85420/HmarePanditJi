import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { proveMatchers, proveSaw } from "./g2";

// ─────────────────────────────────────────────────────────────
// NOTIFICATION TEMPLATES ARE PANDIT-FACING COPY. THE NO-ROMAN LAW APPLIES.
//
// Found 2026-07-31, one message too late: the FIRST HONEST VERIFIED in this
// product's history was announced as
//
//     🎉 Badhai ho! Aapki profile verify ho gayi.
//
// — roman transliteration, in-app AND by SMS, to a reader who reads
// Devanagari. Every register guard in this repo inspects strings IN THE
// REPO; these strings were in the repo the whole time and no guard was
// pointed at this file. The preset rejection reasons were moved into
// packages/types precisely so guards could see that kind of string; the
// notification templates were never given the same treatment.
//
// STRONGER THAN THE FOUC, which was promoted from queue item to defect
// under this same law: the FOUC was a flash on a screen. This is a message
// delivered to a real person's phone, and every verified pandit after him
// receives it.
//
// THE CENSUS THAT FOLLOWED IS THE REASON FOR THE RATCHET: all NINETEEN
// templates were roman or English — not two, all of them. Failing the
// build on all nineteen would block every push until a copy pass that is
// Isj's to rule on, so the two RULED templates are enforced now and the
// remaining seventeen are named in ROMAN_BASELINE, which may only SHRINK.
// ─────────────────────────────────────────────────────────────

console.log("Running notification-register guard (Devanagari, आप/कीजिए)…");

const SRC = readFileSync(
  join(__dirname, "..", "services", "notification-templates.ts"),
  "utf8",
);

/** Cases still carrying roman copy on 2026-07-31. SHRINK ONLY: a name is
 *  removed when that template is rewritten; a NEW roman template fails
 *  immediately, and a listed template that becomes compliant fails until its
 *  name is removed, so the list is always the truth. */
const ROMAN_BASELINE = new Set([
  "BOOKING_CREATED",
  "NEW_BOOKING_REQUEST",
  "BOOKING_CONFIRMED",
  "BOOKING_CONFIRMED_ACK",
  "TRAVEL_BOOKED",
  "TRAVEL_BOOKED_PANDIT",
  "PANDIT_EN_ROUTE",
  "PANDIT_ARRIVED",
  "PUJA_COMPLETED",
  "PUJA_COMPLETED_PANDIT",
  "PAYMENT_CAPTURED",
  "PAYOUT_COMPLETED",
  "CANCELLATION_REQUESTED",
  "CANCELLATION_APPROVED",
  "CANCELLATION_APPROVED_PANDIT",
  "REVIEW_RECEIVED",
  "REVIEW_REMINDER",
]);

const DEVANAGARI = /[ऀ-ॿ]/;
// NO \b — JavaScript's word boundary is defined on ASCII word characters, so
// /\bतुम\b/ can NEVER match Devanagari text. The G2 control below caught this
// on the guard's very first run, and the SAME broken pattern was already
// shipped in verificationQueues.test.ts, where it had been silently matching
// nothing since 2026-07-30. Devanagari has no case and no ASCII boundary;
// plain containment is the honest test.
const REGISTER_BREAK = /तुम|करो/;
/** Roman WORDS only. Interpolations, booking ids, the rupee sign and emoji
 *  are not copy — strip them before judging, or every template with an
 *  `HPJ-${id}` would read as roman forever. */
function romanWords(s: string): string[] {
  const stripped = s
    .replace(/\$\{[^}]*\}/g, " ")
    .replace(/HPJ-?/g, " ")
    .replace(/[^\p{L}\s]/gu, " ");
  return [...stripped.matchAll(/[A-Za-z]{2,}/g)].map((m) => m[0]);
}

interface Field { caseName: string; field: string; text: string }
const fields: Field[] = [];
{
  let current: string | null = null;
  for (const line of SRC.split("\n")) {
    const c = /case '([A-Z_]+)':/.exec(line);
    if (c) { current = c[1]; continue; }
    const m = /^\s*(title|message|smsMessage):\s*[`"']([^`"'\n]*)/.exec(line);
    if (m && current) fields.push({ caseName: current, field: m[1], text: m[2] });
  }
}
// ADJUDICATED NOUN — template strings actually judged. "File read" is
// upstream: it stays non-zero if this parser stops matching and then
// "0 roman templates" would mean "0 templates seen".
proveSaw("notificationRegister", "template strings JUDGED for script/register", fields.length);
assert.ok(
  fields.length >= 40,
  `only ${fields.length} template fields parsed — the case/field reader has rotted, and every ` +
    `verdict below would be about nothing`,
);

const offenders: string[] = [];
const staleBaseline = new Set(ROMAN_BASELINE);
for (const f of fields) {
  const roman = romanWords(f.text);
  const compliant = roman.length === 0 && (f.field === "title" ? DEVANAGARI.test(f.text) : DEVANAGARI.test(f.text));
  if (compliant) continue;
  staleBaseline.delete(f.caseName);
  if (ROMAN_BASELINE.has(f.caseName)) continue; // known, ruled, awaiting the copy pass
  offenders.push(`${f.caseName}.${f.field}  →  ${f.text.slice(0, 60)}  [roman: ${roman.slice(0, 4).join(" ")}]`);
}

assert.deepStrictEqual(
  offenders, [],
  "notification templates carrying ROMAN copy to a Devanagari-only reader:\n  " +
    offenders.join("\n  ") +
    "\nThese are delivered to a phone, in-app and by SMS. Write them in Devanagari, आप and " +
    "कीजिए — the same register the preset rejection reasons live under. (Adding to " +
    "ROMAN_BASELINE is not an option: the list only shrinks.)",
);
assert.deepStrictEqual(
  [...staleBaseline], [],
  `these are listed in ROMAN_BASELINE but are now compliant — remove them in the same commit, ` +
    `or the list stops being the truth:\n  ${[...staleBaseline].join("\n  ")}`,
);

// ── THE TWO RULED TEMPLATES, pinned positively ────────────────
for (const c of ["VERIFICATION_APPROVED", "VERIFICATION_REJECTED"]) {
  assert.ok(!ROMAN_BASELINE.has(c), `${c} must never be excused by the baseline — it is ruled`);
  const mine = fields.filter((f) => f.caseName === c);
  assert.ok(mine.length >= 3, `${c}: expected title+message+smsMessage, found ${mine.length}`);
  for (const f of mine) {
    assert.ok(DEVANAGARI.test(f.text), `${c}.${f.field} is not Devanagari: ${f.text.slice(0, 50)}`);
    assert.deepStrictEqual(romanWords(f.text), [], `${c}.${f.field} still carries roman words`);
    // REGISTER, not just script: आप and कीजिए, to a man usually older than us.
    assert.ok(!REGISTER_BREAK.test(f.text), `${c}.${f.field} uses तुम/करो — the register is आप and कीजिए`);
  }
}

// ── G2 · THE SPECIMEN IS THE REAL REGRESSION ─────────────────
// Not a cleaner invention: the exact string that reached the first verified
// pandit's phone, and the exact rejection line beside it. The clean
// specimens are the Devanagari replacements now in the file.
proveMatchers("notificationRegister", [
  ["the Badhai-ho approval line that shipped", /[A-Za-z]{2,}/,
    "🎉 Badhai ho! Aapki profile verify ho gayi. Ab aap booking le sakte hain. -HmarePanditJi",
    "🎉 बधाई हो! आपकी पहचान सत्यापित हो गई है। — हमारे पंडित जी"],
  ["the roman rejection line beside it", /[A-Za-z]{2,}/,
    "⚠️ Verification update: reason. Kripya dobara koshish karein. -HmarePanditJi",
    "⚠️ कृपया दोबारा भेजिए — दोबारा भेजना आसान है। — हमारे पंडित जी"],
  ["the तुम/करो register break", REGISTER_BREAK,
    "तुम अपना आधार दोबारा भेजो", "कृपया अपना आधार दोबारा भेजिए"],
]);
// and the stripper must not turn an interpolated Devanagari line into a
// false roman positive — the shape every real template has.
assert.deepStrictEqual(
  romanWords("🎉 बधाई हो! HPJ-${data.id} — ₹${data.amount} — हमारे पंडित जी"),
  [],
  "the interpolation/booking-id stripper has rotted: a compliant Devanagari line reads as roman",
);

console.log(
  `✓ notification-register guard passed (${fields.length} strings judged; 2 ruled templates ` +
    `Devanagari; ${ROMAN_BASELINE.size} awaiting the copy pass, list may only shrink)`,
);
