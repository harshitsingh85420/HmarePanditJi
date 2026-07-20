import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { reduce, type VFState, type VFEffect } from "./voiceFieldMachine";
import { t } from "@/lib/i18n";

// ─────────────────────────────────────────────────────────────────────────────
// CONFORMANCE PIN — F02-02 / F02-05 / F02-06 (voice error ladder + confirm).
//
// These tests FREEZE WHAT THE APP DOES TODAY. They are not aspirational: the
// register (docs/pandit-pov-conformance-register.md) marks all three 🟡 partial,
// and docs/spec/VERIFY-RESULTS.md records exactly why. The point is that a
// future edit which silently changes the ladder, the per-field counter, or the
// confirm gate fails the build instead of drifting unnoticed.
//
// Where a requirement is only PARTIALLY met, the test asserts what IS true.
// One test (the last describe block) deliberately asserts a KNOWN GAP so that
// CLOSING the gap turns it red and forces someone to update the register.
// ─────────────────────────────────────────────────────────────────────────────

const SRC = join(__dirname, "..", "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf-8");

/** ctx factory: `parse` decides parseable vs unparseable, per VoiceField. */
const ctx = (attempts: number, parse: (s: string) => string | null) => ({
  attempts,
  mode: "text",
  parse,
});
const ACCEPTS = (s: string) => s.trim() || null;
const REJECTS = () => null;

const LISTENING: VFState = { phase: "LISTENING" };
const bad = (text = "अस्पष्ट") => ({ type: "TRANSCRIPT" as const, text, confidence: 1 });

// ═════════════════════════════════════════════════════════════════════════════
describe("F02-02 — exactly ONE gentle apology, fired on failure #1, with the app's own string", () => {
  it("F02-02: failure #1 emits SPEAK_SORRY_ONCE and keeps the loop LISTENING", () => {
    const r = reduce(LISTENING, bad(), ctx(0, REJECTS));
    expect(r.effects).toEqual<VFEffect[]>(["SPEAK_SORRY_ONCE"]);
    expect(r.next).toEqual({ phase: "LISTENING" });
    expect(r.attempts).toBe(1);
    // the loop is never stopped by a failure
    expect(r.effects).not.toContain("STOP_LISTEN");
  });

  it("F02-02: failures #2..#5 apologize NEVER again — silent re-arm only (one-rung ladder)", () => {
    for (let a = 1; a <= 5; a++) {
      const r = reduce(LISTENING, bad(), ctx(a, REJECTS));
      expect(r.effects).toEqual<VFEffect[]>(["START_LISTEN"]);
      expect(r.effects).not.toContain("SPEAK_SORRY_ONCE");
      expect(r.attempts).toBe(a + 1);
    }
  });

  it("F02-02: a LOW-CONFIDENCE but parseable transcript counts as a failure (<0.55 floor)", () => {
    const r = reduce(LISTENING, { type: "TRANSCRIPT", text: "रामेश्वर", confidence: 0.54 }, ctx(0, ACCEPTS));
    expect(r.effects).toEqual<VFEffect[]>(["SPEAK_SORRY_ONCE"]);
    expect(r.attempts).toBe(1);
    // 0.55 exactly is ACCEPTED — pins the boundary, not just the direction
    const ok = reduce(LISTENING, { type: "TRANSCRIPT", text: "रामेश्वर", confidence: 0.55 }, ctx(0, ACCEPTS));
    expect(ok.next.phase).toBe("CONFIRMING");
  });

  it("F02-02: the apology string is the APP's wording, not the doc's", () => {
    // STRING IDENTITY. VoiceField's SPEAK_SORRY_ONCE effect speaks
    // t("voiceLoop.sorryOnce"). Pin the resolved value, byte for byte.
    expect(t("voiceLoop.sorryOnce")).toBe(
      "माफ़ कीजिए, समझ नहीं आया — फिर बोलें या नीचे लिख दें",
    );
    // PARTIAL: the doc's rung-1 line is NOT what ships. Pinned so that if
    // someone adopts the doc wording, this fails and the register is updated.
    expect(t("voiceLoop.sorryOnce")).not.toBe("माफ़ कीजिये, कृपया फिर से बोलिए।");
  });

  it("F02-02: the SPEAK_SORRY_ONCE effect is wired to that exact string key in VoiceField", () => {
    // links reducer effect -> spoken string; without this the identity test
    // above would pin a string nothing plays.
    const vf = read("components/voice/VoiceField.tsx");
    const i = vf.indexOf('case "SPEAK_SORRY_ONCE"');
    expect(i).toBeGreaterThan(0);
    expect(vf.slice(i, i + 160)).toContain('t("voiceLoop.sorryOnce")');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe("F02-05 — the failure counter is PER FIELD, not global", () => {
  it("F02-05: a fresh field starts at 0 attempts, so its first failure apologizes", () => {
    // VoiceField.tsx holds `attempts` in component-local useState(0): a newly
    // mounted field's counter is independent of any other field's history.
    const vf = read("components/voice/VoiceField.tsx");
    expect(vf).toMatch(/const \[attempts, setAttempts\] = useState\(0\)/);
    // and the reducer at attempts=0 is what a fresh mount feeds in:
    expect(reduce(LISTENING, bad(), ctx(0, REJECTS)).effects).toEqual(["SPEAK_SORRY_ONCE"]);
  });

  it("F02-05: attempts increment monotonically WITHIN one field across failures", () => {
    let attempts = 0;
    const seen: number[] = [];
    for (let i = 0; i < 4; i++) {
      const r = reduce(LISTENING, bad(), ctx(attempts, REJECTS));
      attempts = r.attempts;
      seen.push(attempts);
    }
    expect(seen).toEqual([1, 2, 3, 4]);
  });

  it("F02-05: two independent fields do NOT share a counter (field B still apologizes)", () => {
    // Field A burns three failures; field B, on its own counter, is untouched.
    let a = 0;
    for (let i = 0; i < 3; i++) a = reduce(LISTENING, bad(), ctx(a, REJECTS)).attempts;
    expect(a).toBe(3);
    const b = reduce(LISTENING, bad(), ctx(0, REJECTS));
    expect(b.effects).toEqual(["SPEAK_SORRY_ONCE"]);
    expect(b.attempts).toBe(1);
    // the reducer is pure in `attempts` — no module-level/global accumulator
    expect(reduce(LISTENING, bad(), ctx(0, REJECTS)).attempts).toBe(1);
  });

  it("F02-05: the counter resets ONLY on CONFIRM_YES", () => {
    expect(reduce({ phase: "CONFIRMING", heard: "h", parsed: "p" }, { type: "CONFIRM_YES" }, ctx(3, ACCEPTS)).attempts).toBe(0);
    // PARTIAL (documented in VERIFY-RESULTS F02-05): decline / typing / STT
    // errors leave the count elevated, so a long-lived field never apologizes
    // again after its first failure. Pinned as-is.
    expect(reduce({ phase: "CONFIRMING", heard: "h", parsed: "p" }, { type: "CONFIRM_NO" }, ctx(3, ACCEPTS)).attempts).toBe(3);
    expect(reduce(LISTENING, { type: "TYPED_INPUT" }, ctx(3, ACCEPTS)).attempts).toBe(3);
    expect(reduce(LISTENING, { type: "STT_FAILED" }, ctx(3, ACCEPTS)).attempts).toBe(3);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe("F02-06 — VoiceField free-value capture CANNOT emit a value without CONFIRM_YES", () => {
  it("F02-06: a parseable transcript goes to CONFIRMING + SPEAK_CONFIRM — never straight to EMIT_VALUE", () => {
    for (const from of [LISTENING, { phase: "PROCESSING" } as VFState]) {
      const r = reduce(from, { type: "TRANSCRIPT", text: "काशी", confidence: 1 }, ctx(0, ACCEPTS));
      expect(r.next).toEqual({ phase: "CONFIRMING", heard: "काशी", parsed: "काशी" });
      expect(r.effects).toEqual<VFEffect[]>(["SPEAK_CONFIRM"]);
      expect(r.effects).not.toContain("EMIT_VALUE");
      expect(r.accepted).toBeUndefined();
    }
  });

  it("F02-06: EMIT_VALUE + accepted appear ONLY on CONFIRM_YES from CONFIRMING", () => {
    const confirming: VFState = { phase: "CONFIRMING", heard: "ग्यारह सौ", parsed: "1100" };
    const yes = reduce(confirming, { type: "CONFIRM_YES" }, ctx(1, ACCEPTS));
    expect(yes.effects).toEqual<VFEffect[]>(["EMIT_VALUE"]);
    expect(yes.accepted).toBe("1100");
    expect(yes.next).toEqual({ phase: "IDLE" });
  });

  it("F02-06: CONFIRM_NO discards the value and returns to LISTENING (no EMIT_VALUE)", () => {
    const r = reduce({ phase: "CONFIRMING", heard: "ग्यारह सौ", parsed: "1100" }, { type: "CONFIRM_NO" }, ctx(1, ACCEPTS));
    expect(r.effects).toEqual<VFEffect[]>(["START_LISTEN"]);
    expect(r.accepted).toBeUndefined();
    expect(r.next).toEqual({ phase: "LISTENING" });
  });

  it("F02-06: NO event from ANY non-CONFIRMING phase can produce EMIT_VALUE", () => {
    const states: VFState[] = [
      { phase: "PROMPTING" },
      { phase: "LISTENING" },
      { phase: "PROCESSING" },
      { phase: "IDLE" },
    ];
    const events = [
      { type: "SPEECH_DONE" as const },
      { type: "TRANSCRIPT" as const, text: "काशी", confidence: 1 },
      { type: "STT_FAILED" as const },
      { type: "CONFIRM_YES" as const },
      { type: "CONFIRM_NO" as const },
      { type: "TYPED_INPUT" as const },
    ];
    for (const s of states) {
      for (const e of events) {
        const r = reduce(s, e, ctx(0, ACCEPTS));
        expect(r.effects).not.toContain("EMIT_VALUE");
        expect(r.accepted).toBeUndefined();
      }
    }
    // even a stray CONFIRM_YES while merely LISTENING emits nothing
    expect(reduce(LISTENING, { type: "CONFIRM_YES" }, ctx(0, ACCEPTS)).effects).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ⚠️ CONFORMANCE **GAP**, NOT A DESIRED PROPERTY. ⚠️
//
// F02-06 asks for confirmation on ALL voice input. It holds for VoiceField
// free-value capture (above) but NOT for on-screen option selection: a spoken
// card/option label runs `opt.onSelect()` immediately inside
// voiceController.handleTranscript (voiceController.ts, the Q3 block calling
// the private matchVisibleOption) with no "आपने कहा X — सही है?" ceremony and
// no हाँ. supplyMode / teamSize / readiness specialization cards all commit
// on the first heard word.
//
// The assertions below PIN THAT HOLE. They are green because the hole exists.
// When someone adds a confirm gate to option-selection, this block goes RED —
// that is the intent: the fix must be accompanied by updating
// docs/pandit-pov-conformance-register.md + docs/spec/VERIFY-RESULTS.md and
// DELETING this block. Do not "fix" it by loosening the assertion.
// ═════════════════════════════════════════════════════════════════════════════
describe("F02-06 GAP — option-selection commits with NO confirmation (pins today's hole)", () => {
  it("F02-06: a spoken option label fires onSelect immediately, without any हाँ", async () => {
    const { voiceController } = await import("@/lib/voiceController");
    const picked: string[] = [];
    const un = voiceController.registerOptions([
      { label: "शाकाहारी भोजन", onSelect: () => picked.push("veg") },
      { label: "अकेले जाऊँगा", onSelect: () => picked.push("solo") },
    ]);
    try {
      // ONE utterance. No confirm prompt is spoken, no CONFIRM_YES is needed.
      const handled = voiceController.handleTranscript("शाकाहारी भोजन", 1);
      expect(handled).toBe(true);
      // GAP: committed on the very first transcript.
      expect(picked).toEqual(["veg"]);
      // GAP: nothing is latched either — repeating the utterance commits AGAIN,
      // because there is no pending-confirmation state to sit in.
      expect(voiceController.handleTranscript("शाकाहारी भोजन", 1)).toBe(true);
      expect(picked).toEqual(["veg", "veg"]);
    } finally {
      un();
    }
  });

  it("F02-06: even a PARTIAL label match commits instantly (no second-chance ceremony)", async () => {
    const { voiceController } = await import("@/lib/voiceController");
    const picked: string[] = [];
    const un = voiceController.registerOptions([
      { label: "सत्यनारायण कथा", onSelect: () => picked.push("satya") },
    ]);
    try {
      // one word out of a two-word label — still an immediate commit
      expect(voiceController.handleTranscript("सत्यनारायण", 1)).toBe(true);
      expect(picked).toEqual(["satya"]);
    } finally {
      un();
    }
  });
});
