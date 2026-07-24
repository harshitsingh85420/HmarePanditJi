import { describe, it, expect } from "vitest";
import { LANG_CONFIRM } from "./strings-langconfirm";

// ─────────────────────────────────────────────────────────────
// MULTI-LANGUAGE REGISTER LAW (founder directive, 2026-07-24) — the Hindi
// register law (आप-forms, -इए, no तुम/करो) extended to every language the
// app renders or speaks. The bar is the SHISHYA bar: a disciple addressing
// a guru — the most reverential natural form each language has (Marathi
// आपण + -आवे optatives, Bengali আপনি, Tamil நீங்கள்/-ங்கள், Telugu మీరు,
// Gujarati આપ, Kannada ನೀವು, Malayalam താങ്കൾ, Punjabi ਤੁਸੀਂ + ਜੀ,
// Odia ଆପଣ; English realizes it lexically: "please"/"kindly"/"Certainly").
//
// Each language's deny-list holds its तुम/करो equivalents — the casual or
// neutral pronoun/imperative forms that must never ship in app voice. The
// lists were built by the 11-language audit (qa-sweep-log PAGE 4 ride-along)
// and are checked against the RUNTIME values of LANG_CONFIRM, so a future
// string edit cannot ship casual register in any language.
//
// JS regex note: \b is ASCII-only — useless on Indic scripts. Boundaries
// here are explicit ([\s…] / lookahead) so the patterns actually bite.
// PROVEN-TO-FAIL: every pre-audit defect string trips its pattern (e.g.
// mr "तुम्हाला…", "निवडा", pa "ਚੁਣੋ" without ਜੀ, ml "നിങ്ങൾ", gu "તમે",
// en "Great!") — restore any of them and this file turns red.
// ─────────────────────────────────────────────────────────────

const END = "(?=[\\s,.!?।…—)\\]'\"]|$)"; // shared right-boundary for Indic tokens

const DENY: Record<string, { pattern: RegExp; means: string }[]> = {
  hi: [
    { pattern: new RegExp(`(^|[\\s('"—])तुम${END}`, "u"), means: "तुम (casual pronoun)" },
    { pattern: /तुम्हार/u, means: "तुम्हारा-forms" },
    { pattern: new RegExp(`करो${END}`, "u"), means: "करो (casual imperative)" },
  ],
  mr: [
    { pattern: /तुम्ह|तुमच|तुझ|तुला/u, means: "तुम्ही/तू-register (bar is आपण)" },
    { pattern: new RegExp(`(^|[\\s('"—])तू${END}`, "u"), means: "तू" },
    { pattern: new RegExp(`(निवडा|थांबा|करा|बोला|पहा|घ्या|म्हणा)${END}`, "u"), means: "bare imperative (bar is the -आवे optative)" },
  ],
  bn: [
    { pattern: /তুমি|তোমা|তুই|তোকে|তোদের/u, means: "তুমি/তুই-register (bar is আপনি)" },
    { pattern: /তোর(?!ণ)/u, means: "তোর (তোরণ exempt)" },
    { pattern: new RegExp(`করো${END}`, "u"), means: "করো (casual imperative)" },
  ],
  ta: [
    { pattern: /(^|[\s('"—])நீ(?=[\s,.!?…]|$)|உன்னை|உனக்கு|உனது|உன்னுடைய|உன்னிடம்/u, means: "நீ/உன்-register (bar is நீங்கள்)" },
    { pattern: /(^|[\s('"—])உன்(?=\s)/u, means: "உன்" },
  ],
  te: [
    { pattern: /నువ్వు|నీవు|నిన్ను|నీకు|నీతో|నీది/u, means: "నువ్వు-register (bar is మీరు)" },
  ],
  kn: [
    { pattern: /ನೀನು|ನಿನ್ನ|ನಿನಗ/u, means: "ನೀನು-register (bar is ನೀವು)" },
    { pattern: new RegExp(`(ಮಾಡು|ನೋಡು|ಹೇಳು|ಬಾ)${END}`, "u"), means: "bare imperative (bar is -ಇರಿ/-ಿ hon.)" },
  ],
  gu: [
    { pattern: /તમે|તમને|તમાર/u, means: "તમે-register (bar is આપ)" },
    { pattern: new RegExp(`(^|[\\s('"—])(તું|તને)${END}`, "u"), means: "તું" },
    { pattern: new RegExp(`(^|[\\s('"—])કર${END}`, "u"), means: "કર (casual imperative)" },
  ],
  pa: [
    { pattern: /ਤੂੰ|ਤੈਨੂੰ|ਤੈਥੋਂ|ਤੇਰਾ|ਤੇਰੀ|ਤੇਰੇ/u, means: "ਤੂੰ-register (bar is ਤੁਸੀਂ + ਜੀ)" },
    { pattern: /ਚੁਣੋ(?!\s*ਜੀ)/u, means: "bare ਚੁਣੋ without the ਜੀ particle" },
    { pattern: /ਵਧੀਆ!/u, means: "bare ਵਧੀਆ! (deferential form is ਵਧੀਆ ਜੀ!)" },
  ],
  ml: [
    { pattern: /നിങ്ങ|നിന്റെ|നിനക്ക്/u, means: "നിങ്ങൾ/നീ-register (bar is താങ്കൾ)" },
    { pattern: /(^|[\s('"—])നീ(?=[\s,.!?…]|$)/u, means: "നീ" },
    { pattern: /എടാ|എടീ|എടോ/u, means: "vocative എടാ/എടീ (never)" },
    { pattern: /കൊള്ളാം/u, means: "കൊള്ളാം (casual appraisal)" },
  ],
  or: [
    { pattern: /ତୁମ|ତୋର|ତୋତେ/u, means: "ତୁମେ/ତୁ-register (bar is ଆପଣ)" },
    { pattern: new RegExp(`(^|[\\s('"—])ତୁ${END}`, "u"), means: "ତୁ" },
  ],
  en: [
    { pattern: /\b(hey|wanna|gonna|gotta|gimme|lemme|yeah|yep|nope|dude|buddy|pls|plz|thx)\b/i, means: "casual token" },
    { pattern: /\b(thou|thee|thy)\b/i, means: "archaic T-form (the तुम equivalent)" },
    { pattern: /Great!/, means: "peer interjection (deferential form is Certainly!)" },
  ],
};

describe("register law — every language at the shishya bar", () => {
  for (const [code, rules] of Object.entries(DENY)) {
    const block = LANG_CONFIRM[code as keyof typeof LANG_CONFIRM];
    it(`${code}: no casual/neutral form in any app-voice string`, () => {
      expect(block, `LANG_CONFIRM.${code} must exist`).toBeTruthy();
      for (const [field, value] of Object.entries(block)) {
        for (const { pattern, means } of rules) {
          expect(
            pattern.test(value),
            `${code}.${field} "${value}" trips the deny-list: ${means}`,
          ).toBe(false);
        }
      }
    });
  }

  it("covers every language the app can confirm (no silent gap as languages are added)", () => {
    const covered = new Set(Object.keys(DENY));
    const missing = Object.keys(LANG_CONFIRM).filter((c) => !covered.has(c));
    expect(
      missing,
      `language(s) ${missing.join(", ")} have LANG_CONFIRM strings but no register deny-list — add one (see the audit in docs/review/qa-sweep-log.md PAGE 4)`,
    ).toEqual([]);
  });
});
