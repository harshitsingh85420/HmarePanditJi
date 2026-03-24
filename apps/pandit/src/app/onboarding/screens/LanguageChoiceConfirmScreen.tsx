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

          // 12s timeout: remind
          timeout12s = setTimeout(() => {
            speak(`${langInfo.latinName} — sahi hai? Button dabaiye.`, 'hi-IN');
          }, 12000);

          // 24s timeout: auto-confirm
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
    <main className="font-hind text-vedic-brown w-full min-h-dvh max-w-[390px] mx-auto bg-vedic-cream flex flex-col shadow-2xl">
      <TopBar showBack onBack={onReject} onLanguageChange={onLanguageChange} />

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full text-center px-6 space-y-6">
        {/* Language Display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: 'spring' as const }}
          className="space-y-2"
        >
          <h1 className="text-[56px] font-bold text-primary leading-tight">
            {langInfo.nativeName}
          </h1>
          <p className="text-[24px] font-normal text-vedic-gold">
            {langInfo.latinName}
          </p>
        </motion.div>

        {/* Decorative divider */}
        <div className="w-[60px] h-px bg-vedic-border mx-auto" />

        {/* Question */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[26px] font-semibold text-vedic-brown"
        >
          क्या यही भाषा सही है?
        </motion.h2>

        {/* Voice Indicator */}
        <div className="flex justify-center">
          <VoiceIndicator isListening />
        </div>
      </div>

      {/* Action Footer */}
      <footer className="w-full space-y-4 px-6 pb-12 relative">
        <button
          onClick={() => {
            speak('Bahut achha.', 'hi-IN', () => onConfirm());
          }}
          className="w-full bg-primary text-white text-[20px] font-semibold py-4 rounded-2xl shadow-cta active:scale-[0.98] transition-transform"
        >
          हाँ, यही भाषा चाहिए
        </button>
        <button
          onClick={() => {
            speak('Theek hai, phir se chunte hain.', 'hi-IN', () => onReject());
          }}
          className="w-full bg-transparent text-vedic-gold text-[18px] font-medium py-2 hover:underline"
        >
          नहीं, फिर से चुनूँगा
        </button>
      </footer>
    </main>
  );
}
