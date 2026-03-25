'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_TRAVEL } from '@/lib/voice-scripts';
import TutorialShell from './TutorialShell';
import { TutorialScreenProps } from './types';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';
import type { SupportedLanguage } from '@/lib/onboarding-store';

const CALENDAR_CELLS = [
  '', '', '', '', '', '',
  '1', '2', '3', '4', '5', '6', '7',
  '8', '9', '10', '11', '12', '13', '14',
  '15', '16', '17', '18', '19', '20', '21',
  '22', '23', '24', '25', '26', '27', '28',
  '29',
];

export default function TutorialTravel({
  currentDot,
  onNext,
  onBack,
  onSkip,
  language = 'Hindi',
}: TutorialScreenProps) {
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S09;

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: TUTORIAL_TRAVEL.scripts.main.hindi,
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
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-1">
        <h1 className="text-[26px] font-bold text-text-primary leading-tight">{t.title}</h1>
        <h1 className="text-[26px] font-bold text-text-primary leading-tight">{t.subtitle}</h1>
      </motion.section>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-primary-lt border border-primary rounded-[20px] p-6 mb-5"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[36px]">🚂</span>
          <h3 className="font-bold text-[20px] text-text-primary">Booking Confirm हुई</h3>
        </div>
        <div className="text-center text-[24px] text-primary mb-4">↓</div>
        <p className="text-[20px] font-semibold text-text-primary mb-4">Platform automatically बनाएगा:</p>
        <ul className="space-y-3">
          {[
            'Train / Bus / Car का समय और टिकट',
            'ज़रूरत हो तो Hotel की Booking',
            'खाने का भत्ता (₹1,000/दिन)',
            'ग्राहक को GPS Updates',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-[18px] text-text-primary">
              <span className="text-primary font-bold text-[20px]">✓</span> {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-dashed border-border-default rounded-[20px] p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <span className="text-[36px]">📅</span>
            <h3 className="font-bold text-[20px] text-text-primary">स्मार्ट कैलेंडर</h3>
          </div>
          <span className="text-[16px] bg-error-lt text-error px-6 py-3 rounded-full font-bold min-h-[56px]">Auto-Blocked</span>
        </div>

        <div className="grid grid-cols-7 gap-2 justify-items-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <div key={index} className="text-center py-4 text-[16px] font-bold text-saffron">
              {day}
            </div>
          ))}

          {CALENDAR_CELLS.map((day, index) => {
            const isBlocked = day === '14' || day === '15';

            return (
              <div
                key={index}
                className={`h-12 w-12 rounded-md flex items-center justify-center relative ${isBlocked
                  ? 'bg-error-red-bg text-error-red'
                  : day
                    ? 'bg-surface-muted text-text-primary text-[16px] font-semibold'
                    : 'bg-transparent'
                  }`}
              >
                {isBlocked ? (
                  <>
                    <span className="absolute left-1 top-1 text-[16px] font-semibold">{day}</span>
                    <span className="text-[24px] font-bold leading-none">✕</span>
                  </>
                ) : (
                  day
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-[16px] text-saffron italic text-center">
          एक बार Set करो। Double Booking हो ही नहीं सकती।
        </p>
      </motion.div>
    </TutorialShell>
  );
}
