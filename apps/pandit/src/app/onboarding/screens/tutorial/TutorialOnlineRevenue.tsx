'use client';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialOnlineRevenue({ currentDot, onNext, onBack, onSkip }: Props) {
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => {
      speak(
        'Do bilkul naye tarike hain — jo aap shayad abhi tak nahi jaante.',
        'hi-IN',
        () => {
          setTimeout(() => {
            speak('Pehla — Ghar Baithe Pooja. Video call se pooja karaiye. Duniya bhar ke grahak milenge — NRI bhi.', 'hi-IN', () => {
              setTimeout(() => {
                speak('Ek pooja mein do hazaar se paanch hazaar rupaye.', 'hi-IN', () => {
                  setTimeout(() => {
                    speak('Doosra — Pandit Se Baat. Phone, video, ya chat par dharmik salah dijiye.', 'hi-IN', () => {
                      setTimeout(() => {
                        speak('Bees rupaye se pachaas rupaye prati minute.', 'hi-IN', () => {
                          setTimeout(() => {
                            speak('Udaaharan ke taur par — bees minute ki ek call mein aath sau rupaye seedhe aapko.', 'hi-IN', () => {
                              setTimeout(() => {
                                speak('Dono milakar — chaalees hazaar rupaye alag se har mahine.', 'hi-IN', () => {
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
                            });
                          }, 200);
                        });
                      }, 300);
                    });
                  }, 500);
                });
              }, 300);
            });
          }, 300);
        }
      );
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
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-[30px] font-bold text-vedic-brown leading-tight">घर बैठे भी कमाई</h1>
        <p className="text-[17px] italic text-vedic-gold mt-1">(2 नए तरीके जो आप नहीं जानते)</p>
      </div>

      {/* Feature Cards */}
      <div className="space-y-5">
        {/* Card 1: Ghar Baithe Pooja */}
        <motion.div
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-primary-lt border-2 border-primary rounded-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm animate-gentle-float shrink-0">
              <span className="text-[24px]">📹</span>
            </div>
            <h3 className="font-bold text-vedic-brown text-[22px]">घर बैठे पूजा</h3>
          </div>
          <p className="text-[15px] text-vedic-brown-2 mb-3 leading-snug">
            Video call से पूजा कराएं। दुनिया भर के ग्राहक मिलेंगे — NRI भी।
          </p>
          <div className="inline-flex items-center px-4 py-1.5 bg-white border border-success rounded-full">
            <span className="text-success font-bold text-[18px]">₹2,000 – ₹5,000 <span className="text-sm font-normal text-vedic-gold">प्रति पूजा</span></span>
          </div>
        </motion.div>

        {/* Card 2: Pandit Se Baat */}
        <motion.div
          initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="bg-white border border-vedic-border rounded-card p-5 shadow-card"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-primary-lt rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <span className="text-[24px]">🎓</span>
            </div>
            <h3 className="font-bold text-vedic-brown text-[22px]">पंडित से बात</h3>
          </div>
          <p className="text-[15px] text-vedic-brown-2 mb-3 leading-snug">
            Phone / Video / Chat पर सलाह दें। आपका ज्ञान अब बिकेगा।
          </p>
          <div className="inline-flex items-center px-4 py-1.5 bg-success-lt border border-success/30 rounded-full mb-3">
            <span className="text-success font-medium text-[15px]">₹20 – ₹50 प्रति मिनट</span>
          </div>
          {/* Worked example — key line */}
          <div className="bg-primary-lt rounded-xl px-4 py-2.5 border border-primary/20">
            <p className="text-[17px] font-bold text-primary">उदाहरण: 20 मिनट = ₹800 आपको</p>
          </div>
        </motion.div>

        {/* Summary Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="bg-primary/10 border border-primary border-dashed px-6 py-3 rounded-xl w-full text-center">
            <p className="text-vedic-brown font-semibold text-[18px]">
              दोनों मिलाकर <span className="text-primary text-[22px] font-bold">₹40,000+</span> अलग से हर महीने
            </p>
          </div>
        </motion.div>
      </div>
    </TutorialShell>
  );
}
