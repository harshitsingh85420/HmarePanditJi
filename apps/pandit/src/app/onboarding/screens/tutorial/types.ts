import type { SupportedLanguage } from '@/lib/onboarding-store';

export interface TutorialScreenProps {
  language: SupportedLanguage;
  onLanguageChange: () => void;
  currentDot: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}
