'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { speakWithSarvam } from '@/lib/sarvam-tts';
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store';

interface LanguageSetScreenProps {
  language: SupportedLanguage;
  onComplete: () => void;
}

export default function LanguageSetScreen({ language, onComplete }: LanguageSetScreenProps) {
  const langInfo = LANGUAGE_DISPLAY[language] || LANGUAGE_DISPLAY['Hindi'];

  useEffect(() => {
    void speakWithSarvam({
      text: `बहुत अच्छा! ${langInfo.latinName} सेट हो गई।`,
      languageCode: 'hi-IN',
      onEnd: () => {
        setTimeout(onComplete, 1800);
      },
    });
  }, [language, langInfo, onComplete]);

  return (
    <main className="w-full min-h-dvh bg-gradient-to-b from-saffron-lt via-surface-base to-surface-base flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Celebration Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0, rotate: Math.random() * 360 }}
            animate={{ y: 200, opacity: 1, rotate: Math.random() * 360 }}
            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, repeat: Infinity }}
            className="absolute text-2xl xs:text-3xl"
            style={{ left: `${Math.random() * 100}%` }}
          >
            {['🎉', '✨', '🪔'][Math.floor(Math.random() * 3)]}
          </motion.div>
        ))}
      </div>

      {/* Success Icon */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} className="text-center z-10">
        <div className="text-7xl xs:text-8xl sm:text-9xl mb-4 xs:mb-6">✅</div>
        <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold text-text-primary mb-2 xs:mb-4">भाषा सेट हो गई!</h1>
        <div className="bg-white border-3 border-saffron rounded-2xl p-6 xs:p-8 shadow-card">
          <p className="text-5xl xs:text-6xl sm:text-7xl mb-2 xs:mb-4">{langInfo.scriptChar}</p>
          <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-saffron">{langInfo.nativeName}</p>
          <p className="text-lg xs:text-xl sm:text-2xl text-text-secondary mt-2">{langInfo.latinName}</p>
        </div>
        <p className="text-base xs:text-lg sm:text-xl text-text-secondary mt-6 xs:mt-8">आगे बढ़ रहे हैं...</p>
      </motion.div>
    </main>
  );
}
