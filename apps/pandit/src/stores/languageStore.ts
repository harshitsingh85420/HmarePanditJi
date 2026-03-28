import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface LanguageState {
  currentLanguage: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  resetLanguage: () => void
}

const DEFAULT_LANGUAGE: SupportedLanguage = 'Hindi'

// SSR FIX: Check if we're on client side before accessing localStorage
const isClient = typeof window !== 'undefined'

// Create store without persist for SSR compatibility
// Language preference will be stored in localStorage via GlobalOverlayProvider
export const useLanguageStore = create<LanguageState>()((set) => ({
  currentLanguage: DEFAULT_LANGUAGE,
  setLanguage: (language) => set({ currentLanguage: language }),
  resetLanguage: () => set({ currentLanguage: DEFAULT_LANGUAGE }),
}))

// SSR-Safe getter - use this in server-side code or during hydration
export function getLanguageStoreState() {
  if (!isClient) {
    return { currentLanguage: DEFAULT_LANGUAGE }
  }
  try {
    return useLanguageStore.getState()
  } catch {
    return { currentLanguage: DEFAULT_LANGUAGE }
  }
}
