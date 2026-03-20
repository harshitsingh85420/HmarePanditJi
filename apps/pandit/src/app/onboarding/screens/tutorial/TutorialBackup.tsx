'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialBackup({ currentDot, onNext, onBack, onSkip }: Props) {
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const [accordionOpen, setAccordionOpen] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      speak("Yeh sunkar lagega — 'Yeh kaise ho sakta hai?'", 'hi-IN', () => {
        setTimeout(() => {
          speak('Main samjhata hoon.', 'hi-IN', () => {
            setTimeout(() => {
              speak(
                'Jab koi booking hoti hai jisme grahak ne backup protection liya hota hai — aapko offer aata hai.',
                'hi-IN',
                () => {
                  setTimeout(() => {
                    speak("'Kya aap us din backup Pandit banenge?'", 'hi-IN', () => {
                      setTimeout(() => {
                        speak('Aap haan kehte hain. Us din free rehte hain.', 'hi-IN', () => {
                          setTimeout(() => {
                            speak('Agar mukhya Pandit ne pooja kar li — bhi aapko do hazaar rupaye milenge.', 'hi-IN', () => {
                              setTimeout(() => {
                                speak('Agar mukhya Pandit cancel kiye — to poori booking aapki aur upar se do hazaar bonus.', 'hi-IN', () => {
                                  setTimeout(() => {
                                    speak(
                                      'Yeh paisa grahak ne booking ke samay backup protection ki extra payment ki thi. Wohi aapko milta hai.',
                                      'hi-IN',
                                      () => {
                                        setTimeout(() => {
                                          speak('Dono taraf se faayda.', 'hi-IN', () => {
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
                                                }, 1000);
                                              });
                                            }, 400);
                                          });
                                        }, 500);
                                      }
                                    );
                                  }, 500);
                                });
                              }, 300);
                            });
                          }, 400);
                        });
                      }, 400);
                    });
                  }, 300);
                }
              );
            }, 300);
          });
        }, 300);
      });
    }, 400);

    return () => {
      clearTimeout(t);
      cleanupRef.current?.();
      stopListening();
      stopSpeaking();
    };
  }, [onNext]);

  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip}>
      {/* Headline block */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-[28px] font-bold text-vedic-brown">बिना कुछ किए</h2>
        <div className="inline-block px-4 py-1 rounded-xl bg-success-lt border border-success/20 animate-gentle-float">
          <h1 className="text-success text-[44px] font-extrabold leading-none">₹2,000?</h1>
        </div>
        <p className="text-[18px] font-semibold text-vedic-brown-2">हाँ। यह सच है।</p>
      </div>

      {/* Timeline Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-card p-5 shadow-card border border-vedic-border/50 mb-6"
      >
        <h3 className="font-bold mb-4 flex items-center gap-2 text-vedic-brown">
          <span>⏱️</span> कैसे काम करता है?
        </h3>
        <div className="space-y-1">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[16px] z-10 shrink-0">
                📅
              </div>
              <div className="w-0.5 h-6 border-l-2 border-dashed border-vedic-border mt-1" />
            </div>
            <div className="pb-2">
              <p className="text-[18px] font-bold text-vedic-brown">कोई पूजा Book हुई</p>
              <p className="text-[15px] text-vedic-gold">(Backup Protection के साथ)</p>
            </div>
          </div>
          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[16px] z-10 shrink-0">
                📲
              </div>
              <div className="w-0.5 h-6 border-l-2 border-dashed border-vedic-border mt-1" />
            </div>
            <div className="pb-2">
              <p className="text-[18px] font-bold text-vedic-brown">आपको Offer आया:</p>
              <p className="text-[15px] text-vedic-gold italic">&quot;क्या आप Backup Pandit बनेंगे?&quot;</p>
            </div>
          </div>
          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white text-[14px] z-10 shrink-0">
              ✅
            </div>
            <div>
              <p className="text-[18px] font-bold text-vedic-brown">आपने हाँ कहा। उस दिन Free रहे।</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Outcome Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-card border border-vedic-border mb-5"
      >
        {/* Header row */}
        <div className="grid grid-cols-2 bg-primary-lt">
          <div className="p-3.5 border-r border-vedic-border">
            <p className="text-[15px] font-bold text-vedic-brown-2">मुख्य Pandit ने पूजा की</p>
          </div>
          <div className="p-3.5">
            <p className="text-[15px] font-bold text-vedic-brown-2">मुख्य Pandit Cancel किया</p>
          </div>
        </div>
        {/* Data row */}
        <div className="grid grid-cols-2 bg-white">
          <div className="p-5 border-r border-vedic-border/50">
            <p className="text-[28px] font-bold text-success">₹2,000</p>
            <p className="text-[14px] font-bold text-success">(बिना कुछ किए!)</p>
          </div>
          <div className="p-5 bg-success-lt">
            <p className="text-[20px] font-bold text-success">Full Amount</p>
            <p className="text-[16px] font-bold text-success">+ ₹2,000 Bonus</p>
          </div>
        </div>
      </motion.div>

      {/* Accordion */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-card border border-vedic-border overflow-hidden"
      >
        <button
          onClick={() => setAccordionOpen(o => !o)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="text-[16px] font-bold text-vedic-brown">
            {accordionOpen ? '▾' : '▸'} यह पैसा कहाँ से आता है?
          </span>
        </button>
        {accordionOpen && (
          <div className="px-4 pb-4">
            <p className="text-[16px] text-vedic-brown-2 leading-relaxed">
              ग्राहक ने Booking के समय Backup Protection की extra payment की थी। वही आपको मिलता है।
            </p>
          </div>
        )}
      </motion.div>
    </TutorialShell>
  );
}
