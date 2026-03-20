'use client';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialDakshina({ currentDot, onNext, onBack, onSkip }: Props) {
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => {
      speak(
        "Kitni baar aisa hua hai ki aapne do ghante ki pooja ki — aur grahak ne keh diya, 'Bhaiya, teen hazaar nahi, do hazaar le lo.'",
        'hi-IN',
        () => {
          setTimeout(() => {
            speak('Aap kuch nahi bol paye.', 'hi-IN', () => {
              setTimeout(() => {
                speak('Ab nahi hoga yeh.', 'hi-IN', () => {
                  setTimeout(() => {
                    speak('Aap khud dakshina tay karenge — platform kabhi nahi badlegi.', 'hi-IN', () => {
                      setTimeout(() => {
                        speak('Grahak ko booking se pehle hi pata hota hai — kitna dena hai.', 'hi-IN', () => {
                          setTimeout(() => {
                            speak('Moalbhav khatam.', 'hi-IN', () => {
                              setTimeout(() => {
                                speak("'Aage' bolein.", 'hi-IN', () => {
                                  setTimeout(() => {
                                    cleanupRef.current = startListening({
                                      language: 'hi-IN',
                                      onResult: (result) => {
                                        const lower = result.transcript.toLowerCase();
                                        if (
                                          lower.includes('aage') || lower.includes('haan') ||
                                          lower.includes('ha') || lower.includes('yes') ||
                                          lower.includes('agle') || lower.includes('chalein') ||
                                          lower.includes('next') || lower.includes('agla')
                                        ) {
                                          onNext();
                                        }
                                      },
                                      onError: () => {},
                                    });
                                  }, 1200);
                                });
                              }, 800);
                            });
                          }, 300);
                        });
                      }, 300);
                    });
                  }, 300);
                });
              }, 400);
            });
          }, 600);
        }
      );
    }, 500);

    return () => {
      clearTimeout(t);
      cleanupRef.current?.();
      stopListening();
      stopSpeaking();
    };
  }, [onNext]);

  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip} nextLabel="अगला फ़ायदा देखें →">
      {/* Headline */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
        <h1 className="text-[34px] font-bold leading-tight text-vedic-brown">अब कोई मोलभाव नहीं।</h1>
      </motion.section>

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <span className="text-[40px]">💵🤝</span>
        <span className="text-[36px] font-bold text-error">✕</span>
      </motion.div>

      {/* Contrast Cards */}
      <div className="space-y-2 mb-6">
        {/* BEFORE Card */}
        <motion.article
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-error-lt rounded-2xl p-4 border border-red-200 shadow-sm"
        >
          <header className="flex items-center gap-2 mb-3">
            <span className="font-bold text-red-700">❌ पहले:</span>
          </header>
          <div className="flex flex-col gap-2 text-left">
            <div className="flex items-start gap-2">
              <span className="text-xl">😒</span>
              <div className="bg-white px-3 py-1.5 rounded-lg rounded-tl-none shadow-sm text-sm border border-red-100">
                &quot;1,500 में हो जाएगा?&quot;
              </div>
            </div>
            <div className="flex items-start gap-2 self-end flex-row-reverse">
              <span className="text-xl">😔</span>
              <div className="bg-white/60 px-3 py-1.5 rounded-lg rounded-tr-none shadow-sm text-sm italic border border-red-100">
                (चुप रह गए...)
              </div>
            </div>
          </div>
        </motion.article>

        {/* Arrow connector */}
        <div className="text-center text-[20px] text-vedic-gold">↓</div>

        {/* AFTER Card */}
        <motion.article
          initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="bg-success-lt rounded-2xl p-4 border border-green-200 shadow-sm"
        >
          <header className="flex items-center gap-2 mb-3">
            <span className="font-bold text-green-700">✅ अब:</span>
          </header>
          <div className="bg-white rounded-xl p-3 text-left border border-green-200 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-vedic-brown text-[18px]">सत्यनारायण पूजा</span>
            </div>
            <div className="text-success font-bold text-[24px]">आपकी दक्षिणा: ₹2,100</div>
            <div className="text-xs text-vedic-gold">(पहले से तय)</div>
          </div>
          <footer className="mt-2 text-sm font-medium text-green-800 text-left">
            ग्राहक को Booking से पहले ही पता है।
          </footer>
        </motion.article>
      </div>

      {/* Trust Message */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center">
        <p className="text-vedic-gold leading-relaxed">
          आप दक्षिणा खुद तय करते हैं।<br />
          <span className="font-bold text-vedic-brown">Platform कभी नहीं बदलेगी।</span>
        </p>
      </motion.section>
    </TutorialShell>
  );
}
