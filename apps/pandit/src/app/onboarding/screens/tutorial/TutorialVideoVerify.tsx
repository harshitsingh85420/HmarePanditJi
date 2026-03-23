'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_VIDEO_VERIFY } from '@/lib/voice-scripts';
import TutorialShell from './TutorialShell';
import { TutorialScreenProps } from './types';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';

export default function TutorialVideoVerify({
  currentDot,
  onNext,
  onBack,
  onSkip,
  language = 'Hindi',
}: TutorialScreenProps) {
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S10;

  const { isListening } = useSarvamVoiceFlow({
    language: language as any,
    script: TUTORIAL_VIDEO_VERIFY.scripts.main.hindi,
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
      language={language}
    >
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
        <h1 className="text-[26px] font-bold leading-tight text-vedic-brown">{t.title}</h1>
        <h1 className="text-[26px] font-bold text-primary leading-tight">{t.subtitle}</h1>
      </motion.section>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[20px] p-5 shadow-card-hover mb-5"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary-lt border-[2.5px] border-primary flex items-center justify-center shrink-0">
            <span className="text-[28px]">🧑</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[20px] font-bold text-vedic-brown">[आपका नाम]</span>
              <span className="bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-md">✓ VERIFIED</span>
            </div>
            <p className="text-[15px] text-vedic-gold">⭐ 4.9 | 234 Reviews</p>
          </div>
        </div>

        <div className="h-px bg-vedic-border/40 mb-3" />
        <p className="text-[16px] font-semibold text-vedic-brown-2 mb-2">Verified पूजाएं:</p>

        <div className="flex flex-wrap gap-2">
          {['सत्यनारायण कथा ✓', 'विवाह संस्कार ✓', 'गृह प्रवेश ✓', 'श्राद्ध कर्म ✓'].map((badge) => (
            <div
              key={badge}
              className="bg-primary-lt border border-primary rounded-full px-3.5 py-2 h-9 flex items-center gap-1 text-[16px] text-vedic-brown"
            >
              <span className="text-primary text-[12px]">🟠</span> {badge}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-primary rounded-xl px-5 py-4 text-center mb-5"
      >
        <p className="text-[16px] text-white/90">Verified Pandits को</p>
        <p className="text-[48px] font-bold text-white leading-none">3x</p>
        <p className="text-[16px] text-white/90">ज़्यादा Bookings मिलती हैं</p>
        <p className="text-[14px] text-white/70">Unverified से</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-1"
      >
        <p className="text-[18px] font-semibold text-vedic-brown">सिर्फ 2 मिनट का Video — एक बार।</p>
        <p className="text-[16px] text-vedic-gold italic">Video सिर्फ Admin देखेगा। Public नहीं होगी।</p>
      </motion.div>
    </TutorialShell>
  );
}
