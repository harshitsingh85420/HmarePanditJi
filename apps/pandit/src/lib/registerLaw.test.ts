import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { hi } from "./strings";
import * as voiceScripts from "./voice-scripts";
import * as voiceScriptsPart0 from "./voice-scripts-part0";

// ─────────────────────────────────────────────────────────────
// FOUNDER REGISTER LAW guard (Isj, 2026-07-21) — PROPOSED register rows
// PW-07/PW-08, filed alongside PW-04 (no-roman-letters).
//
// This is a devotional app for elders. Everything the app SAYS or WRITES is
// शुद्ध, सम्मानजनक हिंदी: आप-forms only, imperatives in the -इए form, no
// casual touch-words (छूकर → स्पर्श कीजिए), no तुम/तू ever.
//
// SCOPE: app-EMITTED text — strings.ts, the voice-script narrations, and
// component source (comment-stripped). Voice-GRAMMAR arrays (keywords:/
// spoken: — what the PANDIT may say) are exempt: the app must keep
// UNDERSTANDING casual speech it never uses itself. Quoted command
// vocabulary the app TEACHES ('वापस करो', 'हटा दो', 'सो जाओ') is exempt
// the same way — the app quotes the user's own words.
//
// Word boundaries are Devanagari-aware and EXCLUDE the danda । ॥ (they are
// punctuation — a sentence-final match must still be caught).
// ─────────────────────────────────────────────────────────────

// letters only: danda/double-danda (0964/0965) are punctuation, not word chars
const DEVA = "\\u0900-\\u0963\\u0966-\\u097F";
const banned = (w: string) => new RegExp(`(?<![${DEVA}])${w}(?![${DEVA}])`, "u");

// The banned casual register. करो uses the same boundary (करोड़ survives —
// ड़ is a word char; the कीजिए-family never matches these stems).
const BANNED: Array<{ token: string; rx: RegExp; law: string }> = [
  { token: "छूकर", rx: banned("छूकर"), law: "छूकर → स्पर्श कर/स्पर्श कीजिए" },
  { token: "छुओ", rx: banned("छुओ"), law: "छुओ → स्पर्श कीजिए" },
  { token: "छुएँ", rx: banned("छुएँ"), law: "छुएँ → स्पर्श कीजिए" },
  { token: "बोलो", rx: banned("बोलो"), law: "बोलो → बोलिए" },
  { token: "दबाओ", rx: banned("दबाओ"), law: "दबाओ → दबाइए" },
  { token: "चुनो", rx: banned("चुनो"), law: "चुनो → चुनिए" },
  { token: "करो", rx: banned("करो"), law: "करो → कीजिए" },
  { token: "तुम", rx: banned("तुम"), law: "तुम → आप" },
  { token: "तुम्हें", rx: banned("तुम्हें"), law: "तुम-forms → आप" },
  { token: "तुम्हारा", rx: banned("तुम्हारा"), law: "तुम-forms → आप" },
  { token: "तुम्हारे", rx: banned("तुम्हारे"), law: "तुम-forms → आप" },
  { token: "तुम्हारी", rx: banned("तुम्हारी"), law: "तुम-forms → आप" },
  { token: "तू", rx: banned("तू"), law: "तू → आप" },
  { token: "तूने", rx: banned("तूने"), law: "तू-forms → आप" },
  { token: "तुझे", rx: banned("तुझे"), law: "तू-forms → आप" },
  { token: "तेरा", rx: banned("तेरा"), law: "तू-forms → आपका" },
  { token: "तेरे", rx: banned("तेरे"), law: "तू-forms → आपके" },
  { token: "तेरी", rx: banned("तेरी"), law: "तू-forms → आपकी" },
];

// Command vocabulary the app may QUOTE while teaching (the user's words).
const QUOTED_COMMANDS = [/["'“]वापस करो["'”]/g, /["'“]हटा दो["'”]/g, /["'“]सो जाओ["'”]/g];

function scan(text: string): string[] {
  let t = text;
  for (const q of QUOTED_COMMANDS) t = t.replace(q, " ");
  return BANNED.filter((b) => b.rx.test(t)).map((b) => `${b.token} (${b.law})`);
}

function flattenStrings(obj: unknown, path: string, out: Array<{ path: string; value: string }>) {
  if (typeof obj === "string") {
    out.push({ path, value: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenStrings(v, `${path}[${i}]`, out));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      flattenStrings(v, path ? `${path}.${k}` : k, out);
    }
  }
}

describe("FOUNDER REGISTER LAW — शुद्ध, सम्मानजनक हिंदी (PW-07 proposed)", () => {
  it("the scanner itself can fail (proof-of-teeth fixtures)", () => {
    // every banned token is caught…
    expect(scan("छूकर शुरू करें")).toContain("छूकर (छूकर → स्पर्श कर/स्पर्श कीजिए)");
    expect(scan("number दबाओ")).toContain("दबाओ (दबाओ → दबाइए)");
    expect(scan("एक बार set करो।")).toContain("करो (करो → कीजिए)"); // danda-final MUST match
    expect(scan("तुम आ जाओ")).toContain("तुम (तुम → आप)");
    // …and the legitimate look-alikes are not:
    expect(scan("दो करोड़ रुपये")).toEqual([]); // करोड़ ≠ करो
    expect(scan("स्पर्श कीजिए")).toEqual([]);
    expect(scan("तूफ़ान आया")).toEqual([]); // तूफ़ान ≠ तू
    expect(scan('"वापस करो" बोलिए')).toEqual([]); // taught command vocabulary
  });

  it("strings.ts (everything शिष्य writes or says) carries no banned register", () => {
    const rows: Array<{ path: string; value: string }> = [];
    flattenStrings(hi, "hi", rows);
    const hits = rows
      .map((r) => ({ ...r, bad: scan(r.value) }))
      .filter((r) => r.bad.length > 0);
    expect(
      hits.map((h) => `${h.path}: "${h.value}" → ${h.bad.join(", ")}`),
    ).toEqual([]);
  });

  it("voice-scripts narrations carry no banned register", () => {
    for (const mod of [voiceScripts, voiceScriptsPart0]) {
      const rows: Array<{ path: string; value: string }> = [];
      flattenStrings(mod, "voiceScripts", rows);
      const hits = rows
        // roman transliteration lines mirror the hindi line for keypad TTS —
        // scan only Devanagari content (roman lines can't carry these tokens)
        .map((r) => ({ ...r, bad: scan(r.value) }))
        .filter((r) => r.bad.length > 0);
      expect(
        hits.map((h) => `${h.path}: "${h.value.slice(0, 80)}…" → ${h.bad.join(", ")}`),
      ).toEqual([]);
    }
  });

  it("component source (comment-stripped, grammar-exempt) carries no banned register", () => {
    const SRC = join(__dirname, "..");
    const files: string[] = [];
    (function walk(dir: string) {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
          if (name === "node_modules" || name === "design") continue;
          walk(p);
        } else if (
          /\.tsx?$/.test(p) &&
          !/\.test\.tsx?$/.test(p) &&
          // voiceGrammar.ts is USER-utterance vocabulary by definition —
          // the app must understand casual speech it never uses itself
          !/voiceGrammar\.ts$/.test(p)
        ) {
          files.push(p);
        }
      }
    })(SRC);

    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      const lines = src.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // exempt: comments and voice-GRAMMAR vocabulary (the user's words)
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
        if (/keywords\s*:|spoken\s*:|CITY_SPOKEN|voiceGrammar|intent\(/.test(line)) continue;
        const stripped = line.replace(/\/\/.*$/, "");
        const bad = scan(stripped);
        if (bad.length > 0) {
          offenders.push(`${f.replace(SRC, "src")}:${i + 1} → ${bad.join(", ")} :: ${line.trim().slice(0, 100)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
