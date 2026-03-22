'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { listenOnce } from '@/lib/deepgram-stt';
import type { SupportedLanguage } from '@/lib/onboarding-store';

// OTP word normalizer
const NUMBER_WORDS: Record<string, string> = {
  'ek': '1', 'एक': '1', 'do': '2', 'दो': '2',
  'teen': '3', 'तीन': '3', 'char': '4', 'चार': '4',
  'paanch': '5', 'पांच': '5', 'chhah': '6', 'छह': '6',
  'saat': '7', 'सात': '7', 'aath': '8', 'आठ': '8',
  'nau': '9', 'नौ': '9', 'zero': '0', 'shoonya': '0', 'शून्य': '0',
};

function normalizeOTP(transcript: string): string {
  const text = transcript.toLowerCase().replace(/\s+/g, ' ').trim();
  const words = text.split(' ');
  const digits = words.map(w => NUMBER_WORDS[w] ?? w).join('');
  return digits.replace(/\D/g, '').slice(0, 6);
}

interface Props {
  mobile: string;
  language: SupportedLanguage;
  onVerified: () => void;
  onBack: () => void;
}

export default function OTPScreen({ mobile, language, onVerified, onBack }: Props) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [resendTimer, setResendTimer] = useState(30);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cleanupSTT = useRef<(() => void) | null>(null);

  const formatted = `${mobile.slice(0, 5)} ${mobile.slice(5)}`;

  // TTS then STT on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpeaking(true);
      void speakWithSarvam({
        text: `हमने ${mobile.split('').join('... ')} पर OTP भेजा है। 6 अंकों का OTP बोलें — या नीचे टाइप करें।`,
        languageCode: 'hi-IN',
        speaker: 'ratan',
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          startSTT();
        },
      });
    }, 600);

    return () => {
      clearTimeout(timer);
      stopCurrentSpeech();
      cleanupSTT.current?.();
    };
  }, [mobile]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function startSTT() {
    cleanupSTT.current?.();
    setIsListening(true);
    cleanupSTT.current = listenOnce(
      'hi',
      20000,
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          setIsListening(false);
          const digits = normalizeOTP(text);
          if (digits.length === 6) {
            const arr = digits.split('');
            setOtp(arr);
            submitOTP(arr.join(''));
          } else {
            setError('6 अंक नहीं मिले — फिर से बोलें या टाइप करें।');
          }
        }
      },
      () => {
        setIsListening(false);
        // Reprompt once
        void speakWithSarvam({
          text: '6 अंकों का OTP बोलें।',
          languageCode: 'hi-IN',
          onEnd: () => startSTT(),
        });
      }
    );
  }

  const submitOTP = (code: string) => {
    // In production: verify via API
    // For MVP: simulate success (any 6 digits works)
    setIsSpeaking(true);
    stopCurrentSpeech();
    // BUG-004 FIX: Add error handling to TTS calls
    speakWithSarvam({
      text: 'OTP सही है। बहुत अच्छा।',
      languageCode: 'hi-IN',
      onEnd: () => {
        setIsSpeaking(false);
        onVerified();
      },
    }).catch((err) => {
      console.error('TTS failed:', err);
      // Still navigate even if TTS fails
      setIsSpeaking(false);
      onVerified();
    });
  };

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => submitOTP(newOtp.join('')), 300);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otp.every(d => d !== '')) {
      submitOTP(otp.join(''));
    }
  };

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-vedic-cream font-hind text-vedic-brown flex flex-col shadow-2xl">
      {/* Header - shrink-0 to prevent compression */}
      <header className="pt-8 px-6 pb-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-10 h-10 -ml-2 flex items-center justify-center text-vedic-gold hover:bg-black/5 rounded-full" aria-label="Go back">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[20px] font-bold text-vedic-brown">Registration — Step 2/4</h1>
      </header>

      {/* Progress - shrink-0 to prevent compression */}
      <div className="px-6 pb-4 shrink-0">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= 2 ? 'bg-primary' : 'bg-vedic-border'}`} />
          ))}
        </div>
        <p className="text-xs text-vedic-gold mt-1">OTP Verification</p>
      </div>

      {/* Content - flex-grow with overflow-y-auto for scroll on small screens */}
      <div className="flex-grow flex flex-col items-center px-6 pt-2 overflow-y-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h2 className="text-[26px] font-bold text-vedic-brown">🔐 OTP दर्ज करें</h2>
          <p className="text-[16px] text-vedic-gold mt-2">
            <span className="font-semibold text-vedic-brown">+91 {formatted}</span> पर भेजा गया
          </p>
        </motion.div>

        {/* Voice indicator */}
        <AnimatePresence>
          {(isListening || isSpeaking) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full mb-4 flex items-center gap-3 px-4 py-2.5 bg-primary-lt rounded-xl border border-primary/20"
            >
              <div className="flex items-end gap-1 h-5 shrink-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-1.5 bg-primary rounded-full animate-voice-bar" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span className="text-[14px] text-vedic-brown truncate">
                {isSpeaking ? 'बोल रहा हूँ...' : (transcript || 'OTP बोलें...')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input Boxes */}
        <div className="flex gap-3 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-[24px] font-bold rounded-xl border-2 transition-colors bg-white focus:outline-none ${digit ? 'border-primary text-vedic-brown' : 'border-vedic-border text-vedic-border'
                } focus:border-primary`}
            />
          ))}
        </div>

        {error && <p className="text-error text-[14px] mb-4 text-center">{error}</p>}

        {/* Resend */}
        <div className="text-center mb-8">
          {resendTimer > 0 ? (
            <p className="text-vedic-gold text-[14px]">OTP दोबारा भेजें ({resendTimer}s)</p>
          ) : (
            <button
              onClick={() => {
                setResendTimer(30);
                setError('');
                void speakWithSarvam({
                  text: 'नया OTP भेजा गया।',
                  languageCode: 'hi-IN',
                  onEnd: () => startSTT(),
                });
              }}
              className="text-primary text-[16px] font-semibold underline"
            >
              OTP दोबारा भेजें
            </button>
          )}
        </div>

        {/* Helptext */}
        <p className="text-[13px] text-vedic-gold text-center">
          OTP नहीं आया? Spam folder check करें या ऊपर Resend दबाएं।
        </p>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-10 pt-3 bg-vedic-cream/90 backdrop-blur-sm border-t border-vedic-border shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!otp.every(d => d !== '')}
          onClick={() => submitOTP(otp.join(''))}
          className={`w-full h-16 rounded-2xl flex items-center justify-center text-[20px] font-bold transition-all ${otp.every(d => d !== '')
            ? 'bg-primary text-white shadow-cta'
            : 'bg-vedic-border/30 text-vedic-gold cursor-not-allowed'
            }`}
        >
          Verify करें →
        </motion.button>
      </footer>
    </main>
  );
}
