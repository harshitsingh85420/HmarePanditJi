'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  onExit?: () => void;
}

export default function SplashScreen({ onComplete, onExit }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // UI-003 FIX: Increased from 3000ms to 4000ms for elderly users
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="splash-gradient shadow-2xl overflow-hidden min-h-dvh flex flex-col items-center relative w-full">
      {/* Exit Button */}
      {onExit && (
        <button
          onClick={onExit}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white active:opacity-50 z-50"
          aria-label="Exit app"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Top breathing room */}
      <div className="h-[180px]"></div>

      {/* Center Content Block */}
      <section className="flex flex-col items-center justify-center flex-grow -mt-10">
        {/* OM Symbol */}
        <div className="animate-glow-pulse drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] mb-[28px]">
          <svg fill="none" height="80" viewBox="0 0 24 24" width="80" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.44 14.5C11.66 14.5 11 14.81 10.44 15.44C10.06 15.81 9.88 16.31 9.88 16.94C9.88 18.06 10.81 19 12 19C13.19 19 14.12 18.06 14.12 16.94C14.12 16.31 13.94 15.81 13.56 15.44C13 14.81 12.34 14.5 12.44 14.5ZM12.44 11.5C11.19 11.5 10.19 12.5 10.19 13.75C10.19 13.88 10.22 14 10.28 14.12C10.03 13.84 9.69 13.69 9.31 13.69C8.59 13.69 8 14.28 8 15C8 15.34 8.12 15.66 8.34 15.91C8.12 16.19 8 16.56 8 16.94C8 18.06 8.94 19 10.06 19C10.44 19 10.78 18.88 11.06 18.66C11.31 18.88 11.66 19 12 19C13.19 19 14.12 18.06 14.12 16.94C14.12 16.56 14 16.19 13.78 15.91C14 15.66 14.12 15.34 14.12 15C14.12 14.28 13.53 13.69 12.81 13.69C12.44 13.69 12.09 13.84 11.84 14.12C11.91 14 11.94 13.88 11.94 13.75C11.94 12.5 10.94 11.5 9.69 11.5C9.38 11.5 9.09 11.56 8.84 11.69C9.09 11.19 9.25 10.62 9.25 10C9.25 8.34 7.91 7 6.25 7C5.44 7 4.72 7.31 4.19 7.81C4.47 7.31 5 7 5.56 7C6.41 7 7.09 7.69 7.09 8.53C7.09 8.84 7 9.12 6.84 9.38C7.34 9.12 7.94 9 8.56 9C9.91 9 11 10.09 11 11.44C11 11.75 10.94 12.06 10.84 12.31C11.34 11.81 12 11.5 12.75 11.5C14 11.5 15.06 12.56 15.06 13.88C15.06 14.44 14.88 14.94 14.56 15.34C15.19 15.34 15.69 15.84 15.69 16.47C15.69 17.09 15.19 17.59 14.56 17.59C14.28 17.59 14.03 17.5 13.84 17.34C14.03 17.59 14.12 17.91 14.12 18.22C14.12 19.22 13.31 20.03 12.31 20.03C11.31 20.03 10.5 19.22 10.5 18.22C10.5 17.91 10.59 17.59 10.78 17.34C10.59 17.5 10.34 17.59 10.06 17.59C9.44 17.59 8.94 17.09 8.94 16.47C8.94 15.84 9.44 15.34 10.06 15.34C10.38 15.34 10.66 15.47 10.88 15.69C10.66 15.19 10.5 14.62 10.5 14C10.5 12.62 11.62 11.5 13 11.5C13.44 11.5 13.84 11.62 14.19 11.81C13.84 11.12 13.12 10.66 12.31 10.66C11.22 10.66 10.31 11.56 10.31 12.66C10.31 12.97 10.38 13.25 10.5 13.5C10 13.19 9.41 13 8.75 13C7.22 13 6 14.22 6 15.75C6 16.34 6.19 16.88 6.5 17.31C6.19 16.88 6 16.34 6 15.75C6 14.22 7.22 13 8.75 13C9.41 13 10 13.19 10.5 13.5C10.38 13.25 10.31 12.97 10.31 12.66C10.31 11.56 11.22 10.66 12.31 10.66C13.12 10.66 13.84 11.12 14.19 11.81C13.84 11.62 13.44 11.5 13 11.5C11.62 11.5 10.5 12.62 10.5 14C10.5 14.62 10.66 15.19 10.88 15.69C10.66 15.47 10.38 15.34 10.06 15.34C9.44 15.34 8.94 15.84 8.94 16.47C8.94 17.09 9.44 17.59 10.06 17.59C10.34 17.59 10.59 17.5 10.78 17.34C10.59 17.59 10.5 17.91 10.5 18.22C10.5 19.22 11.31 20.03 12.31 20.03C13.31 20.03 14.12 19.22 14.12 18.22C14.12 17.91 14.03 17.59 13.84 17.34C14.03 17.5 14.28 17.59 14.56 17.59C15.19 17.59 15.69 17.09 15.69 16.47C15.69 15.84 15.19 15.34 14.56 15.34C14.88 14.94 15.06 14.44 15.06 13.88C15.06 12.56 14 11.5 12.75 11.5ZM17 6.5C17 6.22 17.22 6 17.5 6C17.78 6 18 6.22 18 6.5C18 6.78 17.78 7 17.5 7C17.22 7 17 6.78 17 6.5ZM15 4C15 3.45 15.45 3 16 3C16.55 3 17 3.45 17 4C17 4.55 16.55 5 16 5C15.45 5 15 4.55 15 4Z" fill="white"></path>
            <path d="M12.5 5.5C13.5 4.5 15.5 4 17.5 4.5M6 14.5C5 12.5 5.5 9.5 8.5 8.5C11.5 7.5 13 9.5 13 11.5C13 13.5 11.5 15 9.5 15C13 15 16.5 17.5 16.5 20C16.5 22.5 14 23 12 23M17 10C18 9 20 8.5 22 9" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2"></path>
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="font-hind text-[28px] font-[600] text-white tracking-[0.5px] leading-tight">
          HmarePanditJi
        </h1>
        <h2 className="font-devanagari text-[18px] font-[400] text-white/80 mt-[8px]">
          हमारे पंडित जी
        </h2>
      </section>

      {/* Loading Area */}
      <footer className="absolute bottom-[48px] w-full flex justify-center">
        <div className="w-[120px] h-[3px] bg-white/25 rounded-[2px] relative overflow-hidden">
          {/* Progress Fill Animation - UI-003 FIX: Slower timing for elderly users */}
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute left-0 top-0 h-full bg-white/90 rounded-[2px]"
          />
        </div>
      </footer>
    </main>
  );
}
