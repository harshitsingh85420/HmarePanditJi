import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  NORMAL_LISTEN_MS,
  ELDERLY_LISTEN_MS,
  listenTimeoutMs,
} from "./listenTimeout";

// F02-07 — "Voice listen timeout ≥ 8s; elderly-flagged profiles get
// 12s (edge #3)." Half unit test (the constants and the selection
// function) and half grep-guard (the LIVE listen path must derive its
// window from this module and may never dip under the floor).
//
// The live listen path is hooks/useVoiceInput.ts, which owns the mic
// under voiceController custody. lib/deepgramSTT.ts, lib/voice-engine.ts
// and lib/hooks/useVoiceCascade.ts also carry listen timings but have
// no live screen consumers (see lib/oneVoiceOwner.test.ts), so they are
// deliberately NOT guarded here — guarding dead code would manufacture
// the appearance of coverage over the path that actually runs.
const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf-8");

describe("F02-07 listen timeout floor", () => {
  it("F02-07: the normal floor is 8s, exactly the doc's '≥ 8s'", () => {
    expect(NORMAL_LISTEN_MS).toBe(8000);
    expect(NORMAL_LISTEN_MS).toBeGreaterThanOrEqual(8000);
  });

  it("F02-07: the elderly floor is 12s and is never shorter than the normal one", () => {
    expect(ELDERLY_LISTEN_MS).toBe(12000);
    expect(ELDERLY_LISTEN_MS).toBeGreaterThanOrEqual(NORMAL_LISTEN_MS);
  });

  it("F02-07: selection defaults to the normal floor when no profile is supplied", () => {
    expect(listenTimeoutMs()).toBe(NORMAL_LISTEN_MS);
    expect(listenTimeoutMs({})).toBe(NORMAL_LISTEN_MS);
    expect(listenTimeoutMs({ elderly: false })).toBe(NORMAL_LISTEN_MS);
    expect(listenTimeoutMs({ elderly: undefined })).toBe(NORMAL_LISTEN_MS);
  });

  it("F02-07: an elderly profile selects the 12s floor", () => {
    expect(listenTimeoutMs({ elderly: true })).toBe(ELDERLY_LISTEN_MS);
  });

  // TRUTHFUL-STATE: this pins the honest status quo rather than a
  // capability. No live caller can pass elderly:true because no such
  // user attribute exists — if one is ever built, THIS test is the one
  // that should be rewritten to assert the real flag is threaded
  // through, and the comment block in listenTimeout.ts deleted.
  it("F02-07: the elderly branch is documented as unreachable (no flag exists yet)", () => {
    const src = read("lib/listenTimeout.ts");
    expect(src).toContain("There is NO elderly flag in this product today");
    // The live path must call listenTimeoutMs() with NO argument. The
    // moment it passes anything, someone has invented a flag source and
    // this guard should be replaced by one that proves the flag is real.
    expect(read("hooks/useVoiceInput.ts")).not.toMatch(/listenTimeoutMs\(\s*[^)\s]/);
  });

  it("F02-07: the live listen path derives its window from this module, not a literal", () => {
    const src = read("hooks/useVoiceInput.ts");
    expect(src).toContain('from "@/lib/listenTimeout"');
    expect(src).toContain("listenTimeoutMs()");
    // the old bare ternary must not come back
    expect(src).not.toMatch(/const HARD_CAP = mode === "command" \? \d+ : \d+/);
  });

  it("F02-07: no listen window in the live path can be shorter than the 8s floor", () => {
    const src = read("hooks/useVoiceInput.ts");
    const m = src.match(/const HARD_CAP = ([\s\S]*?);/);
    expect(m, "HARD_CAP declaration found in useVoiceInput").toBeTruthy();
    const expr = m![1];
    expect(expr).toContain("Math.max");
    expect(expr).toContain("listenTimeoutMs()");
    const literals = (expr.match(/\d+/g) ?? []).map(Number);
    expect(literals.length, "HARD_CAP has mode-specific literals").toBeGreaterThan(0);
    for (const n of literals) {
      expect(n, `listen window literal ${n}ms is under the ${NORMAL_LISTEN_MS}ms floor`)
        .toBeGreaterThanOrEqual(NORMAL_LISTEN_MS);
    }
  });

  it("F02-07: both listen deadlines share one window (no-speech abort AND utterance cap)", () => {
    const src = read("hooks/useVoiceInput.ts");
    // the no-speech abort
    expect(src).toMatch(/elapsed >= HARD_CAP && !spokeOnce/);
    // the utterance cap
    expect(src).toMatch(/elapsed >= HARD_CAP\)/);
  });
});
