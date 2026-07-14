import { describe, it, expect } from "vitest";
import { voiceController } from "@/lib/voiceController";

// ─────────────────────────────────────────────────────────────
// L5 TRANSCRIPT-PROVENANCE — BUILD-FAILING BEHAVIORAL GUARD.
// STT round-trips can take up to ~8s. A command or yes/no spoken on
// screen A that resolves AFTER navigating onto screen B must NOT fire
// B's action — a "हाँ" that lands one beat after arriving on the booking
// accept-confirm screen is a MONEY bug. Each listen is stamped with the
// screen epoch it armed on; a resolve whose stamp no longer matches the
// active epoch is dropped. This asserts that real controller behavior.
// ─────────────────────────────────────────────────────────────

describe("L5 transcript-provenance", () => {
  it("drops a transcript spoken on a previous screen; acts on the current one", () => {
    let firedA = 0;
    let firedB = 0;
    const unA = voiceController.registerVoiceScreen(
      [{ keywords: ["alphacmd"], action: () => { firedA++; }, id: "a" }],
      "help",
    );
    const epochA = voiceController.currentScreenEpoch();

    // CONTROL: a same-epoch transcript acts on screen A
    expect(voiceController.handleTranscript("alphacmd", 1, epochA)).toBe(true);
    expect(firedA).toBe(1);

    // NAVIGATE: screen B mounts (bumps the epoch); it also has "alphacmd"
    const unB = voiceController.registerVoiceScreen(
      [{ keywords: ["alphacmd"], action: () => { firedB++; }, id: "b" }],
      "help",
    );

    // a LATE transcript stamped with the OLD epoch must be DROPPED — it must
    // NOT fire B's command
    expect(voiceController.handleTranscript("alphacmd", 1, epochA)).toBe(false);
    expect(firedB).toBe(0);

    // a CURRENT-epoch transcript acts on B
    expect(voiceController.handleTranscript("alphacmd", 1, voiceController.currentScreenEpoch())).toBe(true);
    expect(firedB).toBe(1);

    unB();
    unA();
  });

  it("legacy callers (no stamp) are unaffected", () => {
    let fired = 0;
    const un = voiceController.registerVoiceScreen(
      [{ keywords: ["betacmd"], action: () => { fired++; }, id: "c" }],
      "help",
    );
    expect(voiceController.handleTranscript("betacmd", 1)).toBe(true); // no epoch arg
    expect(fired).toBe(1);
    un();
  });
});
