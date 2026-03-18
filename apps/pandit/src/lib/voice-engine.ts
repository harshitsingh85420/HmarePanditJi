'use client'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type VoiceState =
  | 'IDLE'
  | 'SPEAKING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILURE'
  | 'NOISE_WARNING'

export type VoiceResult = {
  transcript: string
  confidence: number
  isFinal: boolean
}

export type VoiceEngineConfig = {
  language?: string
  confidenceThreshold?: number
  listenTimeoutMs?: number
  onStateChange?: (state: VoiceState) => void
  onResult?: (result: VoiceResult) => void
  onError?: (error: string) => void
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
// INTENT → WORD MAP
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

export function detectIntent(transcript: string): string | null {
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
// TTS (TEXT TO SPEECH)
// ─────────────────────────────────────────────────────────────

let ttsUtterance: SpeechSynthesisUtterance | null = null

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

  window.speechSynthesis.cancel()

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

  ttsUtterance.onend = () => { onEnd?.() }
  ttsUtterance.onerror = () => {
    console.warn('[VoiceEngine] TTS error — calling onEnd anyway')
    onEnd?.()
  }

  setTimeout(() => {
    if (ttsUtterance) window.speechSynthesis.speak(ttsUtterance)
  }, 100)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return
  window.speechSynthesis?.cancel()
  ttsUtterance = null
}

// ─────────────────────────────────────────────────────────────
// STT (SPEECH TO TEXT)
// ─────────────────────────────────────────────────────────────

let recognition: SpeechRecognition | null = null
let listenTimeout: ReturnType<typeof setTimeout> | null = null

export function startListening(config: VoiceEngineConfig): () => void {
  if (typeof window === 'undefined') return () => {}

  const SpeechRecognitionAPI =
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

  if (!SpeechRecognitionAPI) {
    console.warn('[VoiceEngine] SpeechRecognition not supported')
    config.onError?.('NOT_SUPPORTED')
    return () => {}
  }

  if (recognition) {
    try { recognition.stop() } catch (_e) { /* ignore */ }
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

  recognition = new SpeechRecognitionAPI()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = language
  recognition.maxAlternatives = 5

  onStateChange?.('LISTENING')

  recognition.onresult = (event: SpeechRecognitionEvent) => {
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
      onStateChange?.('SUCCESS')
      onResult?.({
        transcript: bestTranscript,
        confidence: bestConfidence,
        isFinal: true,
      })
    } else {
      onStateChange?.('FAILURE')
      onError?.('LOW_CONFIDENCE')
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    clearListenTimeout()
    console.warn('[VoiceEngine] STT error:', event.error)
    onStateChange?.('FAILURE')
    onError?.(event.error)
  }

  recognition.onend = () => {
    clearListenTimeout()
  }

  try {
    recognition.start()
  } catch (e) {
    console.warn('[VoiceEngine] Failed to start recognition:', e)
    onError?.('START_FAILED')
  }

  listenTimeout = setTimeout(() => {
    if (recognition) {
      try { recognition.stop() } catch (_e) { /* ignore */ }
      recognition = null
    }
    onStateChange?.('IDLE')
    onError?.('TIMEOUT')
  }, listenTimeoutMs)

  return () => {
    clearListenTimeout()
    if (recognition) {
      try { recognition.stop() } catch (_e) { /* ignore */ }
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
    try { recognition.stop() } catch (_e) { /* ignore */ }
    recognition = null
  }
}

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false
  const hasTTS = !!window.speechSynthesis
  const hasSTT = !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  )
  return hasTTS && hasSTT
}
