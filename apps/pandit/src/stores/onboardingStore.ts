import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OnboardingState, OnboardingPhase, SupportedLanguage } from '@/lib/onboarding-store'

// SSR FIX: Check if we're on client side before accessing localStorage
const isClient = typeof window !== 'undefined'

// BUG-024 FIX: Custom storage wrapper that handles QuotaExceededError gracefully
const createSafeLocalStorage = () => {
  return {
    getItem: (key: string) => {
      if (!isClient) return null
      try {
        return localStorage.getItem(key)
      } catch (error) {
        // Silently fail - storage might be unavailable
        console.warn('[onboardingStore] getItem failed:', error)
        return null
      }
    },
    setItem: (key: string, value: string) => {
      if (!isClient) return
      try {
        localStorage.setItem(key, value)
      } catch (error) {
        // BUG-024: Handle QuotaExceededError gracefully - don't crash the app
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('[onboardingStore] Storage full - cannot persist data. User data may be lost on page reload.')
        } else {
          console.warn('[onboardingStore] setItem failed:', error)
        }
        // Silently fail - don't throw, don't crash the app
      }
    },
    removeItem: (key: string) => {
      if (!isClient) return
      try {
        localStorage.removeItem(key)
      } catch (error) {
        // Silently fail - storage might be unavailable
        console.warn('[onboardingStore] removeItem failed:', error)
      }
    },
  }
}

const DEFAULT_STATE: OnboardingState = {
  phase: 'SPLASH',
  selectedLanguage: 'Hindi',
  detectedCity: '',
  detectedState: '',
  languageConfirmed: false,
  pendingLanguage: null,
  scriptPreference: null,
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
      // BUG-024 FIX: Use safe storage wrapper that handles QuotaExceededError
      storage: createJSONStorage(() => createSafeLocalStorage()),
      partialize: (state) => ({
        phase: state.phase,
        selectedLanguage: state.selectedLanguage,
        detectedCity: state.detectedCity,
        detectedState: state.detectedState,
        languageConfirmed: state.languageConfirmed,
        pendingLanguage: state.pendingLanguage,
        scriptPreference: state.scriptPreference,
        tutorialStarted: state.tutorialStarted,
        tutorialCompleted: state.tutorialCompleted,
        currentTutorialScreen: state.currentTutorialScreen,
        voiceTutorialSeen: state.voiceTutorialSeen,
        firstEverOpen: state.firstEverOpen,
        helpRequested: state.helpRequested,
      }),
      // SSR FIX: Skip hydration on server, will hydrate on client
      skipHydration: true,
    }
  )
)

// SSR-Safe getter - use this in server-side code or during hydration
export function getOnboardingStoreState() {
  if (!isClient) {
    return DEFAULT_STATE
  }
  try {
    return useOnboardingStore.getState()
  } catch {
    return DEFAULT_STATE
  }
}
