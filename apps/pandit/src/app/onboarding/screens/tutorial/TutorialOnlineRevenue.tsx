'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialOnlineRevenue({ currentDot, onNext, onBack, onSkip }: Props) {
  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip}>
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-6 text-xs">
        <div className="flex gap-1 text-[10px]">
          {Array.from({length:4}).map((_,i) => <span key={i} className="text-primary">●</span>)}
          {Array.from({length:8}).map((_,i) => <span key={i} className="text-vedic-border">○</span>)}
        </div>
        <button onClick={onSkip} className="text-vedic-gold font-medium">Skip</button>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-vedic-brown leading-tight">घर बैठे भी कमाई</h1>
        <p className="text-vedic-gold mt-1">(2 नए तरीके जो आप नहीं जानते)</p>
      </div>

      {/* Feature Cards */}
      <div className="space-y-5">
        {/* Card 1: Online Pooja */}
        <motion.div initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:0.1}}
          className="bg-primary-lt border-2 border-primary rounded-3xl p-5 flex items-center shadow-sm">
          <div className="bg-white p-3 rounded-2xl mr-4 shadow-sm animate-gentle-float">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-vedic-brown text-lg">GHAR BAITHE POOJA</h3>
            <p className="text-primary font-bold text-xl animate-glow-pulse">₹2,000 – ₹5,000 <span className="text-sm font-normal text-vedic-gold">प्रति पूजा</span></p>
          </div>
        </motion.div>

        {/* Card 2: Pandit Se Baat */}
        <motion.div initial={{x:20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:0.25}}
          className="bg-white border border-vedic-border rounded-3xl p-5 flex items-center shadow-card">
          <div className="bg-primary-lt/50 p-3 rounded-2xl mr-4 shadow-sm">
            <svg className="w-8 h-8 text-vedic-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-vedic-brown text-lg uppercase">Pandit Se Baat</h3>
            <p className="text-vedic-brown font-bold text-xl">₹20 – ₹50 <span className="text-sm font-normal text-vedic-gold">प्रति मिनट</span></p>
            <div className="mt-2 inline-block bg-primary-lt/50 px-3 py-1 rounded-lg border border-primary-lt">
              <p className="text-xs text-vedic-gold italic">उदाहरण: 20 मिनट = <span className="text-primary font-bold">₹800 आपको</span></p>
            </div>
          </div>
        </motion.div>

        {/* Summary Pill */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
          className="flex justify-center mt-4">
          <div className="bg-primary/10 border border-primary border-dashed px-6 py-3 rounded-full">
            <p className="text-vedic-brown font-bold text-center">दोनों मिलाकर <span className="text-primary text-xl">₹40,000+</span> अलग से हर महीने</p>
          </div>
        </motion.div>
      </div>
    </TutorialShell>
  );
}
