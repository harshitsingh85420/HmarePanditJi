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

interface OnboardingStore {
  data: OnboardingState
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
    (set) => ({
      data: DEFAULT_STATE,

      setPhase: (phase) => set((state) => ({
        data: { ...state.data, phase }
      })),

      setSelectedLanguage: (language) => set((state) => ({
        data: { ...state.data, selectedLanguage: language }
      })),

      setDetectedCity: (city, stateStr) => set((state) => ({
        data: { ...state.data, detectedCity: city, detectedState: stateStr }
      })),

      setLanguageConfirmed: (confirmed) => set((state) => ({
        data: { ...state.data, languageConfirmed: confirmed }
      })),

      setPendingLanguage: (language) => set((state) => ({
        data: { ...state.data, pendingLanguage: language }
      })),

      setTutorialStarted: (started) => set((state) => ({
        data: { ...state.data, tutorialStarted: started }
      })),

      setTutorialCompleted: (completed) => set((state) => ({
        data: { ...state.data, tutorialCompleted: completed }
      })),

      setCurrentTutorialScreen: (screen) => set((state) => ({
        data: { ...state.data, currentTutorialScreen: screen }
      })),

      setVoiceTutorialSeen: (seen) => set((state) => ({
        data: { ...state.data, voiceTutorialSeen: seen }
      })),

      setHelpRequested: (requested) => set((state) => ({
        data: { ...state.data, helpRequested: requested }
      })),

      setLanguage: (language) => set((state) => ({
        data: { ...state.data, selectedLanguage: language, languageConfirmed: true }
      })),

      reset: () => set({ data: DEFAULT_STATE }),
    }),
    {
      name: 'hpj-onboarding',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ data: state.data }),
    }
  )
)
