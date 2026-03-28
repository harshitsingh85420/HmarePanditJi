import { create } from 'zustand'

export type VoiceState =
  | 'idle'          // V-01: Mic available, not listening
  | 'listening'     // V-02: Actively capturing audio
  | 'processing'    // V-03: Analyzing captured audio
  | 'confirming'    // V-04: Showing transcribed text for confirmation
  | 'error_1'       // V-05: First failure
  | 'error_2'       // V-06: Second failure
  | 'error_3'       // V-07: Third failure -> keyboard trigger
  | 'keyboard'      // K-01: Keyboard input active

export interface VoiceStore {
  // State
  state: VoiceState
  transcribedText: string
  confidence: number
  currentQuestion: string
  errorCount: number
  ambientNoiseLevel: number   // 0-100 dB approximation
  isKeyboardMode: boolean

  // Actions
  setState: (state: VoiceState) => void
  setTranscribedText: (text: string) => void
  setConfidence: (confidence: number) => void
  setCurrentQuestion: (question: string) => void
  incrementError: () => void
  resetErrors: () => void
  setAmbientNoise: (level: number) => void
  switchToKeyboard: () => void
  switchToVoice: () => void
  reset: () => void
}

// Create the store with SSR safety using typeof window check
export const useVoiceStore = create<VoiceStore>()((set, get) => ({
  // State
  state: 'idle',
  transcribedText: '',
  confidence: 0,
  currentQuestion: '',
  errorCount: 0,
  ambientNoiseLevel: 0,
  isKeyboardMode: false,

  // Actions
  setState: (voiceState) => {
    set({ state: voiceState })
    if (voiceState === 'error_3') {
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
    else if (newCount >= 3) {
      set({ state: 'error_3', isKeyboardMode: true })
    }
  },

  resetErrors: () => set({ errorCount: 0, state: 'idle' }),

  setAmbientNoise: (level) => set({ ambientNoiseLevel: level }),

  switchToKeyboard: () => set({ isKeyboardMode: true, state: 'keyboard' }),

  switchToVoice: () => {
    set({ isKeyboardMode: false, state: 'idle', errorCount: 0 })
  },

  reset: () => set({
    state: 'idle',
    transcribedText: '',
    confidence: 0,
    currentQuestion: '',
    errorCount: 0,
    isKeyboardMode: false,
  }),
}))

// SSR-safe getter for ambient noise level
export function getAmbientNoiseLevel(): number {
  if (typeof window === 'undefined') return 0
  try {
    return useVoiceStore.getState().ambientNoiseLevel
  } catch {
    return 0
  }
}

// Export error count getter for cascade logic
export function getErrorCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    return useVoiceStore.getState().errorCount
  } catch {
    return 0
  }
}

// SSR-Safe getter - use this in server-side code or during hydration
export function getVoiceStoreState() {
  if (typeof window === 'undefined') {
    return {
      state: 'idle' as const,
      transcribedText: '',
      confidence: 0,
      currentQuestion: '',
      errorCount: 0,
      ambientNoiseLevel: 0,
      isKeyboardMode: false,
    }
  }
  try {
    return useVoiceStore.getState()
  } catch {
    return {
      state: 'idle' as const,
      transcribedText: '',
      confidence: 0,
      currentQuestion: '',
      errorCount: 0,
      ambientNoiseLevel: 0,
      isKeyboardMode: false,
    }
  }
}
