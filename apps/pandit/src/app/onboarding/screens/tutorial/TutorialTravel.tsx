'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_TRAVEL } from '@/lib/voice-scripts';
import TutorialShell from './TutorialShell';
import { TutorialScreenProps } from './types';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';

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
        <h1 className="text-[26px] font-bold text-vedic-brown leading-tight">{t.title}</h1>
        <h1 className="text-[26px] font-bold text-vedic-brown leading-tight">{t.subtitle}</h1>
      </motion.section>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-primary-lt border border-primary rounded-[20px] p-5 mb-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[28px]">🚂</span>
          <h3 className="font-bold text-[18px] text-vedic-brown">Booking Confirm हुई</h3>
        </div>
        <div className="text-center text-[20px] text-primary mb-3">↓</div>
        <p className="text-[18px] font-semibold text-vedic-brown mb-3">Platform automatically बनाएगा:</p>
        <ul className="space-y-2">
          {[
            'Train / Bus / Car का समय और टिकट',
            'ज़रूरत हो तो Hotel की Booking',
            'खाने का भत्ता (₹1,000/दिन)',
            'ग्राहक को GPS Updates',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-[17px] text-vedic-brown">
              <span className="text-primary font-bold">✓</span> {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-dashed border-vedic-border rounded-[20px] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[28px]">📅</span>
            <h3 className="font-bold text-[18px] text-vedic-brown">स्मार्ट कैलेंडर</h3>
          </div>
          <span className="text-[12px] bg-error-lt text-error px-2 py-0.5 rounded-full font-bold">Auto-Blocked</span>
        </div>

        <div className="grid grid-cols-7 gap-1 justify-items-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <div key={index} className="text-center py-1 text-[13px] font-bold text-vedic-gold">
              {day}
            </div>
          ))}

          {CALENDAR_CELLS.map((day, index) => {
            const isBlocked = day === '14' || day === '15';

            return (
              <div
                key={index}
                className={`h-9 w-9 rounded-md flex items-center justify-center relative ${isBlocked
                  ? 'bg-error-lt text-error'
                  : day
                    ? 'bg-gray-50 text-vedic-brown text-[11px]'
                    : 'bg-transparent'
                  }`}
              >
                {isBlocked ? (
                  <>
                    <span className="absolute left-1 top-1 text-[9px] font-semibold">{day}</span>
                    <span className="text-[16px] font-bold leading-none">✕</span>
                  </>
                ) : (
                  day
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[14px] text-vedic-gold italic text-center">
          एक बार Set करो। Double Booking हो ही नहीं सकती।
        </p>
      </motion.div>
    </TutorialShell>
  );
}
