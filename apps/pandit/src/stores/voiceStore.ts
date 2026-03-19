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

interface VoiceStore {
  state: VoiceState
  transcribedText: string
  confidence: number
  currentQuestion: string
  errorCount: number
  ambientNoiseLevel: number   // 0-100 dB approximation
  isKeyboardMode: boolean
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

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  state: 'idle',
  transcribedText: '',
  confidence: 0,
  currentQuestion: '',
  errorCount: 0,
  ambientNoiseLevel: 0,
  isKeyboardMode: false,

  setState: (voiceState) => {
    const errorStateMap: Record<string, VoiceState> = {
      error_1: 'error_1',
      error_2: 'error_2',
      error_3: 'error_3',
    }
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
    // Voice re-enabled per screen — keyboard mode is per-screen only
    set({ isKeyboardMode: false, state: 'idle', errorCount: 0 })
  },

  reset: () => set({
    state: 'idle',
    transcribedText: '',
    confidence: 0,
    errorCount: 0,
    isKeyboardMode: false,
  }),
}))
