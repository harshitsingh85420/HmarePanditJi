import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
}

const STEP_ORDER: RegistrationStep[] = [
  'language', 'welcome', 'mic_permission', 'location_permission',
  'notification_permission', 'mobile', 'otp', 'profile', 'complete'
]

const REGISTRATION_STEPS: RegistrationStep[] = [
  'mobile', 'otp', 'profile', 'complete'
]

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
    }),
    {
      name: 'hpj-registration',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ data: state.data }),
    }
  )
)
