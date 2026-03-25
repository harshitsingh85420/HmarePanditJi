'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_PAYMENT } from '@/lib/voice-scripts';
import TutorialShell from './TutorialShell';
import { TutorialScreenProps } from './types';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';
import type { SupportedLanguage } from '@/lib/onboarding-store';

export default function TutorialPayment({
  currentDot,
  onNext,
  onBack,
  onSkip,
  language = 'Hindi',
}: TutorialScreenProps) {
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S06;

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: TUTORIAL_PAYMENT.scripts.main.hindi,
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
      isListening={isListening}
      showKeyboardToggle
      onKeyboardToggle={() => { }}
    >
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pb-6 text-center">
        <h1 className="text-[32px] font-bold leading-tight text-text-primary">{t.title}</h1>
        <h1 className="text-[32px] font-bold leading-tight text-primary">{t.subtitle}</h1>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-card p-5 border border-border-default/50 shadow-card mb-5"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <p className="text-[16px] text-saffron w-16 shrink-0 font-medium">3:30 PM</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-success mt-0.5 shrink-0" />
              <div className="w-0.5 h-6 border-l-2 border-dashed border-border-default mt-1" />
            </div>
            <p className="text-[18px] text-text-primary">पूजा समाप्त हुई</p>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <p className="text-[16px] text-saffron w-16 shrink-0 font-medium">3:31 PM</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute w-4 h-4 rounded-full bg-primary"
                />
                <div className="w-3 h-3 rounded-full bg-primary relative z-10" />
              </div>
              <div className="w-0.5 h-6 border-l-2 border-dashed border-border-default mt-1" />
            </div>
            <p className="text-[18px] text-text-primary">Payment शुरू हुआ</p>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <p className="text-[16px] text-saffron w-16 shrink-0 font-medium">3:32 PM</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-success mt-0.5 shrink-0" />
            </div>
            <p className="text-[26px] font-bold text-success">✅ ₹2,325 आपके Bank में</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-success-lt border-l-4 border-success rounded-xl px-6 py-5"
      >
        <p className="text-[16px] text-saffron italic mb-3">एक असली उदाहरण:</p>
        <div className="h-px bg-success/20 mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[18px] text-text-primary">आपकी दक्षिणा:</span>
            <span className="text-[18px] text-text-primary font-medium">₹2,500</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[17px] text-saffron">Platform (15%):</span>
            <span className="text-[18px] text-error font-medium">−₹375</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[17px] text-saffron">यात्रा भत्ता:</span>
            <span className="text-[18px] text-success font-medium">+₹200</span>
          </div>
          <div className="h-px bg-success/30" />
          <div className="flex justify-between items-center">
            <span className="text-[18px] font-bold text-success">आपको मिला:</span>
            <span className="text-[24px] font-bold text-success">₹2,325</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-5 space-y-2"
      >
        <p className="text-[17px] font-semibold text-text-primary-2">हर रुपये का हिसाब।</p>
        <p className="text-[16px] text-text-primary-2">कोई छुपाई नहीं।</p>
      </motion.div>
    </TutorialShell>
  );
}
