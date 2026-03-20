'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialSwagat({ currentDot, onNext, onBack, onSkip }: Props) {
  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip} nextLabel="जानें (सिर्फ 2 मिनट) →">
      {/* Hero Illustration */}
      <div className="relative mb-8 flex justify-center">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-glow-pulse"></div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <img
              alt="Dignified Pandit Illustration"
              className="rounded-full mix-blend-multiply w-48 h-48 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHdHaf3NXc5GwAB598SIzP0-4TmANQSJ41qGXJOVrBt71E3JSeKFYAiyau3Z1-_Zj3--oRtfPws1ezpvAN2kG0hKCn60XN4KcESb9fTGcFyvRtRB5LsJp68wQXqA5WuU9yZ1DjHmKvg7du5gJgNp3Co6IowqmJqEbS_jVJvrkspBzAEvyI6wfaRHds-TnHKtfcAw-5gSHIJLheLALiiXTJN3KuyDUDWgUb6OnsC_knXgKwn2C8bIUOx1w-1H3fUwvKjNv2o9BztoMV"
            />
          </motion.div>
        </div>
      </div>

      {/* Greeting Text */}
      <div className="text-center space-y-1 mb-6">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-[40px] font-bold leading-tight text-vedic-brown">
          नमस्ते
        </motion.h1>
        <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-[40px] font-bold text-primary leading-tight">
          पंडित जी।
        </motion.h2>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="text-[22px] text-vedic-gold font-normal mt-2">
          HmarePanditJi पर आपका स्वागत है।
        </motion.p>
      </div>

      {/* Divider & Tagline */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-[2px] bg-vedic-border mb-4"></div>
        <p className="text-[18px] italic text-vedic-gold leading-relaxed">
          App पंडित के लिए है,<br/>और पंडित App के लिए नहीं।
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
