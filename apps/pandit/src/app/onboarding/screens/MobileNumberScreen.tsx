'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { useRegistrationStore } from '@/stores/registrationStore';
import type { SupportedLanguage } from '@/lib/onboarding-store';

// ─── Number word mappings (Hindi spoken numbers) ──────────────────────────────
const NUMBER_WORDS: Record<string, string> = {
  'ek': '1', 'aik': '1', 'एक': '1',
  'do': '2', 'दो': '2',
  'teen': '3', 'तीन': '3',
  'char': '4', 'chaar': '4', 'चार': '4',
  'paanch': '5', 'पांच': '5',
  'chhah': '6', 'chhe': '6', 'छह': '6',
  'saat': '7', 'सात': '7',
  'aath': '8', 'आठ': '8',
  'nau': '9', 'नौ': '9',
  'shoonya': '0', 'zero': '0', 'sifar': '0', 'शून्य': '0',
};

const PREAMBLE = ['mera', 'hamara', 'number', 'ye', 'is', 'meri', 'apna', 'mobile'];

function normalizeMobile(transcript: string): string {
  let text = transcript.toLowerCase().trim();
  for (const p of PREAMBLE) {
    text = text.replace(new RegExp(`^${p}\\s+`, 'i'), '');
  }
  text = text.replace(/^(\+91|91|plus\s*91)\s*/, '');
  const digits = text.split(/\s+/).map(w => NUMBER_WORDS[w] ?? w).join('');
  return digits.replace(/\D/g, '');
}

interface Props {
  language: SupportedLanguage;
  onComplete: (mobile: string) => void;
  onBack: () => void;
}

// S-R.01 voice script
const MIC_CLOSE_SCRIPT = 'बहुत अच्छा। अब मुझे आपका मोबाइल नंबर चाहिए — ताकि हम आपका खाता बना सकें। अपना 10 अंकों का नंबर बोलें — या नीचे टाइप करें।';
const REPROMPT = '10 अंकों का नंबर बोलें, या नीचे टाइप करें।';
const CONFIRM_WRONG = 'कोई बात नहीं। दोबारा बोलें।';

export default function MobileNumberScreen({ language, onComplete, onBack }: Props) {
  // BUG-001 FIX: Use Zustand store for mobile persistence across navigation
  const storedMobile = useRegistrationStore(state => state.data.mobile);
  const updateMobile = useRegistrationStore(state => state.setMobile);

  const [mobile, setMobile] = useState(storedMobile || '');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [isKeyboardMode, setIsKeyboardMode] = useState(false); // BUG-003 FIX: Track keyboard mode
  const [keyboardEntered, setKeyboardEntered] = useState(false); // BUG-003 FIX: Track if user typed input
  const [transcript, setTranscript] = useState(''); // BUG-003 FIX: Local transcript state
  const [isMicOff, setIsMicOff] = useState(false); // BUG-003 FIX: Local mic state
  const inputRef = useRef<HTMLInputElement>(null);

  // BUG-001 FIX: Sync storedMobile to local state when navigating back
  React.useEffect(() => {
    if (storedMobile && storedMobile !== mobile) {
      setMobile(storedMobile);
    }
  }, [storedMobile]);

  const toggleMic = () => setIsMicOff(prev => !prev); // BUG-003 FIX: Toggle mic state

  const { isSpeaking, restartListening, stopFlow } = useSarvamVoiceFlow({ // BUG-003 FIX: Added stopFlow
    language,
    script: MIC_CLOSE_SCRIPT,
    repromptScript: REPROMPT,
    initialDelayMs: 600,
    pauseAfterMs: 500,
    disabled: isKeyboardMode || isMicOff, // BUG-003 FIX: Disable voice when keyboard mode or mic off
    onIntent: (intentOrRaw) => {
      // BUG-010 FIX: Always process intent, even if mic off - only skip voice reprompt
      // Don't return early - allow keyboard/voice hybrid interaction

      if (intentOrRaw.startsWith('RAW:')) {
        const raw = intentOrRaw.slice(4);
        setTranscript(raw); // BUG-003 FIX: Store transcript
        const digits = normalizeMobile(raw);
        if (digits.length === 10) {
          setMobile(digits);
          setConfirming(true);
          // BUG-010 FIX: Only speak confirmation if mic is on
          if (!isMicOff && !isKeyboardMode) {
            void speakWithSarvam({
              text: `${digits.split('').join('... ')} — क्या यह नंबर सही है? 'हाँ' बोलें या 'नहीं' बोलें।`,
              languageCode: 'hi-IN',
            });
          }
        } else if (digits.length > 0) {
          setError(`${digits.length} अंक मिले — 10 चाहिए। फिर से बोलें।`);
          // BUG-010 FIX: Only speak error if mic is on
          if (!isMicOff && !isKeyboardMode) {
            void speakWithSarvam({
              text: CONFIRM_WRONG,
              languageCode: 'hi-IN',
              onEnd: () => restartListening(),
            });
          }
        }
      } else if (confirming) {
        if (intentOrRaw === 'YES' || intentOrRaw === 'FORWARD') {
          handleSubmit(mobile);
        } else if (intentOrRaw === 'NO' || intentOrRaw === 'BACK') {
          setConfirming(false);
          setMobile('');
          // BUG-010 FIX: Only speak reprompt if mic is on
          if (!isMicOff && !isKeyboardMode) {
            void speakWithSarvam({
              text: REPROMPT,
              languageCode: 'hi-IN',
              onEnd: () => restartListening(),
            });
          }
        }
      }
    },
  });

  const handleSubmit = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('10 अंकों का नंबर चाहिए');
      return;
    }
    // BUG-001 FIX: Persist mobile to Zustand store before navigation
    updateMobile(clean);

    stopCurrentSpeech();
    // BUG-004 FIX: Add error handling to TTS calls
    speakWithSarvam({
      text: 'धन्यवाद। अब OTP भेज रहे हैं।',
      languageCode: 'hi-IN',
      onEnd: () => onComplete(clean),
    }).catch((err) => {
      console.error('TTS failed:', err);
      // Still navigate even if TTS fails
      onComplete(clean);
    });
  };

  const handleKeypadInput = (val: string) => {
    if (mobile.length >= 10) return;
    const newMobile = mobile + val;
    setMobile(newMobile);
    // BUG-001 FIX: Also persist to store on keypad input
    updateMobile(newMobile);
    // BUG-003 FIX: Mark as keyboard entered - skip voice confirmation
    setKeyboardEntered(true);
    setError('');
  };

  const handleDelete = () => {
    const newMobile = mobile.slice(0, -1);
    setMobile(newMobile);
    updateMobile(newMobile);
    // BUG-003 FIX: If user deletes, they're using keyboard
    if (newMobile.length > 0) setKeyboardEntered(true);
  };

  // BUG-003 FIX: Handle text input change
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
    updateMobile(val);
    // BUG-003 FIX: Mark as keyboard entered - skip voice confirmation
    setKeyboardEntered(val.length > 0);
    setError('');
  };

  // BUG-003 FIX: Keyboard toggle handler
  const handleKeyboardToggle = () => {
    const newMode = !isKeyboardMode;
    setIsKeyboardMode(newMode);
    if (newMode) {
      stopFlow(); // Stop voice when switching to keyboard
    } else {
      restartListening(); // Resume voice when switching back
    }
  };

  const formatted = mobile
    ? `${mobile.slice(0, 5)} ${mobile.slice(5)}`.trim()
    : '';

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-body text-text-primary flex flex-col shadow-2xl relative">
      {/* Header - shrink-0 to prevent compression */}
      <header className="pt-8 px-6 pb-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-[72px] h-[72px] -ml-2 flex items-center justify-center text-saffron hover:bg-saffron-light rounded-full min-h-[72px] min-w-[72px] focus:ring-4 focus:ring-saffron focus:outline-none" aria-label="पीछे जाएं">
          <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-[36px] font-bold text-text-primary">पंजीकरण</h1>
          <p className="text-[32px] font-bold text-saffron">कदम 1 / 4</p>
        </div>
      </header>

      {/* Progress - shrink-0 to prevent compression - Bold and Clear for Elderly */}
      <div className="px-6 pb-4 shrink-0">
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-16 rounded-full transition-colors ${i === 1 ? 'bg-saffron' : 'bg-surface-dim'}`} />
          ))}
        </div>
      </div>

      {/* Content - flex-grow with overflow-y-auto for scroll on small screens */}
      <div className="flex-grow flex flex-col items-center px-6 pt-2 overflow-y-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 w-full">
          <h2 className="text-[40px] font-bold text-text-primary leading-tight">
            📱 आपका मोबाइल नंबर?
          </h2>
          <p className="text-[24px] text-saffron mt-3 font-medium">
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
              className="w-full mb-4 flex items-center justify-between gap-3 px-5 py-5 bg-saffron-lt rounded-2xl border-3 border-saffron/40 min-h-[88px] shadow-card"
            >
              {isMicOff ? (
                <div className="flex items-center gap-3 text-red-600">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[26px] font-medium">Mic Off</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex items-end gap-2 h-14 shrink-0">
                    <div className="w-3 bg-saffron rounded-full animate-voice-bar" />
                    <div className="w-3 bg-saffron rounded-full animate-voice-bar-2" />
                    <div className="w-3 bg-saffron rounded-full animate-voice-bar-3" />
                  </div>
                  <span className="text-[28px] text-text-primary truncate font-medium">
                    {isSpeaking ? 'बोल रहा हूँ...' : (transcript || 'नंबर बोलें...')}
                  </span>
                </div>
              )}

              <button
                onClick={toggleMic}
                className={`px-8 py-5 min-h-[80px] rounded-2xl text-[22px] font-bold border-3 transition-colors shrink-0 focus:ring-4 focus:ring-saffron focus:outline-none ${isMicOff
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
          <div className="w-full mb-4 flex items-center justify-between gap-3 px-5 py-5 bg-surface-muted rounded-2xl border-3 border-border-default min-h-[88px] shadow-card">
            <div className="flex items-center gap-3 text-text-primary">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
              </svg>
              <span className="text-[26px] font-medium">Keyboard Mode</span>
            </div>
            <button
              onClick={handleKeyboardToggle}
              className="px-8 py-5 min-h-[80px] rounded-2xl text-[22px] font-bold border-3 border-border-default bg-white text-text-primary hover:bg-saffron-lt transition-colors focus:ring-4 focus:ring-saffron focus:outline-none"
            >
              Voice वापस लाएं
            </button>
          </div>
        )}

        {/* Number Display */}
        <div className={`w-full text-center py-8 rounded-2xl border-3 mb-4 transition-colors ${mobile.length === 10 ? 'border-success bg-success-lt' : 'border-saffron/30 bg-surface-card'
          }`}>
          {mobile.length > 0 ? (
            <div>
              <span className="text-[26px] text-saffron">+91 </span>
              <span className="text-[42px] font-bold text-text-primary tracking-widest">{formatted}</span>
              {mobile.length === 10 && <span className="block text-[24px] text-success mt-3 font-bold">✓ नंबर पूरा है</span>}
            </div>
          ) : (
            <span className="text-[32px] text-surface-dim">_ _ _ _ _ _ _ _ _ _</span>
          )}
        </div>

        {error && <p className="text-error text-[24px] mb-4 text-center font-bold">{error}</p>}

        {/* Text input for manual - Larger touch target */}
        <input
          ref={inputRef}
          type="tel"
          maxLength={10}
          value={mobile}
          onChange={handleTextInputChange}
          placeholder="या यहाँ टाइप करें"
          className="w-full px-8 py-6 min-h-[88px] border-3 border-border-default rounded-2xl text-center text-[32px] bg-surface-card focus:border-saffron focus:outline-none text-text-primary mb-4 font-bold shadow-input"
        />

        {/* On-screen Keypad - Larger buttons for elderly */}
        <div className="grid grid-cols-3 gap-4 w-full mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => {
            if (!key) return <div key={i} />;
            const isDelete = key === '⌫';
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => isDelete ? handleDelete() : handleKeypadInput(key)}
                className={`min-h-[88px] rounded-2xl text-[32px] font-bold transition-colors border-3 ${isDelete
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
      <footer className="px-6 pb-10 pt-3 bg-surface-base/90 backdrop-blur-sm border-t-3 border-border-default shrink-0 relative z-50">
        {/* BUG-003 FIX: Only show confirmation UI for voice input, not keyboard */}
        {confirming && !keyboardEntered ? (
          <div className="space-y-4">
            <p className="text-center text-[26px] text-text-primary font-bold">क्या यह नंबर सही है?</p>
            <div className="flex gap-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setConfirming(false);
                  setMobile('');
                  updateMobile(''); // BUG-001 FIX: Clear store as well
                  restartListening();
                }}
                className="flex-1 min-h-[88px] border-3 border-border-default rounded-2xl text-[26px] font-bold text-saffron bg-surface-card hover:bg-saffron-lt"
              >
                ✗ नहीं
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubmit(mobile)}
                className="flex-1 min-h-[88px] bg-saffron text-white rounded-2xl text-[26px] font-bold shadow-btn-saffron"
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
              // BUG-003 FIX: Reset keyboardEntered on submit
              setKeyboardEntered(false);
              handleSubmit(mobile);
            }}
            className={`w-full min-h-[88px] rounded-2xl flex items-center justify-center text-[26px] font-bold transition-all ${mobile.length === 10
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
