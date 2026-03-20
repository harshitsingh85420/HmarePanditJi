'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialVoiceNav({ currentDot, onNext, onBack, onSkip }: Props) {
  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip}>
      {/* Headline */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center mb-6">
        <h1 className="text-3xl font-bold leading-tight text-vedic-brown">टाइपिंग की ज़रूरत नहीं।</h1>
        <p className="text-vedic-gold text-lg mt-1">बोलकर खोजें और नेविगेट करें</p>
      </motion.div>

      {/* Demo Box */}
      <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.15}}
        className="w-full aspect-square relative flex flex-col items-center justify-center border-4 border-dashed border-primary/40 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
        {/* Success Pill */}
        <div className="absolute top-5 flex items-center gap-2 bg-success-lt border border-success/30 text-success px-4 py-2 rounded-full shadow-sm">
          <span className="text-sm">✅</span>
          <span className="font-bold text-sm uppercase">शाबाश! बिल्कुल सही!</span>
        </div>

        {/* Pulsing Mic */}
        <div className="relative flex items-center justify-center mt-8">
          <motion.div animate={{scale:[1,1.3],opacity:[0.3,0]}} transition={{repeat:Infinity,duration:2}} className="absolute inset-0 bg-primary rounded-full w-24 h-24"></motion.div>
          <motion.div animate={{scale:[1,1.3],opacity:[0.3,0]}} transition={{repeat:Infinity,duration:2,delay:1}} className="absolute inset-0 bg-primary rounded-full w-24 h-24"></motion.div>
          <div className="relative z-10 w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-cta">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/>
            </svg>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-primary font-bold animate-pulse">सुन रहा हूँ...</p>
          <p className="text-vedic-gold text-xs mt-1">"निकटतम एटीएम कहाँ है?"</p>
        </div>
      </motion.div>

      {/* Keyboard toggle */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-vedic-border/50 text-vedic-gold font-medium border border-vedic-border">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect height="14" rx="2" width="18" x="3" y="5"></rect>
            <path d="M7 9h.01M11 9h.01M15 9h.01M7 13h.01M11 13h.01M15 13h.01M8 17h8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          कीबोर्ड इस्तेमाल करें
        </button>
      </div>
    </TutorialShell>
  );
}
