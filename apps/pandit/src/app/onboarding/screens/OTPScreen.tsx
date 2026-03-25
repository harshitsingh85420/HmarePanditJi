'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWithSarvam, stopCurrentSpeech, LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts';
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
      const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN'; // BUG-003 FIX: Use dynamic language
      void speakWithSarvam({
        text: `हमने ${mobile.split('').join('... ')} पर OTP भेजा है। 6 अंकों का OTP बोलें — या नीचे टाइप करें।`,
        languageCode,
        speaker: 'ratan',
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          startSTT();
        },
      }).catch((err) => {
        console.error('TTS failed on mount:', err);
        // Still start STT even if TTS fails
        setIsSpeaking(false);
        startSTT();
      });
    }, 600);

    return () => {
      clearTimeout(timer);
      stopCurrentSpeech();
      cleanupSTT.current?.();
    };
  }, [mobile, language]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function startSTT() {
    cleanupSTT.current?.();
    setIsListening(true);
    const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN'; // BUG-003 FIX: Use dynamic language
    cleanupSTT.current = listenOnce(
      'hi',
      20000,
      (text) => {
        setTranscript(text);
        setIsListening(false);
        const digits = normalizeOTP(text);
        if (digits.length === 6) {
          const arr = digits.split('');
          setOtp(arr);
          submitOTP(arr.join(''));
        } else {
          setError('6 अंक नहीं मिले — फिर से बोलें या टाइप करें।');
        }
      },
      () => {
        setIsListening(false);
        // Reprompt once
        void speakWithSarvam({
          text: '6 अंकों का OTP बोलें।',
          languageCode,
          onEnd: () => startSTT(),
        }).catch((err) => {
          console.error('TTS reprompt failed:', err);
          // Still start STT even if TTS fails
          startSTT();
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
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-body text-text-primary flex flex-col shadow-2xl">
      {/* Header - shrink-0 to prevent compression */}
      <header className="pt-8 px-6 pb-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-[72px] h-[72px] -ml-2 flex items-center justify-center text-saffron hover:bg-saffron-light rounded-full min-h-[72px] min-w-[72px] focus:ring-4 focus:ring-saffron focus:outline-none" aria-label="पीछे जाएं">
          <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-[36px] font-bold text-text-primary">पंजीकरण</h1>
          <p className="text-[32px] font-bold text-saffron">कदम 2 / 4</p>
        </div>
      </header>

      {/* Progress - shrink-0 to prevent compression - Bold and Clear for Elderly */}
      <div className="px-6 pb-4 shrink-0">
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-16 rounded-full transition-colors ${i <= 2 ? 'bg-saffron' : 'bg-surface-dim'}`} />
          ))}
        </div>
      </div>

      {/* Content - flex-grow with overflow-y-auto for scroll on small screens */}
      <div className="flex-grow flex flex-col items-center px-6 pt-2 overflow-y-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h2 className="text-[40px] font-bold text-text-primary">🔐 OTP दर्ज करें</h2>
          <p className="text-[24px] text-saffron mt-3 font-medium">
            <span className="font-bold text-text-primary">+91 {formatted}</span> पर भेजा गया
          </p>
        </motion.div>

        {/* Voice indicator */}
        <AnimatePresence>
          {(isListening || isSpeaking) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full mb-4 flex items-center gap-3 px-5 py-5 bg-saffron-lt rounded-2xl border-3 border-saffron/40 min-h-[88px] shadow-card"
            >
              <div className="flex items-end gap-2 h-14 shrink-0">
                <div className="w-3 bg-saffron rounded-full animate-voice-bar" />
                <div className="w-3 bg-saffron rounded-full animate-voice-bar-2" />
                <div className="w-3 bg-saffron rounded-full animate-voice-bar-3" />
              </div>
              <span className="text-[28px] text-text-primary truncate font-medium">
                {isSpeaking ? 'बोल रहा हूँ...' : (transcript || 'OTP बोलें...')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input Boxes - Larger for elderly */}
        <div className="flex gap-4 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-20 h-24 text-center text-[40px] font-bold rounded-xl border-3 transition-colors bg-surface-card focus:outline-none ${digit ? 'border-saffron text-text-primary' : 'border-border-default text-text-disabled'
                } focus:border-saffron min-h-[96px] min-w-[80px]`}
            />
          ))}
        </div>

        {error && <p className="text-error text-[20px] mb-4 text-center font-medium">{error}</p>}

        {/* Resend */}
        <div className="text-center mb-8">
          {resendTimer > 0 ? (
            <p className="text-saffron text-[22px] font-medium">OTP दोबारा भेजें ({resendTimer}s)</p>
          ) : (
            <button
              onClick={() => {
                setResendTimer(30);
                setError('');
                const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
                void speakWithSarvam({
                  text: 'नया OTP भेजा गया।',
                  languageCode,
                  onEnd: () => startSTT(),
                }).catch((err) => {
                  console.error('TTS resend failed:', err);
                  startSTT();
                });
              }}
              className="min-h-[80px] text-text-primary text-[22px] font-semibold underline focus:ring-4 focus:ring-saffron focus:outline-none px-8 py-4"
            >
              OTP दोबारा भेजें
            </button>
          )}
        </div>

        {/* Helptext */}
        <p className="text-[22px] text-text-secondary text-center font-medium">
          OTP नहीं आया? Spam folder check करें या ऊपर Resend दबाएं।
        </p>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-10 pt-3 bg-surface-base/90 backdrop-blur-sm border-t-3 border-border-default shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!otp.every(d => d !== '')}
          onClick={() => submitOTP(otp.join(''))}
          className={`w-full min-h-[88px] rounded-2xl flex items-center justify-center text-[26px] font-bold transition-all ${otp.every(d => d !== '')
            ? 'bg-saffron text-white shadow-btn-saffron'
            : 'bg-surface-dim text-saffron cursor-not-allowed'
            }`}
        >
          Verify करें →
        </motion.button>
      </footer>
    </main>
  );
}
