import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CITY_TO_LANG, LANG_TO_BCP47 } from "./languageDetect";
import { CITY_LANGUAGE_MAP } from "./onboarding-store";
import { LANG_CONFIRM } from "./strings-langconfirm";

// ─────────────────────────────────────────────────────────────
// SINGLE-SOURCE DETECT MAP (Isj ruling, 2026-07-25). Two hand-maintained
// city→language maps had diverged: the store's carried guwahati→Assamese —
// a detect result the app can neither confirm (no LANG_CONFIRM entry) nor
// speak (no bulbul voice) — while the confirm screen's map didn't know
// half the store's cities. Now languageDetect.CITY_TO_LANG is THE map and
// the store's CITY_LANGUAGE_MAP is derived from it. These guards pin:
//   1. every detect value is a SPEAKABLE language (confirm strings + TTS
//      code + voice all exist) — no map may point at a voiceless language;
//   2. the two exports agree on every city (derivation stays real);
//   3. the Assamese entry stays dead (guwahati detects nothing);
//   4. the store file contains no literal city table (source-scan).
// ─────────────────────────────────────────────────────────────

const SPEAKABLE_CODES = Object.keys(LANG_CONFIRM); // the 11 the app can confirm
const CODE_TO_NAME: Record<string, string> = {
  hi: "Hindi", mr: "Marathi", bn: "Bengali", ta: "Tamil", te: "Telugu",
  kn: "Kannada", gu: "Gujarati", pa: "Punjabi", ml: "Malayalam",
  or: "Odia", en: "English",
};

describe("detect map — one source, speakable-only values", () => {
  it("every CITY_TO_LANG value is a speakable code (confirm + TTS + voice exist)", () => {
    for (const [city, code] of Object.entries(CITY_TO_LANG)) {
      expect(SPEAKABLE_CODES, `${city} detects '${code}' — not in LANG_CONFIRM`).toContain(code);
      expect(LANG_TO_BCP47[code], `${city} → '${code}' has no TTS code`).toBeTruthy();
    }
  });

  it("CITY_LANGUAGE_MAP is CITY_TO_LANG, derived — same cities, agreeing values", () => {
    expect(Object.keys(CITY_LANGUAGE_MAP).sort()).toEqual(Object.keys(CITY_TO_LANG).sort());
    for (const [city, code] of Object.entries(CITY_TO_LANG)) {
      expect(CITY_LANGUAGE_MAP[city], `divergence at ${city}`).toBe(CODE_TO_NAME[code]);
    }
  });

  it("no voiceless language can be detected — the Assamese entry stays dead", () => {
    const voiceless = ["Assamese", "Bhojpuri", "Maithili", "Sanskrit"];
    for (const v of Object.values(CITY_LANGUAGE_MAP)) {
      expect(voiceless, `voiceless '${v}' re-entered the detect map`).not.toContain(v);
    }
    expect(CITY_LANGUAGE_MAP["guwahati"], "guwahati must detect NOTHING until Assamese is speakable").toBeUndefined();
  });

  it("the store holds no second literal city table (source-scan)", () => {
    const src = readFileSync(join(__dirname, "onboarding-store.ts"), "utf8");
    expect(src).toMatch(/Object\.entries\(CITY_TO_LANG\)/); // derivation present
    expect(src, "a re-literalized city table is the divergence coming back").not.toMatch(
      /varanasi:\s*['"]Hindi['"]/,
    );
  });
});
