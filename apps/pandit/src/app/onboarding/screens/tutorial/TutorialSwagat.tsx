'use client';
import React from 'react';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_SWAGAT } from '@/lib/voice-scripts';
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

export default function TutorialSwagat({ currentDot, onNext, onBack, onSkip, language = 'Hindi' }: Props) {
  // BUG-007 FIX: Derive translations from language prop so runtime language switch works
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S01;

  const { isListening } = useSarvamVoiceFlow({
    language,
    script: TUTORIAL_SWAGAT.scripts.main.hindi,
    autoListen: true,
    listenTimeoutMs: 12000,
    repromptScript: 'कृपया जानें बोलें या Skip बोलें।',
    repromptTimeoutMs: 12000,
    initialDelayMs: 500,
    pauseAfterMs: 1000,
    onIntent: (intent) => {
      const lower = typeof intent === 'string' ? intent.toLowerCase() : '';
      if (lower.includes('skip') || lower.includes('registration') || lower.includes('seedhe')) {
        onSkip();
      } else if (
        lower.includes('jaanen') ||
        lower.includes('jaane') ||
        lower.includes('haan') ||
        lower.includes('ha') ||
        lower.includes('yes') ||
        lower.includes('aage') ||
        lower.includes('forward')
      ) {
        onNext();
      }
    },
  });

  return (
    <TutorialShell
      currentDot={currentDot}
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={undefined}
      isListening={isListening}
      showVoiceBar={true}
      language={language}
    >
      {/* Hero Illustration */}
      <div className="relative mb-8 flex justify-center">
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          <div className="absolute w-[200px] h-[200px] bg-primary/12 rounded-full blur-xl animate-glow-pulse" />
          <div className="relative z-10 w-[200px] h-[200px] bg-primary-lt rounded-full flex items-center justify-center">
            <span className="animate-gentle-float text-[96px] leading-none">🧘</span>
          </div>
        </div>
      </div>

      {/* Greeting Text — from translations */}
      <div className="text-center space-y-1 mb-6">
        <h1 className="text-[40px] font-bold leading-tight text-text-primary">{t.greeting}</h1>
        <h2 className="text-[40px] font-bold text-primary leading-tight">{t.welcome}</h2>
        <p className="text-[22px] text-text-primary-2 font-normal mt-2">{t.subtitle}</p>
      </div>

      {/* Mool Mantra — from translations */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-[1px] bg-surface-dim mb-4" />
        <p className="text-[18px] italic text-saffron leading-relaxed">
          {t.moolMantra1}<br />{t.moolMantra2}
        </p>
      </div>

      {/* Direct Skip Link — from translations */}
      <div className="text-center mt-2">
        <button onClick={onSkip} className="text-saffron text-[16px] underline decoration-1 underline-offset-4 active:opacity-50">
          {t.cta}
        </button>
      </div>
    </TutorialShell>
  );
}
