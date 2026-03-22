'use client';

import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';
import { TutorialScreenProps } from './types';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_GUARANTEES } from '@/lib/voice-scripts';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';

export default function TutorialGuarantees({
  currentDot,
  onNext,
  onBack,
  onSkip,
  language = 'Hindi',
}: TutorialScreenProps) {
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S11;

  const GUARANTEES = [
    { icon: '🏅', title: t.guarantee1, sub: 'Verified Badge · Zero Bargain' },
    { icon: '🎧', title: t.guarantee2, sub: 'Voice Navigation · Auto Travel' },
    { icon: '🔒', title: t.guarantee3, sub: 'Fixed Income · Instant Payment' },
    { icon: '💰', title: t.guarantee4, sub: '4 Income Streams · Backup Earnings' },
  ];

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: TUTORIAL_GUARANTEES.scripts.main.hindi,
    autoListen: true,
    listenTimeoutMs: 12000,
    repromptScript: 'कृपया आगे बोलें।',
    repromptTimeoutMs: 12000,
    initialDelayMs: 400,
    pauseAfterMs: 1000,
    onIntent: (intent) => {
      if (intent === 'FORWARD' || intent === 'YES') onNext();
      else if (intent === 'BACK') onBack();
      else if (intent === 'SKIP') onSkip();
    },
  });

  return (
    <TutorialShell
      currentDot={currentDot}
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextVariant="primary-dk"
      isListening={isListening}
      showKeyboardToggle
      onKeyboardToggle={() => { }}
      language={language}
    >
      {/* motion replaces CSS animate-fade-up opacity-0 — reliably animates on every re-mount */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-[22px] text-vedic-gold leading-tight">{t.title}</h2>
        <h1 className="text-[36px] font-bold text-vedic-brown leading-tight">{t.heading ?? '4 Guarantees'}</h1>
      </motion.section>

      <section className="space-y-3 mb-6">
        {GUARANTEES.map((guarantee, index) => (
          <motion.div
            key={`${guarantee.title}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.3 }}
            className="bg-white h-[80px] px-4 rounded-r-xl shadow-sm flex items-center gap-4 border-l-[6px] border-primary-dk"
          >
            <div className="w-10 h-10 bg-primary-lt rounded-full flex items-center justify-center text-[20px] shrink-0">
              {guarantee.icon}
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-vedic-brown leading-tight">{guarantee.title}</h3>
              <p className="text-[15px] text-vedic-gold">{guarantee.sub}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-primary-lt/50 border border-primary/20 rounded-full py-3.5 px-5 flex items-center gap-3 justify-center"
      >
        <span className="text-[24px]">🤝</span>
        <p className="text-[18px] font-semibold text-vedic-brown">{t.socialProof}</p>
      </motion.div>
    </TutorialShell>
  );
}
