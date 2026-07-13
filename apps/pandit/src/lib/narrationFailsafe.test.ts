import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// LAW L-A — NARRATION IS BOUNDED AND SELF-RELEASING.
// Root class it kills: "narration phase unbounded/uninterruptible" (matrix
// E10/E11/H1). A browser-initiated pause (OS audio-focus steal on an incoming
// call, BT/headphone disconnect) fires neither 'ended' nor 'error'; before this
// law the playback promise hung forever, finish() never ran, _speaking stuck
// true, and the whole always-listening loop wedged deaf in NARRATING — a silent
// death of the core voice UX. This grep-guard (same shape as the one-voice test)
// FAILS THE BUILD if a future edit removes any of the three nets that guarantee
// _speaking is always released: onpause, a per-utterance failsafe timeout, and
// the watchdog covering _speaking.
const src = readFileSync(join(__dirname, "voiceController.ts"), "utf-8");

describe("L-A narration failsafe — _speaking can never hang", () => {
  it("wires el.onpause in the playback promise (device/OS interrupt net)", () => {
    expect(src).toMatch(/el\.onpause\s*=\s*\(\)\s*=>/);
    // onpause must actually settle the promise, not just log
    const idx = src.indexOf("el.onpause = () =>");
    expect(idx).toBeGreaterThan(0);
    expect(src.slice(idx, idx + 260)).toMatch(/done\(false\)/);
  });

  it("arms a per-utterance failsafe timeout that releases narration", () => {
    expect(src).toMatch(/failsafe\s*=\s*setTimeout\(/);
    expect(src).toMatch(/const capMs\s*=/);
    const idx = src.indexOf("failsafe = setTimeout(");
    expect(src.slice(idx, idx + 200)).toMatch(/done\(false\)/);
  });

  it("done() tears down BOTH the failsafe timer and the onpause handler", () => {
    // guarantees no leaked timer/handler and that a settle is final
    expect(src).toMatch(/if\s*\(failsafe\)\s*\{\s*clearTimeout\(failsafe\)/);
    const doneIdx = src.indexOf("const done = (ok: boolean");
    expect(doneIdx).toBeGreaterThan(0);
    expect(src.slice(doneIdx, doneIdx + 400)).toMatch(/el\.onpause\s*=\s*null/);
  });

  it("the loop watchdog covers a stuck _speaking (last-resort net)", () => {
    expect(src).toMatch(/this\.speakingSince\s*=\s*performance\.now\(\)/);
    // watchdog must recover a _speaking that outlives any real utterance
    expect(src).toMatch(/this\._speaking\s*&&\s*this\.speakingSince\s*>\s*0\s*&&\s*now\s*-\s*this\.speakingSince\s*>/);
    expect(src).toMatch(/watchdog:stuck-speaking/);
  });

  it("onpause only fires after playback began (no premature settle)", () => {
    const idx = src.indexOf("el.onpause = () =>");
    expect(src.slice(idx, idx + 160)).toMatch(/!playing/);
  });
});
