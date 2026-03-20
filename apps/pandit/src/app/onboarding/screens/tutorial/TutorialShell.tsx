'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TutorialShellProps {
  currentDot: number;
  totalDots?: number;
  onSkip: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  children: React.ReactNode;
  showVoiceBar?: boolean;
}

export default function TutorialShell({
  currentDot,
  totalDots = 12,
  onSkip,
  onBack,
  onNext,
  nextLabel = 'अगला फ़ायदा देखें →',
  children,
  showVoiceBar = true,
}: TutorialShellProps) {
  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-vedic-cream font-hind text-vedic-brown flex flex-col shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="pt-10 px-6 flex justify-between items-center shrink-0">
        {/* Progress Dots */}
        <div className="flex gap-1.5 flex-wrap max-w-[250px]">
          {Array.from({ length: totalDots }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentDot ? 'bg-primary' : 'bg-vedic-border'
              }`}
            />
          ))}
        </div>
        <button onClick={onSkip} className="text-vedic-gold text-sm font-medium shrink-0 active:opacity-50">
          Skip करें →
        </button>
      </header>

      {/* Content - scrollable */}
      <div className="flex-grow overflow-y-auto px-6 py-6">
        {children}
      </div>

      {/* Footer */}
      <footer className="px-6 pb-10 pt-3 space-y-3 shrink-0 bg-vedic-cream/90 backdrop-blur-sm border-t border-vedic-border">
        {showVoiceBar && (
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 bg-success-lt border border-success/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-success">बोलकर सुनें</span>
            </div>
            <button className="p-2 rounded-lg bg-vedic-border/50 text-vedic-gold hover:bg-vedic-border transition-colors">
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                <rect height="16" rx="2" width="20" x="2" y="4"></rect>
                <path d="M6 8h.01"></path><path d="M10 8h.01"></path><path d="M14 8h.01"></path><path d="M18 8h.01"></path>
                <path d="M6 12h.01"></path><path d="M18 12h.01"></path><path d="M7 16h10"></path>
              </svg>
            </button>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-[20px] font-bold shadow-cta active:scale-95 transition-transform gap-2"
        >
          {nextLabel}
        </motion.button>
        {onBack && (
          <button onClick={onBack} className="w-full text-center text-vedic-gold text-sm py-1 active:opacity-50">
            ← वापस जाएं
          </button>
        )}
      </footer>
    </main>
  );
}
