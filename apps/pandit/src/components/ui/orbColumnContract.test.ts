import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// ORB COLUMN CONTRACT — enforceable (founder, 2026-07-24).
// The orb wrapper is a FIXED (px+12 ≈ 84px) anchor with overflow:visible: any
// wider child must SELF-ESCAPE (`w-max` + `whitespace-nowrap`, or
// width:max-content) or it gets squeezed and wraps. The contract was unwritten
// and two children had already broken it (the सुला-दें pill wrapped mid-phrase;
// the asleep wake-hint wrapped with leading-none, clipping Devanagari matras).
// A third will — unless this guard catches it at build time.
//
// The rendered wrap itself is invisible to source-reading guards, but the
// ESCAPE PATTERN is source-readable — so this guard pins:
//   1. the contract comment stays at the column (the next author must see it);
//   2. every KNOWN wide child carries its escape;
//   3. TRIPWIRE: any NEW text-bearing child (a new `{t("shishya.…")}` rendered
//      as element text) fails the build until it is consciously registered
//      below as ESCAPED or NARROW — the author must decide, not discover.
//
// PROVEN-TO-FAIL: removing `w-max` from the pill turns assertion 2 red.
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "ShishyaOrb.tsx"), "utf-8");

// Children REGISTERED as satisfying the contract. Adding a new text child to
// the column? Add its key here ONLY after giving it the escape pattern (or
// verifying it is provably narrower than the column, like the one-word name).
const ESCAPED = ["wakeHint", "muteControl", "wakeControl"]; // carry w-max + whitespace-nowrap (wakeControl shares the pill's escape — Ruling #9 amendment: the pill toggles)
const NARROW = ["name"]; // "शिष्य" — one short word, provably < 84px at 15-18px

describe("orb column contract — fixed anchor, children must escape", () => {
  it("the contract is documented at the column itself", () => {
    expect(src).toMatch(/ORB COLUMN CONTRACT/);
    expect(src).toMatch(/width: px \+ 12, overflow: "visible"/);
  });

  it("the say-ribbon escapes via width:max-content", () => {
    const ribbonIdx = src.indexOf("const ribbon =");
    const ribbonBlock = src.slice(ribbonIdx, src.indexOf("aria-hidden", ribbonIdx));
    expect(ribbonBlock).toContain('width: "max-content"');
  });

  it("every registered ESCAPED child carries w-max + whitespace-nowrap", () => {
    for (const key of ESCAPED) {
      const useIdx = src.indexOf(`t("shishya.${key}")`);
      expect(useIdx, `shishya.${key} must be rendered`).toBeGreaterThan(0);
      // the escape may sit on the text element itself (wake-hint span) or its
      // owning control (the pill's <button> wraps an icon + label span) — check
      // the enclosing element window: from the start of the owning element's
      // JSX (the last blank-line/brace boundary) up to the usage.
      const windowStart = Math.max(src.lastIndexOf("<button", useIdx), src.lastIndexOf("{asleep &&", useIdx), useIdx - 600);
      const win = src.slice(windowStart, useIdx);
      expect(win, `shishya.${key}'s element must carry w-max (escape the 84px column)`).toMatch(/w-max/);
      expect(win, `shishya.${key}'s element must carry whitespace-nowrap`).toMatch(/whitespace-nowrap/);
    }
  });

  it("TRIPWIRE: no unregistered text child in the column", () => {
    // every t("shishya.X") rendered as element TEXT (not an aria/prop value).
    // Matches bare {t(...)} AND ternaries like {muted ? t(...) : t(...)} —
    // classification is by LINE: a line containing `attr={` is a prop value.
    const rendered = new Set<string>();
    const re = /t\("shishya\.(\w+)"\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const lineStart = src.lastIndexOf("\n", m.index) + 1;
      const lineEnd = src.indexOf("\n", m.index);
      const line = src.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      if (/[\w-]+=\{/.test(line)) continue; // attribute assignment → prop value
      rendered.add(m[1]);
    }
    const known = new Set([...ESCAPED, ...NARROW]);
    const unregistered = [...rendered].filter((k) => !known.has(k));
    expect(
      unregistered,
      `new text child(ren) in the orb column without a contract decision: ${unregistered.join(", ")} — give it w-max+whitespace-nowrap and register it in ESCAPED, or prove it narrow and register it in NARROW (see ORB COLUMN CONTRACT comment)`,
    ).toEqual([]);
    // and the registry itself must not go stale (a removed child = stale entry)
    for (const k of known) {
      expect(rendered.has(k), `registered child shishya.${k} is no longer rendered — remove its registry entry`).toBe(true);
    }
  });
});
