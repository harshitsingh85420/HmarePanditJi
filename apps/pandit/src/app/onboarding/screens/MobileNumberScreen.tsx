'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding-store';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import { readOTPAuto } from '@/lib/webotp';

interface MobileNumberScreenProps {
  language: SupportedLanguage;
  onComplete: (mobile: string) => void;
  onBack: () => void;
}

export default function MobileNumberScreen({ language, onComplete, onBack }: MobileNumberScreenProps) {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [keyboardEntered, setKeyboardEntered] = useState(false);
  const [isMicOff, setIsMicOff] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { restartListening } = useSarvamVoiceFlow({
    language,
    script: 'अपना मोबाइल नंबर बोलें — जैसे 9876543210।',
    repromptScript: 'नंबर बोलें — 10 अंक।',
    initialDelayMs: 800,
    pauseAfterMs: 1000,
    autoListen: !isKeyboardMode && !isMicOff,
    onIntent: (intentOrRaw) => {
      if (intentOrRaw.startsWith('RAW:')) {
        const raw = intentOrRaw.slice(4).trim().replace(/\D/g, '');
        if (raw.length === 10) {
          setMobile(raw);
          setConfirming(true);
          void speakWithSarvam({
            text: `${raw.slice(0, 5)} ${raw.slice(5)} — क्या यह सही है? 'हाँ' बोलें।`,
            languageCode: 'hi-IN',
          });
        } else if (raw.length > 0) {
          void speakWithSarvam({
            text: 'केवल 10 अंक बताइए। फिर से बोलें।',
            languageCode: 'hi-IN',
          });
        }
      } else if (intentOrRaw === 'YES' && mobile) {
        setConfirming(false);
        void speakWithSarvam({
          text: 'बहुत अच्छा। OTP भेज रहा हूँ।',
          languageCode: 'hi-IN',
          onEnd: () => onComplete(mobile),
        });
      } else if (intentOrRaw === 'NO') {
        setMobile('');
        setConfirming(false);
        restartListening();
      }
    },
  });

  useEffect(() => {
    if (keyboardEntered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [keyboardEntered]);

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
    setKeyboardEntered(true);
    setConfirming(false);
    if (value.length === 10) {
      setError('');
    }
  };

  const handleSubmit = async (number: string) => {
    if (number.length === 10) {
      // Save registration phase
      const saved = loadOnboardingState();
      saveOnboardingState({ ...saved, phase: 'REGISTRATION' });

      // Try WebOTP auto-read on supported devices
      if (typeof window !== 'undefined' && 'credentials' in navigator) {
        const otp = await readOTPAuto(8000);

        if (otp) {
          // OTP auto-read successful - will be used by OTP screen
          console.log('[MobileNumberScreen] OTP auto-read successful:', otp.substring(0, 2) + '****');
        }
      }

      onComplete(number);
    } else {
      setError('कृपया 10 अंक बताइए');
      void speakWithSarvam({
        text: 'कृपया 10 अंक बताइए। फिर से कोशिश करें।',
        languageCode: 'hi-IN',
      });
    }
  };

  const handleKeyboardToggle = () => {
    setIsKeyboardMode(!isKeyboardMode);
    setKeyboardEntered(!keyboardEntered);
    if (!keyboardEntered) {
      stopCurrentSpeech();
      setConfirming(false);
    }
  };

  const formatted = mobile
    ? `${mobile.slice(0, 5)} ${mobile.slice(5)}`.trim()
    : '';

  return (
    <main className="min-h-dvh w-full max-w-[390px] xs:max-w-[430px] mx-auto bg-[#FFFDF7] font-body text-[#1b1c19] flex flex-col shadow-2xl relative">
      {/* Top Bar: Progress & Navigation */}
      <header className="w-full top-0 sticky z-50 px-6 py-4 flex items-center gap-6 bg-[#fbf9f3]">
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-200"
          aria-label="Go back"
        >
          <svg className="w-6 h-6 text-[#904d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 flex gap-2">
          {/* Progress Pills (1 of 6) */}
          <div className="h-2 flex-1 rounded-full bg-[#ff8c00]"></div>
          <div className="h-2 flex-1 rounded-full bg-[#e4e2dd] opacity-40"></div>
          <div className="h-2 flex-1 rounded-full bg-[#e4e2dd] opacity-40"></div>
          <div className="h-2 flex-1 rounded-full bg-[#e4e2dd] opacity-40"></div>
          <div className="h-2 flex-1 rounded-full bg-[#e4e2dd] opacity-40"></div>
          <div className="h-2 flex-1 rounded-full bg-[#e4e2dd] opacity-40"></div>
        </div>
        <span className="font-label text-sm font-bold text-[#904d00]">1/6</span>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-10 pb-32 max-w-xl mx-auto w-full">
        {/* Animated Entrance Card */}
        <div className="bg-[#f5f3ee] rounded-3xl p-8 shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border-l-4 border-[#ff8c00]">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-headline text-3xl font-bold text-[#1b1c19] leading-tight">
              आपका मोबाइल नंबर क्या है?
            </h1>
            {/* Saved Status Badge */}
            {mobile.length === 10 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#a0f399] text-[#002204] rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Saved
              </div>
            )}
          </div>
          <p className="text-[#564334] text-lg mb-10 leading-[150%]">
            हम आपके पंजीकरण के लिए एक ओटीपी भेजेंगे।
          </p>

          {/* Large Input Field Section */}
          <div className="relative group">
            <label className="block font-label font-bold text-[#904d00] mb-3 text-lg">मोबाइल नंबर</label>
            <div className="flex items-center gap-4 p-5 bg-[#f5f3ee] rounded-2xl border-2 border-transparent group-focus-within:border-[#ff8c00] group-focus-within:shadow-[0_0_12px_rgba(255,140,0,0.15)] transition-all">
              {/* Flag/Code Section */}
              <div className="flex items-center gap-2 pr-4 border-r border-[#ddc1ae]/30">
                <img
                  alt="India Flag"
                  className="w-8 h-auto rounded-sm"
                  src="https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_India.svg"
                  style={{ width: '32px', height: '24px', objectFit: 'cover' }}
                />
                <span className="text-2xl font-bold text-[#1b1c19]">+91</span>
              </div>
              {/* Input Area */}
              <input
                ref={inputRef}
                type="tel"
                maxLength={10}
                value={formatted.replace(/\s/g, '')}
                onChange={handleTextInputChange}
                placeholder="00000 00000"
                className="w-full bg-transparent border-none focus:ring-0 text-3xl font-bold tracking-widest text-[#1b1c19] placeholder:text-[#897362]/40"
              />
            </div>
          </div>

          {/* Contextual Help */}
          <div className="mt-8 p-4 bg-[#fbf9f3] rounded-xl flex items-start gap-4 italic text-[#564334]">
            <svg className="w-6 h-6 text-[#904d00] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-base leading-relaxed">
              आपकी गोपनीयता हमारे लिए पवित्र है। हम कभी भी आपके नंबर का दुरुपयोग नहीं करेंगे।
            </p>
          </div>
        </div>

        {/* Asymmetric Decorative Element */}
        <div className="mt-12 flex justify-end opacity-20">
          <svg className="w-24 h-24 text-[#904d00] transform rotate-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22a7 7 0 007-7c0-2-1-3.5-3-5.5C17.5 7.5 16 4 16 2a1 1 0 00-2 0c0 1.5-1 4-2.5 6.5C10.5 11 9 13 9 15a7 7 0 007 7z" />
          </svg>
        </div>
      </div>

      {/* Bottom Action Area */}
      <footer className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        {/* Floating Action Button for Next */}
        <div className="max-w-xl mx-auto px-6 mb-24 flex justify-end pointer-events-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSubmit(mobile)}
            disabled={mobile.length !== 10}
            className={`h-16 px-8 rounded-2xl flex items-center gap-3 transition-all ${mobile.length === 10
              ? 'bg-gradient-to-tr from-[#904d00] to-[#f89100] text-white shadow-lg'
              : 'bg-[#e4e2dd] text-[#897362] cursor-not-allowed'
              }`}
          >
            <span className="font-bold text-xl">आगे बढ़ें</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </div>

        {/* Voice-Keyboard Toggle Bar */}
        <div className="w-full bg-[#e4e2dd] px-6 py-4 flex justify-between items-center pointer-events-auto shadow-[0px_-4px_16px_rgba(144,77,0,0.06)]">
          <button
            onClick={handleKeyboardToggle}
            className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors ${isKeyboardMode
              ? 'text-[#904d00] bg-[#f0eee8]'
              : 'text-[#564334] hover:bg-[#f0eee8]'
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth={2} />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" strokeWidth={2} />
            </svg>
            <span>कीबोर्ड</span>
          </button>
          <div className="h-8 w-px bg-[#ddc1ae]/50"></div>
          <button
            onClick={() => {
              setIsKeyboardMode(false);
              setIsMicOff(false);
            }}
            className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-colors ${!isKeyboardMode
              ? 'text-[#1b1c19] bg-[#f0eee8]'
              : 'text-[#564334] hover:bg-[#f0eee8]'
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>बोलकर लिखें</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
