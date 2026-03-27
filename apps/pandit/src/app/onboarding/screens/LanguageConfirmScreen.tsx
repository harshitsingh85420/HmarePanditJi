'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { LANGUAGE_CONFIRM_SCREEN, replaceScriptPlaceholders } from '@/lib/voice-scripts';
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store';

interface LanguageConfirmScreenProps {
  language: SupportedLanguage;
  onLanguageChange?: () => void;
  detectedCity: string;
  onConfirm: () => void;
  onChange: () => void;
  onBack?: () => void;
}

export default function LanguageConfirmScreen({
  language,
  detectedCity,
  onConfirm,
  onChange,
  onLanguageChange,
  onBack,
}: LanguageConfirmScreenProps) {
  const langInfo = LANGUAGE_DISPLAY[language] || LANGUAGE_DISPLAY['Hindi'];
  const city = detectedCity || 'आपके शहर';

  const mainScript = replaceScriptPlaceholders(LANGUAGE_CONFIRM_SCREEN.scripts.main, {
    CITY: city,
    LANGUAGE: langInfo.latinName,
  });

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: mainScript.hindi,
    autoListen: true,
    listenTimeoutMs: 20000,
    repromptScript: LANGUAGE_CONFIRM_SCREEN.scripts.reprompt?.hindi,
    repromptTimeoutMs: 30000,
    initialDelayMs: 800,  // BUG-001 FIX: Increased from 400ms for elderly comprehension
    pauseAfterMs: 1000,  // BUG-001 FIX: Increased from 800ms for TTS completion
    onIntent: (intent) => {
      const lower = typeof intent === 'string' ? intent.toLowerCase() : '';
      if (lower.includes('haan') || lower.includes('ha') || lower.includes('yes') || lower.includes('sahi') || lower.includes('theek') || lower.includes('bilkul')) {
        onConfirm();
      } else if (lower.includes('nahi') || lower.includes('naa') || lower.includes('no') || lower.includes('badlo') || lower.includes('badle') || lower.includes('change') || lower.includes('alag')) {
        onChange();
      }
    },
  });

  return (
    <main className="w-full min-h-dvh bg-surface-base shadow-2xl relative flex flex-col overflow-hidden items-center text-text-primary font-hind">
      {/* Top Bar */}
      <header className="flex items-center p-3 xs:p-4 w-full justify-between">
        <button onClick={onBack ?? onChange} aria-label="Go back" className="min-h-[52px] xs:min-h-[56px] min-w-[52px] xs:min-w-[56px] p-2 hover:bg-black/5 rounded-full transition-colors active:scale-95">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
        <button onClick={onLanguageChange} className="min-h-[52px] xs:min-h-[56px] min-w-[52px] xs:min-w-[56px] text-2xl xs:text-3xl active:opacity-50">🌐</button>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center px-4 xs:px-6 pt-4 w-full max-w-[390px] xs:max-w-[430px]">

        {/* Detected City Chip */}
        {detectedCity && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-saffron-lt border-2 border-saffron rounded-full px-4 xs:px-6 py-2 xs:py-3 mb-4 xs:mb-6 flex items-center gap-2 xs:gap-3">
            <span className="text-xl xs:text-2xl">📍</span>
            <span className="text-base xs:text-lg sm:text-xl font-semibold text-text-primary">{city}</span>
          </motion.div>
        )}

        {/* Language Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white border-3 border-saffron rounded-2xl p-6 xs:p-8 flex flex-col items-center gap-4 xs:gap-6 shadow-card w-full">
          <div className="text-6xl xs:text-7xl sm:text-8xl">{langInfo.scriptChar}</div>
          <div className="text-center">
            <p className="text-3xl xs:text-4xl sm:text-5xl font-bold text-saffron">{langInfo.nativeName}</p>
            <p className="text-xl xs:text-2xl sm:text-3xl text-text-secondary mt-2">{langInfo.latinName}</p>
          </div>
        </motion.div>

        {/* Voice Prompt */}
        <div className="mt-6 xs:mt-8 text-center px-4">
          <p className="text-lg xs:text-xl sm:text-2xl font-bold text-text-primary">क्या यह सही है?</p>
          <p className="text-base xs:text-lg sm:text-xl text-saffron mt-2">
            {isListening ? '🎤 सुन रहा हूँ...' : "'हाँ' या 'बदलें' बोलें"}
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <footer className="w-full px-4 xs:px-6 pb-6 xs:pb-8 pt-4 xs:pt-6 bg-surface-base/90 backdrop-blur-sm border-t border-border-default">
        <div className="grid grid-cols-2 gap-3 xs:gap-4">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onChange} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] border-3 border-border-default rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold text-saffron bg-surface-card active:bg-saffron-light">
            ✗ बदलें
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold shadow-btn-saffron">
            ✓ हाँ
          </motion.button>
        </div>
      </footer>
    </main>
  );
}
