'use client';

import React from 'react';
import TutorialShell from './TutorialShell';
import { TutorialScreenProps } from './types';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';

const GUARANTEES = [
  { icon: '🏅', title: 'सम्मान', sub: 'Verified Badge · Zero मोलभाव' },
  { icon: '🎧', title: 'सुविधा', sub: 'Voice Navigation · Auto Travel' },
  { icon: '🔒', title: 'सुरक्षा', sub: 'Fixed Income · Instant Payment' },
  { icon: '💰', title: 'समृद्धि', sub: '4 Income Streams · Backup Earnings' },
];

const GUARANTEES_SCRIPT =
  'यह रहे HmarePanditJi के चार वादे। एक — सम्मान। दो — सुविधा। तीन — सुरक्षा। चार — समृद्धि। तीन लाख से ज़्यादा पंडित पहले से जुड़ चुके हैं। अब Registration की बारी।';

export default function TutorialGuarantees({
  currentDot,
  onNext,
  onBack,
  onSkip,
  language,
}: TutorialScreenProps) {
  const { isListening } = useSarvamVoiceFlow({
    language,
    script: GUARANTEES_SCRIPT,
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
      nextLabel="Registration शुरू करें →"
      nextVariant="primary-dk"
      isListening={isListening}
      showKeyboardToggle
      onKeyboardToggle={() => {}}
    >
      <section className="mb-8 animate-fade-up opacity-0">
        <h2 className="text-[22px] text-vedic-gold leading-tight">HmarePanditJi की</h2>
        <h1 className="text-[36px] font-bold text-vedic-brown leading-tight">4 गारंटी</h1>
      </section>

      <section className="space-y-3 mb-6">
        {GUARANTEES.map((guarantee, index) => (
          <div
            key={guarantee.title}
            style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
            className="bg-white h-[80px] px-4 rounded-r-xl shadow-sm flex items-center gap-4 border-l-[6px] border-primary-dk animate-fade-up opacity-0"
          >
            <div className="w-10 h-10 bg-primary-lt rounded-full flex items-center justify-center text-[20px] shrink-0">
              {guarantee.icon}
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-vedic-brown leading-tight">{guarantee.title}</h3>
              <p className="text-[15px] text-vedic-gold">{guarantee.sub}</p>
            </div>
          </div>
        ))}
      </section>

      <div
        style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
        className="bg-primary-lt/50 border border-primary/20 rounded-full py-3.5 px-5 flex items-center gap-3 justify-center animate-fade-up opacity-0"
      >
        <span className="text-[24px]">🤝</span>
        <p className="text-[18px] font-semibold text-vedic-brown">3,00,000+ पंडित पहले से जुड़े हैं</p>
      </div>
    </TutorialShell>
  );
}
