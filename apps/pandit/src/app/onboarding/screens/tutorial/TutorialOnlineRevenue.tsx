'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_ONLINE_REVENUE } from '@/lib/voice-scripts';
import TutorialShell from './TutorialShell';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';
import type { SupportedLanguage } from '@/lib/onboarding-store';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: SupportedLanguage; onLanguageChange?: () => void; }

export default function TutorialOnlineRevenue({ currentDot, onNext, onBack, onSkip, language = 'Hindi' }: Props) {
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S04;

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: TUTORIAL_ONLINE_REVENUE.scripts.main.hindi,
    autoListen: true,
    listenTimeoutMs: 12000,
    repromptScript: 'कृपया आगे बोलें।',
    repromptTimeoutMs: 12000,
    initialDelayMs: 400,
    pauseAfterMs: 1000,
    onIntent: (intent) => {
      const lower = typeof intent === 'string' ? intent.toLowerCase() : '';
      if (lower.includes('aage') || lower.includes('haan') || lower.includes('forward')) {
        onNext();
      }
    },
  });

  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip} isListening={isListening}>
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-[30px] font-bold text-text-primary leading-tight">{t.title}</h1>
        <p className="text-[18px] italic text-saffron mt-1">{t.subtitle}</p>
      </div>

      {/* Feature Cards */}
      <div className="space-y-5">
        {/* Card 1: Ghar Baithe Pooja */}
        <motion.div
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-primary-lt border-2 border-primary rounded-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-[64px] h-[64px] bg-white rounded-2xl flex items-center justify-center shadow-sm animate-gentle-float shrink-0">
              <span className="text-[28px]">📹</span>
            </div>
            <h3 className="font-bold text-text-primary text-[22px]">घर बैठे पूजा</h3>
          </div>
          <p className="text-[17px] text-text-primary-2 mb-4 leading-snug">
            Video call से पूजा कराएं। दुनिया भर के ग्राहक मिलेंगे — NRI भी।
          </p>
          <div className="inline-flex items-center px-5 py-3 bg-white border border-success rounded-full">
            <span className="text-success font-bold text-[18px]">₹2,000 – ₹5,000 <span className="text-[16px] font-normal text-saffron">प्रति पूजा</span></span>
          </div>
        </motion.div>

        {/* Card 2: Pandit Se Baat */}
        <motion.div
          initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="bg-white border border-border-default rounded-card p-6 shadow-card"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-[64px] h-[64px] bg-primary-lt rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <span className="text-[28px]">🎓</span>
            </div>
            <h3 className="font-bold text-text-primary text-[22px]">पंडित से बात</h3>
          </div>
          <p className="text-[17px] text-text-primary-2 mb-4 leading-snug">
            Phone / Video / Chat पर सलाह दें। आपका ज्ञान अब बिकेगा।
          </p>
          <div className="inline-flex items-center px-5 py-3 bg-success-lt border border-success/30 rounded-full mb-4">
            <span className="text-success font-medium text-[16px]">₹20 – ₹50 प्रति मिनट</span>
          </div>
          {/* Worked example — key line */}
          <div className="bg-primary-lt rounded-xl px-5 py-3 border border-primary/20">
            <p className="text-[18px] font-bold text-primary">उदाहरण: 20 मिनट = ₹800 आपको</p>
          </div>
        </motion.div>

        {/* Summary Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="bg-primary/10 border border-primary border-dashed px-6 py-4 rounded-xl w-full text-center">
            <p className="text-text-primary font-semibold text-[18px]">
              दोनों मिलाकर <span className="text-primary text-[24px] font-bold">₹40,000+</span> अलग से हर महीने
            </p>
          </div>
        </motion.div>
      </div>
    </TutorialShell>
  );
}
