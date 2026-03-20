'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store';

interface LanguageChoiceConfirmScreenProps {
  language?: SupportedLanguage;
  onLanguageChange?: () => void;
  pendingLanguage: string;
  onConfirm: () => void;
  onReject: () => void;
}

export default function LanguageChoiceConfirmScreen({
  pendingLanguage,
  onConfirm,
  onReject
}: LanguageChoiceConfirmScreenProps) {
  const langInfo = LANGUAGE_DISPLAY[pendingLanguage as SupportedLanguage] || { nativeName: pendingLanguage, latinName: pendingLanguage };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const t = setTimeout(() => {
      speak(
        `Aapne ${langInfo.latinName} chuna hai. Kya yahi bhasha sahi hai?`,
        'hi-IN',
        () => {
          cleanup = startListening({
            language: 'hi-IN',
            onResult: (result) => {
              const lower = result.transcript.toLowerCase();
              if (lower.includes('haan') || lower.includes('ha') || lower.includes('yes') || lower.includes('sahi')) {
                onConfirm();
              } else if (lower.includes('nahi') || lower.includes('no') || lower.includes('badlo')) {
                onReject();
              }
            },
            onError: () => {},
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
  }, [langInfo.latinName, onConfirm, onReject]);

  return (
    <main className="font-hind text-vedic-brown w-full min-h-dvh max-w-[390px] mx-auto bg-vedic-cream flex flex-col items-center justify-between p-6 shadow-2xl">
      {/* Header */}
      <header className="w-full pt-8 text-center">
        <p className="text-[12px] opacity-40 font-medium tracking-widest uppercase">
          भाषा की पुष्टि
        </p>
      </header>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full text-center space-y-10">
        {/* Language Display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: 'spring' }}
          className="space-y-2"
        >
          <h1 className="text-[56px] font-bold text-primary leading-tight">
            {langInfo.nativeName}
          </h1>
          <p className="text-[24px] font-normal text-vedic-gold">
            {langInfo.latinName}
          </p>
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-[26px] font-semibold text-vedic-brown">
            क्या यही भाषा सही है?
          </h2>
        </motion.div>

        {/* Voice Status Indicator */}
        <div className="flex items-center justify-center gap-1.5 h-10">
          <div className="animate-voice-bar w-1.5 bg-primary rounded-full"></div>
          <div className="animate-voice-bar-2 w-1.5 bg-primary rounded-full h-full"></div>
          <div className="animate-voice-bar-3 w-1.5 bg-primary rounded-full"></div>
          <div className="animate-voice-bar w-1.5 bg-primary rounded-full"></div>
          <div className="animate-voice-bar-2 w-1.5 bg-primary rounded-full h-full"></div>
        </div>
      </div>

      {/* Action Footer */}
      <footer className="w-full space-y-4 pb-12 relative">
        <button
          onClick={onConfirm}
          className="w-full bg-primary text-white text-[20px] font-semibold py-4 rounded-2xl shadow-cta active:scale-[0.98] transition-transform"
        >
          हाँ, यही भाषा चाहिए
        </button>
        <button
          onClick={onReject}
          className="w-full bg-transparent text-vedic-gold text-[18px] font-medium py-2 hover:underline"
        >
          नहीं, फिर से चुनूँगा
        </button>

        {/* Keyboard Toggle */}
        <div className="absolute -bottom-4 right-0">
          <button aria-label="Toggle Keyboard" className="p-3 bg-vedic-brown/5 rounded-full text-vedic-brown/60 active:bg-vedic-brown/10 transition-colors">
            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
              <rect height="16" rx="2" ry="2" width="20" x="2" y="4"></rect>
              <path d="M6 8h.01"></path><path d="M10 8h.01"></path><path d="M14 8h.01"></path><path d="M18 8h.01"></path>
              <path d="M6 12h.01"></path><path d="M18 12h.01"></path><path d="M7 16h10"></path>
            </svg>
          </button>
        </div>
      </footer>
    </main>
  );
}
