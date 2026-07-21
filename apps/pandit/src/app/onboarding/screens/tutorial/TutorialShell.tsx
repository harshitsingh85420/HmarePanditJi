"use client";

// ─────────────────────────────────────────────────────────────
// TutorialShell — CANON-EXACT chrome for artboards 4-9
// (design/canon/हमारे पंडित जी.dc.html · "ट्यूटोरियल · …").
//
// Canon's tutorial frame is ONE padded column — `padding:16px 24px 22px`:
//   · top row: "छोड़ें ›" pushed to the right (plain text, no pill)
//   · flex:1 centred illustration zone
//   · bottom stack (gap 16): the 6 progress dots, then the primary CTA
// The dots are NOT in the header in canon — they sit directly above the
// button, inactive 14px flat #E4D6C1, the current one 20px drawn as a lit
// genda orb (bg-orb-diya + shadow-glow-genda). On the final frame all six
// are lit at 18px with the 7px glow, and the CTA becomes the hero variant:
// 66px tall, the sindoor 180deg gradient, 23px/900, shadow-btn-hero.
//
// Page field: canon frames 4-8 carry
//   radial-gradient(120% 60% at 50% 20%,#FFF3DE,#FFF9EE 60%)
// and frame 9 (स्वागत) switches to linear-gradient(180deg,#FFE9C4,#FFF9EE 55%).
// Neither exists as a token, so both are inline canon literals.
//
// STANDING LAWS kept over canon (see lawConflicts in the batch report):
//   · 52px tap targets — canon's "छोड़ें ›" is bare 15px text; we keep the
//     canon LOOK but give it a 52px hit box and the 18sp floor.
//   · the शिष्य orb keeps its footer seat (ONE voice control; the सो जाओ
//     slide spotlights it) even though canon's tutorial frames omit it.
//   · the universal back button is kept even though canon 4-9 has none.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { TUTORIAL_TRANSLATIONS, type TutorialLanguage, getTutorialLang } from "@/lib/tutorial-translations";
import type { SupportedLanguage } from "@/lib/onboarding-store";

/** canon 4-8 page field */
export const CANON_TUTORIAL_BG = "radial-gradient(120% 60% at 50% 20%,#FFF3DE,#FFF9EE 60%)";
/** canon 9 (स्वागत) page field */
export const CANON_TUTORIAL_BG_HERO = "linear-gradient(180deg,#FFE9C4 0%,#FFF9EE 55%)";

interface TutorialShellProps {
  currentDot: number;
  totalDots?: number;
  onSkip: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  /** S3: narration-highlight target — a wrapper around the primary CTA. */
  nextBtnRef?: { current: HTMLDivElement | null };
  children: React.ReactNode;
  /**
   * स्वागत (canon 9): warm page gradient, every dot lit, hero CTA.
   * Canon draws this frame differently from 4-8 in all three places.
   */
  hero?: boolean;
  language?: SupportedLanguage;
}

export default function TutorialShell({
  currentDot,
  totalDots = 6,
  onSkip,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  nextBtnRef,
  children,
  hero = false,
  language = "Hindi",
}: TutorialShellProps) {
  const lang: TutorialLanguage = getTutorialLang(language);
  const translations = TUTORIAL_TRANSLATIONS[lang];
  const label = nextLabel || translations.next;

  return (
    <main
      className="h-[100dvh] w-full max-w-[430px] mx-auto font-hindi text-ink flex flex-col relative overflow-hidden"
      style={{ background: hero ? CANON_TUTORIAL_BG_HERO : CANON_TUTORIAL_BG }}
    >
      {/* canon top row — padding 16px 24px, छोड़ें pushed right */}
      <header className="pt-4 px-6 flex justify-between items-center shrink-0 gap-2">
        {onBack ? (
          <button
            onClick={onBack}
            className="min-h-[52px] min-w-[52px] flex items-center justify-center active:scale-90 transition-transform shrink-0 rounded-full"
            aria-label={translations.back}
          >
            {/* UNIVERSAL BACK LAW: 48px circle, card bg, sand border —
                canon's back glyph is always Material arrow_back, never ← */}
            <span className="w-12 h-12 rounded-full bg-card border border-saffron-200 shadow-card flex items-center justify-center" aria-hidden="true">
              <span className="material-symbols-outlined text-[24px] leading-none text-saffron-700">arrow_back</span>
            </span>
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <button
          onClick={onSkip}
          // canon: 15px/700 #8A6F5C plain text. 18sp floor + 52px hit box.
          className="min-h-[52px] px-2 -mr-2 flex items-center text-[18px] font-bold text-softgrey active:opacity-70 shrink-0"
        >
          {translations.skip}
        </button>
      </header>

      {/* canon centre: flex:1, contents centred vertically */}
      <div className="flex-grow min-h-0 overflow-y-auto px-6 py-2 flex flex-col justify-center">
        {children}
      </div>

      {/* canon bottom stack: dots, then the CTA, gap 16 */}
      <footer className="px-6 pb-[22px] pt-2 shrink-0 flex flex-col items-center gap-4">
        <div className="flex gap-[9px] items-center justify-center" aria-hidden="true">
          {Array.from({ length: totalDots }).map((_, index) => {
            const lit = hero || index === currentDot - 1;
            const size = hero ? 18 : lit ? 20 : 14;
            return (
              <span
                key={index}
                className={`rounded-full shrink-0 ${
                  lit
                    ? // canon: active dot glow 8px (frames 5a-5e); hero dots 7px
                      `bg-orb-diya ${hero ? "shadow-glow-genda-sm" : "shadow-glow-genda"}`
                    : "bg-sand-300"
                }`}
                style={{ width: size, height: size }}
              />
            );
          })}
        </div>

        <div className="w-full flex items-end gap-3">
          <div className="flex-1" ref={nextBtnRef}>
            <button
              onClick={onNext}
              disabled={nextDisabled}
              aria-disabled={nextDisabled}
              className={
                hero
                  ? // canon 5f: min-height 66, bg-sindoor 180deg, 23px/900, gap 11,
                    // shadow-btn-hero, g-glowring pulse
                    "relative w-full min-h-[66px] bg-sindoor text-chandan shadow-btn-hero rounded-cta flex items-center justify-center text-[23px] font-black gap-[11px] font-hindi active:scale-95 transition-transform disabled:opacity-60 disabled:active:scale-100"
                  : // canon 5a-5e: min-height 60, #B23A1A, 20px/800, radius 18, shadow-btn
                    "w-full min-h-[60px] bg-saffron-500 text-chandan shadow-btn rounded-cta flex items-center justify-center text-[20px] font-extrabold gap-2 font-hindi active:scale-95 transition-transform disabled:opacity-60 disabled:active:scale-100"
              }
            >
              {hero && (
                <>
                  {/* canon g-glowring as a transform/opacity ring (A12-safe) */}
                  <span
                    className="pa-glowring absolute inset-0 rounded-cta pointer-events-none motion-reduce:hidden"
                    aria-hidden="true"
                  />
                  {/* canon draws Material 'celebration', not the 🎉 emoji */}
                  <span className="material-symbols-outlined text-[28px] leading-none" aria-hidden="true">
                    celebration
                  </span>
                </>
              )}
              {label}
            </button>
          </div>
          {/* ONE voice control keeps its footer seat (see header note) */}
          <ShishyaOrb />
        </div>
      </footer>
    </main>
  );
}
