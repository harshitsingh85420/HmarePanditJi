'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface VoiceTutorialScreenProps {
  onComplete: () => void;
}

export default function VoiceTutorialScreen({ onComplete }: VoiceTutorialScreenProps) {
  const [demoState, setDemoState] = useState<'idle' | 'listening' | 'success'>('idle');

  const handleMicTap = () => {
    if (demoState !== 'idle') return;
    setDemoState('listening');
    setTimeout(() => {
      setDemoState('success');
    }, 1500);
  };

  return (
    <main className="bg-vedic-cream font-hind text-vedic-brown min-h-dvh max-w-[390px] mx-auto flex flex-col items-center justify-between shadow-xs">
      {/* MainHeader */}
      <header className="pt-8 px-6 text-center w-full">
        <h1 className="text-2xl font-bold text-primary-dk">
          Voice Micro-Tutorial
        </h1>
        <span className="inline-block mt-2 px-4 py-1 bg-primary-lt text-primary-dk rounded-full text-sm font-semibold tracking-wide">
          एक ज़रूरी बात
        </span>
      </header>

      {/* IllustrationSection */}
      <div className="flex-grow flex flex-col items-center px-6 py-8 w-full justify-center">
        {/* Illustration of person holding phone with sound waves */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          <div className="w-32 h-32 bg-primary-lt rounded-full flex items-center justify-center relative z-10 overflow-hidden">
            <svg className="w-20 h-20 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.5], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute border-2 border-primary rounded-full w-32 h-32"></motion.div>
            <motion.div animate={{ scale: [1, 1.5], opacity: [0.8, 0] }} transition={{ duration: 2, delay: 1, repeat: Infinity }} className="absolute border-2 border-primary rounded-full w-32 h-32"></motion.div>
          </div>
          <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md border border-primary-lt z-20">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>

        {/* Instruction Text */}
        <div className="text-center mb-8 px-4">
          <p className="text-lg font-medium leading-relaxed">
            जब यह दिखे: 
            <span className="inline-flex items-center px-2 py-0.5 bg-white border border-primary-lt rounded-md mx-1">
              <svg className="w-4 h-4 text-primary mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"></path></svg>
              <span className="text-xs text-primary-dk font-bold uppercase">Live</span>
            </span> 
            तब बोलिए.
          </p>
        </div>

        {/* DemoInteraction */}
        <section className="w-full max-w-sm">
          <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all ${demoState === 'success' ? 'bg-success-lt border-success' : 'bg-primary-lt border-primary'}`}>
            <button onClick={handleMicTap} className={`w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-primary transition-transform ${demoState === 'idle' ? 'animate-pulse hover:scale-105' : ''} ${demoState === 'listening' ? 'ring-4 ring-primary' : ''}`}>
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"></path>
              </svg>
            </button>
            <p className="mt-6 text-primary-dk font-semibold text-center">बटन दबाकर बोलें</p>
            
            <div className={`mt-4 transition-all duration-500 pointer-events-none ${demoState === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="bg-success-lt text-success border border-success px-6 py-2 rounded-full font-bold shadow-sm flex items-center gap-2">
                <span>✅</span>
                <span>शाबाश! बिल्कुल सही!</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FooterActions */}
      <footer className="p-6 space-y-4 w-full">
        <button onClick={onComplete} className="w-full py-4 bg-primary text-white rounded-2xl text-xl font-bold shadow-cta hover:bg-primary-dk active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          समझ गया, आगे चलें 
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
        <div className="flex justify-end">
          <button className="p-3 text-vedic-gold hover:text-vedic-brown flex items-center gap-1 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            टाइप करें
          </button>
        </div>
      </footer>
    </main>
  );
}
