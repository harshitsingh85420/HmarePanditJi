'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_DAKSHINA } from '@/lib/voice-scripts';
import TutorialShell from './TutorialShell';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';
import type { SupportedLanguage } from '@/lib/onboarding-store';

interface Props {
  currentDot: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  language?: SupportedLanguage;
  onLanguageChange?: () => void;
}

export default function TutorialDakshina({ currentDot, onNext, onBack, onSkip, language = 'Hindi' }: Props) {
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S03;

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: TUTORIAL_DAKSHINA.scripts.main.hindi,
    autoListen: true,
    listenTimeoutMs: 12000,
    repromptScript: 'कृपया आगे बोलें।',
    repromptTimeoutMs: 12000,
    initialDelayMs: 500,
    pauseAfterMs: 1200,
    onIntent: (intent) => {
      const lower = typeof intent === 'string' ? intent.toLowerCase() : '';
      if (
        lower.includes('aage') || lower.includes('haan') ||
        lower.includes('ha') || lower.includes('yes') ||
        lower.includes('agle') || lower.includes('chalein') ||
        lower.includes('next') || lower.includes('agla') ||
        lower.includes('forward')
      ) {
        onNext();
      }
    },
  });

  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip} isListening={isListening} language={language}>
      {/* Headline */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
        <h1 className="text-[34px] font-bold leading-tight text-text-primary">{t.title}</h1>
      </motion.section>

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <span className="text-[40px]">💵🤝</span>
        <span className="text-[36px] font-bold text-error">✕</span>
      </motion.div>

      {/* Contrast Cards */}
      <div className="space-y-2 mb-6">
        {/* BEFORE Card */}
        <motion.article
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-error-lt rounded-2xl p-4 border border-red-200 shadow-sm"
        >
          <header className="flex items-center gap-2 mb-3">
            <span className="font-bold text-red-700">{t.before}</span>
          </header>
          <div className="flex flex-col gap-2 text-left">
            <div className="flex items-start gap-2">
              <span className="text-xl">😒</span>
              <div className="bg-white px-5 py-3.5 rounded-lg rounded-tl-none shadow-sm text-[16px] border border-red-100">
                &quot;1,500 में हो जाएगा?&quot;
              </div>
            </div>
            <div className="flex items-start gap-2 self-end flex-row-reverse">
              <span className="text-xl">😔</span>
              <div className="bg-white/60 px-5 py-3.5 rounded-lg rounded-tr-none shadow-sm text-[16px] italic border border-red-100">
                (चुप रह गए...)
              </div>
            </div>
          </div>
        </motion.article>

        {/* Arrow connector */}
        <div className="text-center text-[20px] text-saffron">↓</div>

        {/* AFTER Card */}
        <motion.article
          initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="bg-success-lt rounded-2xl p-4 border border-green-200 shadow-sm"
        >
          <header className="flex items-center gap-2 mb-3">
            <span className="font-bold text-green-700">{t.after}</span>
          </header>
          <div className="bg-white rounded-xl p-3 text-left border border-green-200 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-text-primary text-[18px]">सत्यनारायण पूजा</span>
            </div>
            <div className="text-success font-bold text-[24px]">आपकी दक्षिणा: ₹2,100</div>
            <div className="text-[16px] text-saffron">(पहले से तय)</div>
          </div>
          <footer className="mt-2 text-[16px] font-medium text-green-800 text-left">
            ग्राहक को Booking से पहले ही पता है।
          </footer>
        </motion.article>
      </div>

      {/* Trust Message */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center">
        <p className="text-saffron leading-relaxed">
          आप दक्षिणा खुद तय करते हैं।<br />
          <span className="font-bold text-text-primary">Platform कभी नहीं बदलेगी।</span>
        </p>
      </motion.section>
    </TutorialShell>
  );
}
