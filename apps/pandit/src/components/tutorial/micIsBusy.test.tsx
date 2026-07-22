import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor, screen } from "@testing-library/react";
import { voiceController } from "@/lib/voiceController";
import { t } from "@/lib/i18n";
import { MicPracticeArtboard } from "./MicPracticeArtboard";

// the 78px mic disc, disambiguated from the शिष्य orb button by accessible name
const micButton = () => screen.getByRole("button", { name: t("tutorial.slide5Button") });

// ─────────────────────────────────────────────────────────────
// onBusy CANNOT GET STUCK (Isj, addition 2 to the mic extraction). The parent
// (TutorialV2 / DeckPlayer) gates its Next off MicPracticeArtboard's onBusy while
// the mic is asking|listening. If onBusy could be left stuck `true` — e.g. the
// pandit leaves the slide mid-permission — the parent's Next would stay dead
// forever. So the contract this guard PINS:
//   1. onBusy is DERIVED from micState → fires on EVERY transition;
//   2. it is `false` at rest (idle) and while showing the result (done);
//   3. it is released to `false` on UNMOUNT, from ANY state including a busy one.
// Property (3) is the "can't get stuck" guarantee — leaving the slide always
// frees the gate.
//
// The mic APIs are mocked so the component reaches real busy states in jsdom:
// getUserMedia stays pending → micState "asking" (busy) without a native prompt.
// ─────────────────────────────────────────────────────────────

const lastCall = (spy: ReturnType<typeof vi.fn>): unknown =>
  spy.mock.calls.length ? spy.mock.calls[spy.mock.calls.length - 1][0] : undefined;

beforeEach(() => {
  try { localStorage.clear(); } catch { /* noop */ }
  // audio/TTS: no-op in jsdom
  vi.spyOn(voiceController, "speak").mockImplementation(() => {});
  vi.spyOn(voiceController, "debug").mockImplementation(() => {});
  vi.spyOn(voiceController, "stopSpeech").mockImplementation(() => {});
  // permissions.query: reject → the component keeps micPerm "unknown" (so a tap
  // takes the getUserMedia/asking path, not the granted short-circuit).
  Object.defineProperty(navigator, "permissions", {
    configurable: true,
    value: { query: vi.fn(() => Promise.reject(new Error("no permissions api"))) },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  try { sessionStorage.clear(); } catch { /* noop */ }
  (voiceController as unknown as { _e2e: boolean })._e2e = false;
});

describe("MicPracticeArtboard — onBusy can never get stuck true", () => {
  it("is false at rest (idle) on mount and stays false through unmount", () => {
    // getUserMedia never invoked here — pure idle → unmount path
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn(() => new Promise<MediaStream>(() => {})) },
    });
    const onBusy = vi.fn();
    const { unmount } = render(<MicPracticeArtboard onBusy={onBusy} />);
    // derived effect fired on mount with the idle (not-busy) value
    expect(onBusy).toHaveBeenCalledWith(false);
    unmount();
    // unmount-release fired, still false
    expect(lastCall(onBusy)).toBe(false);
    // never went true on the idle path
    expect(onBusy.mock.calls.some((c) => c[0] === true)).toBe(false);
  });

  it("goes true entering asking, then is RELEASED to false on unmount (the stuck case)", async () => {
    // getUserMedia stays pending → micState parks in "asking" (busy)
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn(() => new Promise<MediaStream>(() => {})) },
    });
    const onBusy = vi.fn();
    const { unmount } = render(<MicPracticeArtboard onBusy={onBusy} />);

    fireEvent.click(micButton());

    // entering asking → onBusy(true)
    await waitFor(() => expect(onBusy).toHaveBeenCalledWith(true));
    expect(lastCall(onBusy)).toBe(true);

    // UNMOUNT FROM THE BUSY STATE — the parent's gate must be released
    unmount();
    expect(lastCall(onBusy)).toBe(false);
  });

  it("e2e bypass (idle→done): fires onDone and NEVER reports busy", async () => {
    // e2e traversal mode (session-sticky flag the controller reads) — the mic
    // branch resolves practice immediately, no native prompt, no mediaDevices.
    sessionStorage.setItem("hpj_e2e", "1");
    (voiceController as unknown as { _e2e: boolean })._e2e = true;
    const onBusy = vi.fn();
    const onDone = vi.fn();
    render(<MicPracticeArtboard onBusy={onBusy} onDone={onDone} />);

    fireEvent.click(micButton());

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    // idle → done: neither state is busy, so onBusy never went true
    expect(onBusy.mock.calls.some((c) => c[0] === true)).toBe(false);
  });
});
