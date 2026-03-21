'use client'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type VoiceState =
  | 'IDLE'
  | 'SPEAKING'       // TTS is playing
  | 'LISTENING'      // STT is active, waiting for user
  | 'PROCESSING'     // STT detected sound, processing
  | 'SUCCESS'        // STT recognized successfully
  | 'FAILURE'        // STT failed (below confidence)
  | 'NOISE_WARNING'  // Ambient noise too high

export type VoiceResult = {
  transcript: string
  confidence: number
  isFinal: boolean
}

export type VoiceEngineConfig = {
  language?: string         // BCP-47 language tag, e.g. 'hi-IN', 'en-IN'
  confidenceThreshold?: number  // 0-1, default 0.65
  listenTimeoutMs?: number     // How long to listen, default 12000ms
  onStateChange?: (state: VoiceState) => void
  onResult?: (result: VoiceResult) => void
  onError?: (error: string) => void
}

type BrowserSpeechRecognitionCtor = new () => SpeechRecognition

type BrowserSpeechWindow = Window & typeof globalThis & {
  SpeechRecognition?: BrowserSpeechRecognitionCtor
  webkitSpeechRecognition?: BrowserSpeechRecognitionCtor
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE → BCP-47 MAP
// ─────────────────────────────────────────────────────────────

export const LANGUAGE_TO_BCP47: Record<string, string> = {
  'Hindi': 'hi-IN',
  'Bhojpuri': 'hi-IN',
  'Maithili': 'hi-IN',
  'Bengali': 'bn-IN',
  'Tamil': 'ta-IN',
  'Telugu': 'te-IN',
  'Kannada': 'kn-IN',
  'Malayalam': 'ml-IN',
  'Marathi': 'mr-IN',
  'Gujarati': 'gu-IN',
  'Sanskrit': 'hi-IN',
  'English': 'en-IN',
  'Odia': 'or-IN',
  'Punjabi': 'pa-IN',
  'Assamese': 'as-IN',
}

// ─────────────────────────────────────────────────────────────
// INTENT → WORD MAP (Fuzzy matching for voice commands)
// ─────────────────────────────────────────────────────────────

type VoiceIntent = 'YES' | 'NO' | 'SKIP' | 'HELP' | 'CHANGE' | 'FORWARD' | 'BACK'

const INTENT_WORD_MAP: Record<VoiceIntent, string[]> = {
  YES: [
    'haan', 'ha', 'haanji', 'theek', 'sahi', 'bilkul', 'kar lo', 'de do',
    'ok', 'okay', 'yes', 'correct', 'accha', 'thik', 'haan ji', 'zaroor',
    'bilkul theek', 'haan haan', 'shi hai',
  ],
  NO: [
    'nahi', 'naa', 'na', 'mat', 'mat karo', 'no', 'galat', 'nahi chahiye',
    'nahi karna', 'nahi ji',
  ],
  SKIP: [
    'skip', 'skip karo', 'chodo', 'chhor do', 'aage jao', 'registration',
    'baad mein', 'baad me', 'later', 'abhi nahi', 'seedha chalo',
  ],
  HELP: [
    'sahayata', 'madad', 'help', 'samajh nahi', 'samajha nahi', 'dikkat',
    'problem', 'mushkil', 'nahi samajha', 'mujhe madad chahiye',
  ],
  CHANGE: [
    'badle', 'badlo', 'change', 'doosri', 'alag', 'koi aur', 'doosra',
    'change karo', 'nahi yeh', 'kuch aur',
  ],
  FORWARD: [
    'aage', 'agla', 'next', 'continue', 'samajh gaya', 'theek hai',
    'aage chalein', 'jaari rakhein', 'dekhein', 'show karo',
  ],
  BACK: [
    'pichhe', 'wapas', 'pehle wala', 'back', 'previous', 'wapas jao',
    'pichle screen',
  ],
}

export function detectIntent(transcript: string): VoiceIntent | null {
  const normalized = transcript.toLowerCase().trim()
  for (const [intent, words] of Object.entries(INTENT_WORD_MAP)) {
    for (const word of words) {
      if (normalized.includes(word)) {
        return intent as VoiceIntent
      }
    }
  }
  return null
}

export function detectLanguageName(transcript: string): string | null {
  const normalized = transcript.toLowerCase().trim()
  const languageAliases: Record<string, string> = {
    'hindi': 'Hindi', 'hindee': 'Hindi',
    'bhojpuri': 'Bhojpuri', 'bhojpori': 'Bhojpuri', 'bhojpuriya': 'Bhojpuri',
    'maithili': 'Maithili', 'maithil': 'Maithili',
    'bengali': 'Bengali', 'bangla': 'Bengali', 'bangali': 'Bengali',
    'tamil': 'Tamil', 'tamizh': 'Tamil', 'tameel': 'Tamil',
    'telugu': 'Telugu', 'telegu': 'Telugu',
    'kannada': 'Kannada', 'kannad': 'Kannada',
    'malayalam': 'Malayalam', 'malayali': 'Malayalam',
    'marathi': 'Marathi',
    'gujarati': 'Gujarati', 'gujrati': 'Gujarati', 'gujarathi': 'Gujarati',
    'sanskrit': 'Sanskrit', 'sanskrith': 'Sanskrit',
    'english': 'English', 'angrezi': 'English',
    'odia': 'Odia', 'oriya': 'Odia',
    'punjabi': 'Punjabi', 'panjabi': 'Punjabi',
    'assamese': 'Assamese',
  }
  for (const [alias, language] of Object.entries(languageAliases)) {
    if (normalized.includes(alias)) return language
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// VOICE STATE MACHINE (GLOBAL)
// ─────────────────────────────────────────────────────────────

export let globalVoiceState: VoiceState = 'IDLE'

export function setGlobalVoiceState(state: VoiceState) {
  globalVoiceState = state
}

// ─────────────────────────────────────────────────────────────
// MANUAL MIC TOGGLE STATE
// ─────────────────────────────────────────────────────────────

let isManualMicOff = false

export function setManualMicOff(isOff: boolean): void {
  isManualMicOff = isOff
  console.log('[VoiceEngine] Manual mic toggle:', isOff ? 'OFF' : 'ON')
}

export function getManualMicOff(): boolean {
  return isManualMicOff
}

// ─────────────────────────────────────────────────────────────
// TTS (TEXT TO SPEECH)
// ─────────────────────────────────────────────────────────────

let ttsUtterance: SpeechSynthesisUtterance | null = null
let postTtsTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Speak text using Web Speech API.
 * CRITICAL: While speaking, microphone is turned OFF to prevent feedback loop.
 * After speech ends, microphone restarts ONLY if user hasn't manually turned it off.
 */
export function speak(
  text: string,
  languageBcp47: string = 'hi-IN',
  onEnd?: () => void
): void {
  if (typeof window === 'undefined') return
  if (!window.speechSynthesis) {
    console.warn('[VoiceEngine] SpeechSynthesis not supported')
    onEnd?.()
    return
  }

  // CRITICAL: HARD STOP STT while speaking to prevent feedback loop
  stopListening()

  if (postTtsTimeout) {
    clearTimeout(postTtsTimeout)
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel()

  setGlobalVoiceState('SPEAKING')

  ttsUtterance = new SpeechSynthesisUtterance(text)
  ttsUtterance.lang = languageBcp47
  ttsUtterance.rate = 0.88
  ttsUtterance.pitch = 1.0
  ttsUtterance.volume = 1.0

  const voices = window.speechSynthesis.getVoices()
  const matchedVoice = voices.find(v =>
    v.lang.startsWith(languageBcp47.split('-')[0]) && v.localService
  ) ?? voices.find(v => v.lang.startsWith(languageBcp47.split('-')[0]))
  if (matchedVoice) {
    ttsUtterance.voice = matchedVoice
  }

  // CRITICAL: Use speechSynthesis.onend to control mic restart
  ttsUtterance.onend = () => {
    postTtsTimeout = setTimeout(() => {
      setGlobalVoiceState('IDLE')
      // Call onEnd callback - caller decides whether to restart listening
      onEnd?.()
    }, 500)
  }

  ttsUtterance.onerror = () => {
    console.warn('[VoiceEngine] TTS error - calling onEnd anyway')
    postTtsTimeout = setTimeout(() => {
      setGlobalVoiceState('IDLE')
      onEnd?.()
    }, 500)
  }

  setTimeout(() => {
    if (ttsUtterance) window.speechSynthesis.speak(ttsUtterance)
  }, 100)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return
  window.speechSynthesis?.cancel()
  ttsUtterance = null
  if (postTtsTimeout) clearTimeout(postTtsTimeout)
  setGlobalVoiceState('IDLE')
}

// ─────────────────────────────────────────────────────────────
// STT (SPEECH TO TEXT)
// ─────────────────────────────────────────────────────────────

let recognition: SpeechRecognition | null = null
let listenTimeout: ReturnType<typeof setTimeout> | null = null

export function startListening(config: VoiceEngineConfig): () => void {
  if (typeof window === 'undefined') return () => { }

  // CRITICAL: If user manually turned mic off, do NOT start listening
  if (isManualMicOff) {
    console.warn('[VoiceEngine] Mic is manually turned OFF. Not starting listening.')
    config.onError?.('MIC_MANUALLY_OFF')
    return () => { }
  }

  // If TTS is currently speaking, do not start STT
  if (globalVoiceState === 'SPEAKING' || window.speechSynthesis?.speaking) {
    console.warn('[VoiceEngine] Cannot listen while speaking. Mic OFF.')
    config.onError?.('MIC_OFF_WHILE_SPEAKING')
    return () => { }
  }

  stopSpeaking()

  const speechWindow = window as BrowserSpeechWindow
  const SpeechRecognition =
    speechWindow.SpeechRecognition ||
    speechWindow.webkitSpeechRecognition

  if (!SpeechRecognition) {
    console.warn('[VoiceEngine] SpeechRecognition not supported')
    config.onError?.('NOT_SUPPORTED')
    return () => { }
  }

  if (recognition) {
    try { recognition.stop() } catch { /* noop */ }
    recognition = null
  }

  const {
    language = 'hi-IN',
    confidenceThreshold = 0.65,
    listenTimeoutMs = 12000,
    onStateChange,
    onResult,
    onError,
  } = config

  const rec = new SpeechRecognition()
  recognition = rec

  rec.continuous = false
  rec.interimResults = false
  rec.lang = language
  rec.maxAlternatives = 5

  setGlobalVoiceState('LISTENING')
  onStateChange?.('LISTENING')

  rec.onresult = (event: SpeechRecognitionEvent) => {
    clearListenTimeout()
    onStateChange?.('PROCESSING')

    let bestTranscript = ''
    let bestConfidence = 0

    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i]
      for (let j = 0; j < result.length; j++) {
        if (result[j].confidence > bestConfidence) {
          bestConfidence = result[j].confidence
          bestTranscript = result[j].transcript
        }
      }
    }

    if (bestConfidence >= confidenceThreshold || bestConfidence === 0) {
      setGlobalVoiceState('IDLE')
      onStateChange?.('SUCCESS')
      onResult?.({
        transcript: bestTranscript,
        confidence: bestConfidence,
        isFinal: true,
      })
    } else {
      setGlobalVoiceState('IDLE')
      onStateChange?.('FAILURE')
      onError?.('LOW_CONFIDENCE')
    }
  }

  rec.onerror = (event: SpeechRecognitionErrorEvent) => {
    clearListenTimeout()
    console.warn('[VoiceEngine] STT error:', event.error)
    setGlobalVoiceState('IDLE')
    onStateChange?.('FAILURE')
    onError?.(event.error)
  }

  rec.onend = () => {
    clearListenTimeout()
  }

  try {
    rec.start()
  } catch (e) {
    console.warn('[VoiceEngine] Failed to start recognition:', e)
    onError?.('START_FAILED')
  }

  listenTimeout = setTimeout(() => {
    if (recognition) {
      try { recognition.stop() } catch { /* noop */ }
      recognition = null
    }
    setGlobalVoiceState('IDLE')
    onStateChange?.('IDLE')
    onError?.('TIMEOUT')
  }, listenTimeoutMs)

  return () => {
    clearListenTimeout()
    if (recognition) {
      try { recognition.stop() } catch { /* noop */ }
      recognition = null
    }
  }
}

function clearListenTimeout(): void {
  if (listenTimeout) {
    clearTimeout(listenTimeout)
    listenTimeout = null
  }
}

export function stopListening(): void {
  clearListenTimeout()
  if (recognition) {
    try { recognition.stop() } catch { /* noop */ }
    recognition = null
  }
  if (globalVoiceState === 'LISTENING' || globalVoiceState === 'PROCESSING') {
    setGlobalVoiceState('IDLE')
  }
}

export function speakEchoAndResume(
  echoText: string,
  languageBcp47: string,
  resumeConfig: VoiceEngineConfig | null,
  shouldResume: () => boolean
): void {
  stopListening()

  speak(echoText, languageBcp47, () => {
    if (!resumeConfig) return
    if (!shouldResume()) return
    startListening(resumeConfig)
  })
}

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false
  const speechWindow = window as BrowserSpeechWindow
  const hasTTS = !!window.speechSynthesis
  const hasSTT = !!(
    speechWindow.SpeechRecognition ||
    speechWindow.webkitSpeechRecognition
  )
  return hasTTS && hasSTT
}
