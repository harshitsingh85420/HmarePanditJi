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

  const toggleMic = () => setIsMicOff(prev => !prev); // BUG-003 FIX: Toggle mic state

  const { isSpeaking, restartListening, stopFlow } = useSarvamVoiceFlow({ // BUG-003 FIX: Added stopFlow
    language,
    script: MIC_CLOSE_SCRIPT,
    repromptScript: REPROMPT,
    initialDelayMs: 600,
    pauseAfterMs: 500,
    disabled: isKeyboardMode || isMicOff, // BUG-003 FIX: Disable voice when keyboard mode or mic off
    onIntent: (intentOrRaw) => {
      // BUG-003 FIX: Skip voice confirmation if keyboard mode is active
      if (isKeyboardMode || isMicOff) return;

      if (intentOrRaw.startsWith('RAW:')) {
        const raw = intentOrRaw.slice(4);
        setTranscript(raw); // BUG-003 FIX: Store transcript
        const digits = normalizeMobile(raw);
        if (digits.length === 10) {
          setMobile(digits);
          setConfirming(true);
          void speakWithSarvam({
            text: `${digits.split('').join('... ')} — क्या यह नंबर सही है? 'हाँ' बोलें या 'नहीं' बोलें।`,
            languageCode: 'hi-IN',
          });
        } else if (digits.length > 0) {
          setError(`${digits.length} अंक मिले — 10 चाहिए। फिर से बोलें।`);
          void speakWithSarvam({
            text: CONFIRM_WRONG,
            languageCode: 'hi-IN',
            onEnd: () => restartListening(),
          });
        }
      } else if (confirming) {
        if (intentOrRaw === 'YES' || intentOrRaw === 'FORWARD') {
          handleSubmit(mobile);
        } else if (intentOrRaw === 'NO' || intentOrRaw === 'BACK') {
          setConfirming(false);
          setMobile('');
          void speakWithSarvam({
            text: REPROMPT,
            languageCode: 'hi-IN',
            onEnd: () => restartListening(),
          });
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
    <main className="min-h-dvh max-w-[390px] mx-auto bg-vedic-cream font-hind text-vedic-brown flex flex-col shadow-2xl relative">
      {/* Header - shrink-0 to prevent compression */}
      <header className="pt-8 px-6 pb-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-10 h-10 -ml-2 flex items-center justify-center text-vedic-gold hover:bg-black/5 rounded-full" aria-label="Go back">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[20px] font-bold text-vedic-brown">Registration — Step 1/4</h1>
      </header>

      {/* Progress - shrink-0 to prevent compression */}
      <div className="px-6 pb-4 shrink-0">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i === 1 ? 'bg-primary' : 'bg-vedic-border'}`} />
          ))}
        </div>
        <p className="text-xs text-vedic-gold mt-1">Mobile Number</p>
      </div>

      {/* Content - flex-grow with overflow-y-auto for scroll on small screens */}
      <div className="flex-grow flex flex-col items-center px-6 pt-2 overflow-y-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 w-full">
          <h2 className="text-[26px] font-bold text-vedic-brown leading-tight">
            📱 आपका मोबाइल नंबर?
          </h2>
          <p className="text-[16px] text-vedic-gold mt-2">
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
              className="w-full mb-4 flex items-center justify-between gap-3 px-4 py-2 bg-primary-lt rounded-xl border border-primary/20"
            >
              {isMicOff ? (
                <div className="flex items-center gap-2 text-red-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[14px] font-medium">Mic Off</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex items-end gap-1 h-5 shrink-0">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="w-1.5 bg-primary rounded-full animate-voice-bar" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span className="text-[14px] text-vedic-brown truncate">
                    {isSpeaking ? 'बोल रहा हूँ...' : (transcript || 'नंबर बोलें...')}
                  </span>
                </div>
              )}

              <button
                onClick={toggleMic}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors shrink-0 ${isMicOff
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-vedic-brown border-vedic-border'
                  }`}
              >
                {isMicOff ? 'Mic On' : 'Mic Off'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BUG-003 FIX: Keyboard toggle - shown when keyboard mode is active */}
        {isKeyboardMode && (
          <div className="w-full mb-4 flex items-center justify-between gap-3 px-4 py-2 bg-surface-muted rounded-xl border border-vedic-border">
            <div className="flex items-center gap-2 text-text-primary">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
              </svg>
              <span className="text-[14px] font-medium">Keyboard Mode</span>
            </div>
            <button
              onClick={handleKeyboardToggle}
              className="px-3 py-1 rounded-full text-sm font-medium border border-vedic-border bg-white text-vedic-brown hover:bg-primary-lt transition-colors"
            >
              Voice वापस लाएं
            </button>
          </div>
        )}

        {/* Number Display */}
        <div className={`w-full text-center py-5 rounded-2xl border-2 mb-4 transition-colors ${mobile.length === 10 ? 'border-success bg-success-lt' : 'border-primary/30 bg-white'
          }`}>
          {mobile.length > 0 ? (
            <div>
              <span className="text-[14px] text-vedic-gold">+91 </span>
              <span className="text-[32px] font-bold text-vedic-brown tracking-widest">{formatted}</span>
              {mobile.length === 10 && <span className="block text-[14px] text-success mt-1">✓ नंबर पूरा है</span>}
            </div>
          ) : (
            <span className="text-[22px] text-vedic-border">_ _ _ _ _ _ _ _ _ _</span>
          )}
        </div>

        {error && <p className="text-error text-[14px] mb-3 text-center">{error}</p>}

        {/* Text input for manual */}
        <input
          ref={inputRef}
          type="tel"
          maxLength={10}
          value={mobile}
          onChange={handleTextInputChange}
          placeholder="या यहाँ टाइप करें"
          className="w-full px-4 py-3 border-2 border-vedic-border rounded-xl text-center text-[18px] bg-white focus:border-primary focus:outline-none mb-4 text-vedic-brown"
        />

        {/* On-screen Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => {
            if (!key) return <div key={i} />;
            const isDelete = key === '⌫';
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.93 }}
                onClick={() => isDelete ? handleDelete() : handleKeypadInput(key)}
                className={`h-14 rounded-xl text-[22px] font-bold transition-colors ${isDelete
                  ? 'bg-vedic-border/40 text-vedic-gold'
                  : 'bg-white border border-vedic-border text-vedic-brown active:bg-primary-lt'
                  }`}
              >
                {key}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer CTA - BUG-005 FIX: Use z-50 to stay above overlays */}
      <footer className="px-6 pb-10 pt-3 bg-vedic-cream/90 backdrop-blur-sm border-t border-vedic-border shrink-0 relative z-50">
        {/* BUG-003 FIX: Only show confirmation UI for voice input, not keyboard */}
        {confirming && !keyboardEntered ? (
          <div className="space-y-3">
            <p className="text-center text-[16px] text-vedic-brown font-medium">क्या यह नंबर सही है?</p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setConfirming(false);
                  setMobile('');
                  updateMobile(''); // BUG-001 FIX: Clear store as well
                  restartListening();
                }}
                className="flex-1 h-14 border-2 border-vedic-border rounded-2xl text-[18px] font-bold text-vedic-gold"
              >
                ✗ नहीं
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubmit(mobile)}
                className="flex-1 h-14 bg-primary-dk text-white rounded-2xl text-[18px] font-bold shadow-cta-dk"
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
            className={`w-full h-16 rounded-2xl flex items-center justify-center text-[20px] font-bold transition-all ${mobile.length === 10
              ? 'bg-primary text-white shadow-cta'
              : 'bg-vedic-border/30 text-vedic-gold cursor-not-allowed'
              }`}
          >
            {keyboardEntered ? 'आगे बढ़ें →' : 'OTP भेजें →'}
          </motion.button>
        )}
      </footer>
    </main>
  );
}
