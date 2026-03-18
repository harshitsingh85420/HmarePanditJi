export interface TutorialScreenProps {
  language: string
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}
