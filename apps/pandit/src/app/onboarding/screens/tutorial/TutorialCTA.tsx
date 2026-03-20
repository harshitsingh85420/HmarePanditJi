'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface TutorialCTAProps {
  currentDot: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onRegisterNow: () => void;
  onLater: () => void;
  language?: string;
  onLanguageChange?: () => void;
}

export default function TutorialCTA({ currentDot, onBack, onSkip, onRegisterNow, onLater }: TutorialCTAProps) {
  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-vedic-cream font-hind text-vedic-brown flex flex-col shadow-2xl relative overflow-hidden">
      {/* Progress Dots Header */}
      <header className="pt-10 px-6 flex justify-center">
        <div className="flex gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-primary-dk" />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-8 pt-8 text-center">
        {/* Hero Illustration */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-56 h-56 mb-8 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-vedic-border opacity-50 rounded-full scale-110"></div>
          <img
            alt="Confident Pandit with Phone"
            className="relative z-10 w-full h-full object-contain rounded-full"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRWa_13F4-aVsD0ktpjx7I-0ylP0a-7XTfzUPyWcReq5rZvxBmZibCypToJibCKn_H0Im6IHsbFF3GPp29X1i-J10S4_o5uq59JgrlacGQ4D8JSNphmdVtRz33LI9Pkc8LTEp15_cvo5UD1fCn6b5v73eHx_qhRumw7i1TMSLKJxp7ausFDM5b1XMFVpSDbMQpEqO-JYe8tjOYgHvqPeOBoxrwsAOVs4uWwHvToaUabgP6dduc1Qr7w0gfiluxENdlKQ4jE_tK_nl5"
          />
        </motion.div>

        {/* Headlines */}
        <div className="space-y-4">
          <h1 className="text-[32px] font-bold leading-tight text-vedic-brown">
            Registration शुरू करें?
          </h1>
          <div className="space-y-1">
            <p className="text-[22px] font-semibold text-success">बिल्कुल मुफ़्त।</p>
            <p className="text-[20px] font-normal text-vedic-brown-2">10 मिनट लगेंगे।</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-10 space-y-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRegisterNow}
            className="w-full h-[72px] bg-primary-dk text-white rounded-2xl flex items-center justify-center gap-2 text-[22px] font-bold shadow-cta-dk active:scale-95 transition-transform"
          >
            <span>✅</span> हाँ, Registration शुरू करें →
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onLater}
            className="w-full h-[56px] bg-white text-vedic-brown-2 border-2 border-vedic-border rounded-2xl text-[18px] font-semibold active:scale-95 transition-transform"
          >
            बाद में करूँगा
          </motion.button>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-10 px-8 text-center space-y-2">
        <p className="text-[14px] text-vedic-brown-2 opacity-70">मदद चाहिए? टोल-फ्री कॉल करें</p>
        <a className="text-[18px] font-bold text-primary-dk tracking-wide" href="tel:1800435000">
          1800-HPJ-HELP
        </a>
      </footer>
    </main>
  );
}
