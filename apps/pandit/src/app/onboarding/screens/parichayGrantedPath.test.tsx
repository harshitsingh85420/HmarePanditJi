// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, cleanup } from "@testing-library/react";

// ─────────────────────────────────────────────────────────────
// परिचय GRANTED LEG — the one mic-outcome that had NO behavioral pin.
// The harsh-pass PAGE 4 audit (2026-07-24) found every existing guard for
// this screen is a static source-grep (micPrompt/parichayForwardPath); a
// regression breaking the resolved-stream → practice-listen → advance()
// RUNTIME path would pass the whole wall. These tests mock getUserMedia to
// actually RESOLVE and pin the ladder end-to-end:
//   prompt-path: intro → gUM resolves → mic_permission_granted='true' +
//     setMicDenied(false) → practice listen ON THE SAME STREAM (never a
//     second getUserMedia) → silence → 15s watchdog → advance, exactly once.
//   pre-granted shortcut: permissions.query 'granted' → silent gUM, no
//     popup ceremony, same ladder.
// ─────────────────────────────────────────────────────────────

const speak = vi.fn(
  (
    _line: string,
    opts?: { onOutcome?: (s: string) => void; onEnd?: (c: boolean) => void },
  ) => {
    // deliver clean completion async, like real playback settling
    queueMicrotask(() => {
      opts?.onOutcome?.("ended");
      opts?.onEnd?.(true);
    });
  },
);

vi.mock("@/lib/voiceController", () => ({
  voiceController: {
    speak: (...a: unknown[]) => (speak as (...a: unknown[]) => void)(...a),
    speakAndWait: vi.fn(async () => ({ status: "ended" })),
    stopSpeech: vi.fn(),
    debug: vi.fn(),
    prefetch: vi.fn(),
    registerReplay: vi.fn(() => () => {}),
    e2e: false,
    unlocked: true, // audio already unlocked — the granted leg under test
    audioElState: () => "ready",
  },
}));

const voiceStart = vi.fn(async (_opts?: { stream?: MediaStream }) => {});
vi.mock("@/hooks/useVoiceInput", () => ({
  useVoiceInput: () => ({
    start: voiceStart,
    state: "listening", // practice never resolves by itself → watchdog owns the exit
    transcript: null,
    heardSpeech: false,
  }),
}));

const setParichayDone = vi.fn();
const setMicDenied = vi.fn();
vi.mock("@/lib/stores/ssr-safe-stores", () => ({
  useSafeOnboardingStore: () => ({ setParichayDone, setMicDenied }),
}));

// the orb and pointer are their own guarded components — not under test here
vi.mock("@/components/ui/ShishyaOrb", () => ({
  ShishyaOrb: () => null,
  ShishyaMuteControl: () => null,
}));
vi.mock("@/components/moments/PopupPointer", () => ({
  PopupPointer: () => null,
}));

import ParichayScreen from "./ParichayScreen";

const fakeStream = { getTracks: () => [], getAudioTracks: () => [] } as unknown as MediaStream;

function stubMic(queryState: string, gUM: (...a: unknown[]) => unknown) {
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia: gUM },
    configurable: true,
  });
  Object.defineProperty(navigator, "permissions", {
    value: { query: vi.fn(async () => ({ state: queryState })) },
    configurable: true,
  });
}

describe("परिचय — mic GRANTED leg, behaviorally pinned", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("prompt path: gUM resolves → granted state → practice on the SAME stream → watchdog advance, once", async () => {
    const gUM = vi.fn(async () => fakeStream);
    stubMic("prompt", gUM);
    const onDone = vi.fn();

    await act(async () => {
      render(<ParichayScreen onDone={onDone} />);
    });
    // flush the intro → askMic → gUM-resolve → granted → tryIt → practice chain
    await act(async () => {});
    await act(async () => {});

    expect(gUM).toHaveBeenCalledTimes(1);
    expect(gUM).toHaveBeenCalledWith({ audio: true });
    expect(localStorage.getItem("mic_permission_granted")).toBe("true");
    expect(setMicDenied).toHaveBeenCalledWith(false);
    // the practice listen reuses the granted stream — identity, not equality
    expect(voiceStart).toHaveBeenCalledTimes(1);
    expect(voiceStart.mock.calls[0][0]).toMatchObject({ stream: fakeStream });
    expect(onDone).not.toHaveBeenCalled(); // practicing, not done

    // pure silence: the 15s watchdog is the exit — advance exactly once
    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(setParichayDone).toHaveBeenCalledWith(true);
    // and no second prompt ever fired
    expect(gUM).toHaveBeenCalledTimes(1);
  });

  it("pre-granted shortcut: query 'granted' → silent gUM (no popup ceremony) → same ladder", async () => {
    const gUM = vi.fn(async () => fakeStream);
    stubMic("granted", gUM);
    const onDone = vi.fn();

    await act(async () => {
      render(<ParichayScreen onDone={onDone} />);
    });
    await act(async () => {});
    await act(async () => {});

    expect(gUM).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("mic_permission_granted")).toBe("true");
    expect(voiceStart).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
