'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding-store';
import type { SupportedLanguage } from '@/lib/onboarding-store';

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

  const { isListening, isSpeaking, voiceFlowState, restartListening } = useSarvamVoiceFlow({
    language,
    script: 'अपना मोबाइल नंबर बोलें — जैसे 9876543210।',
    repromptScript: 'नंबर बोलें — 10 अंक।',
    initialDelayMs: 800,  // BUG-001 FIX: Increased from 600ms for elderly comprehension
    pauseAfterMs: 1000,  // BUG-001 FIX: Increased from 500ms for TTS completion
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

  const handleKeypadInput = (digit: string) => {
    if (mobile.length < 10) {
      const newMobile = mobile + digit;
      setMobile(newMobile);
      if (newMobile.length === 10) {
        setError('');
        if (!keyboardEntered) {
          setConfirming(true);
          void speakWithSarvam({
            text: `${newMobile.slice(0, 5)} ${newMobile.slice(5)} — क्या यह सही है?`,
            languageCode: 'hi-IN',
          });
        }
      }
    }
  };

  const handleDelete = () => {
    setMobile(mobile.slice(0, -1));
    setConfirming(false);
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
    setKeyboardEntered(true);
    setConfirming(false);
    if (value.length === 10) {
      setError('');
    }
  };

  const handleSubmit = (number: string) => {
    if (number.length === 10) {
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

  const updateMobile = (newMobile: string) => {
    setMobile(newMobile);
  };

  const formatted = mobile
    ? `${mobile.slice(0, 5)} ${mobile.slice(5)}`.trim()
    : '';

  return (
    <main className="min-h-dvh w-full max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base font-body text-text-primary flex flex-col shadow-2xl relative">
      {/* Header - shrink-0 to prevent compression */}
      <header className="pt-6 xs:pt-8 px-4 xs:px-6 pb-2 flex items-center gap-2 xs:gap-3 shrink-0">
        <button onClick={onBack} className="w-16 h-16 xs:w-20 xs:h-20 -ml-2 xs:-ml-3 flex items-center justify-center text-saffron hover:bg-saffron-light rounded-full min-h-[52px] xs:min-h-[56px] min-w-[52px] xs:min-w-[56px] focus:ring-4 focus:ring-saffron focus:outline-none" aria-label="पीछे जाएं">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl xs:text-4xl sm:text-[36px] font-bold text-text-primary">पंजीकरण</h1>
          <p className="text-2xl xs:text-3xl sm:text-[32px] font-bold text-saffron">कदम 1 / 4</p>
        </div>
      </header>

      {/* Progress - shrink-0 to prevent compression - Bold and Clear for Elderly */}
      <div className="px-4 xs:px-6 pb-3 xs:pb-4 shrink-0">
        <div className="flex gap-2 xs:gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-12 xs:h-14 sm:h-16 rounded-full transition-colors ${i === 1 ? 'bg-saffron' : 'bg-surface-dim'}`} />
          ))}
        </div>
      </div>

      {/* Content - flex-grow with overflow-y-auto for scroll on small screens */}
      <div className="flex-grow flex flex-col items-center px-4 xs:px-6 pt-2 overflow-y-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 xs:mb-8 w-full">
          <h2 className="text-3xl xs:text-4xl sm:text-[40px] font-bold text-text-primary leading-tight">
            📱 आपका मोबाइल नंबर?
          </h2>
          <p className="text-lg xs:text-xl sm:text-[24px] text-saffron mt-2 xs:mt-3 font-medium">
            OTP से verify होगा — बिल्कुल safe
          </p>
        </motion.div>

        {/* Voice listening indicator */}
        <AnimatePresence>
          {!isKeyboardMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-3 xs:mb-4 flex items-center justify-between gap-2 xs:gap-3 px-4 xs:px-5 py-4 xs:py-5 bg-saffron-lt rounded-2xl border-3 border-saffron/40 min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] shadow-card"
            >
              {isMicOff ? (
                <div className="flex items-center gap-2 xs:gap-3 text-red-600">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xl xs:text-2xl sm:text-[26px] font-medium">Mic Off</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 xs:gap-2 overflow-hidden">
                  <div className="flex items-end gap-1 xs:gap-2 h-10 xs:h-14 shrink-0">
                    <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar" />
                    <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar-2" />
                    <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar-3" />
                  </div>
                  <span className="text-xl xs:text-2xl sm:text-[28px] text-text-primary truncate font-medium">
                    {isSpeaking ? 'बोल रहा हूँ...' : 'नंबर बोलें...'}
                  </span>
                </div>
              )}

              <button
                onClick={() => setIsMicOff(!isMicOff)}
                className={`px-6 xs:px-8 py-4 xs:py-5 min-h-[52px] xs:min-h-[56px] sm:min-h-[80px] rounded-2xl text-lg xs:text-xl sm:text-[22px] font-bold border-3 transition-colors shrink-0 focus:ring-4 focus:ring-saffron focus:outline-none ${isMicOff
                  ? 'bg-saffron text-white border-saffron'
                  : 'bg-white text-text-primary border-border-default'
                  }`}
              >
                {isMicOff ? 'Mic On' : 'Mic Off'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BUG-003 FIX: Keyboard toggle - shown when keyboard mode is active */}
        {isKeyboardMode && (
          <div className="w-full mb-3 xs:mb-4 flex items-center justify-between gap-2 xs:gap-3 px-4 xs:px-5 py-4 xs:py-5 bg-surface-muted rounded-2xl border-3 border-border-default min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] shadow-card">
            <div className="flex items-center gap-2 xs:gap-3 text-text-primary">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
              </svg>
              <span className="text-xl xs:text-2xl sm:text-[26px] font-medium">Keyboard Mode</span>
            </div>
            <button
              onClick={handleKeyboardToggle}
              className="px-6 xs:px-8 py-4 xs:py-5 min-h-[52px] xs:min-h-[56px] sm:min-h-[80px] rounded-2xl text-lg xs:text-xl sm:text-[22px] font-bold border-3 border-border-default bg-white text-text-primary hover:bg-saffron-lt transition-colors focus:ring-4 focus:ring-saffron focus:outline-none"
            >
              Voice वापस लाएं
            </button>
          </div>
        )}

        {/* Number Display */}
        <div className={`w-full text-center py-6 xs:py-8 rounded-2xl border-3 mb-3 xs:mb-4 transition-colors ${mobile.length === 10 ? 'border-success bg-success-lt' : 'border-saffron/30 bg-surface-card'
          }`}>
          {mobile.length > 0 ? (
            <div>
              <span className="text-xl xs:text-2xl sm:text-[26px] text-saffron">+91 </span>
              <span className="text-3xl xs:text-4xl sm:text-[42px] font-bold text-text-primary tracking-widest">{formatted}</span>
              {mobile.length === 10 && <span className="block text-lg xs:text-xl sm:text-[24px] text-success mt-2 xs:mt-3 font-bold">✓ नंबर पूरा है</span>}
            </div>
          ) : (
            <span className="text-2xl xs:text-3xl sm:text-[32px] text-surface-dim">_ _ _ _ _ _ _ _ _ _</span>
          )}
        </div>

        {error && <p className="text-error text-lg xs:text-xl sm:text-[24px] mb-3 xs:mb-4 text-center font-bold">{error}</p>}

        {/* Text input for manual - Larger touch target */}
        <input
          ref={inputRef}
          type="tel"
          maxLength={10}
          value={mobile}
          onChange={handleTextInputChange}
          placeholder="या यहाँ टाइप करें"
          className="w-full px-6 xs:px-8 py-4 xs:py-6 min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] border-3 border-border-default rounded-2xl text-center text-2xl xs:text-3xl sm:text-[32px] bg-surface-card focus:border-saffron focus:outline-none text-text-primary mb-3 xs:mb-4 font-bold shadow-input"
        />

        {/* On-screen Keypad - Larger buttons for elderly */}
        <div className="grid grid-cols-3 gap-3 xs:gap-4 w-full mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => {
            if (!key) return <div key={i} />;
            const isDelete = key === '⌫';
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => isDelete ? handleDelete() : handleKeypadInput(key)}
                className={`min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] rounded-2xl text-2xl xs:text-3xl sm:text-[32px] font-bold transition-colors border-3 ${isDelete
                  ? 'bg-surface-dim text-saffron border-surface-dim'
                  : 'bg-surface-card text-text-primary border-border-default active:bg-saffron-lt'
                  }`}
              >
                {key}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer CTA - BUG-005 FIX: Use z-50 to stay above overlays */}
      <footer className="px-4 xs:px-6 pb-8 xs:pb-10 pt-2 xs:pt-3 bg-surface-base/90 backdrop-blur-sm border-t-3 border-border-default shrink-0 relative z-50">
        {/* BUG-003 FIX: Only show confirmation UI for voice input, not keyboard */}
        {confirming && !keyboardEntered ? (
          <div className="space-y-3 xs:space-y-4">
            <p className="text-center text-xl xs:text-2xl sm:text-[26px] text-text-primary font-bold">क्या यह नंबर सही है?</p>
            <div className="flex gap-3 xs:gap-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setConfirming(false);
                  setMobile('');
                  updateMobile('');
                  restartListening();
                }}
                className="flex-1 min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] border-3 border-border-default rounded-2xl text-lg xs:text-xl sm:text-[26px] font-bold text-saffron bg-surface-card hover:bg-saffron-lt"
              >
                ✗ नहीं
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubmit(mobile)}
                className="flex-1 min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-[26px] font-bold shadow-btn-saffron"
              >
                ✓ हाँ →
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={mobile.length !== 10}
            onClick={() => {
              setKeyboardEntered(false);
              handleSubmit(mobile);
            }}
            className={`w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] rounded-2xl flex items-center justify-center text-lg xs:text-xl sm:text-[26px] font-bold transition-all ${mobile.length === 10
              ? 'bg-saffron text-white shadow-btn-saffron'
              : 'bg-surface-dim text-saffron cursor-not-allowed'
              }`}
          >
            {keyboardEntered ? 'आगे बढ़ें →' : 'OTP भेजें →'}
          </motion.button>
        )}
      </footer>
    </main>
  );
}
