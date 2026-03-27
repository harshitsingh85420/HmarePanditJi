import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface LanguageState {
  currentLanguage: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  resetLanguage: () => void
}

const DEFAULT_LANGUAGE: SupportedLanguage = 'Hindi'

// Create store without persist for SSR compatibility
// Language preference will be stored in localStorage via GlobalOverlayProvider
export const useLanguageStore = create<LanguageState>()((set) => ({
  currentLanguage: DEFAULT_LANGUAGE,
  setLanguage: (language) => set({ currentLanguage: language }),
  resetLanguage: () => set({ currentLanguage: DEFAULT_LANGUAGE }),
}))
