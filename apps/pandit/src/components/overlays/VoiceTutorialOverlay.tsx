'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWithSarvam } from '@/lib/sarvam-tts';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import { LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts';

interface VoiceTutorialOverlayProps {
  language: SupportedLanguage;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function VoiceTutorialOverlay({
  language,
  onComplete,
  onSkip
}: VoiceTutorialOverlayProps) {
  const [isListening, setIsListening] = useState(false);
  const [successShown, setSuccessShown] = useState(false);
  const [interactionBoxColor, setInteractionBoxColor] = useState<'orange' | 'green'>('orange');

  useEffect(() => {
    const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
    void speakWithSarvam({
      text: 'जब यह दिखे, तब बोलिए।',
      languageCode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMicClick = () => {
    setIsListening(true);

    // Simulate successful speech detection after 1.5s
    setTimeout(() => {
      setSuccessShown(true);
      setInteractionBoxColor('green');
      setIsListening(false);

      const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
      void speakWithSarvam({
        text: 'शाबाश! बिल्कुल सही!',
        languageCode,
        onEnd: () => {
          setTimeout(onComplete, 1500);
        },
      });
    }, 1500);
  };

  return (
    <main className="bg-[#FFFBF5] font-hind text-slate-800 min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-8 px-6 text-center">
        <h1 className="text-2xl font-bold text-orange-800">
          Voice Micro-Tutorial
        </h1>
        <span className="inline-block mt-2 px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold tracking-wide">
          एक ज़रूरी बात
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center px-6 py-8">
        {/* Illustration of person holding phone with sound waves */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          {/* Placeholder for Person Illustration */}
          <div className="w-32 h-32 bg-orange-200 rounded-full flex items-center justify-center relative z-10 overflow-hidden">
            <svg className="w-20 h-20 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          {/* Animated Sound Waves */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 border-2 border-orange-500 rounded-full absolute"
            />
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="w-32 h-32 border-2 border-orange-500 rounded-full absolute"
            />
          </div>

          {/* Phone Indicator */}
          <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md border border-orange-100 z-20">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Instruction Text */}
        <div className="text-center mb-8 px-4">
          <p className="text-lg font-medium leading-relaxed">
            जब यह दिखे:
            <span className="inline-flex items-center px-2 py-0.5 bg-white border border-orange-300 rounded-md mx-1">
              <svg className="w-4 h-4 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
              </svg>
              <span className="text-xs text-orange-600 font-bold uppercase">Live</span>
            </span>
            तब बोलिए.
          </p>
        </div>

        {/* Demo Interaction */}
        <section className="w-full max-w-sm">
          <motion.div
            animate={{
              backgroundColor: interactionBoxColor === 'orange'
                ? 'rgba(254, 243, 199, 1)'
                : 'rgba(220, 252, 231, 1)',
              borderColor: interactionBoxColor === 'orange'
                ? 'rgba(249, 115, 22, 1)'
                : 'rgba(34, 197, 94, 1)'
            }}
            className="bg-[#FEF3C7] border-2 border-dashed border-orange-500 rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300"
          >
            {/* Pulsing Mic Icon */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleMicClick}
              animate={isListening ? { scale: [1, 1.05, 1] } : {}}
              transition={isListening ? { duration: 0.5, repeat: Infinity } : {}}
              className={`w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-orange-600 transition-all ${isListening ? 'ring-4 ring-orange-300 animate-pulse' : 'hover:scale-105'
                }`}
            >
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
              </svg>
            </motion.button>

            <p className="mt-6 text-orange-800 font-semibold text-center">
              बटन दबाकर बोलें
            </p>

            {/* Success Feedback */}
            <AnimatePresence>
              {successShown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4"
                >
                  <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-bold shadow-sm flex items-center gap-2">
                    <span>✅</span>
                    <span>शाबाश! बिल्कुल सही!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>

      {/* Footer Actions */}
      <footer className="p-6 space-y-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onComplete}
          className="w-full py-4 bg-orange-600 text-white rounded-2xl text-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          समझ गया, आगे चलें
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </motion.button>

        <div className="flex justify-end">
          <button
            onClick={onSkip}
            className="p-3 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            टाइप करें
          </button>
        </div>
      </footer>
    </main>
  );
}
