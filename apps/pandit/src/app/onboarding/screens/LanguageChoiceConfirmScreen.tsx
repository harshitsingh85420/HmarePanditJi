'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store';
import TopBar from '@/components/TopBar';
import VoiceIndicator from '@/components/VoiceIndicator';

interface LanguageChoiceConfirmScreenProps {
  language: SupportedLanguage;
  onLanguageChange: () => void;
  pendingLanguage: SupportedLanguage;
  onConfirm: () => void;
  onReject: () => void;
}

export default function LanguageChoiceConfirmScreen({
  language: _language,
  onLanguageChange,
  pendingLanguage,
  onConfirm,
  onReject,
}: LanguageChoiceConfirmScreenProps) {
  const langInfo = LANGUAGE_DISPLAY[pendingLanguage] || { nativeName: pendingLanguage, latinName: pendingLanguage };
  const isListeningRef = useRef(false);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let timeout12s: ReturnType<typeof setTimeout>;
    let timeout24s: ReturnType<typeof setTimeout>;

    const startSpeakAndListen = () => {
      speak(
        `Aapne ${langInfo.latinName} kahi. Sahi hai? Haan ya Nahi bolein.`,
        'hi-IN',
        () => {
          isListeningRef.current = true;
          cleanupRef.current = startListening({
            language: 'hi-IN',
            onResult: (result) => {
              const lower = result.transcript.toLowerCase();
              if (lower.includes('haan') || lower.includes('ha') || lower.includes('yes') || lower.includes('sahi')) {
                speak('Bahut achha.', 'hi-IN', () => onConfirm());
              } else if (lower.includes('nahi') || lower.includes('no') || lower.includes('badlo')) {
                speak('Theek hai, phir se chunte hain.', 'hi-IN', () => onReject());
              }
            },
            onError: () => { },
          });

          timeout12s = setTimeout(() => {
            speak(`${langInfo.latinName} — sahi hai? Button dabaiye.`, 'hi-IN');
          }, 12000);

          timeout24s = setTimeout(() => {
            onConfirm();
          }, 24000);
        }
      );
    };

    const initTimer = setTimeout(startSpeakAndListen, 300);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(timeout12s);
      clearTimeout(timeout24s);
      cleanupRef.current?.();
      stopListening();
      stopSpeaking();
    };
  }, [langInfo.latinName, onConfirm, onReject]);

  return (
    <main className="font-hind text-text-primary w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col shadow-2xl">
      <TopBar showBack onBack={onReject} onLanguageChange={onLanguageChange} />

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full text-center px-4 xs:px-6 space-y-4 xs:space-y-6">
        {/* Language Display */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="flex flex-col items-center gap-6 xs:gap-8"
        >
          {/* Glow Effect Behind Emoji */}
          <div className="relative">
            <div className="absolute inset-0 bg-saffron/20 blur-3xl rounded-full animate-pulse" />
            <motion.span
              className="relative text-7xl xs:text-8xl sm:text-9xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
            >
              {langInfo.emoji}
            </motion.span>
          </div>

          {/* Language Display */}
          <div className="text-center space-y-3 xs:space-y-4">
            {/* Short Name (Hero) */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl xs:text-6xl sm:text-[72px] font-bold text-saffron leading-tight"
            >
              {langInfo.shortName}
            </motion.h1>

            {/* Script Character */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl xs:text-3xl text-vedic-gold"
            >
              {langInfo.scriptChar}
            </motion.p>

            {/* Full Native Name */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg xs:text-xl text-text-secondary mt-4"
            >
              {langInfo.nativeName}
            </motion.p>
          </div>
        </motion.div>

        {/* Decorative divider */}
        <div className="w-12 xs:w-[60px] h-px bg-border-default mx-auto" />

        {/* Voice Indicator */}
        <VoiceIndicator isListening={isListeningRef.current} />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 xs:gap-4 w-full max-w-sm px-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onReject}
            className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] border-3 border-border-default rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold text-saffron bg-surface-card active:bg-saffron-light"
          >
            ✗ नहीं
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold shadow-btn-saffron"
          >
            ✓ हाँ
          </motion.button>
        </div>

        <p className="text-sm xs:text-base text-text-secondary px-4">
          या नीचे बटन दबाएं
        </p>
      </div>
    </main>
  );
}
