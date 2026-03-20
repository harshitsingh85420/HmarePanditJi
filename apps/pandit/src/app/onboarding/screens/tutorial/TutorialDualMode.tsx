'use client';

import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';
import { TutorialScreenProps } from './types';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';

const DUAL_MODE_SCRIPT =
  'चाहे आपके पास smartphone हो या keypad phone — दोनों से काम चलेगा। और अगर registration में बेटा या परिवार मदद करे — कोई बात नहीं। पूजा आपको मिलेगी। पैसे आपके खाते में।';

export default function TutorialDualMode({
  currentDot,
  onNext,
  onBack,
  onSkip,
  language,
}: TutorialScreenProps) {
  const { isListening } = useSarvamVoiceFlow({
    language,
    script: DUAL_MODE_SCRIPT,
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
      onKeyboardToggle={() => {}}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1 mb-6"
      >
        <h1 className="text-[28px] font-bold text-vedic-brown leading-tight">कोई भी Phone,</h1>
        <h1 className="text-[28px] font-bold text-primary leading-tight">Platform चलेगा।</h1>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border-2 border-primary bg-primary/10 shadow-cta"
        >
          <div className="text-[36px] text-center mb-2">📱</div>
          <p className="text-[17px] font-bold text-vedic-brown text-center mb-3">Smartphone</p>
          <ul className="space-y-1.5">
            {['Video Call', 'Chat', 'Voice Alerts', 'Maps'].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-[14px] text-vedic-brown">
                <span className="text-primary font-bold">✓</span> {feature}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border border-vedic-border bg-white shadow-card"
        >
          <div className="text-[36px] text-center mb-2">📟</div>
          <p className="text-[17px] font-bold text-vedic-gold text-center mb-3">Keypad Phone</p>
          <ul className="space-y-1.5">
            {[
              { label: 'Call आएगी', italic: false },
              { label: '1 = हाँ', italic: false },
              { label: '2 = ना', italic: false },
              { label: 'बस!', italic: true },
            ].map(({ label, italic }) => (
              <li
                key={label}
                className={`flex items-center gap-2 text-[14px] text-vedic-brown ${italic ? 'italic text-[12px]' : ''}`}
              >
                <span className="text-vedic-gold font-bold">✓</span> {label}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary-lt border-2 border-dashed border-primary rounded-card p-5 min-h-[148px] flex items-start gap-4"
      >
        <span className="text-[36px] shrink-0">👨‍👩‍👦</span>
        <div>
          <p className="text-[20px] font-bold text-vedic-brown leading-snug">बेटा या परिवार Registration में</p>
          <p className="text-[20px] font-bold text-vedic-brown leading-snug">मदद कर सकते हैं।</p>
          <p className="text-[16px] text-vedic-brown-2 mt-1">पूजा आपको मिलेगी, पैसे आपके खाते में।</p>
        </div>
      </motion.div>
    </TutorialShell>
  );
}
