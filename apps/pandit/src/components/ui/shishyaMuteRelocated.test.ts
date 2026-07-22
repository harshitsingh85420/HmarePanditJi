import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// RULING #9 — MOVE-NEVER-REMOVE (build-failing guard). A layout that relocates
// the शिष्य mute control (passes muteControl="relocated" to ShishyaOrb) MUST
// render <ShishyaMuteControl/> itself, somewhere. Mechanically enforced so
// "relocated" can never silently mean "removed" — silence is never the outcome.
// ─────────────────────────────────────────────────────────────

const SRC = join(__dirname, "..", "..");

function walk(dir: string, out: string[]) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx") && !p.endsWith(".test.tsx")) out.push(p);
  }
}

const files: string[] = [];
walk(SRC, files);

const RELOCATED = /muteControl\s*=\s*(?:"relocated"|'relocated'|\{\s*["']relocated["']\s*\})/;
const RENDERS = /<\s*ShishyaMuteControl\b/;

describe("Ruling #9 — relocated mute control must still be rendered", () => {
  it("every file passing muteControl=\"relocated\" also renders <ShishyaMuteControl/>", () => {
    const offenders = files
      .map((p) => ({ p, src: readFileSync(p, "utf8") }))
      .filter(({ src }) => RELOCATED.test(src) && !RENDERS.test(src))
      .map(({ p }) => p.slice(SRC.length + 1));
    expect(
      offenders,
      'muteControl="relocated" without <ShishyaMuteControl/> = the control was REMOVED, not moved',
    ).toEqual([]);
  });
});
