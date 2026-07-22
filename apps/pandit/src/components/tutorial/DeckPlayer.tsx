"use client";

// ─────────────────────────────────────────────────────────────
// DeckPlayer — the SHARED, data-driven tutorial deck player. Plays any
// DeckSlide[] (Deck A pre-registration, Deck B first-home) through the canon
// TutorialShell chrome. It is a CONTROLLED component: the parent owns the
// 1-based slide cursor and persists it (resume), the player renders + drives
// navigation, voice and the confirm choices.
//
// Deliberately SLIM and standalone — it does NOT touch TutorialV2 (whose
// mic/mute/bell machinery and tutorialIdentity/micPrompt guards are Deck-A
// onboarding specifics). Interactive slides that need those extras stay in
// TutorialV2; a plain narrate+advance+skip deck (Deck B, and Deck A once its
// artboards land) uses this.
//
// Handles (founder spec): आगे / छोड़ें controls, a silent pause between slides
// (सोचने का समय), reduced-motion (the artboard renders its static end-state),
// per-slide speech via the existing TTS, and voice-answerable choices on the
// confirm slides (A0 जानें/स्किप, A8 हाँ/बाद-में). Progress persistence is the
// parent's job (onSlideChange).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from "react";
import TutorialShell from "@/app/onboarding/screens/tutorial/TutorialShell";
import type { DeckSlide } from "@/lib/tutorial-decks";
import { getArtboard } from "@/components/tutorial/tutorial-artboards";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { useVoiceCommands } from "@/hooks/useVoiceScreen";
import { SKIP, NEXT, BACK, YES } from "@/lib/voiceGrammar";
import { useReduced } from "@/lib/motion";
import type { SupportedLanguage } from "@/lib/onboarding-store";

export type DeckExitReason = "skip" | "defer" | "back";

export interface DeckPlayerProps {
  /** the slides to play (DECK_A or DECK_B) */
  deck: readonly DeckSlide[];
  /** 1-based current slide — controlled by the parent, which persists it */
  slide: number;
  /** advance/rewind — the parent updates the cursor AND persists it */
  onSlideChange: (slide: number) => void;
  /** left WITHOUT finishing — छोड़ें / स्किप (A0) / बाद-में (A8) / back off slide 1 */
  onExit: (reason: DeckExitReason) => void;
  /** finished — reached the end, or said हाँ on the CTA */
  onComplete: () => void;
  language?: SupportedLanguage;
}

// The doc-mandated silent "सोचने का समय" between slides: narration waits this
// long after each slide change so the pandit gets a beat before the voice speaks.
const SILENT_PAUSE_MS = 700;

export default function DeckPlayer({
  deck,
  slide,
  onSlideChange,
  onExit,
  onComplete,
  language = "Hindi",
}: DeckPlayerProps) {
  const reduced = useReduced();
  const total = deck.length;
  const idx = Math.min(Math.max(1, slide), total) - 1; // 0-based, clamped
  const s = deck[idx];
  const isLast = idx === total - 1;
  const isCta = s.role === "cta";

  const ctaRef = useRef<HTMLDivElement | null>(null);

  // ── navigation (all in 1-based cursor terms) ──────────────
  const goNext = () => (isLast ? onComplete() : onSlideChange(idx + 2));
  const goBack = () => (idx > 0 ? onSlideChange(idx) : onExit("back"));
  // confirm-slide choices: proceed advances (or completes on the CTA); the
  // skip choice leaves the deck — 'defer' on the CTA (बाद-में), else 'skip'.
  const proceed = () => (isCta ? onComplete() : goNext());
  const skipChoice = () => onExit(isCta ? "defer" : "skip");

  const onNext = s.confirm ? proceed : goNext;
  const onSkip = s.confirm ? skipChoice : () => onExit("skip");
  const skipLabel = s.confirm ? s.confirm[1].label : undefined;

  // ── voice: silent pause, then speak the slide's line ──────
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    setArmed(false);
    const t = setTimeout(() => setArmed(true), SILENT_PAUSE_MS);
    return () => clearTimeout(t);
  }, [slide]);
  useScreenVoice(armed ? s.say : "", {
    highlightRef: isCta ? (ctaRef as unknown as { current: HTMLElement | null }) : undefined,
  });

  // Command set — STABLE length (3) so 'स्किप करें' stays armed across slide
  // swaps (no re-register churn; useVoiceCommands' proxy reads current actions).
  const commands = useMemo(() => {
    if (s.confirm) {
      return [
        { keywords: [s.confirm[0].label, ...YES, ...NEXT], action: proceed },
        { keywords: [s.confirm[1].label, ...SKIP], action: skipChoice },
        { keywords: [...BACK], action: goBack },
      ];
    }
    return [
      { keywords: [...NEXT], action: goNext },
      { keywords: [...SKIP], action: () => onExit("skip") },
      { keywords: [...BACK], action: goBack },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);
  useVoiceCommands(commands, "आगे बढ़ने के लिए 'आगे', छोड़ने के लिए 'स्किप करें' बोलिए।");

  const Artboard = getArtboard(s.id);

  return (
    <TutorialShell
      currentDot={idx + 1}
      totalDots={total}
      onSkip={onSkip}
      skipLabel={skipLabel}
      onBack={goBack}
      onNext={onNext}
      nextLabel={s.nextLabel}
      nextBtnRef={ctaRef}
      hero={isCta}
      language={language}
    >
      <Artboard slide={s} reduced={reduced} />
    </TutorialShell>
  );
}
