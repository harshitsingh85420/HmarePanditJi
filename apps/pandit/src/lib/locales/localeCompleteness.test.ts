import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { LANGUAGES, enabledLanguages, DEFAULT_LANGUAGE, isEnabled, languageForState, ttsCodeFor } from "../languages";
import { hi } from "./hi";

// ─────────────────────────────────────────────────────────────
// PER-LOCALE COMPLETENESS GUARD. Written BEFORE any translation lands,
// so a half-translated locale can never ship.
//
// Laws pinned:
//   1. every ENABLED language has a locale file
//   2. that file has EVERY key hi.ts has, nested, with no empty values
//   3. a language may not be enabled without a real Sarvam voice
//      (voice-first law — the registry ceiling)
//   4. detection never yields a language that is not enabled
// ─────────────────────────────────────────────────────────────

/** every leaf key path in an object, e.g. "faq.items.0.q" */
function leafPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || obj === undefined) return [prefix];
  if (typeof obj !== "object") return [prefix];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object") out.push(...leafPaths(v, path));
    else out.push(path);
  }
  return out;
}

function valueAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc === null || acc === undefined || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
}

const canonicalPaths = leafPaths(hi);

describe("language registry", () => {
  it("has Hindi enabled as the default", () => {
    expect(isEnabled(DEFAULT_LANGUAGE)).toBe(true);
  });

  it("never enables a language without a real Sarvam voice (voice-first law)", () => {
    for (const l of LANGUAGES) {
      if (l.enabled) {
        expect(l.ttsCode, `${l.code} is enabled but has no Sarvam voice`).toBeTruthy();
      }
    }
  });

  it("every disabled language explains why", () => {
    for (const l of LANGUAGES) {
      if (!l.enabled) expect(l.note, `${l.code} is disabled with no reason given`).toBeTruthy();
    }
  });

  it("every language has a native name that is not its English name", () => {
    for (const l of LANGUAGES) {
      expect(l.nativeName.trim().length).toBeGreaterThan(0);
      if (l.code !== "en") {
        expect(l.nativeName, `${l.code} nativeName looks like a transliteration`).not.toBe(l.englishName);
      }
    }
  });

  it("codes are unique", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("detection", () => {
  it("never yields a language that is not enabled", () => {
    const states = [
      "Uttar Pradesh", "Maharashtra", "West Bengal", "Tamil Nadu", "Kerala",
      "Karnataka", "Gujarat", "Punjab", "Odisha", "Assam", "Bihar",
      "Nowhere At All", "", null, undefined,
    ];
    for (const s of states) {
      expect(isEnabled(languageForState(s as string)), `state "${s}" yielded a disabled language`).toBe(true);
    }
  });

  it("falls back to Hindi for an unknown state", () => {
    expect(languageForState("Atlantis")).toBe(DEFAULT_LANGUAGE);
  });

  it("always resolves a speakable TTS code", () => {
    for (const l of LANGUAGES) {
      expect(ttsCodeFor(l.code)).toMatch(/-IN$/);
    }
  });
});

describe("locale completeness — every enabled language", () => {
  it("the canonical locale is non-trivial", () => {
    expect(canonicalPaths.length).toBeGreaterThan(100);
  });

  for (const lang of enabledLanguages()) {
    it(`${lang.code} (${lang.nativeName}) has a locale file`, () => {
      const file = join(__dirname, `${lang.code}.ts`);
      expect(existsSync(file), `locales/${lang.code}.ts is missing but ${lang.code} is enabled`).toBe(true);
    });

    it(`${lang.code} (${lang.nativeName}) has every key, none empty`, async () => {
      const mod = await import(`./${lang.code}`);
      const locale = mod.default ?? mod[lang.code];
      expect(locale, `locales/${lang.code}.ts has no usable export`).toBeTruthy();

      const missing: string[] = [];
      const empty: string[] = [];
      for (const path of canonicalPaths) {
        const v = valueAt(locale, path);
        if (v === undefined) missing.push(path);
        else if (typeof v === "string" && v.trim() === "") empty.push(path);
      }
      expect(missing, `${lang.code} missing ${missing.length} key(s): ${missing.slice(0, 8).join(", ")}`).toEqual([]);
      expect(empty, `${lang.code} has ${empty.length} empty value(s): ${empty.slice(0, 8).join(", ")}`).toEqual([]);
    });
  }
});
