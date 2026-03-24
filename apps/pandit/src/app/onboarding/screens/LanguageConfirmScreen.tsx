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

  // Build dynamic script with city and language placeholders
  const mainScript = replaceScriptPlaceholders(LANGUAGE_CONFIRM_SCREEN.scripts.main, {
    CITY: city,
    LANGUAGE: langInfo.latinName,
  });

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: mainScript.hindi,
    autoListen: true,
    // BUG-004 FIX: Increased timeout from 12s to 20s for elderly users to have enough time to read, understand, and respond
    listenTimeoutMs: 20000,
    repromptScript: LANGUAGE_CONFIRM_SCREEN.scripts.reprompt?.hindi,
    repromptTimeoutMs: 30000,
    initialDelayMs: 400,
    pauseAfterMs: 800,
    onIntent: (intent) => {
      const lower = typeof intent === 'string' ? intent.toLowerCase() : '';
      if (
        lower.includes('haan') || lower.includes('ha') ||
        lower.includes('yes') || lower.includes('sahi') ||
        lower.includes('theek') || lower.includes('bilkul')
      ) {
        onConfirm();
      } else if (
        lower.includes('nahi') || lower.includes('naa') ||
        lower.includes('no') || lower.includes('badlo') ||
        lower.includes('badle') || lower.includes('change') ||
        lower.includes('alag')
      ) {
        onChange();
      }
    },
  });

  return (
    <main className="w-full min-h-dvh bg-surface-base shadow-2xl relative flex flex-col overflow-hidden items-center text-text-baserimary font-hind">
      {/* Top Bar */}
      <header className="flex items-center p-4 w-full justify-between">
        <button onClick={onBack ?? onChange} aria-label="Go back" className="min-h-[52px] min-w-[52px] p-2 hover:bg-black/5 rounded-full transition-colors active:scale-95">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
        <button onClick={onLanguageChange} className="min-h-[52px] min-w-[52px] text-[24px] active:opacity-50">🌐</button>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4 w-full max-w-[390px]">

        {/* Detected City Chip */}
        {detectedCity && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-3 rounded-full bg-saffron-lt border border-saffron text-saffron text-lg font-medium mb-10"
          >
            <span className="mr-1">📍</span>
            <span>{detectedCity}</span>
          </motion.div>
        )}

        {/* Main Language Card */}
        <motion.section
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, damping: 20, stiffness: 200 }}
          className="w-full bg-white rounded-[20px] py-12 px-8 flex flex-col items-center shadow-card-hover animate-gentle-float"
        >
          <div className="text-[64px] font-bold mb-2 text-saffron animate-glow-pulse">
            {langInfo.scriptChar}
          </div>
          <h1 className="text-[48px] font-bold leading-tight mb-4 text-text-baserimary">
            {langInfo.nativeName}
          </h1>
          <p className="text-[22px] text-saffron text-center leading-snug">
            क्या इस भाषा में बात करना चाहेंगे?
          </p>
        </motion.section>

        {/* Voice Status */}
        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-end gap-1.5 h-6 mb-3">
            <div className="w-1.5 bg-saffron rounded-full animate-voice-bar" />
            <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-2 h-full" />
            <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-3" />
          </div>
          <p className="text-saffron font-medium text-lg mb-1">सुन रहा हूँ...</p>
          <p className="text-saffron text-lg italic">&quot;हाँ&quot; या &quot;बदलें&quot; बोलें</p>
        </div>
      </div>

      {/* Action Buttons */}
      <footer className="p-6 space-y-4 mb-8 w-full max-w-[390px]">
        <motion.button
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          onClick={onConfirm}
          className="w-full py-4 bg-saffron text-white font-bold text-lg rounded-btn shadow-cta transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">check_circle</span>
          <span>हाँ, यही भाषा सही है</span>
        </motion.button>

        <motion.button
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          onClick={onChange}
          className="w-full py-4 bg-white border-2 border-saffron text-saffron font-bold text-lg rounded-btn transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">language</span>
          <span>दूसरी भाषा चुनें</span>
        </motion.button>

        {/* Timeout hint - BUG-004 FIX: Updated to 20s, ACC-012 FIX: Show only in selected language */}
        <p className="text-center text-lgs text-saffron mt-4">
          20 सेकंड में ऑटो-कन्फर्म होगा
        </p>
      </footer>
    </main>
  );
}
