'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { speak, stopSpeaking } from '@/lib/voice-engine';
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store';

interface LanguageSetScreenProps {
  language: SupportedLanguage;
  onComplete: () => void;
}

export default function LanguageSetScreen({ language, onComplete }: LanguageSetScreenProps) {
  const [confetti, setConfetti] = useState<{ id: number; left: string; top: string; color: string; duration: string; delay: string; shape: string }[]>([]);
  const langInfo = LANGUAGE_DISPLAY[language] || { nativeName: language, latinName: language };

  useEffect(() => {
    // Generate exactly 20 confetti pieces
    const colors = ['#F09942', '#FFD700', '#FFFFFF', '#15803D'];
    const shapes = ['rounded-full', ''];
    const newConfetti = Array.from({ length: 20 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 80 + 40;
      return {
        id: i,
        left: `calc(50% + ${Math.cos(angle) * radius}px)`,
        top: `calc(50% + ${Math.sin(angle) * radius}px)`,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        duration: (Math.random() * 2 + 2) + 's',
        delay: (Math.random() * 1.5) + 's',
      };
    });
    setConfetti(newConfetti);

    // Speak on mount, then auto-advance at 1800ms
    speak(
      `Bahut achha! Ab hum aapse ${langInfo.latinName || 'Hindi'} mein baat karenge.`,
      'hi-IN'
    );

    const timer = setTimeout(onComplete, 1800);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [langInfo.latinName, onComplete]);

  return (
    <main className="w-full min-h-dvh max-w-[390px] mx-auto bg-vedic-cream relative overflow-hidden flex flex-col items-center justify-center text-center px-8">
      {/* Radial Background Overlay - Using diya-halo CSS class */}
      <div className="absolute inset-0 pointer-events-none diya-halo" />

      {/* Animated Checkmark */}
      <div className="relative w-20 h-20 mb-10 z-10">
        <svg fill="none" height="80" viewBox="0 0 80 80" width="80" xmlns="http://www.w3.org/2000/svg">
          <circle
            className="animate-draw-circle"
            cx="40" cy="40" r="38"
            stroke="#15803D" strokeWidth="4"
            strokeDasharray="252" strokeDashoffset="252"
          />
          <path
            className="animate-draw-check"
            d="M24 40L35 51L56 30"
            stroke="#15803D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5"
            strokeDasharray="100" strokeDashoffset="100"
          />
        </svg>

        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {confetti.map((c) => (
            <div
              key={c.id}
              className={`absolute animate-confetti-fall ${c.shape} w-2 h-2`}
              style={{
                left: c.left, top: c.top, backgroundColor: c.color,
                animationDuration: c.duration, animationDelay: c.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Text — fade in at 1.2s / 1.5s */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <h1 className="text-[40px] font-bold text-vedic-brown mb-4 leading-tight">
          बहुत अच्छा!
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <p className="text-[22px] text-vedic-brown-2 leading-relaxed">
          अब हम आपसे {langInfo.nativeName} में बात करेंगे।
        </p>
      </motion.div>
    </main>
  );
}
