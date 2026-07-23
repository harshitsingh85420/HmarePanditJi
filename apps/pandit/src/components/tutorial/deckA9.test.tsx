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

// TutorialShell's default skip label (Hindi) — confirm slides override it with
// their own choice label (A0 'स्किप करें', A8 'बाद में').
const DEFAULT_SKIP = "छोड़िए ›";

describe("Deck A (flag-forced-on) — no slide strands the pandit", () => {
  it("sanity: the deck ends on the CTA (A8, शुरू कीजिए)", () => {
    const last = DECK_A[DECK_A.length - 1];
    expect(last.id).toBe("A8");
    expect(last.role).toBe("cta");
    expect(last.nextLabel).toBe("शुरू कीजिए");
  });

  it("SKIP leaves the deck from EVERY slide (defer on the CTA)", () => {
    for (let slide = 1; slide <= DECK_A.length; slide++) {
      const s = DECK_A[slide - 1];
      const onExit = vi.fn();
      render(
        <DeckPlayer deck={DECK_A} slide={slide} onSlideChange={vi.fn()} onExit={onExit} onComplete={vi.fn()} />,
      );
      const label = s.confirm ? s.confirm[1].label : DEFAULT_SKIP;
      fireEvent.click(screen.getByRole("button", { name: label }));
      // A8 (cta) exits as 'defer' (बाद में); every other slide as 'skip'
      expect(onExit, `slide ${slide} (${s.id})`).toHaveBeenCalledWith(s.role === "cta" ? "defer" : "skip");
      cleanup();
    }
  });

  it("the CTA slide completes the deck (शुरू कीजिए → onComplete)", () => {
    const onComplete = vi.fn();
    render(
      <DeckPlayer deck={DECK_A} slide={DECK_A.length} onSlideChange={vi.fn()} onExit={vi.fn()} onComplete={onComplete} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "शुरू कीजिए" }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("hardware/UI back off slide 1 exits as 'back' (universal back law hands over)", () => {
    const onExit = vi.fn();
    render(
      <DeckPlayer deck={DECK_A} slide={1} onSlideChange={vi.fn()} onExit={onExit} onComplete={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "वापस जाइए" }));
    expect(onExit).toHaveBeenCalledWith("back");
  });

  it("out-of-range cursors clamp inside the deck (resume safety at 9)", () => {
    // DeckPlayer's own clamp: a cursor beyond the deck renders the last slide,
    // below 1 renders the first — never a crash, never a blank frame.
    const { container } = render(
      <DeckPlayer deck={DECK_A} slide={99} onSlideChange={vi.fn()} onExit={vi.fn()} onComplete={vi.fn()} />,
    );
    expect(container.textContent).toContain(DECK_A[DECK_A.length - 1].headline);
    cleanup();
    const { container: c2 } = render(
      <DeckPlayer deck={DECK_A} slide={-5} onSlideChange={vi.fn()} onExit={vi.fn()} onComplete={vi.fn()} />,
    );
    expect(c2.textContent).toContain(DECK_A[0].headline);
  });
});
