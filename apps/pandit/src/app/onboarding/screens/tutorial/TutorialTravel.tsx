'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialTravel({ currentDot, onNext, onBack, onSkip }: Props) {
  const perks = [
    'Train / Bus / Car बुकिंग',
    'Hotel ठहरने की व्यवस्था',
    'खर्च (Food) ₹1,000/दिन',
    'GPS लोकेशन अपडेट्स',
  ];

  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip}>
      {/* Headlines */}
      <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mb-8 space-y-1">
        <h1 className="text-[26px] font-bold text-vedic-brown leading-tight">Travel की Tension नहीं।</h1>
        <h1 className="text-[26px] font-bold text-vedic-brown leading-tight">Double Booking नहीं।</h1>
      </motion.section>

      {/* Travel Card */}
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
        className="bg-primary-lt border-[1.5px] border-primary rounded-[20px] p-5 shadow-sm animate-gentle-float mb-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🚂</span>
          <h3 className="font-bold text-lg text-vedic-brown">यात्रा के लाभ</h3>
        </div>
        <ul className="space-y-3">
          {perks.map((p, i) => (
            <motion.li key={i} initial={{x:-15,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:0.1*i+0.2}}
              className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
              </svg>
              <span className="text-[15px] font-medium text-vedic-brown">{p}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Smart Calendar Card */}
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.3}}
        className="bg-white border-[1.5px] border-dashed border-vedic-border rounded-[20px] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <h3 className="font-bold text-lg text-vedic-brown">स्मार्ट कैलेंडर</h3>
          </div>
          <span className="text-[12px] bg-error-lt text-error px-2 py-0.5 rounded-full font-bold">Auto-Blocked</span>
        </div>
        {/* Mini Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 opacity-80">
          {['M','T','W','T','F','S','S'].map((d,i) => (
            <div key={i} className={`text-center py-2 text-xs font-bold ${i===6 ? 'text-error' : 'text-vedic-border'}`}>{d}</div>
          ))}
          {['12','13','✕','✕','16','17','18'].map((d,i) => (
            <div key={i} className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${d==='✕' ? 'bg-error-lt text-error font-bold text-sm' : 'bg-vedic-border/30 text-vedic-brown'}`}>{d}</div>
          ))}
        </div>
        <p className="mt-4 text-xs text-vedic-gold italic text-center leading-relaxed">
          एक बार बुक होने पर वो स्लॉट अपने आप हट जाएगा।
        </p>
      </motion.div>
    </TutorialShell>
  );
}
