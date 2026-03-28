import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
        console.warn('[registrationStore] getItem failed:', error)
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
          console.warn('[registrationStore] Storage full - cannot persist data. User data may be lost on page reload.')
        } else {
          console.warn('[registrationStore] setItem failed:', error)
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
        console.warn('[registrationStore] removeItem failed:', error)
      }
    },
  }
}

export type RegistrationStep =
  | 'language'
  | 'welcome'
  | 'mic_permission'
  | 'location_permission'
  | 'notification_permission'
  | 'mobile'
  | 'otp'
  | 'profile'
  | 'complete'

export interface RegistrationData {
  language: string
  mobile: string
  otp: string
  name: string
  city: string
  state: string
  currentStep: RegistrationStep
  completedSteps: RegistrationStep[]
  referralCode?: string
  sessionId: string
  startedAt: number
  lastSavedAt: number
}

interface RegistrationStore {
  data: RegistrationData
  setLanguage: (lang: string) => void
  setMobile: (mobile: string) => void
  setOtp: (otp: string) => void
  setName: (name: string) => void
  setCity: (city: string, state: string) => void
  setCurrentStep: (step: RegistrationStep) => void
  markStepComplete: (step: RegistrationStep) => void
  setReferralCode: (code: string) => void
  getStepNumber: (step: RegistrationStep) => number
  getTotalSteps: () => number
  getCompletionPercentage: () => number
  isStepComplete: (step: RegistrationStep) => boolean
  reset: () => void
  syncFromStorage: () => void
}

const REGISTRATION_STEPS: RegistrationStep[] = [
  'mobile', 'otp', 'profile', 'complete'
]

// STEP_ORDER: RegistrationStep[] = [  // ARCH-001 FIX: Commented out unused constant
//   'language', 'welcome', 'mic_permission', 'location_permission',
//   'notification_permission', 'mobile', 'otp', 'profile', 'complete'
// ]

const initialData: RegistrationData = {
  language: 'hi',
  mobile: '',
  otp: '',
  name: '',
  city: '',
  state: '',
  currentStep: 'language',
  completedSteps: [],
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  startedAt: Date.now(),
  lastSavedAt: Date.now(),
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      data: initialData,

      setLanguage: (lang) => set((state) => ({
        data: { ...state.data, language: lang, lastSavedAt: Date.now() }
      })),

      setMobile: (mobile) => set((state) => ({
        data: { ...state.data, mobile, lastSavedAt: Date.now() }
      })),

      setOtp: (otp) => set((state) => ({
        data: { ...state.data, otp, lastSavedAt: Date.now() }
      })),

      setName: (name) => set((state) => ({
        data: { ...state.data, name, lastSavedAt: Date.now() }
      })),

      setCity: (city, state_name) => set((state) => ({
        data: { ...state.data, city, state: state_name, lastSavedAt: Date.now() }
      })),

      setCurrentStep: (step) => set((state) => ({
        data: { ...state.data, currentStep: step, lastSavedAt: Date.now() }
      })),

      markStepComplete: (step) => set((state) => ({
        data: {
          ...state.data,
          completedSteps: state.data.completedSteps.includes(step)
            ? state.data.completedSteps
            : [...state.data.completedSteps, step],
          lastSavedAt: Date.now()
        }
      })),

      setReferralCode: (code) => set((state) => ({
        data: { ...state.data, referralCode: code }
      })),

      getStepNumber: (step) => REGISTRATION_STEPS.indexOf(step) + 1,
      getTotalSteps: () => REGISTRATION_STEPS.length,

      getCompletionPercentage: () => {
        const { completedSteps } = get().data
        const registrationSteps = completedSteps.filter(s => REGISTRATION_STEPS.includes(s))
        return Math.round((registrationSteps.length / REGISTRATION_STEPS.length) * 100)
      },

      isStepComplete: (step) => get().data.completedSteps.includes(step),

      reset: () => set({ data: { ...initialData, sessionId: `session_${Date.now()}`, startedAt: Date.now() } }),

      // BUG-018 FIX: Manual sync function to reload data from localStorage
      syncFromStorage: () => {
        try {
          const stored = localStorage.getItem('hpj-registration')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.data) {
              set({ data: parsed.data })
            }
          }
        } catch {
          // Silently fail - storage might be corrupted or unavailable
        }
      },
    }),
    {
      name: 'hpj-registration',
      // BUG-024 FIX: Use safe storage wrapper that handles QuotaExceededError
      storage: createJSONStorage(() => createSafeLocalStorage()),
      partialize: (state) => ({ data: state.data }),
      // BUG-018 FIX: Skip initial hydration to set up storage listener first
      skipHydration: true,
    }
  )
)

// BUG-018 FIX: Cross-tab synchronization using storage event listener
if (typeof window !== 'undefined') {
  // Initial hydration
  try {
    const stored = localStorage.getItem('hpj-registration')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.data) {
        useRegistrationStore.setState({ data: parsed.data })
      }
    }
  } catch {
    // Silently fail - use default state
  }

  // Listen for storage changes from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'hpj-registration' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue)
        if (parsed.data) {
          // Sync data from other tab
          useRegistrationStore.setState({ data: parsed.data })
        }
      } catch {
        // Silently ignore corrupted storage events
      }
    }
  })

  // BUG-018 FIX: Also sync when visibility changes (user switches back from another tab)
  window.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      try {
        const stored = localStorage.getItem('hpj-registration')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.data) {
            useRegistrationStore.setState({ data: parsed.data })
          }
        }
      } catch {
        // Silently fail
      }
    }
  })
}

// SSR-Safe getter - use this in server-side code or during hydration
export function getRegistrationStoreState() {
  if (!isClient) {
    return { data: initialData }
  }
  try {
    return useRegistrationStore.getState()
  } catch {
    return { data: initialData }
  }
}
