import { describe, it, expect } from "vitest";
import { hi } from "./strings";

// ─────────────────────────────────────────────────────────────
// RULING #9 / option A — the tap-repeat lesson lives on the failed-voice-
// attempt hooks (zero new chrome, fires exactly when he's stuck). This guard
// pins that "शिष्य को स्पर्श कर फिर सुनिए" is present in F02 rung 2, rung 3, and
// the general command-miss line (voiceLoop.unmatched) — and that it is
// register-clean (स्पर्श not छूकर, -इए, no तुम/तू, no roman).
// ACCEPTED GAP (CONFLICT_RULINGS #9): this reaches only a pandit who SPEAKS;
// one stuck SILENTLY (no tap, no voice) gets no hint — a deliberate trade
// (gesture-idle "B" was dropped as clutter). Revisit on Isj's device pass.
// ─────────────────────────────────────────────────────────────

const TEACH = "शिष्य को स्पर्श कर फिर सुनिए";
const hooks: Array<[string, string]> = [
  ["voiceLoop.rung2", hi.voiceLoop.rung2],
  ["voiceLoop.rung3", hi.voiceLoop.rung3],
  ["voiceLoop.unmatched", hi.voiceLoop.unmatched],
];

describe("tap-repeat teaching on the failed-voice-attempt hooks", () => {
  it("rung 2, rung 3, and the unmatched line all teach the tap-repeat", () => {
    for (const [path, value] of hooks) {
      expect(value, `${path} must teach the tap-repeat`).toContain(TEACH);
    }
  });

  it("the teaching is register-clean (स्पर्श not छूकर, no तुम/तू, no roman)", () => {
    expect(TEACH).toMatch(/स्पर्श/);
    expect(TEACH).not.toMatch(/छूकर|छुओ/);
    expect(TEACH).not.toMatch(/तुम|तू\b/);
    expect(TEACH).not.toMatch(/[A-Za-z]/);
    // it invites a repeat via touch + the -इए imperative
    expect(TEACH).toMatch(/सुनिए/);
  });
});
