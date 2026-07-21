import { describe, it, expect, afterEach } from "vitest";
import { voiceController } from "@/lib/voiceController";

// ─────────────────────────────────────────────────────────────
// F02-06 MENU-CHOICE CONFIRMATION GUARD.
//
// The walk found the hole: matchVisibleOption called onSelect DIRECTLY, so a
// spoken menu choice committed with no "सही है?" — the silent acceptance the
// doc (edge #4) forbids. Now a spoken option is confirmed first, exactly like a
// spoken field value.
//
// Every test can fail: the prior code committed on the first utterance, which
// these assertions (pending-not-committed, हाँ-commits, नहीं-cancels) reject.
// ─────────────────────────────────────────────────────────────

const disposers: Array<() => void> = [];
afterEach(() => {
  while (disposers.length) disposers.pop()!();
});
const mount = (opts: Array<{ label: string; onSelect: () => void }>) => {
  disposers.push(voiceController.registerOptions(opts));
};

describe("F02-06 — a spoken menu choice confirms before it commits", () => {
  it("speaking a choice does NOT commit — it becomes pending", () => {
    const hit: string[] = [];
    mount([{ label: "सत्यनारायण कथा", onSelect: () => hit.push("SATYA") }]);

    const handled = voiceController.handleTranscript("सत्यनारायण कथा", 1);
    expect(handled).toBe(true); // the utterance WAS consumed…
    expect(hit).toEqual([]); // …but nothing committed yet
    expect(voiceController.pendingOptionLabel()).toBe("सत्यनारायण कथा");
  });

  it("हाँ commits the pending choice", () => {
    const hit: string[] = [];
    mount([{ label: "सत्यनारायण कथा", onSelect: () => hit.push("SATYA") }]);

    voiceController.handleTranscript("सत्यनारायण कथा", 1);
    const committed = voiceController.handleTranscript("हाँ", 1);
    expect(committed).toBe(true);
    expect(hit).toEqual(["SATYA"]);
    expect(voiceController.pendingOptionLabel()).toBeNull();
  });

  it("नहीं cancels — the choice never fires", () => {
    const hit: string[] = [];
    mount([{ label: "सत्यनारायण कथा", onSelect: () => hit.push("SATYA") }]);

    voiceController.handleTranscript("सत्यनारायण कथा", 1);
    voiceController.handleTranscript("नहीं", 1);
    expect(hit).toEqual([]);
    expect(voiceController.pendingOptionLabel()).toBeNull();
  });

  it("speaking a DIFFERENT choice while one is pending is a correction", () => {
    const hit: string[] = [];
    mount([
      { label: "सत्यनारायण कथा", onSelect: () => hit.push("SATYA") },
      { label: "गृह प्रवेश", onSelect: () => hit.push("GRIHA") },
    ]);

    voiceController.handleTranscript("सत्यनारायण कथा", 1); // pending SATYA
    voiceController.handleTranscript("गृह प्रवेश", 1); // correction → pending GRIHA
    expect(voiceController.pendingOptionLabel()).toBe("गृह प्रवेश");
    expect(hit).toEqual([]); // still nothing committed
    voiceController.handleTranscript("हाँ", 1);
    expect(hit).toEqual(["GRIHA"]); // the corrected choice commits
  });

  it("a screen change clears a pending choice (never fires on the next screen)", () => {
    const hit: string[] = [];
    mount([{ label: "सत्यनारायण कथा", onSelect: () => hit.push("SATYA") }]);

    voiceController.handleTranscript("सत्यनारायण कथा", 1);
    expect(voiceController.pendingOptionLabel()).toBe("सत्यनारायण कथा");
    // a new screen registers → the stale choice must be dropped
    const off = voiceController.registerVoiceScreen([], "help");
    disposers.push(off);
    expect(voiceController.pendingOptionLabel()).toBeNull();
    voiceController.handleTranscript("हाँ", 1);
    expect(hit).toEqual([]); // the "हाँ" has nothing to confirm
  });
});
