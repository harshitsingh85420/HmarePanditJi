'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScreenFooter from '@/components/ScreenFooter';
import { TUTORIAL_TRANSLATIONS, type TutorialLanguage, getTutorialLang } from '@/lib/tutorial-translations';
import type { SupportedLanguage } from '@/lib/onboarding-store';

const noop = () => { };

interface TutorialShellProps {
  currentDot: number;
  totalDots?: number;
  onSkip: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  children: React.ReactNode;
  showVoiceBar?: boolean;
  isListening?: boolean;
  onKeyboardToggle?: () => void;
  showKeyboardToggle?: boolean;
  nextVariant?: 'primary' | 'primary-dk';
  language?: SupportedLanguage;
}

export default function TutorialShell({
  currentDot,
  totalDots = 12,
  onSkip,
  onBack,
  onNext,
  nextLabel,
  children,
  showVoiceBar = true,
  isListening = false,
  onKeyboardToggle,
  showKeyboardToggle = false,
  nextVariant = 'primary',
  language = 'Hindi',
}: TutorialShellProps) {
  const nextButtonClasses =
    nextVariant === 'primary-dk'
      ? 'bg-primary-dk shadow-cta-dk'
      : 'bg-primary shadow-cta';

  // Get translations
  const lang: TutorialLanguage = getTutorialLang(language);
  const translations = TUTORIAL_TRANSLATIONS[lang];
  const label = nextLabel || translations.next;

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-hind text-text-primary flex flex-col shadow-2xl relative overflow-hidden">
      <header className="pt-10 px-6 flex justify-between items-center shrink-0">
        <div className="flex gap-1.5 flex-wrap max-w-[250px]">
          {Array.from({ length: totalDots }).map((_, index) => (
            <span
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${index < currentDot ? 'bg-saffron' : 'bg-border-default'
                }`}
            />
          ))}
        </div>
        {/* UI-005 FIX: Skip button with proper touch target (52px minimum) */}
        <button
          onClick={onSkip}
          className="min-w-[64px] min-h-[52px] px-5 text-[16px] font-semibold text-saffron rounded-full border-2 border-saffron/30 active:bg-saffron-light active:opacity-50 shrink-0"
        >
          {translations.skip}
        </button>
      </header>

      <div className="flex-grow overflow-y-auto px-6 py-6">
        {children}
      </div>

      {showVoiceBar ? (
        <ScreenFooter
          isListening={isListening}
          onKeyboardToggle={showKeyboardToggle ? (onKeyboardToggle ?? noop) : undefined}
        >
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className={`w-full h-16 ${nextButtonClasses} text-text-primary rounded-2xl flex items-center justify-center text-[20px] font-bold active:scale-95 transition-transform gap-2`}
            >
              {label}
            </motion.button>
            {/* UI-006 FIX: Back button with proper touch target (52px minimum) and larger text */}
            {onBack && (
              <button
                onClick={onBack}
                className="w-full text-center text-[16px] font-medium text-saffron min-h-[52px] py-3 rounded-full border-2 border-saffron/30 active:bg-saffron-light"
              >
                {translations.back}
              </button>
            )}
          </div>
        </ScreenFooter>
      ) : (
        <footer className="px-6 pb-10 pt-3 space-y-3 shrink-0 bg-surface-base/90 backdrop-blur-sm border-t border-border-default">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className={`w-full h-16 ${nextButtonClasses} text-text-primary rounded-2xl flex items-center justify-center text-[20px] font-bold active:scale-95 transition-transform gap-2`}
          >
            {label}
          </motion.button>
          {/* UI-006 FIX: Back button with proper touch target (52px minimum) and larger text */}
          {onBack && (
            <button
              onClick={onBack}
              className="w-full text-center text-[16px] font-medium text-saffron min-h-[52px] py-3 rounded-full border-2 border-saffron/30 active:bg-saffron-light"
            >
              {translations.back}
            </button>
          )}
        </footer>
      )}
    </main>
  );
}
