import { describe, it, expect, afterEach } from "vitest";
import { voiceController } from "@/lib/voiceController";
import { BACK } from "@/lib/voiceGrammar";

// ─────────────────────────────────────────────────────────────
// F02-09 BACK-SAFETY / DELETE GUARD.
//
// The law: "पीछे" only NAVIGATES — it never destroys entered data. Deletion
// happens only through the explicit "हटा दो" path, and even then only after a
// DOUBLE confirmation (हाँ → "क्या आप निश्चित हैं?" → हाँ). An unclear answer
// at either stage cancels — ambiguity must never delete.
//
// Each test can fail: before this build there was no delete grammar at all,
// and a naive single-confirm implementation fails the double-confirm tests.
// ─────────────────────────────────────────────────────────────

const disposers: Array<() => void> = [];
afterEach(() => {
  while (disposers.length) disposers.pop()!();
});

function mountDeletable(label: string) {
  const state = { value: "9876500050" };
  disposers.push(voiceController.registerDeletable(label, () => (state.value = "")));
  return state;
}

describe("F02-09 — deletion is double-confirmed; पीछे never deletes", () => {
  it("'हटा दो' alone deletes NOTHING — it only asks (stage 1)", () => {
    const f = mountDeletable("मोबाइल नंबर");
    voiceController.handleTranscript("हटा दो", 1);
    expect(f.value).toBe("9876500050");
    expect(voiceController.pendingDeleteStage()).toBe(1);
  });

  it("first हाँ still deletes nothing — it asks फिर से (stage 2)", () => {
    const f = mountDeletable("मोबाइल नंबर");
    voiceController.handleTranscript("हटा दो", 1);
    voiceController.handleTranscript("हाँ", 1);
    expect(f.value).toBe("9876500050");
    expect(voiceController.pendingDeleteStage()).toBe(2);
  });

  it("only the SECOND हाँ deletes", () => {
    const f = mountDeletable("मोबाइल नंबर");
    voiceController.handleTranscript("हटा दो", 1);
    voiceController.handleTranscript("हाँ", 1);
    voiceController.handleTranscript("हाँ", 1);
    expect(f.value).toBe("");
    expect(voiceController.pendingDeleteStage()).toBeNull();
  });

  it("नहीं at stage 1 cancels", () => {
    const f = mountDeletable("मोबाइल नंबर");
    voiceController.handleTranscript("हटा दो", 1);
    voiceController.handleTranscript("नहीं", 1);
    expect(f.value).toBe("9876500050");
    expect(voiceController.pendingDeleteStage()).toBeNull();
  });

  it("नहीं at stage 2 cancels", () => {
    const f = mountDeletable("मोबाइल नंबर");
    voiceController.handleTranscript("हटा दो", 1);
    voiceController.handleTranscript("हाँ", 1);
    voiceController.handleTranscript("नहीं", 1);
    expect(f.value).toBe("9876500050");
    expect(voiceController.pendingDeleteStage()).toBeNull();
  });

  it("an UNCLEAR answer cancels — ambiguity never deletes", () => {
    const f = mountDeletable("मोबाइल नंबर");
    voiceController.handleTranscript("हटा दो", 1);
    voiceController.handleTranscript("अच्छा ठहरो ज़रा", 1);
    expect(f.value).toBe("9876500050");
    expect(voiceController.pendingDeleteStage()).toBeNull();
  });

  it("पीछे (every BACK phrase) NEVER deletes and never starts a delete", () => {
    const f = mountDeletable("मोबाइल नंबर");
    for (const phrase of BACK) {
      voiceController.handleTranscript(phrase, 1);
      expect(f.value, `"${phrase}" touched the field`).toBe("9876500050");
      expect(voiceController.pendingDeleteStage(), `"${phrase}" started a delete`).toBeNull();
    }
  });

  it("'हटा दो' with nothing deletable is an honest no-op", () => {
    voiceController.handleTranscript("हटा दो", 1);
    expect(voiceController.pendingDeleteStage()).toBeNull();
  });
});
