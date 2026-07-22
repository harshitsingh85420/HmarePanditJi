import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor, screen } from "@testing-library/react";
import DeckPlayer from "./DeckPlayer";
import { DECK_A } from "@/lib/tutorial-decks";
import { voiceController } from "@/lib/voiceController";
import { t } from "@/lib/i18n";

// ─────────────────────────────────────────────────────────────
// DECK A, FLAG-FORCED-ON behaviours. TUTORIAL_DECKS_ENABLED is OFF in prod, so
// these tests mount the DeckPlayer DIRECTLY (which is flag-agnostic — it just
// plays a deck), keeping the 9-slide path honest even while the live app serves
// the 6-slide TutorialV2.
//
// COVERED HERE (Isj, risk 2 of the mic extraction): A4 (आवाज़) IS NOT A DEAD END.
// A4 resolves to MicPracticeArtboard; a granted mic must ADVANCE the deck via the
// artboard's onDone, or the pandit strands on the screen that teaches him voice.
//
// (The rest of the flag-forced-on Deck-A suite — back-law at 9, resume clamp,
//  skip-from-every-slide — lands with the TUTORIAL_TOTAL 6→9 unit.)
// ─────────────────────────────────────────────────────────────

const A4_INDEX = DECK_A.findIndex((s) => s.id === "A4"); // 0-based
const A4_SLIDE = A4_INDEX + 1; // 1-based cursor the parent controls

beforeEach(() => {
  try { localStorage.clear(); sessionStorage.clear(); } catch { /* noop */ }
  vi.spyOn(voiceController, "speak").mockImplementation(() => {});
  vi.spyOn(voiceController, "debug").mockImplementation(() => {});
  vi.spyOn(voiceController, "stopSpeech").mockImplementation(() => {});
  // keep micPerm "unknown" so a tap takes the practice path, not a re-grant
  Object.defineProperty(navigator, "permissions", {
    configurable: true,
    value: { query: vi.fn(() => Promise.reject(new Error("no permissions api"))) },
  });
  // e2e traversal → the mic practice resolves immediately, no native prompt
  sessionStorage.setItem("hpj_e2e", "1");
  (voiceController as unknown as { _e2e: boolean })._e2e = true;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  (voiceController as unknown as { _e2e: boolean })._e2e = false;
  try { sessionStorage.clear(); } catch { /* noop */ }
});

describe("Deck A (flag-forced-on) — A4 आवाज़ is not a dead end", () => {
  it("sanity: A4 is the interactive mic slide", () => {
    expect(A4_INDEX).toBeGreaterThanOrEqual(0);
    expect(DECK_A[A4_INDEX].interactive).toBe("mic");
    expect(A4_INDEX).toBeLessThan(DECK_A.length - 1); // not the last slide — has somewhere to advance TO
  });

  it("a granted mic ADVANCES the deck past A4 (onDone → next cursor)", async () => {
    const onSlideChange = vi.fn();
    render(
      <DeckPlayer
        deck={DECK_A}
        slide={A4_SLIDE}
        onSlideChange={onSlideChange}
        onExit={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    // tap the 78px mic disc → e2e practice completes → artboard onDone →
    // DeckPlayer.goNext → parent cursor advances by one slide
    fireEvent.click(screen.getByRole("button", { name: t("tutorial.slide5Button") }));
    await waitFor(() => expect(onSlideChange).toHaveBeenCalledWith(A4_SLIDE + 1));
  });
});
