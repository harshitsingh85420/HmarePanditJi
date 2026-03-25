import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OnboardingState, OnboardingPhase, SupportedLanguage } from '@/lib/onboarding-store'

const DEFAULT_STATE: OnboardingState = {
  phase: 'SPLASH',
  selectedLanguage: 'Hindi',
  detectedCity: '',
  detectedState: '',
  languageConfirmed: false,
  pendingLanguage: null,
  tutorialStarted: false,
  tutorialCompleted: false,
  currentTutorialScreen: 1,
  voiceTutorialSeen: false,
  firstEverOpen: true,
  helpRequested: false,
}

interface OnboardingStore extends OnboardingState {
  setPhase: (phase: OnboardingPhase) => void
  setSelectedLanguage: (language: SupportedLanguage) => void
  setDetectedCity: (city: string, state: string) => void
  setLanguageConfirmed: (confirmed: boolean) => void
  setPendingLanguage: (language: SupportedLanguage | null) => void
  setTutorialStarted: (started: boolean) => void
  setTutorialCompleted: (completed: boolean) => void
  setCurrentTutorialScreen: (screen: number) => void
  setVoiceTutorialSeen: (seen: boolean) => void
  setHelpRequested: (requested: boolean) => void
  setLanguage: (language: SupportedLanguage) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setPhase: (phase) => set({ phase }),

      setSelectedLanguage: (language) => set({ selectedLanguage: language }),

      setDetectedCity: (city, stateStr) => set({ detectedCity: city, detectedState: stateStr }),

      setLanguageConfirmed: (confirmed) => set({ languageConfirmed: confirmed }),

      setPendingLanguage: (language) => set({ pendingLanguage: language }),

      setTutorialStarted: (started) => set({ tutorialStarted: started }),

      setTutorialCompleted: (completed) => set({ tutorialCompleted: completed }),

      setCurrentTutorialScreen: (screen) => set({ currentTutorialScreen: screen }),

      setVoiceTutorialSeen: (seen) => set({ voiceTutorialSeen: seen }),

      setHelpRequested: (requested) => set({ helpRequested: requested }),

      setLanguage: (language) => set({ selectedLanguage: language, languageConfirmed: true }),

      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: 'hpj-onboarding',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        phase: state.phase,
        selectedLanguage: state.selectedLanguage,
        detectedCity: state.detectedCity,
        detectedState: state.detectedState,
        languageConfirmed: state.languageConfirmed,
        pendingLanguage: state.pendingLanguage,
        tutorialStarted: state.tutorialStarted,
        tutorialCompleted: state.tutorialCompleted,
        currentTutorialScreen: state.currentTutorialScreen,
        voiceTutorialSeen: state.voiceTutorialSeen,
        firstEverOpen: state.firstEverOpen,
        helpRequested: state.helpRequested,
      }),
    }
  )
)
