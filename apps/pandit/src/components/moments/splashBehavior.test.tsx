import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SunriseSplash, SPLASH_ADVANCE_MS } from "./SunriseSplash";
import { voiceController } from "@/lib/voiceController";

// ─────────────────────────────────────────────────────────────
// SPLASH BEHAVIOUR GUARD — Isj's founder-specified 8-second rule + the
// app's-first-words speech attempt (register: F02-13, founder-specified).
//
// Pinned:
//   1. no touch by 8s → auto-advance (timer fires ONCE at SPLASH_ADVANCE_MS)
//   2. a touch cancels the timer and advances immediately (no double-fire)
//   3. the two spoken lines are ATTEMPTED on mount, in order (hello → ask)
//   4. the timer is cleaned up on unmount
//   5. audio unlock is GLOBAL + persistent — the controller unlocks on the
//      first pointerdown anywhere, so every later screen can speak on mount
//
// Each test can fail: the prior deadline law used 9s/30s, spoke different
// lines, and had no single 8s timer.
// ─────────────────────────────────────────────────────────────

describe("splash — Isj's 8-second rule", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // speech never really synthesises in jsdom — resolve as PARKED (a fresh
    // first-ever load), which is the autoplay-blocked path the pill covers.
    vi.spyOn(voiceController, "speakAndWait").mockResolvedValue({ status: "parked" } as never);
    vi.spyOn(voiceController, "prefetch").mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("SPLASH_ADVANCE_MS is a finite 8 seconds", () => {
    expect(SPLASH_ADVANCE_MS).toBe(8_000);
    expect(Number.isFinite(SPLASH_ADVANCE_MS)).toBe(true);
  });

  it("no touch by 8s → auto-advances exactly once", async () => {
    const onDone = vi.fn();
    await act(async () => {
      render(<SunriseSplash onDone={onDone} />);
    });
    expect(onDone).not.toHaveBeenCalled(); // still on the splash before 8s
    await act(async () => {
      vi.advanceTimersByTime(SPLASH_ADVANCE_MS);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    // the timer must not fire again
    await act(async () => {
      vi.advanceTimersByTime(SPLASH_ADVANCE_MS * 2);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("a touch cancels the timer and advances now — no double-fire", async () => {
    const onDone = vi.fn();
    let container: HTMLElement;
    await act(async () => {
      container = render(<SunriseSplash onDone={onDone} />).container;
    });
    await act(async () => {
      (container!.firstChild as HTMLElement).click();
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    // the 8s timer was cancelled — advancing past it does NOT re-fire onDone
    await act(async () => {
      vi.advanceTimersByTime(SPLASH_ADVANCE_MS * 2);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("attempts the two first-words on mount, in order (hello → sparsh-ask on live audio)", async () => {
    // this run: live audio (not parked) so BOTH lines are attempted in order
    (voiceController.speakAndWait as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: "ended",
    });
    const spoken: string[] = [];
    (voiceController.speakAndWait as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async (text: string) => {
        spoken.push(text);
        return { status: "ended" };
      },
    );
    await act(async () => {
      render(<SunriseSplash onDone={vi.fn()} />);
    });
    await act(async () => {}); // flush the mount speech chain
    expect(spoken[0]).toContain("नमस्ते पंडित जी");
    expect(spoken[1]).toContain("स्पर्श"); // "आगे बढ़ने के लिए स्पर्श कीजिए"
  });

  it("cleans up the timer on unmount (no advance after gone)", async () => {
    const onDone = vi.fn();
    let unmount: () => void;
    await act(async () => {
      unmount = render(<SunriseSplash onDone={onDone} />).unmount;
    });
    await act(async () => {
      unmount!();
    });
    await act(async () => {
      vi.advanceTimersByTime(SPLASH_ADVANCE_MS * 3);
    });
    expect(onDone).not.toHaveBeenCalled();
  });
});

describe("splash — audio unlock is global & persistent (source pin)", () => {
  it("the controller unlocks on the first pointerdown anywhere (once, capture)", () => {
    const src = readFileSync(join(__dirname, "..", "..", "lib", "voiceController.ts"), "utf-8");
    // a single global listener primes audio on the first gesture, so every
    // screen mounted after it can speak without its own fresh gesture.
    expect(src).toMatch(
      /document\.addEventListener\("pointerdown",\s*\(\)\s*=>\s*this\.unlock\(\),\s*\{[^}]*once:\s*true[^}]*\}/,
    );
  });
});
