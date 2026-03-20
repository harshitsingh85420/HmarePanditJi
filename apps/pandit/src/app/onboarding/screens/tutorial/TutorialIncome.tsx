'use client';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialIncome({ currentDot, onNext, onBack, onSkip }: Props) {
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => {
      speak(
        'Suniye, Varanasi ke Pandit Rameshwar Sharma Ji pehle mahine mein aatharah hazaar rupaye kamate the.',
        'hi-IN',
        () => {
          setTimeout(() => {
            speak('Aaj woh teen naye tarikon se tirsath hazaar kama rahe hain.', 'hi-IN', () => {
              setTimeout(() => {
                speak('Main aapko bhi yahi teen tarike dikhata hoon.', 'hi-IN', () => {
                  setTimeout(() => {
                    speak(
                      "In chaar tiles mein se jo samajhna ho use chhoo sakte hain. Ya 'aage' bolkar sab ek-ek dekh sakte hain.",
                      'hi-IN',
                      () => {
                        setTimeout(() => {
                          cleanupRef.current = startListening({
                            language: 'hi-IN',
                            onResult: (result) => {
                              const lower = result.transcript.toLowerCase();
                              if (
                                lower.includes('aage') || lower.includes('haan') ||
                                lower.includes('ha') || lower.includes('yes') ||
                                lower.includes('agle') || lower.includes('chalein') ||
                                lower.includes('dekhe') || lower.includes('next') ||
                                lower.includes('aur')
                              ) {
                                onNext();
                              }
                            },
                            onError: () => {},
                          });
                        }, 1500);
                      }
                    );
                  }, 400);
                });
              }, 500);
            });
          }, 300);
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
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip} nextLabel="और देखें →">
      {/* Title Section */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-[26px] font-bold text-vedic-brown leading-tight">आपकी कमाई कैसे बढ़ेगी?</h1>
      </motion.section>

      {/* Hero Card - Testimonial */}
      <motion.section
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-card shadow-card p-5 border-l-[5px] border-primary relative overflow-hidden mb-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-lt border-2 border-primary flex items-center justify-center shrink-0">
            <span className="text-[22px]">🧑‍🦳</span>
          </div>
          <div>
            <h3 className="font-bold text-vedic-brown text-[18px]">पंडित रामेश्वर शर्मा</h3>
            <p className="text-[15px] text-vedic-gold">वाराणसी, UP</p>
          </div>
        </div>
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-sm text-vedic-gold mb-1">पहले:</p>
            <span className="text-[24px] text-vedic-gold/60 line-through">₹18,000</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-vedic-gold mb-1">अब:</p>
            <span className="text-[32px] font-bold text-success block animate-glow-pulse">₹63,000</span>
          </div>
        </div>
        <div className="inline-flex items-center px-3 py-1 bg-success-lt border border-success/20 rounded-full">
          <span className="text-success text-[14px] font-bold">✓ HmarePanditJi Verified</span>
        </div>
      </motion.section>

      {/* 3 New Methods Grid */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-[20px] font-semibold text-vedic-brown-2 mb-4">3 नए तरीकों से यह हुआ:</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: '🏠', label: 'ऑफलाइन पूजाएं', sub: '(पहले से हैं आप)', delay: 0.1, badge: null },
            { icon: '📱', label: 'ऑनलाइन पूजाएं', sub: '(नया मौका)', delay: 0.2, badge: 'NEW' },
            { icon: '🎓', label: 'सलाह सेवा', sub: '(प्रति मिनट)', delay: 0.3, badge: 'NEW' },
            { icon: '🤝', label: 'बैकअप पंडित', sub: '(बिना कुछ किए)', delay: 0.4, badge: 'NEW' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: item.delay }}
              className="bg-white h-[80px] rounded-xl border border-vedic-border flex flex-col items-center justify-center relative px-4 py-3.5"
            >
              {item.badge && (
                <span className="absolute -top-2 -right-1 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
              <span className="text-[24px] mb-0.5">{item.icon}</span>
              <p className="text-[13px] font-bold text-vedic-brown text-center leading-tight">{item.label}</p>
              <p className="text-[11px] text-vedic-gold text-center leading-tight">{item.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </TutorialShell>
  );
}
