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

/* ── TWO AUDIENCES, TWO LAWS (Isj, 2026-07-31) ────────────────────────────
   THE BASELINE USED TO CONFLATE THEM, and that was a trap for the next
   reader: a shrink-only list of "violations" containing nine templates that
   are NOT violations, which someone would eventually "fix" and thereby
   break a settled ruling.

   · PANDIT-facing  → the no-roman law. Devanagari, आप, कीजिए.
   · CUSTOMER-facing → the OPPOSITE and DELIBERATE customer-app ruling:
     English-first, ritual vocabulary in roman, Devanagari as typographic
     accent only. These are NOT violations and are NOT listed below.
   · ADMIN-facing   → NO LAW GOVERNS IT. Stated, not assumed: no ruling in
     this campaign has ever covered ops-facing copy. CANCELLATION_REQUESTED
     is the only one, it is English, and it is left alone until Isj rules.

   HOW AUDIENCE WAS DETERMINED — and the honest correction: THE TEMPLATES
   CARRY NO AUDIENCE FIELD. getNotificationTemplate returns only
   {title, message, smsMessage}; nothing in the file says who reads it.
   Audience is knowable ONLY from the 23 call sites — whether notify() is
   handed booking.customerId or a panditProfile's userId. That is a
   READING of the call graph, recorded here so the next person re-reads it
   rather than trusting this list. It is also a finding in itself: the file
   that decides what a pandit reads does not know it is talking to a pandit.
   ─────────────────────────────────────────────────────────────────────── */

/** PANDIT-facing and still roman. SHRINK ONLY: removed when rewritten; a
 *  NEW roman pandit template fails immediately; a listed one that becomes
 *  compliant fails until its name is removed. */
const ROMAN_BASELINE = new Set([
  "NEW_BOOKING_REQUEST",          // notify(userId: pandit) — the earning alert
  "BOOKING_CONFIRMED_ACK",        // notify(userId: req.user.id, the pandit accepting)
  "TRAVEL_BOOKED_PANDIT",         // notify(userId: pandit) — his own travel
  "PUJA_COMPLETED_PANDIT",        // notify(userId: pandit) — payout queued
  "PAYOUT_COMPLETED",             // notify(userId: pandit) — MONEY, ₹ in his account
  "CANCELLATION_APPROVED_PANDIT", // notify(userId: cancelPanditUserId)
  "REVIEW_RECEIVED",              // notify(userId: pandit) — his review
]);

/** CUSTOMER-facing: governed by the customer-app ruling (English-first).
 *  Listed for the reader, asserted only to be EXCLUDED from the no-roman
 *  law — never as violations. */
const CUSTOMER_TEMPLATES = new Set([
  "BOOKING_CREATED", "BOOKING_CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE",
  "PUJA_COMPLETED", "PAYMENT_CAPTURED", "CANCELLATION_APPROVED", "REVIEW_REMINDER",
  // NAMED FOR ITS SUBJECT, NOT ITS READER: PANDIT_ARRIVED notifies
  // existing.customerId (booking.routes.ts:347) — it tells the YAJMAN that
  // the pandit has arrived. I had placed it pandit-facing on the strength of
  // its name; the call site says otherwise. The name is the trap.
  "PANDIT_ARRIVED",
]);

/** ADMIN-facing: no law. Untouched until Isj rules. */
const ADMIN_TEMPLATES = new Set(["CANCELLATION_REQUESTED"]);

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
  if (CUSTOMER_TEMPLATES.has(f.caseName)) continue; // different, deliberate ruling
  if (ADMIN_TEMPLATES.has(f.caseName)) continue;    // no law governs ops copy
  if (ROMAN_BASELINE.has(f.caseName)) continue;     // pandit-facing, ruled, awaiting the copy pass
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
    `Devanagari; ${ROMAN_BASELINE.size} pandit-facing awaiting the copy pass (shrink-only); ` +
    `${CUSTOMER_TEMPLATES.size} customer templates excluded by the customer-app ruling; ` +
    `${ADMIN_TEMPLATES.size} admin template ungoverned)`,
);
