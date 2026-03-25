'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import { SupportedLanguage } from '@/lib/onboarding-store';
import TopBar from '@/components/TopBar';
import SkipButton from '@/components/SkipButton';

interface VoiceTutorialScreenProps {
  language: SupportedLanguage;
  onLanguageChange: () => void;
  onComplete: () => void;
}

export default function VoiceTutorialScreen({ onLanguageChange, onComplete }: VoiceTutorialScreenProps) {
  const [demoState, setDemoState] = useState<'listening' | 'success'>('listening');
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const timeout20sRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const successFadeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // 3-line voice script on mount with 500ms initial delay
    const initTimer = setTimeout(() => {
      // P1 FIX: Changed from Roman Hindi to proper Devanagari Hindi for correct pronunciation
      speak(
        'एक छोटी सी बात। यह ऐप आपकी आवाज़ से चलता है।',
        'hi-IN',
        () => {
          setTimeout(() => {
            speak(
              "जब यह नारंगी माइक दिखे और 'सुन रहा हूँ' लिखा हो — तब बोलिए।",
              'hi-IN',
              () => {
                setTimeout(() => {
                  speak(
                    "अभी कोशिश कीजिए — हाँ या नहीं बोलिए।",
                    'hi-IN',
                    () => {
                      // STT starts 500ms after LINE 3 ends
                      setTimeout(() => {
                        cleanupRef.current = startListening({
                          language: 'hi-IN',
                          onResult: () => {
                            // Any voice = success
                            handleVoiceDetected();
                          },
                          onError: () => { },
                        });

                        // 20s no-voice fallback
                        timeout20sRef.current = setTimeout(() => {
                          stopListening();
                          speak(
                            'कोई बात नहीं अगर बोलने में दिक्कत हो। नीचे कीबोर्ड भी है। आगे चलें बटन दबाइए।',
                            'hi-IN'
                          );
                        }, 20000);
                      }, 500);
                    }
                  );
                }, 600);
              }
            );
          }, 600);
        }
      );
    }, 500);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(timeout20sRef.current);
      clearTimeout(successFadeRef.current);
      cleanupRef.current?.();
      stopListening();
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoiceDetected = () => {
    clearTimeout(timeout20sRef.current);
    cleanupRef.current?.();
    stopListening();
    setDemoState('success');

    speak('Wah! Bilkul sahi. Aap bahut achha kar rahe hain.', 'hi-IN');

    // Success pill fades out after 2s
    successFadeRef.current = setTimeout(() => {
      setDemoState('listening');
    }, 2000);
  };

  return (
    <main className="bg-surface-base font-body text-text-primary min-h-dvh max-w-[390px] mx-auto flex flex-col shadow-2xl">
      {/* TopBar with SkipButton in top-right */}
      <TopBar showBack={false} onLanguageChange={onLanguageChange} />
      <div className="flex justify-end px-4 -mt-1">
        <SkipButton label="छोड़ें" onClick={onComplete} />
      </div>

      {/* Section Label */}
      <p className="text-[22px] font-semibold text-saffron text-center mt-2 px-6">
        एक ज़रूरी बात
      </p>

      {/* Illustration — 🎤 in 180px primary-lt circle with 2 pulse rings */}
      <div className="flex justify-center mt-6">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          {/* Pulse rings */}
          <motion.div
            animate={{ scale: [1, 1.4], opacity: [0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-[180px] h-[180px] rounded-full border-2 border-saffron"
          />
          <motion.div
            animate={{ scale: [1, 1.4], opacity: [0.1, 0] }}
            transition={{ duration: 2, delay: 0.8, repeat: Infinity }}
            className="absolute w-[180px] h-[180px] rounded-full border-2 border-saffron"
          />
          {/* Circle */}
          <div className="w-[140px] h-[140px] bg-saffron-lt rounded-full flex items-center justify-center z-10">
            <span className="text-[80px] leading-none">🎤</span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center mt-6 px-6">
        <p className="text-[20px] font-medium text-text-primary">
          जब यह दिखे:{' '}
          <span className="inline-flex items-center px-6 py-3 bg-saffron-lt border border-saffron rounded-full mx-1 text-[18px] text-saffron font-semibold min-h-[64px]">
            🎤 सुन रहा हूँ
          </span>
        </p>
        <p className="text-[32px] font-bold text-text-primary mt-3">
          तब बोलिए।
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-[2px] bg-surface-dim my-5" />

      {/* Interactive Demo Box */}
      <div className="px-6 flex-1">
        <div className="relative w-full min-h-[104px] bg-saffron-lt border-2 border-dashed border-saffron rounded-[20px] flex flex-col items-center justify-center py-5 gap-3">
          {/* Mic with 2 pulse rings */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-[56px] h-[56px] rounded-full bg-saffron"
            />
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.15, 0] }}
              transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
              className="absolute w-[56px] h-[56px] rounded-full bg-saffron"
            />
            <span className="text-[44px] leading-none relative z-10">🎤</span>
          </div>

          <p className="text-[18px] text-text-secondary font-medium">
            हाँ या नहीं बोलकर देखें
          </p>

          {/* Success pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={demoState === 'success' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-success-lt text-success border border-success px-5 py-3 rounded-full font-bold flex items-center gap-2 text-[16px]"
          >
            <span>✅</span>
            <span>शाबाश! बिल्कुल सही!</span>
          </motion.div>
        </div>

        {/* Fallback note */}
        <p className="text-center text-[16px] text-text-secondary mt-4">
          अगर बोलने में दिक्कत हो:
        </p>
        <p className="text-center text-[16px] text-text-secondary">
          ⌨️ Keyboard हमेशा नीचे है
        </p>
      </div>

      {/* CTA Footer - ACC-009 FIX: Larger touch target */}
      <footer className="px-6 pb-10 pt-4">
        <button
          onClick={onComplete}
          className="w-full min-h-[72px] bg-saffron text-white rounded-2xl text-[22px] font-bold shadow-btn-saffron active:scale-[0.98] transition-transform"
        >
          समझ गया, आगे चलें →
        </button>
      </footer>
    </main>
  );
}
