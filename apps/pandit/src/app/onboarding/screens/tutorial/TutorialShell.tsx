'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScreenFooter from '@/components/ScreenFooter';

const noop = () => {};

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
}

export default function TutorialShell({
  currentDot,
  totalDots = 12,
  onSkip,
  onBack,
  onNext,
  nextLabel = 'जानें (सिर्फ 2 मिनट) →',
  children,
  showVoiceBar = true,
  isListening = false,
  onKeyboardToggle,
  showKeyboardToggle = false,
  nextVariant = 'primary',
}: TutorialShellProps) {
  const nextButtonClasses =
    nextVariant === 'primary-dk'
      ? 'bg-primary-dk shadow-cta-dk'
      : 'bg-primary shadow-cta';

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-vedic-cream font-hind text-vedic-brown flex flex-col shadow-2xl relative overflow-hidden">
      <header className="pt-10 px-6 flex justify-between items-center shrink-0">
        <div className="flex gap-1.5 flex-wrap max-w-[250px]">
          {Array.from({ length: totalDots }).map((_, index) => (
            <span
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index < currentDot ? 'bg-primary' : 'bg-vedic-border'
              }`}
            />
          ))}
        </div>
        <button onClick={onSkip} className="text-vedic-gold text-sm font-medium shrink-0 active:opacity-50">
          Skip करें →
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
              className={`w-full h-16 ${nextButtonClasses} text-white rounded-2xl flex items-center justify-center text-[20px] font-bold active:scale-95 transition-transform gap-2`}
            >
              {nextLabel}
            </motion.button>
            {onBack && (
              <button onClick={onBack} className="w-full text-center text-vedic-gold text-sm py-1 active:opacity-50">
                ← वापस जाएँ
              </button>
            )}
          </div>
        </ScreenFooter>
      ) : (
        <footer className="px-6 pb-10 pt-3 space-y-3 shrink-0 bg-vedic-cream/90 backdrop-blur-sm border-t border-vedic-border">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className={`w-full h-16 ${nextButtonClasses} text-white rounded-2xl flex items-center justify-center text-[20px] font-bold active:scale-95 transition-transform gap-2`}
          >
            {nextLabel}
          </motion.button>
          {onBack && (
            <button onClick={onBack} className="w-full text-center text-vedic-gold text-sm py-1 active:opacity-50">
              ← वापस जाएँ
            </button>
          )}
        </footer>
      )}
    </main>
  );
}
