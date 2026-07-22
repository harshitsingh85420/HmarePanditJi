import { describe, it, expect } from "vitest";
import { TUTORIAL_DECKS_ENABLED, DECK_A, DECK_B } from "./tutorial-decks";
import { getArtboard, PlaceholderArtboard } from "@/components/tutorial/tutorial-artboards";

// ─────────────────────────────────────────────────────────────
// MERGE-GATE as a FLAG PROPERTY (Isj 2026-07-22). The tutorial is the pilot
// pandit's first screen — placeholder slides there = first-impression failure.
// So: IF the new deck-based tutorial is ON (TUTORIAL_DECKS_ENABLED), EVERY deck
// slide MUST have a real artboard — none may resolve to PlaceholderArtboard.
//
// Formulated on the FLAG, not on "is the deck live-wired", so the guard and the
// flag can NEVER cancel each other (the old trap: a guard that only fires for a
// live deck + a flag that keeps it un-wired = zero protection). While the flag
// is OFF the property is vacuously true; the instant it flips ON with any
// placeholder present, the build fails. Proven-to-fail by flipping the flag.
// (The 9-slide path itself is exercised — flag forced on — in deckA9.test.*,
// so an always-off flag is never an unexercised code path.)
// ─────────────────────────────────────────────────────────────

// The decision the port-complete moment must surface (Isj's call), as a pure
// testable predicate so it can be PROVEN to fire without populating ARTBOARDS.
export const needsFlagFlip = (allArtboardsReal: boolean, flagOn: boolean): boolean =>
  allArtboardsReal && !flagOn;

describe("tutorial merge-gate — flag ON ⇒ no placeholder artboards", () => {
  it("if TUTORIAL_DECKS_ENABLED, every deck slide has a real (non-placeholder) artboard", () => {
    if (!TUTORIAL_DECKS_ENABLED) return; // vacuously satisfied while the deck is OFF
    const stillPlaceholder = [...DECK_A, ...DECK_B]
      .filter((s) => getArtboard(s.id) === PlaceholderArtboard)
      .map((s) => s.id);
    expect(
      stillPlaceholder,
      "these deck slides still render PlaceholderArtboard — the deck must not ship ON",
    ).toEqual([]);
  });

  // MIRROR RISK (Isj 2026-07-22): a default-OFF flag can SILENTLY NEVER SHIP —
  // once every artboard is real, the guard above stays vacuously green and the
  // app keeps serving the old 6-slide TutorialV2 with nothing turning red. So
  // the port-complete moment must turn the build RED to force the flip DECISION
  // to the surface (see docs/review/tutorial-merge-gate.md — flip is Isj's call).
  it("port-complete decision point: all artboards real ⇒ the flag MUST be flipped ON", () => {
    const allReal = [...DECK_A, ...DECK_B].every((s) => getArtboard(s.id) !== PlaceholderArtboard);
    if (needsFlagFlip(allReal, TUTORIAL_DECKS_ENABLED)) {
      throw new Error(
        "ALL deck artboards are real but TUTORIAL_DECKS_ENABLED is still OFF — the new tutorial is silently not shipping. DECISION (Isj): flip TUTORIAL_DECKS_ENABLED ON, or this build stays red.",
      );
    }
  });

  it("the flip-decision predicate can fire (proof-of-teeth)", () => {
    expect(needsFlagFlip(true, false)).toBe(true); // port done, flag off → RED (surface the decision)
    expect(needsFlagFlip(true, true)).toBe(false); // shipped
    expect(needsFlagFlip(false, false)).toBe(false); // mid-port, correctly quiet
    expect(needsFlagFlip(false, true)).toBe(false); // (flag-on+placeholder caught by the first test)
  });
});
