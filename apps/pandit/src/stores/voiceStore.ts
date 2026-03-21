import { create } from 'zustand'

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'confirming'
  | 'error_1'
  | 'error_2'
  | 'error_3'
  | 'keyboard'

export interface VoiceStore {
  state: VoiceState
  transcribedText: string
  confidence: number
  currentQuestion: string
  errorCount: number
  ambientNoiseLevel: number
  isKeyboardMode: boolean
  isListening: boolean
  isMicManuallyOff: boolean
  setState: (state: VoiceState) => void
  setTranscribedText: (text: string) => void
  setConfidence: (confidence: number) => void
  setCurrentQuestion: (question: string) => void
  incrementError: () => void
  resetErrors: () => void
  setAmbientNoise: (level: number) => void
  switchToKeyboard: () => void
  switchToVoice: () => void
  setIsListening: (listening: boolean) => void
  toggleMic: () => void
  setManualMicOff: (off: boolean) => void
  reset: () => void
}

const initialState: VoiceStore = {
  state: 'idle',
  transcribedText: '',
  confidence: 0,
  currentQuestion: '',
  errorCount: 0,
  ambientNoiseLevel: 0,
  isKeyboardMode: false,
  isListening: false,
  isMicManuallyOff: false,
  setState: () => { },
  setTranscribedText: () => { },
  setConfidence: () => { },
  setCurrentQuestion: () => { },
  incrementError: () => { },
  resetErrors: () => { },
  setAmbientNoise: () => { },
  switchToKeyboard: () => { },
  switchToVoice: () => { },
  setIsListening: () => { },
  toggleMic: () => { },
  setManualMicOff: () => { },
  reset: () => { },
}

export const useVoiceStore = create<VoiceStore>()((set, get) => ({
  state: 'idle',
  transcribedText: '',
  confidence: 0,
  currentQuestion: '',
  errorCount: 0,
  ambientNoiseLevel: 0,
  isKeyboardMode: false,
  isListening: false,
  isMicManuallyOff: false,

  setState: (voiceState) => {
    set({ state: voiceState })
    if (voiceState === 'error_3' || voiceState === 'keyboard') {
      set({ isKeyboardMode: true })
    }
  },

  setTranscribedText: (text) => set({ transcribedText: text }),
  setConfidence: (confidence) => set({ confidence }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  incrementError: () => {
    const newCount = get().errorCount + 1
    set({ errorCount: newCount })
    if (newCount === 1) set({ state: 'error_1' })
    else if (newCount === 2) set({ state: 'error_2' })
    else if (newCount >= 3) set({ state: 'error_3', isKeyboardMode: true })
  },

  resetErrors: () => set({ errorCount: 0, state: 'idle' }),
  setAmbientNoise: (level) => set({ ambientNoiseLevel: level }),

  switchToKeyboard: () => set({ isKeyboardMode: true, state: 'keyboard' }),

  switchToVoice: () => set({ isKeyboardMode: false, state: 'idle', errorCount: 0 }),

  setIsListening: (listening) => set({ isListening: listening }),

  toggleMic: () => set((state) => ({ isMicManuallyOff: !state.isMicManuallyOff })),

  setManualMicOff: (off) => set({ isMicManuallyOff: off }),

  reset: () => set({
    state: 'idle',
    transcribedText: '',
    confidence: 0,
    currentQuestion: '',
    errorCount: 0,
    ambientNoiseLevel: 0,
    isKeyboardMode: false,
    isListening: false,
    isMicManuallyOff: false,
  }),
}))

// Custom localStorage persistence for keyboard mode preference only
const STORAGE_KEY = 'hpj-voice-preferences'

export function saveVoicePreferencesToStorage() {
  if (typeof window === 'undefined') return
  const state = useVoiceStore.getState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    isKeyboardMode: state.isKeyboardMode,
    isMicManuallyOff: state.isMicManuallyOff,
  }))
}

export function loadVoicePreferencesFromStorage(): { isKeyboardMode: boolean; isMicManuallyOff: boolean } | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function restoreVoicePreferencesFromStorage() {
  const stored = loadVoicePreferencesFromStorage()
  if (stored) {
    useVoiceStore.setState(stored)
  }
}
