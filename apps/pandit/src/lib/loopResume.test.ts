import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// LAW L-D — THE LOOP NEVER GOES SILENTLY IDLE.
// Root class it kills: "voice loop re-arm/resume is silent, stall-prone,
// non-atomic" (matrix E5/E6/H15/H2). Two enforced invariants:
//  1) an EMPTY STT transcript must re-arm in ONE tick, not stall until the 12s
//     zombie net (H15);
//  2) a resume that followed a mic release must emit an AUDIBLE liveness cue so
//     an elderly voice-first user knows शिष्य is listening again (E5/E6).
const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf-8");

describe("L-D loop resume/re-arm — no silent idle", () => {
  it("an empty STT transcript re-arms in one tick (not a dead 'idle')", () => {
    const src = read("hooks/useVoiceInput.ts");
    // the empty-transcript guard routes to the silent-re-arm ('error') path
    expect(src).toMatch(/if\s*\(!String\(resJson\.data\.transcript[^)]*\)\.trim\(\)\)/);
    const idx = src.indexOf("empty transcript");
    expect(idx).toBeGreaterThan(0);
    expect(src.slice(idx, idx + 160)).toMatch(/setState\("error"\)/);
  });

  it("resume-from-hidden emits an audible liveness cue, debounced", () => {
    const src = read("lib/voiceController.ts");
    expect(src).toContain("private hiddenSince");
    // set on hide, consumed on show
    expect(src).toMatch(/this\.hiddenSince\s*=\s*performance\.now\(\)/);
    // the visible branch replays a cue guarded by mic + a debounce window
    const visIdx = src.indexOf("a resume that followed a real mic release");
    expect(visIdx).toBeGreaterThan(0);
    const window = src.slice(visIdx, visIdx + 900);
    expect(window).toMatch(/this\.replayFn\?\.\(\)/);
    expect(window).toMatch(/performance\.now\(\)\s*-\s*this\.hiddenSince\s*>\s*2000/);
  });
});
