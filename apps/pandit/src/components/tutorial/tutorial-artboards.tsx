"use client";

// ─────────────────────────────────────────────────────────────
// TUTORIAL ARTBOARD REGISTRY. Each deck slide (id 'A0'..'B4') renders an
// artboard here. Until the Claude-Design "ट्यूटोरियल · Animated" bundle lands,
// every slide uses PlaceholderArtboard (a neutral preview of the slide's
// in-mock labels). When the bundle arrives: ingest each artboard into
// design/canon, add it to ARTBOARDS keyed by slide id — the DeckPlayer wiring
// (navigation, voice, progress, reduced-motion) is UNTOUCHED. This registry is
// the ONE seam the visuals drop into.
//
// A real artboard is a component taking { slide, reduced }. `reduced` is the
// prefers-reduced-motion signal — a real artboard must render its STATIC
// end-state (no loops) when true (TUTORIAL ANIMATION LAW / A12).
// ─────────────────────────────────────────────────────────────

import React from "react";
import type { DeckSlide } from "@/lib/tutorial-decks";
import { MicPracticeArtboard } from "./MicPracticeArtboard";

export interface DeckArtboardProps {
  slide: DeckSlide;
  /** prefers-reduced-motion — a real artboard renders its static end-state when true */
  reduced: boolean;
  // ── interactive-artboard signals (static artboards ignore them) ──
  // The DeckPlayer passes these through to every artboard; only interactive
  // ones (currently just the आवाज़ mic, A4) act on them. Defined here — not
  // discovered at flag-flip — so the Design bundle port never has to add them.
  /** permission granted (mic) — the player may record progress */
  onGranted?: () => void;
  /** permission denied at the browser level (mic) */
  onDenied?: () => void;
  /** true while the artboard is mid-interaction — the player gates its Next */
  onBusy?: (busy: boolean) => void;
  /** the interaction completed — the player ADVANCES (so A4 is never a dead end) */
  onDone?: () => void;
}

/** Neutral placeholder — shows the slide's in-mock labels so the deck is fully
 *  playable (headline + narration + controls + progress) before the visuals
 *  exist. Deliberately calm, never a fake of the final art. */
export function PlaceholderArtboard({ slide }: DeckArtboardProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 text-center select-none">
      <h2 className="text-[26px] font-black text-temple-700 font-hindi leading-tight">{slide.headline}</h2>
      <div
        className="w-full max-w-[300px] rounded-tile border-2 border-dashed border-saffron-200 bg-card/60 px-5 py-6 flex flex-col items-center gap-2.5"
        aria-hidden="true"
      >
        {slide.inMock.map((label, i) => (
          <span key={i} className="text-[16px] font-semibold text-softgrey font-hindi leading-snug">
            {label}
          </span>
        ))}
      </div>
      <span className="text-[13px] font-medium text-saffron-300 font-hindi">चित्र तैयार हो रहा है</span>
    </div>
  );
}

/**
 * Real artboards, keyed by slide id. EMPTY until the design bundle is ingested —
 * add entries here (e.g. `A1: KamaiArtboard`) and that slide swaps from the
 * placeholder to the real art with zero changes to the DeckPlayer.
 */
export const ARTBOARDS: Partial<Record<string, React.FC<DeckArtboardProps>>> = {
  // A4 आवाज़ is NOT a static illustration — it is the FUNCTIONAL mic-practice
  // component, shared byte-for-byte with the live TutorialV2 (Ruling #8 / C).
  // The Design bundle's A4 art is merged INTO it as a visual shell, never over
  // it (docs/review/tutorial-merge-gate.md). micSharedConsumers.test.ts pins
  // that this entry stays MicPracticeArtboard.
  A4: MicPracticeArtboard,
  // A0: SwagatArtboard, A1: KamaiArtboard, … (populated when the bundle lands)
};

/** The artboard component for a slide id — its real art if ingested, else the placeholder. */
export function getArtboard(id: string): React.FC<DeckArtboardProps> {
  return ARTBOARDS[id] ?? PlaceholderArtboard;
}
