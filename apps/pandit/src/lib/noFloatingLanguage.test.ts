import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// NO FLOATING LANGUAGE SWITCHER (founder law, 2026-07-22). Language changes
// from Settings → भाषा ONLY. The old floating flag-pill (LanguageChangeWidget,
// `fixed top-20 right-4` with a 🇮🇳/🇬🇧 flag) and the 🌐 globe are banned as
// floating controls. This guard fails the build if either returns:
//   1. no source references the removed LanguageChangeWidget symbol;
//   2. no .tsx renders a position:fixed element carrying a language flag/🌐
//      glyph (the floating-language-pill signature);
//   3. the sanctioned switch — the Settings भाषा row — still exists.
// (The lone 🌐 in onboarding-store.ts is inert language METADATA, not a
// control, and is out of scope — this guard only scans .tsx JSX for the
// fixed-positioned pill.)
// ─────────────────────────────────────────────────────────────

const SRC = join(__dirname, "..");
const SELF = "noFloatingLanguage.test.ts";

function walk(dir: string, out: string[]) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p) && !p.endsWith(SELF)) out.push(p);
  }
}

const files: string[] = [];
walk(SRC, files);
const read = (p: string) => readFileSync(p, "utf8");

describe("no floating language switcher (Settings-only language)", () => {
  it("no source imports or renders the removed LanguageChangeWidget", () => {
    // matches real usage — an import of, or a JSX element named,
    // LanguageChangeWidget — but NOT prose comments referring to its removal.
    const USE = /import\b[^\n]*LanguageChangeWidget|<\s*LanguageChangeWidget\b|lazy\([^\n]*LanguageChangeWidget/;
    const hits = files.filter((p) => USE.test(read(p)))
      .map((p) => p.slice(SRC.length + 1));
    expect(hits, "LanguageChangeWidget must not be imported/rendered anywhere").toEqual([]);
  });

  it("no .tsx renders a fixed-positioned language flag/🌐 pill", () => {
    const FLAG = /🇮🇳|🇬🇧|🌐/;
    const offenders: string[] = [];
    for (const p of files) {
      if (!p.endsWith(".tsx")) continue;
      for (const line of read(p).split("\n")) {
        // a floating control = className with `fixed` positioning AND a
        // language flag / globe glyph on the same element line
        if (/className=/.test(line) && /\bfixed\b/.test(line) && FLAG.test(line)) {
          offenders.push(`${p.slice(SRC.length + 1)}: ${line.trim().slice(0, 100)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the sanctioned switch — Settings भाषा row — still exists", () => {
    const settings = read(join(SRC, "app/(dashboard-group)/settings/page.tsx"));
    expect(settings, "Settings must keep a भाषा language entry").toMatch(/भाषा/);
  });
});
