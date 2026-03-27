'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding-store';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import { LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts';

interface OTPScreenProps {
  language: SupportedLanguage;
  mobile: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function OTPScreen({ language, mobile, onComplete, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const { isListening, isSpeaking, voiceFlowState } = useSarvamVoiceFlow({
    language,
    script: 'OTP बोलें — 6 अंक।',
    repromptScript: '6 अंक बोलें — OTP।',
    initialDelayMs: 800,  // BUG-001 FIX: Increased from 600ms for elderly comprehension
    pauseAfterMs: 1000,  // BUG-001 FIX: Increased from 500ms for TTS completion
    onIntent: (intentOrRaw) => {
      if (intentOrRaw.startsWith('RAW:')) {
        const raw = intentOrRaw.slice(4).trim().replace(/\D/g, '').slice(0, 6);
        if (raw.length === 6) {
          setOtp(raw.split(''));
          void speakWithSarvam({
            text: `OTP ${raw} — क्या यह सही है? 'हाँ' बोलें।`,
            languageCode: 'hi-IN',
          });
        } else if (raw.length > 0) {
          void speakWithSarvam({
            text: 'केवल 6 अंक बताइए। फिर से बोलें।',
            languageCode: 'hi-IN',
          });
        }
      } else if (intentOrRaw === 'YES') {
        submitOTP(otp.join(''));
      }
    },
  });

  useEffect(() => {
    const saved = loadOnboardingState();
    saveOnboardingState({ ...saved, phase: 'REGISTRATION' });
    const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
    void speakWithSarvam({
      text: `OTP दर्ज करें। ${mobile} पर भेजा गया है।`,
      languageCode,
    }).catch((err) => {
      console.error('TTS failed:', err);
    });
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every(d => d !== '')) {
      setError('');
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otp.every(d => d !== '')) {
      submitOTP(otp.join(''));
    }
  };

  const submitOTP = (code: string) => {
    if (code.length === 6) {
      const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
      void speakWithSarvam({
        text: 'OTP verify हो गया। बहुत अच्छा।',
        languageCode,
        onEnd: onComplete,
      });
    } else {
      setError('कृपया 6 अंक दर्ज करें');
      void speakWithSarvam({
        text: 'कृपया 6 अंक दर्ज करें। फिर से कोशिश करें।',
        languageCode: 'hi-IN',
      });
    }
  };

  const formatted = mobile.replace(/(\d{5})(\d{5})/, '$1 $2');

  return (
    <main className="min-h-dvh w-full max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base font-body text-text-primary flex flex-col shadow-2xl">
      {/* Header - shrink-0 to prevent compression */}
      <header className="pt-6 xs:pt-8 px-4 xs:px-6 pb-2 flex items-center gap-2 xs:gap-3 shrink-0">
        <button onClick={onBack} className="w-16 h-16 xs:w-20 xs:h-20 -ml-2 xs:-ml-3 flex items-center justify-center text-saffron hover:bg-saffron-light rounded-full min-h-[52px] xs:min-h-[56px] min-w-[52px] xs:min-w-[56px] focus:ring-4 focus:ring-saffron focus:outline-none" aria-label="पीछे जाएं">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl xs:text-4xl sm:text-[36px] font-bold text-text-primary">पंजीकरण</h1>
          <p className="text-2xl xs:text-3xl sm:text-[32px] font-bold text-saffron">कदम 2 / 4</p>
        </div>
      </header>

      {/* Progress - shrink-0 to prevent compression - Bold and Clear for Elderly */}
      <div className="px-4 xs:px-6 pb-3 xs:pb-4 shrink-0">
        <div className="flex gap-2 xs:gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-12 xs:h-14 sm:h-16 rounded-full transition-colors ${i <= 2 ? 'bg-saffron' : 'bg-surface-dim'}`} />
          ))}
        </div>
      </div>

      {/* Content - flex-grow with overflow-y-auto for scroll on small screens */}
      <div className="flex-grow flex flex-col items-center px-4 xs:px-6 pt-2 overflow-y-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 xs:mb-8">
          <h2 className="text-3xl xs:text-4xl sm:text-[40px] font-bold text-text-primary">🔐 OTP दर्ज करें</h2>
          <p className="text-lg xs:text-xl sm:text-[24px] text-saffron mt-2 xs:mt-3 font-medium">
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
              className="w-full mb-3 xs:mb-4 flex items-center gap-2 xs:gap-3 px-4 xs:px-5 py-4 xs:py-5 bg-saffron-lt rounded-2xl border-3 border-saffron/40 min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] shadow-card"
            >
              <div className="flex items-end gap-1 xs:gap-2 h-10 xs:h-14 shrink-0">
                <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar" />
                <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar-2" />
                <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar-3" />
              </div>
              <span className="text-xl xs:text-2xl sm:text-[28px] text-text-primary truncate font-medium">
                {isSpeaking ? 'बोल रहा हूँ...' : 'OTP बोलें...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input Boxes - Larger for elderly */}
        <div className="flex gap-3 xs:gap-4 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-16 h-20 xs:w-20 xs:h-24 text-center text-3xl xs:text-4xl sm:text-[40px] font-bold rounded-xl border-3 transition-colors bg-surface-card focus:outline-none ${digit ? 'border-saffron text-text-primary' : 'border-border-default text-text-disabled'
                } focus:border-saffron min-h-[52px] xs:min-h-[56px] sm:min-h-[96px] min-w-[52px] xs:min-w-[56px] sm:min-w-[80px]`}
            />
          ))}
        </div>

        {error && <p className="text-error text-base xs:text-lg sm:text-[20px] mb-3 xs:mb-4 text-center font-medium">{error}</p>}

        {/* Resend */}
        <div className="text-center mb-6 xs:mb-8">
          {resendTimer > 0 ? (
            <p className="text-saffron text-lg xs:text-xl sm:text-[22px] font-medium">OTP दोबारा भेजें ({resendTimer}s)</p>
          ) : (
            <button
              onClick={() => {
                setResendTimer(30);
                setError('');
                const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
                void speakWithSarvam({
                  text: 'नया OTP भेजा गया।',
                  languageCode,
                }).catch((err) => {
                  console.error('TTS resend failed:', err);
                });
              }}
              className="min-h-[52px] xs:min-h-[56px] sm:min-h-[80px] text-text-primary text-lg xs:text-xl sm:text-[22px] font-semibold underline focus:ring-4 focus:ring-saffron focus:outline-none px-6 xs:px-8 py-4"
            >
              OTP दोबारा भेजें
            </button>
          )}
        </div>

        {/* Helptext */}
        <p className="text-base xs:text-lg sm:text-[22px] text-text-secondary text-center font-medium">
          OTP नहीं आया? Spam folder check करें या ऊपर Resend दबाएं।
        </p>
      </div>

      {/* Footer */}
      <footer className="px-4 xs:px-6 pb-8 xs:pb-10 pt-2 xs:pt-3 bg-surface-base/90 backdrop-blur-sm border-t-3 border-border-default shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!otp.every(d => d !== '')}
          onClick={() => submitOTP(otp.join(''))}
          className={`w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] rounded-2xl flex items-center justify-center text-lg xs:text-xl sm:text-[26px] font-bold transition-all ${otp.every(d => d !== '')
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
