'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_CTA } from '@/lib/voice-scripts';
import { TutorialScreenProps } from './types';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';
import type { SupportedLanguage } from '@/lib/onboarding-store';

interface TutorialCTAProps extends TutorialScreenProps {
  onRegisterNow: () => void;
  onLater: () => void;
}

export default function TutorialCTA({
  language = 'Hindi',
  onRegisterNow,
  onLater,
}: TutorialCTAProps) {
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S12;

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: TUTORIAL_CTA.scripts.main.hindi,
    repromptScript: TUTORIAL_CTA.scripts.onTimeout?.hindi,
    initialDelayMs: 300,
    pauseAfterMs: 800,
    onIntent: (intent) => {
      if (intent === 'YES' || intent === 'FORWARD') onRegisterNow();
      else if (intent === 'SKIP' || intent === 'NO') onLater();
    },
  });

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-hind text-text-primary flex flex-col shadow-2xl relative overflow-hidden">
      {/* Progress Dots + Completion Badge */}
      <header className="pt-10 px-6 flex flex-col items-center gap-3">
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="w-3 h-3 rounded-full bg-saffron" />
          ))}
        </div>
        <p className="text-[20px] font-bold text-trust-green">{t.progressBadge || '✓ Tutorial पूरा हुआ'}</p>
      </header>

      {/* Main Content */}
      <section className="flex-1 flex flex-col items-center px-8 pt-8 text-center">
        {/* Hero Illustration */}
        <div className="relative w-[220px] h-[220px] flex items-center justify-center mb-10">
          <div className="absolute inset-0 bg-saffron-light/30 rounded-full" />
          <div className="absolute inset-0 bg-saffron/12 rounded-full blur-xl" />
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 text-[110px] leading-none"
          >
            🧘
          </motion.span>
        </div>

        {/* Headlines */}
        <div className="space-y-5">
          <h1 className="text-[36px] font-bold leading-tight text-text-primary">
            {t.title}
          </h1>
          <div className="space-y-2">
            <p className="text-[26px] font-bold text-trust-green">{t.subtitle.split('।')[0]}।</p>
            <p className="text-[24px] font-normal text-text-gold">{t.subtitle.split('। ')[1] ?? ''}</p>
          </div>
        </div>

        {/* Voice listening indicator */}
        {isListening && (
          <div className="mt-8 flex items-center gap-3 px-6 py-4 bg-saffron-light rounded-full">
            <span className="w-4 h-4 rounded-full bg-saffron animate-pulse" />
            <span className="text-[20px] font-bold text-text-primary">{t.voicePrompt || "'हाँ' बोलें या बटन दबाएं"}</span>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-border-default/40 my-10" />

        {/* Action Buttons */}
        <div className="w-full space-y-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRegisterNow}
            className="w-full min-h-[80px] bg-saffron-dark text-white rounded-2xl flex items-center justify-center gap-3 text-[26px] font-bold shadow-cta-dk outline outline-2 outline-offset-2 outline-saffron/30 active:scale-95 transition-transform hover:bg-saffron"
          >
            {t.cta}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onLater}
            className="w-full min-h-[72px] bg-surface-card text-saffron border-3 border-border-default rounded-2xl text-[22px] font-bold active:scale-95 transition-transform hover:bg-saffron-lt"
          >
            {t.later}
          </motion.button>
        </div>
      </section>

      {/* Footer — Helpline */}
      <footer className="pb-10 px-8 text-center space-y-3 mt-8">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-[24px]">📞</span>
          <span className="text-[20px] font-bold text-text-gold">{t.helpQuestion || 'कोई सवाल?'}</span>
          <a className="text-[24px] font-bold text-saffron-dark tracking-wide" href="tel:1800435000">
            1800-HPJ-HELP
          </a>
          <span className="text-[18px] text-text-gold">(Toll Free)</span>
        </div>
        <p className="text-[18px] text-text-gold">{t.helpHours || 'सुबह 8 बजे – रात 10 बजे'}</p>
      </footer>
    </main>
  );
}
