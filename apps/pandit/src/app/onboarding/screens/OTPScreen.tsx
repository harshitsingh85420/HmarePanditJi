'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { speakWithSarvam } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding-store';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import { LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts';
import { readOTPAuto } from '@/lib/webotp';

interface OTPScreenProps {
  language: SupportedLanguage;
  mobile: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function OTPScreen({ language, mobile, onComplete, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(45);
  const [canResendSMS, setCanResendSMS] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [autoReadStarted, setAutoReadStarted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { voiceFlowState } = useSarvamVoiceFlow({
    language,
    script: 'OTP बोलें — 6 अंक।',
    repromptScript: '6 अंक बोलें — OTP।',
    initialDelayMs: 800,
    pauseAfterMs: 1000,
    autoListen: !isKeyboardMode,
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

    // Try WebOTP auto-read on mount for supported devices
    if (!autoReadStarted && typeof window !== 'undefined' && 'credentials' in navigator) {
      setAutoReadStarted(true);
      void handleAutoReadOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setCanResendSMS(true);
    }
  }, [resendTimer]);

  const handleAutoReadOTP = async () => {
    try {
      const otpCode = await readOTPAuto(10000);
      if (otpCode && otpCode.length === 6) {
        const otpArray = otpCode.split('');
        setOtp(otpArray);
        // Auto-submit after brief delay
        setTimeout(() => {
          submitOTP(otpCode);
        }, 500);
      }
    } catch (error) {
      console.log('[OTPScreen] WebOTP auto-read failed or not supported');
    }
  };

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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const otpArray = pastedData.split('');
      setOtp(otpArray);
      submitOTP(pastedData);
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

  const handleResendSMS = () => {
    setResendTimer(45);
    setCanResendSMS(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
    void speakWithSarvam({
      text: 'नया OTP भेजा गया।',
      languageCode,
    }).catch((err) => {
      console.error('TTS resend failed:', err);
    });
  };

  const handleResendCall = () => {
    setResendTimer(45);
    setCanResendSMS(false);
    setOtp(['', '', '', '', '', '']);
    const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
    void speakWithSarvam({
      text: 'OTP कॉल की जा रही है। कृपया सुनें।',
      languageCode,
    }).catch((err) => {
      console.error('TTS call failed:', err);
    });
  };

  const handleKeyboardToggle = () => {
    setIsKeyboardMode(!isKeyboardMode);
  };

  return (
    <main className="bg-[#fbf9f3] text-[#1b1c19] font-body min-h-screen flex flex-col items-center max-w-md mx-auto w-full">
      {/* Top Navigation Bar */}
      <nav className="w-full max-w-md bg-[#fbf9f3] sticky top-0 z-50 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-surface-container-low rounded-full transition-colors active:scale-95 duration-200"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 text-[#904d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-1.5 items-center">
            {/* Progress Pills: 2 of 6 */}
            <div className="h-1.5 w-6 rounded-full bg-[#ff8c00]"></div>
            <div className="h-1.5 w-6 rounded-full bg-[#ff8c00]"></div>
            <div className="h-1.5 w-6 rounded-full bg-[#e4e2dd]"></div>
            <div className="h-1.5 w-6 rounded-full bg-[#e4e2dd]"></div>
            <div className="h-1.5 w-6 rounded-full bg-[#e4e2dd]"></div>
            <div className="h-1.5 w-6 rounded-full bg-[#e4e2dd]"></div>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>
      </nav>

      <div className="w-full max-w-md px-6 flex-1 flex flex-col">
        {/* Status Banner */}
        <div className="mt-4 mb-10 animate-fade-in">
          <div className="bg-[#a0f399]/30 border-l-4 border-[#1b6d24] px-4 py-3 rounded-r-xl flex items-center gap-3">
            <svg className="w-6 h-6 text-[#1b6d24]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-devanagari text-[#002204] font-medium text-lg leading-tight">
              OTP भेज दिया गया
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <h1 className="font-headline text-3xl font-bold text-[#904d00] mb-2">प्रमाणीकरण</h1>
          <p className="font-devanagari text-[#564334] text-lg leading-relaxed mb-8">
            कृपया आपके मोबाइल नंबर पर भेजा गया 6-अंकों का कोड यहाँ दर्ज करें।
          </p>

          {/* OTP Card */}
          <div className="bg-[#f5f3ee] rounded-[2rem] p-8 shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border border-[#ddc1ae]/10">
            <div
              className="grid grid-cols-6 gap-2 sm:gap-3 mb-8"
              onPaste={handlePaste}
            >
              {/* OTP Input Boxes */}
              {otp.map((digit, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#f5f3ee] border-b-2 border-[#ddc1ae]/30 rounded-xl flex items-center justify-center focus-within:border-[#ff8c00] focus-within:bg-white transition-all duration-300"
                >
                  <input
                    ref={el => { inputRefs.current[i] = el; }}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="w-full h-full bg-transparent border-none text-center text-2xl font-bold text-[#904d00] focus:ring-0"
                  />
                </div>
              ))}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <svg className="w-6 h-6 text-[#8c5000] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[#8c5000] font-bold font-body tracking-wider text-xl">
                00:{resendTimer.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Action Links */}
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={handleResendSMS}
                disabled={!canResendSMS}
                className={`flex items-center gap-2 font-medium transition-colors ${canResendSMS
                  ? 'text-[#897362] hover:text-[#904d00]'
                  : 'text-stone-400 cursor-not-allowed'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="font-devanagari">Resend SMS</span>
              </button>
              <div className="h-px w-12 bg-[#e4e2dd]"></div>
              <button
                onClick={handleResendCall}
                className="flex items-center gap-2 text-[#904d00] font-semibold hover:bg-[#ff8c00]/10 px-4 py-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-devanagari">Call for OTP</span>
              </button>
            </div>
          </div>

          {/* Confirmation Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => submitOTP(otp.join(''))}
            disabled={!otp.every(d => d !== '')}
            className={`w-full h-14 font-headline font-bold text-lg rounded-xl mt-12 flex items-center justify-center transition-all ${otp.every(d => d !== '')
              ? 'bg-gradient-to-b from-[#904d00] to-[#8c5000] text-white shadow-[0px_8px_24px_rgba(144,77,0,0.08)]'
              : 'bg-[#e4e2dd] text-[#897362] cursor-not-allowed'
              }`}
          >
            आगे बढ़ें
          </motion.button>
        </div>

        {/* Voice-Keyboard Toggle Bar */}
        <div className="mt-auto mb-10 bg-[#eae8e2] rounded-full p-1.5 flex items-center self-center shadow-inner">
          <button
            onClick={handleKeyboardToggle}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold shadow-sm transition-all ${isKeyboardMode
              ? 'bg-[#f5f3ee] text-[#904d00]'
              : 'text-[#564334]'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth={2} />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" strokeWidth={2} />
            </svg>
            <span className="text-sm font-label">Keyboard</span>
          </button>
          <button
            onClick={() => setIsKeyboardMode(false)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${!isKeyboardMode
              ? 'bg-[#f5f3ee] text-[#904d00]'
              : 'text-[#564334] hover:bg-[#f0eee8]'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-sm font-label">Voice</span>
          </button>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <div className="fixed bottom-0 right-0 opacity-5 pointer-events-none -mb-8 -mr-8">
        <div className="w-48 h-48 bg-gradient-to-br from-[#904d00]/10 to-transparent rounded-full blur-2xl"></div>
      </div>
    </main>
  );
}
