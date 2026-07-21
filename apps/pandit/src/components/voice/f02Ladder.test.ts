import { describe, it, expect } from "vitest";
import { reduce, type VFState, type VFEvent } from "./voiceFieldMachine";

// ─────────────────────────────────────────────────────────────
// F02 THREE-RUNG LADDER GUARD (the doc's core promise; walk-confirmed as
// Rameshwar's #2 breaker — before this, failure 2+ was SILENCE).
//
// Pinned:
//   F02-02  rung 1 on failure 1
//   F02-03  rung 2 on failure 2
//   F02-04  rung 3 on failure 3 = fallback line + keyboard + help button
//   F02-05  the failure counter is per-field and resets to 0 on a confirmed value
//   F02-06  a good transcript routes to CONFIRMING, never a silent commit
//
// The reduce() is pure, so this drives it directly. Each test can fail: the
// prior code emitted ['SPEAK_SORRY_ONCE'] then ['START_LISTEN'] forever, which
// these assertions reject.
// ─────────────────────────────────────────────────────────────

const LISTENING: VFState = { phase: "LISTENING" };
const failParse = () => null; // transcript never parses → a failure
const okParse = (t: string) => t.trim(); // transcript always parses
const ctx = (attempts: number, parse: (t: string) => string | null) => ({
  attempts,
  mode: "text",
  parse,
});
const transcript = (text: string, confidence = 0.9): VFEvent => ({ type: "TRANSCRIPT", text, confidence });

describe("F02 error ladder — three rungs, not one-then-silence", () => {
  it("F02-02: rung 1 on the first failure", () => {
    const r = reduce(LISTENING, transcript("zzz"), ctx(0, failParse));
    expect(r.effects).toEqual(["SPEAK_RUNG_1"]);
    expect(r.attempts).toBe(1);
    expect(r.next.phase).toBe("LISTENING");
  });

  it("F02-03: rung 2 on the second failure", () => {
    const r = reduce(LISTENING, transcript("zzz"), ctx(1, failParse));
    expect(r.effects).toEqual(["SPEAK_RUNG_2"]);
    expect(r.attempts).toBe(2);
  });

  it("F02-04: rung 3 speaks, opens the keyboard AND shows help — all three", () => {
    const r = reduce(LISTENING, transcript("zzz"), ctx(2, failParse));
    expect(r.effects).toEqual(["SPEAK_RUNG_3", "OPEN_KEYBOARD", "SHOW_HELP"]);
    expect(r.attempts).toBe(3);
  });

  it("does not re-nag after rung 3 — just keeps listening", () => {
    const r = reduce(LISTENING, transcript("zzz"), ctx(3, failParse));
    expect(r.effects).toEqual(["START_LISTEN"]);
    expect(r.attempts).toBe(4);
  });

  it("low confidence (<0.55) counts as a failure and climbs the ladder", () => {
    const r = reduce(LISTENING, transcript("रमेश", 0.4), ctx(0, okParse));
    expect(r.effects).toEqual(["SPEAK_RUNG_1"]);
  });

  it("the loop NEVER stops on failure (phase stays LISTENING at every rung)", () => {
    for (const a of [0, 1, 2, 3]) {
      expect(reduce(LISTENING, transcript("zzz"), ctx(a, failParse)).next.phase).toBe("LISTENING");
    }
  });
});

describe("F02-05/06 — counter reset + no silent commit", () => {
  it("F02-06: a good transcript routes to CONFIRMING, not a silent EMIT", () => {
    const r = reduce(LISTENING, transcript("रमेश", 0.9), ctx(2, okParse));
    expect(r.next.phase).toBe("CONFIRMING");
    expect(r.effects).toEqual(["SPEAK_CONFIRM"]);
    expect(r.effects).not.toContain("EMIT_VALUE");
  });

  it("F02-05: the counter resets to 0 on a confirmed value", () => {
    const confirming: VFState = { phase: "CONFIRMING", heard: "रमेश", parsed: "रमेश" };
    const r = reduce(confirming, { type: "CONFIRM_YES" }, ctx(3, okParse));
    expect(r.attempts).toBe(0);
    expect(r.effects).toEqual(["EMIT_VALUE"]);
    expect(r.accepted).toBe("रमेश");
  });

  it("a value is emitted ONLY from CONFIRMING + CONFIRM_YES (never from LISTENING)", () => {
    // sweep every non-confirming phase — none may EMIT
    const phases: VFState[] = [
      { phase: "PROMPTING" },
      { phase: "LISTENING" },
      { phase: "PROCESSING" },
      { phase: "IDLE" },
    ];
    for (const s of phases) {
      const r = reduce(s, { type: "CONFIRM_YES" }, ctx(0, okParse));
      expect(r.effects).not.toContain("EMIT_VALUE");
    }
  });
});
