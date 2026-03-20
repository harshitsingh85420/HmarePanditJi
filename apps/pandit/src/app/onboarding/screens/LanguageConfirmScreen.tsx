'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store';

interface LanguageConfirmScreenProps {
  language: SupportedLanguage;
  onLanguageChange?: () => void;
  detectedCity: string;
  onConfirm: () => void;
  onChange: () => void;
}

export default function LanguageConfirmScreen({
  language,
  detectedCity,
  onConfirm,
  onChange,
  onLanguageChange
}: LanguageConfirmScreenProps) {
  const langInfo = LANGUAGE_DISPLAY[language] || LANGUAGE_DISPLAY['Hindi'];

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const t = setTimeout(() => {
      speak(
        `Aapke shehar ke hisaab se, humne ${langInfo.latinName} ko chuna hai. Kya yeh sahi hai? Haan ya Nahi bolein.`,
        'hi-IN',
        () => {
          // After speaking — start listening with 500ms buffer (already handled inside speak via postTtsTimeout)
          cleanup = startListening({
            language: 'hi-IN',
            onResult: (result) => {
              const lower = result.transcript.toLowerCase();
              if (lower.includes('haan') || lower.includes('ha') || lower.includes('yes') || lower.includes('sahi') || lower.includes('theek') || lower.includes('bilkul')) {
                onConfirm();
              } else if (lower.includes('nahi') || lower.includes('naa') || lower.includes('no') || lower.includes('badlo') || lower.includes('change') || lower.includes('alag')) {
                onChange();
              }
            },
            onError: () => {
              // Silently ignore — user can tap buttons
            },
          });
        }
      );
    }, 600);

    return () => {
      clearTimeout(t);
      cleanup?.();
      stopListening();
      stopSpeaking();
    };
  }, [language, langInfo.latinName, onConfirm, onChange]);

  return (
    <main className="w-full min-h-dvh bg-vedic-cream shadow-2xl relative flex flex-col overflow-hidden items-center text-vedic-brown font-hind">
      {/* Top Bar */}
      <header className="flex items-center p-4 w-full justify-between">
        <button onClick={onChange} aria-label="Go back" className="p-2 hover:bg-black/5 rounded-full transition-colors active:scale-95">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </button>
        <button onClick={onLanguageChange} className="text-[24px] active:opacity-50">🌐</button>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4 w-full max-w-[390px]">

        {/* Detected City Chip */}
        {detectedCity && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-lt border border-primary text-vedic-gold text-sm font-medium mb-10"
          >
            <span className="mr-1">📍</span>
            <span>{detectedCity}</span>
          </motion.div>
        )}

        {/* Main Language Card */}
        <motion.section
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="w-full bg-white rounded-[20px] py-12 px-8 flex flex-col items-center shadow-card-hover animate-gentle-float"
        >
          {/* Language Script Icon */}
          <div className="text-[64px] font-bold mb-2 text-primary animate-glow-pulse">
            {langInfo.scriptChar}
          </div>

          {/* Language Name */}
          <h1 className="text-[48px] font-bold leading-tight mb-4 text-vedic-brown">
            {langInfo.nativeName}
          </h1>

          {/* Question Text */}
          <p className="text-[22px] text-vedic-gold text-center leading-snug">
            क्या इस भाषा में बात करना चाहेंगे?
          </p>
        </motion.section>

        {/* Voice Status */}
        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-end gap-1.5 h-6 mb-3">
            <div className="w-1.5 bg-primary rounded-full animate-voice-bar"></div>
            <div className="w-1.5 bg-primary rounded-full animate-voice-bar-2 h-full"></div>
            <div className="w-1.5 bg-primary rounded-full animate-voice-bar-3"></div>
          </div>
          <p className="text-primary font-medium text-lg mb-1">सुन रहा हूँ...</p>
          <p className="text-vedic-gold text-sm italic">"हाँ" या "बदलें" बोलें</p>
        </div>
      </div>

      {/* Action Buttons */}
      <footer className="p-6 space-y-4 mb-8 w-full max-w-[390px]">
        <motion.button
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          onClick={onConfirm}
          className="w-full py-4 bg-primary text-white font-bold text-lg rounded-btn shadow-cta transition-transform active:scale-95"
        >
          हाँ, यही भाषा सही है
        </motion.button>

        <motion.button
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          onClick={onChange}
          className="w-full py-4 bg-white border-2 border-primary text-primary font-bold text-lg rounded-btn transition-transform active:scale-95"
        >
          दूसरी भाषा चुनें
        </motion.button>
      </footer>
    </main>
  );
}
