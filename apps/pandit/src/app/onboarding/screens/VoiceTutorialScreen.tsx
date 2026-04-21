'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { SupportedLanguage, ScriptPreference } from '@/lib/onboarding-store';
import TopBar from '@/components/TopBar';
import SkipButton from '@/components/SkipButton';

interface VoiceTutorialScreenProps {
  language: SupportedLanguage;
  scriptPreference: ScriptPreference | null;
  onLanguageChange: () => void;
  onComplete: () => void;
}

export default function VoiceTutorialScreen({
  language,
  scriptPreference,
  onLanguageChange,
  onComplete
}: VoiceTutorialScreenProps) {
  const [demoState, setDemoState] = useState<'listening' | 'success'>('listening');
  const [keyboardMode, setKeyboardMode] = useState(false);
  const isMountedRef = useRef(true);

  const isLatin = scriptPreference === 'latin';

  const SECTION_LABEL = isLatin ? 'Ek zaroori baat' : 'एक ज़रूरी बात';
  const INSTRUCTION_PART1 = isLatin ? 'Jab yeh dikhe:' : 'जब यह दिखे:';
  const INSTRUCTION_PART2 = isLatin ? '🎤 Sun raha hoon' : '🎤 सुन रहा हूँ';
  const INSTRUCTION_PART3 = isLatin ? 'Tab boliye.' : 'तब बोलिए।';
  const DEMO_PROMPT = isLatin ? 'Haan ya Nahin bolkar dekhein' : 'हाँ या नहीं बोलकर देखें';
  const SUCCESS_MSG = isLatin ? 'Shabaash! Bilkul sahi!' : 'शाबाश! बिल्कुल सही!';
  const FALLBACK_NOTE = isLatin ? 'Agar bolne mein dikkat ho:' : 'अगर बोलने में दिक्कत हो:';
  const KEYBOARD_HINT = isLatin ? '⌨️ Keyboard hamesha neeche hai' : '⌨️ Keyboard हमेशा नीचे है';
  const CTA_LABEL = isLatin ? 'Samajh gaya, aage chalein →' : 'समझ गया, आगे चलें →';

  // Voice flow for voice tutorial
  const { isListening, isSpeaking, voiceFlowState } = useSarvamVoiceFlow({
    language,
    script: isLatin
      ? 'Ek chhoti si baat. Yeh app aapki awaaz se chalta hai. Jab microphone dikhe tab boliye. Abhi koshish kijiye — Haan ya Nahin boliye.'
      : 'एक छोटी सी बात। यह ऐप आपकी आवाज़ से चलता है। जब माइक्रोफ़ोन दिखे तब बोलिए। अभी कोशिश कीजिए — हाँ या नहीं बोलें।',
    repromptScript: isLatin ? 'Haan ya Nahin boliye, ya keyboard se aage badhein.' : 'हाँ या नहीं बोलें, या कीबोर्ड से आगे बढ़ें।',
    initialDelayMs: 800,
    pauseAfterMs: 1000,
    autoListen: !keyboardMode,
    onIntent: (intentOrRaw) => {
      if (!isMountedRef.current) return;

      const lower = intentOrRaw.toLowerCase();

      // Check for keyboard fallback
      if (lower.includes('keyboard') || lower.includes('कीबोर्ड') || lower.includes('skip')) {
        setKeyboardMode(true);
        onComplete();
        return;
      }

      // Any voice response completes the tutorial
      if (lower.includes('haan') || lower.includes('ha') || lower.includes('yes') || lower.includes('nahi') || lower.includes('no')) {
        setDemoState('success');
        void speakWithSarvam({
          text: isLatin ? 'Bahut achha! Aapne voice navigation samajh liya.' : 'बहुत अच्छा! आपने वॉइस नेविगेशन समझ लिया।',
          languageCode: 'hi-IN',
          onEnd: () => {
            setTimeout(() => onComplete(), 1500);
          },
        });
      }
    },
    onNoiseHigh: () => {
      setKeyboardMode(true);
      onComplete();
    },
  });

  useEffect(() => {
    isMountedRef.current = true;
    if (!keyboardMode) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          void speakWithSarvam({
            text: isLatin ? 'Yeh app aapki awaaz se chalta hai' : 'यह ऐप आपकी आवाज़ से चलता है',
            languageCode: 'hi-IN',
          });
        }
      }, 500);
      return () => {
        clearTimeout(timer);
        stopCurrentSpeech();
      };
    }
  }, [keyboardMode, isLatin]);

  return (
    <main className="bg-surface-base font-body text-text-primary min-h-dvh w-full max-w-[390px] xs:max-w-[430px] mx-auto flex flex-col shadow-2xl">
      {/* TopBar with SkipButton in top-right */}
      <TopBar
        showBack={false}
        onLanguageChange={onLanguageChange}
        language={language}
        scriptPreference={scriptPreference}
      />
      <div className="flex justify-end px-4 xs:px-6 -mt-1">
        <SkipButton label={isLatin ? 'Chhodein' : 'छोड़ें'} onClick={onComplete} />
      </div>

      {/* Section Label */}
      <p className="text-xl xs:text-2xl sm:text-[22px] font-semibold text-saffron text-center mt-2 px-6">
        {SECTION_LABEL}
      </p>

      {/* Illustration — 🎤 in 180px primary-lt circle with 2 pulse rings */}
      <div className="flex justify-center mt-4 xs:mt-6">
        <div className="relative w-36 h-36 xs:w-40 xs:h-40 sm:w-[180px] sm:h-[180px] flex items-center justify-center">
          {/* Pulse rings */}
          <motion.div
            animate={{ scale: [1, 1.4], opacity: [0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-36 h-36 xs:w-40 xs:h-40 sm:w-[180px] sm:h-[180px] rounded-full border-2 border-saffron"
          />
          <motion.div
            animate={{ scale: [1, 1.4], opacity: [0.1, 0] }}
            transition={{ duration: 2, delay: 0.8, repeat: Infinity }}
            className="absolute w-36 h-36 xs:w-40 xs:h-40 sm:w-[180px] sm:h-[180px] rounded-full border-2 border-saffron"
          />
          {/* Circle */}
          <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-[140px] sm:h-[140px] bg-saffron-lt rounded-full flex items-center justify-center z-10">
            <span className="text-6xl xs:text-7xl sm:text-[80px] leading-none">🎤</span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center mt-4 xs:mt-6 px-6">
        <p className="text-lg xs:text-xl sm:text-[20px] font-medium text-text-primary">
          {INSTRUCTION_PART1}{' '}
          <span className="inline-flex items-center px-4 xs:px-6 py-2 xs:py-3 bg-saffron-lt border border-saffron rounded-full mx-1 text-base xs:text-lg sm:text-[18px] text-saffron font-semibold min-h-[52px] xs:min-h-[56px] sm:min-h-[64px]">
            {INSTRUCTION_PART2}
          </span>
        </p>
        <p className="text-2xl xs:text-3xl sm:text-[32px] font-bold text-text-primary mt-2 xs:mt-3">
          {INSTRUCTION_PART3}
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-0.5 xs:h-[2px] bg-surface-dim my-4 xs:my-5" />

      {/* Interactive Demo Box */}
      <div className="px-4 xs:px-6 flex-1">
        <div className="relative w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[104px] bg-saffron-lt border-2 border-dashed border-saffron rounded-[20px] flex flex-col items-center justify-center py-4 xs:py-5 gap-2 xs:gap-3">
          {/* Mic with 2 pulse rings */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-12 h-12 xs:w-14 xs:h-14 sm:w-[56px] sm:h-[56px] rounded-full bg-saffron"
            />
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.15, 0] }}
              transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
              className="absolute w-12 h-12 xs:w-14 xs:h-14 sm:w-[56px] sm:h-[56px] rounded-full bg-saffron"
            />
            <span className="text-3xl xs:text-4xl sm:text-[44px] leading-none relative z-10">🎤</span>
          </div>

          <p className="text-base xs:text-lg sm:text-[18px] text-text-secondary font-medium">
            {DEMO_PROMPT}
          </p>

          {/* Success pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={demoState === 'success' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-success-lt text-success border border-success px-4 xs:px-5 py-2 xs:py-3 rounded-full font-bold flex items-center gap-2 text-sm xs:text-base sm:text-[16px]"
          >
            <span>✅</span>
            <span>{SUCCESS_MSG}</span>
          </motion.div>
        </div>

        {/* Fallback note */}
        <p className="text-center text-sm xs:text-base sm:text-[16px] text-text-secondary mt-3 xs:mt-4">
          {FALLBACK_NOTE}
        </p>
        <p className="text-center text-sm xs:text-base sm:text-[16px] text-text-secondary">
          {KEYBOARD_HINT}
        </p>
      </div>

      {/* CTA Footer - ACC-009 FIX: Larger touch target */}
      <footer className="px-4 xs:px-6 pb-8 xs:pb-10 pt-3 xs:pt-4">
        <button
          onClick={onComplete}
          className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-[22px] font-bold shadow-btn-saffron active:scale-[0.98] transition-transform"
        >
          {CTA_LABEL}
        </button>
      </footer>
    </main>
  );
}
