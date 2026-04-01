import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OnboardingPhase, SupportedLanguage } from '@/lib/onboarding-store'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface OnboardingCache {
  phase: OnboardingPhase
  selectedLanguage: SupportedLanguage
  detectedCity: string
  detectedState: string
  languageConfirmed: boolean
  pendingLanguage: SupportedLanguage | null
  tutorialStarted: boolean
  tutorialCompleted: boolean
  currentTutorialScreen: number
  voiceTutorialSeen: boolean
  firstEverOpen: boolean
  helpRequested: boolean
  lastUpdated: number
}

export interface OnboardingCacheStore {
  // Cache state
  cache: OnboardingCache | null
  isLoading: boolean
  isHydrated: boolean
  error: string | null

  // Actions
  setCache: (cache: OnboardingCache) => void
  updatePhase: (phase: OnboardingPhase) => void
  updateLanguage: (language: SupportedLanguage) => void
  updateLocation: (city: string, state: string) => void
  updateTutorialProgress: (screen: number, completed?: boolean) => void
  markTutorialStarted: () => void
  markVoiceTutorialSeen: () => void
  markHelpRequested: () => void
  clearCache: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  markHydrated: () => void

  // Selectors
  getCache: () => OnboardingCache | null
  isValid: () => boolean
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const CACHE_VERSION = 'v1'
const CACHE_KEY = `hpj-onboarding-cache-${CACHE_VERSION}`
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

const DEFAULT_CACHE: OnboardingCache = {
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
  lastUpdated: Date.now(),
}

// ─────────────────────────────────────────────────────────────
// SSR SAFETY
// ─────────────────────────────────────────────────────────────

const isClient = typeof window !== 'undefined'

const createSafeLocalStorage = () => {
  return {
    getItem: (key: string) => {
      if (!isClient) return null
      try {
        return localStorage.getItem(key)
      } catch (error) {
        console.warn('[onboarding-cache-store] getItem failed:', error)
        return null
      }
    },
    setItem: (key: string, value: string) => {
      if (!isClient) return
      try {
        localStorage.setItem(key, value)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('[onboarding-cache-store] Storage full - cannot persist data')
        } else {
          console.warn('[onboarding-cache-store] setItem failed:', error)
        }
      }
    },
    removeItem: (key: string) => {
      if (!isClient) return
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn('[onboarding-cache-store] removeItem failed:', error)
      }
    },
  }
}

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

export const useOnboardingCacheStore = create<OnboardingCacheStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cache: null,
      isLoading: false,
      isHydrated: false,
      error: null,

      // Actions
      setCache: (cache) => {
        set({ cache, isLoading: false, error: null })
      },

      updatePhase: (phase) => {
        const currentCache = get().cache
        if (!currentCache) return

        set({
          cache: {
            ...currentCache,
            phase,
            lastUpdated: Date.now(),
          },
        })
      },

      updateLanguage: (language) => {
        const currentCache = get().cache
        if (!currentCache) return

        set({
          cache: {
            ...currentCache,
            selectedLanguage: language,
            languageConfirmed: true,
            pendingLanguage: null,
            lastUpdated: Date.now(),
          },
        })
      },

      updateLocation: (city, state) => {
        const currentCache = get().cache
        if (!currentCache) return

        set({
          cache: {
            ...currentCache,
            detectedCity: city,
            detectedState: state,
            lastUpdated: Date.now(),
          },
        })
      },

      updateTutorialProgress: (screen, completed = false) => {
        const currentCache = get().cache
        if (!currentCache) return

        set({
          cache: {
            ...currentCache,
            currentTutorialScreen: screen,
            tutorialCompleted: completed,
            lastUpdated: Date.now(),
          },
        })
      },

      markTutorialStarted: () => {
        const currentCache = get().cache
        if (!currentCache) return

        set({
          cache: {
            ...currentCache,
            tutorialStarted: true,
            lastUpdated: Date.now(),
          },
        })
      },

      markVoiceTutorialSeen: () => {
        const currentCache = get().cache
        if (!currentCache) return

        set({
          cache: {
            ...currentCache,
            voiceTutorialSeen: true,
            lastUpdated: Date.now(),
          },
        })
      },

      markHelpRequested: () => {
        const currentCache = get().cache
        if (!currentCache) return

        set({
          cache: {
            ...currentCache,
            helpRequested: true,
            lastUpdated: Date.now(),
          },
        })
      },

      clearCache: () => {
        set({ cache: null, error: null })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error, isLoading: false })
      },

      markHydrated: () => {
        set({ isHydrated: true })
      },

      // Selectors
      getCache: () => {
        return get().cache
      },

      isValid: () => {
        const currentCache = get().cache
        if (!currentCache) return false

        // Check if cache is expired
        const isExpired = Date.now() - currentCache.lastUpdated > CACHE_TTL
        if (isExpired) {
          console.warn('[onboarding-cache-store] Cache expired')
          return false
        }

        return true
      },
    }),
    {
      name: CACHE_KEY,
      storage: createJSONStorage(() => createSafeLocalStorage()),
      partialize: (state) => ({
        cache: state.cache,
        isHydrated: state.isHydrated,
      }),
      skipHydration: true,
      version: 1,
    }
  )
)

// ─────────────────────────────────────────────────────────────
// SSR-SAFE HELPERS
// ─────────────────────────────────────────────────────────────

export function getOnboardingCacheStoreState(): OnboardingCache | null {
  if (!isClient) {
    return null
  }
  try {
    return useOnboardingCacheStore.getState().cache
  } catch {
    return null
  }
}

export function isCacheValid(): boolean {
  if (!isClient) return false
  try {
    return useOnboardingCacheStore.getState().isValid()
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────
// CACHE UTILITIES
// ─────────────────────────────────────────────────────────────

export function createCacheFromState(state: {
  phase?: OnboardingPhase
  selectedLanguage?: SupportedLanguage
  detectedCity?: string
  detectedState?: string
  languageConfirmed?: boolean
  pendingLanguage?: SupportedLanguage | null
  tutorialStarted?: boolean
  tutorialCompleted?: boolean
  currentTutorialScreen?: number
  voiceTutorialSeen?: boolean
  firstEverOpen?: boolean
  helpRequested?: boolean
}): OnboardingCache {
  return {
    phase: state.phase ?? 'SPLASH',
    selectedLanguage: state.selectedLanguage ?? 'Hindi',
    detectedCity: state.detectedCity ?? '',
    detectedState: state.detectedState ?? '',
    languageConfirmed: state.languageConfirmed ?? false,
    pendingLanguage: state.pendingLanguage ?? null,
    tutorialStarted: state.tutorialStarted ?? false,
    tutorialCompleted: state.tutorialCompleted ?? false,
    currentTutorialScreen: state.currentTutorialScreen ?? 1,
    voiceTutorialSeen: state.voiceTutorialSeen ?? false,
    firstEverOpen: state.firstEverOpen ?? true,
    helpRequested: state.helpRequested ?? false,
    lastUpdated: Date.now(),
  }
}

export function mergeCache(
  existing: OnboardingCache,
  updates: Partial<Omit<OnboardingCache, 'lastUpdated'>>
): OnboardingCache {
  return {
    ...existing,
    ...updates,
    lastUpdated: Date.now(),
  }
}
