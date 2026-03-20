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
  
  const [confetti, setConfetti] = useState<{id: number, left: string, top: string, color: string, duration: string, delay: string, shape: string}[]>([]);
  const langInfo = LANGUAGE_DISPLAY[language] || { nativeName: language };

  useEffect(() => {
    // Generate Confetti
    const newConfetti = [];
    const colors = ['#F09942', '#FFD700', '#FFFFFF', '#10B981'];
    const shapes = ['rounded-full', ''];
    for(let i=0; i<25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 80 + 40;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        newConfetti.push({
            id: i,
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            duration: (Math.random() * 2 + 2) + 's',
            delay: (Math.random() * 1.5) + 's'
        });
    }
    setConfetti(newConfetti);

    const timer = setTimeout(() => {
      speak(`Bahut achha! Ab hum aapse ${langInfo.latinName || 'Hindi'} mein baat karenge.`, 'hi-IN');
      setTimeout(onComplete, 4000); // Proceed to next phase
    }, 500);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [langInfo.latinName, onComplete]);

  return (
    <main className="w-full min-h-dvh max-w-[390px] mx-auto bg-vedic-cream relative overflow-hidden flex flex-col items-center justify-center text-center px-8">
      {/* Radial Background Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(240, 153, 66, 0.08) 0%, rgba(240, 153, 66, 0) 70%)' }}></div>

      {/* Animated Checkmark Section */}
      <div className="relative w-20 h-20 mb-10 z-10">
        <svg fill="none" height="80" viewBox="0 0 80 80" width="80" xmlns="http://www.w3.org/2000/svg">
          {/* Circle Stroke */}
          <circle className="animate-draw-circle" cx="40" cy="40" r="38" stroke="#10B981" strokeWidth="4"></circle>
          {/* Checkmark Path */}
          <path className="animate-draw-check" d="M24 40L35 51L56 30" stroke="#10B981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5"></path>
        </svg>

        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none z-0">
            {confetti.map((c) => (
                <div 
                    key={c.id} 
                    className={`absolute animate-confetti-fall ${c.shape}`} 
                    style={{
                        left: c.left, top: c.top, backgroundColor: c.color,
                        width: '8px', height: '8px', animationDuration: c.duration, animationDelay: c.delay
                    }}
                ></div>
            ))}
        </div>
      </div>

      {/* Text Content */}
      <motion.div initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} transition={{ duration: 1, delay: 1 }}>
        <h1 className="text-[40px] font-bold text-vedic-brown mb-6 leading-tight">
          बहुत अच्छा!
        </h1>
        <p className="text-[22px] text-vedic-gold leading-relaxed">
          अब हम आपसे {langInfo.nativeName} में बात करेंगे।
        </p>
      </motion.div>
    </main>
  );
}
