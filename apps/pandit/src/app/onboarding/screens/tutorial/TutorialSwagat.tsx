'use client';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import TutorialShell from './TutorialShell';

interface Props {
  currentDot: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  language?: string;
  onLanguageChange?: () => void;
}

export default function TutorialSwagat({ currentDot, onNext, onBack, onSkip }: Props) {
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // 5-line voice script with 500ms initial delay
    const initTimer = setTimeout(() => {
      speak(
        'Namaste Pandit Ji. HmarePanditJi par aapka bahut-bahut swagat hai.',
        'hi-IN',
        () => {
          setTimeout(() => {
            speak('Yeh platform aapke liye hi bana hai.', 'hi-IN', () => {
              setTimeout(() => {
                speak(
                  'Agle do minute mein hum dekhenge ki yeh app aapki aamdani mein kya badlav la sakta hai.',
                  'hi-IN',
                  () => {
                    setTimeout(() => {
                      speak(
                        "Humara Mool Mantra yaad rakhiye — App Pandit ke liye hai, Pandit App ke liye nahi.",
                        'hi-IN',
                        () => {
                          setTimeout(() => {
                            speak(
                              "Agar seedhe Registration karna ho to 'Skip' bolein. Nahi to 'Jaanen' bolein.",
                              'hi-IN',
                              () => {
                                // STT starts 1000ms after LINE 5 ends
                                setTimeout(() => {
                                  cleanupRef.current = startListening({
                                    language: 'hi-IN',
                                    onResult: (result) => {
                                      const lower = result.transcript.toLowerCase();
                                      if (
                                        lower.includes('skip') ||
                                        lower.includes('registration') ||
                                        lower.includes('seedhe')
                                      ) {
                                        onSkip();
                                      } else if (
                                        lower.includes('jaanen') ||
                                        lower.includes('jaane') ||
                                        lower.includes('haan') ||
                                        lower.includes('ha') ||
                                        lower.includes('yes') ||
                                        lower.includes('aage')
                                      ) {
                                        onNext();
                                      }
                                    },
                                    onError: () => {},
                                  });
                                }, 1000);
                              }
                            );
                          }, 600);
                        }
                      );
                    }, 400);
                  }
                );
              }, 300);
            });
          }, 400);
        }
      );
    }, 500);

    return () => {
      clearTimeout(initTimer);
      cleanupRef.current?.();
      stopListening();
      stopSpeaking();
    };
  }, [onNext, onSkip]);

  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip} nextLabel="जानें (सिर्फ 2 मिनट) →">
      {/* Hero Illustration — 🧘 in 200px primary-lt circle */}
      <div className="relative mb-8 flex justify-center">
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          {/* Radial glow */}
          <div className="absolute w-[200px] h-[200px] bg-primary/12 rounded-full blur-xl animate-glow-pulse" />
          {/* Circle */}
          <div className="relative z-10 w-[200px] h-[200px] bg-primary-lt rounded-full flex items-center justify-center">
            <span className="animate-gentle-float text-[96px] leading-none">
              🧘
            </span>
          </div>
        </div>
      </div>

      {/* Greeting Text */}
      <div className="text-center space-y-1 mb-6">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[40px] font-bold leading-tight text-vedic-brown">
          नमस्ते
        </motion.h1>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[40px] font-bold text-primary leading-tight">
          पंडित जी।
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[22px] text-vedic-brown-2 font-normal mt-2">
          HmarePanditJi पर आपका स्वागत है।
        </motion.p>
      </div>

      {/* Divider & Mool Mantra */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-[1px] bg-vedic-border mb-4" />
        <p className="text-[18px] italic text-vedic-gold leading-relaxed">
          App पंडित के लिए है,<br />पंडित App के लिए नहीं।
        </p>
      </motion.div>

      {/* Direct Skip Link */}
      <div className="text-center mt-2">
        <button onClick={onSkip} className="text-vedic-gold text-[16px] underline decoration-1 underline-offset-4 active:opacity-50">
          Registration पर सीधे जाएं
        </button>
      </div>
    </TutorialShell>
  );
}
