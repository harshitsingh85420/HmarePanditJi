'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TutorialScreenProps } from './types';

interface TutorialCTAProps extends TutorialScreenProps {
  onRegisterNow: () => void;
  onLater: () => void;
}

const CTA_SCRIPT =
  'बस इतना था परिचय। अब Registration शुरू कर सकते हैं। बिल्कुल मुफ़्त, दस मिनट लगेंगे। हाँ बोलें या नीचे बटन दबाएं।';

const CTA_REPROMPT = 'हाँ बोलें या नीचे बटन दबाएं।';

export default function TutorialCTA({
  language,
  onRegisterNow,
  onLater,
}: TutorialCTAProps) {
  const { isListening } = useSarvamVoiceFlow({
    language,
    script: CTA_SCRIPT,
    repromptScript: CTA_REPROMPT,
    initialDelayMs: 300,
    pauseAfterMs: 800,
    onIntent: (intent) => {
      if (intent === 'YES' || intent === 'FORWARD') onRegisterNow();
      else if (intent === 'SKIP' || intent === 'NO') onLater();
    },
  });

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-vedic-cream font-hind text-vedic-brown flex flex-col shadow-2xl relative overflow-hidden">
      {/* Progress Dots + Completion Badge */}
      <header className="pt-10 px-6 flex flex-col items-center gap-2">
        <div className="flex gap-1.5 flex-wrap justify-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-primary-dk" />
          ))}
        </div>
        <p className="text-[14px] font-semibold text-success">✓ Tutorial पूरा हुआ</p>
      </header>

      {/* Main Content */}
      <section className="flex-1 flex flex-col items-center px-8 pt-8 text-center">
        {/* Hero Illustration */}
        <div className="relative w-[200px] h-[200px] flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-primary-lt/30 rounded-full" />
          <div className="absolute inset-0 bg-primary/12 rounded-full blur-xl" />
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 text-[96px] leading-none"
          >
            🧘
          </motion.span>
        </div>

        {/* Headlines */}
        <div className="space-y-4">
          <h1 className="text-[32px] font-bold leading-tight text-vedic-brown">
            Registration शुरू करें?
          </h1>
          <div className="space-y-1">
            <p className="text-[22px] font-semibold text-success">बिल्कुल मुफ़्त।</p>
            <p className="text-[20px] font-normal text-vedic-gold">10 मिनट लगेंगे।</p>
          </div>
        </div>

        {/* Voice listening indicator */}
        {isListening && (
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-primary-lt rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[14px] font-medium text-vedic-brown">'हाँ' बोलें या बटन दबाएं</span>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-vedic-border/40 my-8" />

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRegisterNow}
            className="w-full h-[72px] bg-primary-dk text-white rounded-2xl flex items-center justify-center gap-2 text-[22px] font-bold shadow-cta-dk outline outline-2 outline-offset-2 outline-primary/30 active:scale-95 transition-transform"
          >
            <span>✅</span> हाँ, Registration शुरू करें →
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onLater}
            className="w-full h-[56px] bg-white text-vedic-gold border-2 border-vedic-border rounded-2xl text-[18px] font-semibold active:scale-95 transition-transform"
          >
            बाद में करूँगा
          </motion.button>
        </div>
      </section>

      {/* Footer — Helpline */}
      <footer className="pb-10 px-8 text-center space-y-1 mt-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-[18px]">📞</span>
          <span className="text-[16px] text-vedic-gold">कोई सवाल?</span>
          <a className="text-[18px] font-bold text-primary-dk tracking-wide" href="tel:1800435000">
            1800-HPJ-HELP
          </a>
          <span className="text-[14px] text-vedic-gold">(Toll Free)</span>
        </div>
        <p className="text-[14px] text-vedic-gold">सुबह 8 बजे – रात 10 बजे</p>
      </footer>
    </main>
  );
}
