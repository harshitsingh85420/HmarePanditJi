"use client";

// ─────────────────────────────────────────────────────────────
// TutorialShell — प्रथम आरती edition. Layout grammar: 100dvh column,
// one scrollable content zone, ONE footer (sindoor primary + शिष्य
// orb, optional back underneath). Progress dots take the current
// slide's festive accent (accentHex). Every primary stays sindoor.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { TUTORIAL_TRANSLATIONS, type TutorialLanguage, getTutorialLang } from "@/lib/tutorial-translations";
import type { SupportedLanguage } from "@/lib/onboarding-store";

interface TutorialShellProps {
  currentDot: number;
  totalDots?: number;
  onSkip: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
  /** Festive accent for the progress dots (defaults to sindoor). */
  accentHex?: string;
  language?: SupportedLanguage;
}

export default function TutorialShell({
  currentDot,
  totalDots = 12,
  onSkip,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  children,
  accentHex = "#B23A1A",
  language = "Hindi",
}: TutorialShellProps) {
  const lang: TutorialLanguage = getTutorialLang(language);
  const translations = TUTORIAL_TRANSLATIONS[lang];
  const label = nextLabel || translations.next;

  return (
    <main className="h-[100dvh] w-full max-w-[430px] mx-auto bg-cream font-hindi text-ink flex flex-col relative overflow-hidden">
      <header className="pt-6 px-4 flex justify-between items-center shrink-0 gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="w-14 h-14 min-h-[56px] min-w-[56px] flex items-center justify-center active:scale-90 transition-all shrink-0 rounded-full"
            aria-label={translations.back}
          >
            {/* UNIVERSAL BACK LAW: 48px circle, card bg, sand border, ← ink */}
            <span className="w-12 h-12 rounded-full bg-card border border-saffron-200 shadow-card flex items-center justify-center text-[24px] text-ink" aria-hidden="true">
              ←
            </span>
          </button>
        )}
        <div className="flex gap-1.5 flex-wrap max-w-[200px]">
          {Array.from({ length: totalDots }).map((_, index) => (
            <span
              key={index}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: index < currentDot ? accentHex : "#FAD8C9" }}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          className="min-h-[56px] px-4 text-[18px] font-semibold text-saffron-600 rounded-full border-2 border-saffron-300 active:bg-saffron-50 shrink-0"
        >
          {translations.skip}
        </button>
      </header>

      <div className="flex-grow min-h-0 overflow-y-auto px-4 py-4">
        {children}
      </div>

      <footer className="px-4 pb-4 pt-3 space-y-2 shrink-0 bg-cream/95 backdrop-blur border-t border-saffron-100">
        <div className="flex items-end gap-3">
          <button
            onClick={onNext}
            disabled={nextDisabled}
            aria-disabled={nextDisabled}
            className="flex-1 min-h-[64px] bg-saffron-500 text-[#FFF3EA] shadow-btn rounded-btn flex items-center justify-center text-[20px] font-bold active:scale-95 transition-transform gap-2 font-hindi disabled:opacity-60 disabled:active:scale-100"
          >
            {label}
          </button>
          <ShishyaOrb />
        </div>
      </footer>
    </main>
  );
}
