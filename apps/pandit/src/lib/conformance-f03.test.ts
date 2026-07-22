import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LANGUAGES,
  STATE_TO_LANGUAGE,
  languageForState,
  isEnabled,
  enabledLanguages,
  getLanguage,
  DEFAULT_LANGUAGE,
} from "./languages";
import { detectLanguage, LANG_TO_BCP47, LANG_NATIVE_NAME } from "./languageDetect";
import { LANG_CONFIRM } from "./strings-langconfirm";

// ─────────────────────────────────────────────────────────────
// CONFORMANCE PINS — F03-01, F03-02, F03-03 (language detection,
// the confirm ceremony, and the manual override list).
//
// These tests FREEZE WHAT IS TRUE TODAY. They are not aspirational.
// Where the register records a 🟡 partial, the gap is pinned too, with
// a comment saying so — closing the gap must fail here and force the
// register (docs/pandit-pov-conformance-register.md) to be updated.
// ─────────────────────────────────────────────────────────────

const ONBOARDING_SRC = readFileSync(
  join(__dirname, "..", "app", "onboarding", "page.tsx"),
  "utf-8",
);
const LANG_LIST_SRC = readFileSync(
  join(__dirname, "..", "app", "onboarding", "screens", "LanguageListScreen.tsx"),
  "utf-8",
);
const SARVAM_SRC = readFileSync(join(__dirname, "sarvam-tts.ts"), "utf-8");

/** The real TTS ceiling: the SarvamLanguageCode union, parsed from source.
 *  Types are erased at runtime, so reading the union is the only honest way
 *  to assert the registry never claims a voice Sarvam does not have. */
function sarvamUnionCodes(): string[] {
  const m = SARVAM_SRC.match(/export type SarvamLanguageCode\s*=([\s\S]*?);/);
  if (!m) throw new Error("SarvamLanguageCode union not found in sarvam-tts.ts");
  return [...m[1].matchAll(/'([a-z]{2}-IN)'/g)].map((x) => x[1]);
}

/** Body of the ONLY function that writes the language, sliced out of
 *  page.tsx so we can prove nothing outside it writes a language. */
function runLanguageSwitchBody(): string {
  const start = ONBOARDING_SRC.indexOf("const runLanguageSwitch");
  expect(start).toBeGreaterThan(-1);
  const end = ONBOARDING_SRC.indexOf("\n  const ", start + 10);
  expect(end).toBeGreaterThan(start);
  return ONBOARDING_SRC.slice(start, end);
}

// ─────────────────────────────────────────────────────────────
describe("F03-01 — location → default language via the state map", () => {
  it("F03-01: every STATE_TO_LANGUAGE value is a code that exists in the registry", () => {
    const codes = new Set(LANGUAGES.map((l) => l.code));
    for (const [state, code] of Object.entries(STATE_TO_LANGUAGE)) {
      expect(codes, `${state} → ${code} is not a registry language`).toContain(code);
    }
    // the map is real, not a stub
    expect(Object.keys(STATE_TO_LANGUAGE).length).toBeGreaterThanOrEqual(30);
  });

  it("F03-01: the raw map carries the regional intent (Maharashtra→mr, Tamil Nadu→ta, Bihar→hi)", () => {
    expect(STATE_TO_LANGUAGE["Uttar Pradesh"]).toBe("hi");
    expect(STATE_TO_LANGUAGE["Maharashtra"]).toBe("mr");
    expect(STATE_TO_LANGUAGE["Tamil Nadu"]).toBe("ta");
    expect(STATE_TO_LANGUAGE["Kerala"]).toBe("ml");
    expect(STATE_TO_LANGUAGE["Punjab"]).toBe("pa");
    // Bhojpuri/Maithili have no Sarvam voice, so the belt maps to Hindi
    expect(STATE_TO_LANGUAGE["Bihar"]).toBe("hi");
    // Assam's language has no voice either — mapped honestly to Hindi
    expect(STATE_TO_LANGUAGE["Assam"]).toBe("hi");
  });

  it("F03-01: languageForState DOWNGRADES to Hindi when the mapped language is not enabled (voice-first law)", () => {
    // Maharashtra maps to Marathi in the raw map, but Marathi is not enabled,
    // so detection must NOT hand the pandit a language the app cannot serve.
    expect(STATE_TO_LANGUAGE["Maharashtra"]).toBe("mr");
    expect(isEnabled("mr")).toBe(false);
    expect(languageForState("Maharashtra")).toBe("hi");

    // The invariant, stated generally: whatever the map says, the RESULT is
    // always an enabled language.
    for (const state of Object.keys(STATE_TO_LANGUAGE)) {
      expect(isEnabled(languageForState(state)), `${state} yielded a disabled language`).toBe(true);
    }
  });

  it("F03-01: unknown / empty / null state falls back to the default (Hindi), and keys are trimmed", () => {
    expect(languageForState(null)).toBe(DEFAULT_LANGUAGE);
    expect(languageForState(undefined)).toBe(DEFAULT_LANGUAGE);
    expect(languageForState("")).toBe(DEFAULT_LANGUAGE);
    expect(languageForState("Atlantis")).toBe(DEFAULT_LANGUAGE);
    expect(languageForState("  Maharashtra  ")).toBe(languageForState("Maharashtra"));
    expect(DEFAULT_LANGUAGE).toBe("hi");
  });

  it("F03-01: the map is case-SENSITIVE — geocoder casing other than the stored key misses (documents current behaviour)", () => {
    // Not a desired property; STATE_TO_LANGUAGE is keyed on Nominatim's exact
    // English names and languageForState only trims. Change the lookup to be
    // case-insensitive and this test must be updated deliberately.
    expect(STATE_TO_LANGUAGE["maharashtra"]).toBeUndefined();
    expect(languageForState("MAHARASHTRA")).toBe(DEFAULT_LANGUAGE);
  });

  it("F03-01: KNOWN GAP — with only Hindi enabled, languageForState collapses EVERY state to Hindi", () => {
    // GAP, not a desired property. The register's example (Madurai→Tamil)
    // cannot hold while every non-Hindi registry row is enabled:false.
    // Enabling a second language will fail this test — update the register
    // (F03-01) when it does.
    const results = new Set(Object.keys(STATE_TO_LANGUAGE).map(languageForState));
    expect([...results]).toEqual(["hi"]);
    expect(enabledLanguages().map((l) => l.code)).toEqual(["hi"]);
  });

  it("F03-01: KNOWN GAP — the LIVE detect path (languageDetect) does not consult the registry's enabled flag", () => {
    // GAP. languages.ts:languageForState is the safe mapper, but the
    // onboarding flow calls detectLanguage() from languageDetect.ts, which has
    // its own city/state maps and no isEnabled() check — so it can propose a
    // language the registry marks enabled:false.
    expect(detectLanguage("madurai", "Tamil Nadu")).toBe("ta");
    expect(isEnabled("ta")).toBe(false);
    expect(detectLanguage("varanasi", "Uttar Pradesh")).toBe("hi");
    // city wins over state when both are known
    expect(detectLanguage("mumbai", "Uttar Pradesh")).toBe("mr");
    // unknown → Hindi
    expect(detectLanguage("Atlantis", "Atlantis")).toBe("hi");
    expect(detectLanguage()).toBe("hi");
  });
});

// ─────────────────────────────────────────────────────────────
describe("F03-02 — detection is a PROMPT, never a silent auto-set", () => {
  it("F03-02: runLanguageSwitch is the ONLY writer of the language", () => {
    const body = runLanguageSwitchBody();
    const writes = [...ONBOARDING_SRC.matchAll(/store\.set(?:Preferred)?Language\(/g)];
    expect(writes.length).toBeGreaterThan(0);
    for (const w of writes) {
      const inside = w.index! >= ONBOARDING_SRC.indexOf(body) &&
        w.index! < ONBOARDING_SRC.indexOf(body) + body.length;
      expect(inside, `a language write at index ${w.index} lives outside runLanguageSwitch`).toBe(true);
    }
  });

  it("F03-02: granting location only records the place and routes to LANGUAGE_CONFIRM — it never sets a language", () => {
    const start = ONBOARDING_SRC.indexOf("onGranted={(city, state) => {");
    expect(start).toBeGreaterThan(-1);
    const handler = ONBOARDING_SRC.slice(start, ONBOARDING_SRC.indexOf("}}", start));
    expect(handler).toContain("store.setDetectedCity(city, state)");
    expect(handler).toContain('goto("LANGUAGE_CONFIRM")');
    expect(handler).not.toMatch(/setLanguage\(|setPreferredLanguage\(|runLanguageSwitch\(/);
  });

  it("F03-02: the switch is reachable ONLY from the explicit हाँ and the explicit list pick", () => {
    // the definition is `const runLanguageSwitch = async (code…)`, so a
    // `runLanguageSwitch(` match is always a CALL — there are exactly two.
    const calls = [...ONBOARDING_SRC.matchAll(/runLanguageSwitch\(/g)];
    expect(calls.length).toBe(2);
    expect(ONBOARDING_SRC).toMatch(/const runLanguageSwitch = async \(code: LangCode\)/);
    // …and the confirm screen's हाँ is one of them
    const yes = ONBOARDING_SRC.slice(
      ONBOARDING_SRC.indexOf("onYes={() => {"),
      ONBOARDING_SRC.indexOf("onOther={"),
    );
    expect(yes).toContain("runLanguageSwitch(detectedCode)");
    // the detected code is computed for RENDER, and handed to the confirm screen
    expect(ONBOARDING_SRC).toMatch(/const detectedCode = detectLanguage\(detectedCity, detectedState\)/);
    expect(ONBOARDING_SRC).toMatch(/<LangConfirmScreen2[\s\S]{0,80}code=\{detectedCode\}/);
  });

  it("F03-02: the prompt is answerable both ways — a यह-भाषा-ठीक button and a 'दूसरी भाषा' escape, per language", () => {
    for (const [code, s] of Object.entries(LANG_CONFIRM)) {
      expect(s.confirmQuestion.length, `${code} has no confirm question`).toBeGreaterThan(10);
      expect(s.yesLabel.length, `${code} has no yes label`).toBeGreaterThan(2);
      expect(s.otherLabel.length, `${code} has no escape label`).toBeGreaterThan(2);
      // it must READ as a question, not as a statement of a done deed
      expect(s.confirmQuestion, `${code}'s prompt is not a question`).toMatch(/[?？]$/);
    }
    expect(LANG_CONFIRM.hi.otherLabel).toBe("दूसरी भाषा चुनिए");
  });

  it("F03-02: KNOWN GAP — the detected CITY is never named in the prompt", () => {
    // GAP, not a desired property. The doc requires
    //   "आपके शहर [X] के हिसाब से हम [भाषा] सेट कर रहे हैं…"
    // Today Hindi says only "your region", and there is no city slot at all on
    // LangConfirmStrings, so nothing could interpolate [X]. Closing the gap
    // must fail this test — then update the register (F03-02).
    const iface = readFileSync(join(__dirname, "strings-langconfirm.ts"), "utf-8");
    const shape = iface.slice(
      iface.indexOf("export interface LangConfirmStrings"),
      iface.indexOf("export const LANG_CONFIRM"),
    );
    expect(shape).not.toMatch(/\b(city|place|shahar|location)\b/i);

    for (const [code, s] of Object.entries(LANG_CONFIRM)) {
      expect(s.confirmQuestion, `${code} interpolates something`).not.toMatch(/\{|\[X\]/);
      expect(s.confirmQuestion, `${code} names a city`).not.toMatch(/शहर/);
    }
    // today's string shape: Hindi says "क्षेत्र" (region), city-less
    expect(LANG_CONFIRM.hi.confirmQuestion).toBe(
      "हमने आपके क्षेत्र की भाषा हिन्दी पहचानी — इसी में चलें या बदलें?",
    );
  });

  it("F03-02: KNOWN GAP — only the Hindi line mentions detection at all", () => {
    // GAP. The other ten just ask "would you like <language>?", so a pandit
    // outside the Hindi belt is never told the suggestion came from location.
    const mentionsDetection = Object.entries(LANG_CONFIRM).filter(([, s]) =>
      /पहचान|क्षेत्र/.test(s.confirmQuestion),
    );
    expect(mentionsDetection.map(([c]) => c)).toEqual(["hi"]);
  });
});

// ─────────────────────────────────────────────────────────────
describe("F03-03 — manual override list = registry ∩ TTS-supported", () => {
  /** the codes actually offered on the override screen, read from its TILES */
  const tileCodes = (() => {
    const block = LANG_LIST_SRC.slice(
      LANG_LIST_SRC.indexOf("const TILES:"),
      LANG_LIST_SRC.indexOf("export default function LanguageListScreen"),
    );
    return [...block.matchAll(/code:\s*"([a-z]{2})"/g)].map((m) => m[1]);
  })();

  it("F03-03: the override list is exactly the registry rows that have a real Sarvam voice", () => {
    const withVoice = LANGUAGES.filter((l) => l.ttsCode !== null).map((l) => l.code);
    expect(tileCodes.length).toBe(11);
    expect([...tileCodes].sort()).toEqual([...withVoice].sort());
  });

  it("F03-03: VOICE-FIRST LAW — no voiceless language is offered, and none is enabled", () => {
    const voiceless = LANGUAGES.filter((l) => l.ttsCode === null).map((l) => l.code);
    // the registry really does carry voiceless rows (so this is not vacuous)
    expect(voiceless).toEqual(expect.arrayContaining(["bho", "mai", "as", "sa"]));
    for (const code of voiceless) {
      expect(tileCodes, `${code} is offered without a Sarvam voice`).not.toContain(code);
      expect(isEnabled(code), `${code} is enabled without a Sarvam voice`).toBe(false);
      // and a voiceless row must say WHY, so the gap stays visible
      expect(getLanguage(code)!.note, `${code} has no reason recorded`).toBeTruthy();
    }
    // the law, stated positively: nothing enabled without a voice
    for (const l of enabledLanguages()) {
      expect(l.ttsCode, `${l.code} is enabled with no Sarvam voice`).not.toBeNull();
    }
  });

  it("F03-03: every registry ttsCode is a code Sarvam actually accepts", () => {
    const union = sarvamUnionCodes();
    expect(union.length).toBe(11);
    for (const l of LANGUAGES) {
      if (l.ttsCode === null) continue;
      expect(union, `${l.code} claims ${l.ttsCode}, not in the Sarvam union`).toContain(l.ttsCode);
    }
  });

  it("F03-03: every offered tile can be spoken, named and confirmed in its own language", () => {
    for (const code of tileCodes) {
      const entry = getLanguage(code);
      expect(entry, `${code} is offered but has no registry row`).toBeTruthy();
      expect(entry!.ttsCode, `${code} is offered with no Sarvam voice`).not.toBeNull();
      expect(LANG_TO_BCP47[code as keyof typeof LANG_TO_BCP47], `${code} has no BCP-47`).toBeTruthy();
      expect(LANG_NATIVE_NAME[code as keyof typeof LANG_NATIVE_NAME], `${code} has no native name`).toBeTruthy();
      expect(LANG_CONFIRM[code as keyof typeof LANG_CONFIRM], `${code} has no confirm strings`).toBeTruthy();
    }
    // each tile also carries spoken aliases, so the list is voice-selectable
    const spokenArrays = [...LANG_LIST_SRC.matchAll(/spoken:\s*\[/g)];
    expect(spokenArrays.length).toBe(tileCodes.length);
  });

  it("F03-03: KNOWN GAP — the override list offers 11 languages while the registry enables 1", () => {
    // GAP, not a desired property. The screen and languages.ts disagree:
    // LanguageListScreen offers every voice-capable language, but only Hindi
    // has a complete locale file (the rest are enabled:false and land on
    // runLanguageSwitch's fallbackNotice path if their bundle fails).
    // Ship a locale file and this test must be updated with the register.
    expect(enabledLanguages().map((l) => l.code)).toEqual(["hi"]);
    const offeredButDisabled = tileCodes.filter((c) => !isEnabled(c));
    expect(offeredButDisabled.length).toBe(10);
    // the honesty valve that makes the gap survivable: a spoken notice in the
    // target language, and the app stays in Hindi
    expect(ONBOARDING_SRC).toMatch(/fallbackNotice/);
    for (const code of offeredButDisabled) {
      expect(LANG_CONFIRM[code as keyof typeof LANG_CONFIRM].fallbackNotice.length).toBeGreaterThan(10);
    }
  });
});
