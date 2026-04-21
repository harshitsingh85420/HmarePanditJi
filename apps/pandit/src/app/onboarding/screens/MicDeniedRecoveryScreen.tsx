'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { speakWithSarvam } from '@/lib/sarvam-tts';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import { LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts';

interface MicDeniedRecoveryScreenProps {
  language: SupportedLanguage;
  onContinueWithKeyboard: () => void;
  onRetryPermission: () => void;
  onBack?: () => void;
}

export default function MicDeniedRecoveryScreen({
  language,
  onContinueWithKeyboard,
  onRetryPermission,
  onBack
}: MicDeniedRecoveryScreenProps) {

  useEffect(() => {
    const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
    void speakWithSarvam({
      text: 'कोई बात नहीं! आप कीबोर्ड से भी अपना काम कर सकते हैं।',
      languageCode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bg-[#fbf9f3] text-[#1b1c19] font-body selection:bg-[#ff8c00]/10 min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-[#ff8c00]/5 to-transparent">
        {/* Hero Illustration: The Keyboard */}
        <div className="w-full max-w-md text-center mb-10">
          <div className="relative inline-block mb-8">
            {/* Decorative Diya-like Glow behind icon */}
            <div className="absolute inset-0 bg-[#ff8c00]/20 blur-3xl rounded-full scale-150"></div>

            {/* Illustrated Keyboard Representation */}
            <div className="relative bg-[#f5f3ee] p-8 rounded-3xl shadow-[0px_8px_24px_rgba(144,77,0,0.08)] border-l-4 border-[#ff8c00] inline-flex flex-col items-center gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="w-14 h-14 bg-[#f0eee8] rounded-xl flex items-center justify-center text-2xl font-devanagari text-[#ff8c00] font-bold border border-[#ddc1ae]/20">
                  क
                </div>
                <div className="w-14 h-14 bg-[#f0eee8] rounded-xl flex items-center justify-center text-2xl font-devanagari text-[#ff8c00] font-bold border border-[#ddc1ae]/20">
                  ख
                </div>
                <div className="w-14 h-14 bg-[#f0eee8] rounded-xl flex items-center justify-center text-2xl font-devanagari text-[#ff8c00] font-bold border border-[#ddc1ae]/20">
                  ग
                </div>
              </div>
              <svg className="w-12 h-12 text-[#904d00]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
              </svg>
            </div>
          </div>

          <h1 className="font-headline text-4xl font-bold text-[#002204] mb-4">
            कोई बात नहीं! 🙏
          </h1>
          <p className="font-devanagari text-xl text-[#564334] leading-relaxed">
            माइक्रोफ़ोन के बिना भी हम आगे बढ़ सकते हैं।
          </p>
        </div>

        {/* Equivalence Demo: Voice = Keyboard = Success */}
        <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-3 items-center gap-6 mb-12">
          {/* Voice Track */}
          <div className="flex flex-col items-center p-6 bg-[#f5f3ee] rounded-2xl opacity-60 grayscale">
            <svg className="w-8 h-8 mb-2 text-[#564334]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-sm font-medium text-[#564334]">बोलकर</p>
          </div>

          {/* Connector (Hidden on Mobile, shown on Web) */}
          <div className="hidden md:flex flex-col items-center">
            <svg className="w-8 h-8 text-[#904d00]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          {/* Keyboard Track (Active Focus) */}
          <div className="flex flex-col items-center p-6 bg-[#f5f3ee] rounded-2xl shadow-[0px_8px_24px_rgba(144,77,0,0.08)] border-l-4 border-[#ff8c00]">
            <svg className="w-8 h-8 mb-2 text-[#904d00]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
            </svg>
            <p className="text-sm font-bold text-[#904d00]">लिखकर</p>
          </div>
        </div>

        {/* Reassuring Message */}
        <div className="text-center mb-10 max-w-xs">
          <div className="flex items-center justify-center gap-2 text-[#1b6d24] mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-bold text-lg">Same result.</p>
          </div>
          <p className="text-[#1b6d24]/80 font-medium">Sirf tarika alag hai.</p>
        </div>

        {/* Primary Action */}
        <div className="w-full max-w-md space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onContinueWithKeyboard}
            className="w-full h-14 bg-gradient-to-b from-[#ff8c00] to-[#f89100] text-[#2f1500] font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            Type Karke Registration Shuru Karein
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onRetryPermission}
            className="w-full h-14 bg-[#e4e2dd]/30 text-[#564334] font-medium text-base rounded-xl flex items-center justify-center gap-2 hover:bg-[#e4e2dd]/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Permission Dobara Check Karein
          </motion.button>
        </div>
      </div>

      {/* Visual Soul: Decorative Footer Pattern */}
      <footer className="py-8 flex justify-center opacity-20 pointer-events-none">
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-[#904d00]"></div>
          <div className="w-2 h-2 rounded-full bg-[#904d00]"></div>
          <div className="w-2 h-2 rounded-full bg-[#904d00]"></div>
        </div>
      </footer>
    </main>
  );
}
