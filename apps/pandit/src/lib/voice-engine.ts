'use client'

import { sttEngine, type STTOptions } from './sarvamSTT'
import { deepgramEngine, type DeepgramSTTOptions } from './deepgramSTT'

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
  inputType?: 'mobile' | 'otp' | 'yes_no' | 'name' | 'text' | 'address' | 'date'
  isElderly?: boolean        // Use longer timeout for elderly users
  useSarvam?: boolean        // Force Sarvam STT (default: true if configured)
  onStateChange?: (state: VoiceState) => void
  onResult?: (result: VoiceResult) => void
  onError?: (error: string) => void
  onInterimResult?: (text: string) => void  // Real-time partial transcription
  onNoiseLevel?: (dbLevel: number) => void  // Ambient noise level callback
}

type BrowserSpeechRecognitionCtor = new () => any

type BrowserSpeechWindow = Window & typeof globalThis & {
  SpeechRecognition?: BrowserSpeechRecognitionCtor
  webkitSpeechRecognition?: BrowserSpeechRecognitionCtor
}

// SpeechRecognition type for TypeScript
interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start: () => void
  stop: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
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
// ARCH-009 FIX: Single source of truth for voice timeouts
// ─────────────────────────────────────────────────────────────
// BUG-001 FIX: Increased timeouts for elderly users (60% longer than industry standard)

export const VOICE_TIMEOUTS = {
  LISTEN: 20000,      // 20s for user to respond (elderly-friendly, was 15s)
  REPROMPT: 40000,    // 40s for reprompt (was 30s)
  MAX_ERRORS: 3,      // Max errors before keyboard fallback
} as const

// ─────────────────────────────────────────────────────────────
// AMBIENT NOISE DETECTION
// ─────────────────────────────────────────────────────────────

// CRITICAL: 65dB threshold per Tech Lead review
// Noise scale is 0-100 (linear mapping from RMS 0-80):
// - 0-20: Silence/very quiet (RMS 0-5)
// - 20-40: Normal room/quiet office (RMS 5-15)
// - 40-60: Moderate noise/conversation (RMS 15-30)
// - 60-65: Elevated noise (suggest keyboard in temple environment)
// - 65+: Very loud - triggers keyboard fallback (temple bells, heavy traffic, crowds)
export const AMBIENT_NOISE_THRESHOLD_DB = 65

let audioContext: AudioContext | null = null
let noiseAnalyser: AnalyserNode | null = null
let noiseSource: MediaStreamAudioSourceNode | null = null
let noiseStream: MediaStream | null = null
let noiseCheckInterval: ReturnType<typeof setInterval> | null = null
let calibrationTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Start monitoring ambient noise level using Web Audio API.
 * Returns cleanup function to stop monitoring.
 *
 * BUG-MEDIUM-04 FIX: Extended calibration period to 5 seconds with smoothing
 * to prevent false-triggering from audio context initialization pop or device-specific baseline.
 * Uses rolling average over 10 samples (5 seconds) before triggering onNoiseHigh.
 */
export function startAmbientNoiseMonitoring(
  onNoiseHigh: (level: number) => void,
  onNoiseNormal: () => void
): () => void {
  if (typeof window === 'undefined') return () => { }

  try {
    // Create audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    noiseAnalyser = audioContext.createAnalyser()
    noiseAnalyser.fftSize = 512
    noiseAnalyser.smoothingTimeConstant = 0.8

    // BUG-MEDIUM-04 FIX: Extended calibration period - ignore first 5 seconds of measurements
    // This prevents false positives from audio context initialization pop and device warm-up
    let calibrationComplete = false
    calibrationTimeout = setTimeout(() => {
      calibrationComplete = true
    }, 5000)

    // BUG-MEDIUM-04 FIX: Rolling average buffer to smooth out spurious spikes
    const noiseBuffer: number[] = []
    const BUFFER_SIZE = 10 // Average over 10 samples (5 seconds at 500ms intervals)

    // Request mic access for noise monitoring
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        noiseStream = stream
        noiseSource = audioContext!.createMediaStreamSource(stream)
        noiseSource.connect(noiseAnalyser!)

        const dataArray = new Uint8Array(noiseAnalyser!.frequencyBinCount)

        noiseCheckInterval = setInterval(() => {
          if (!noiseAnalyser) return

          noiseAnalyser.getByteFrequencyData(dataArray)

          // Calculate average volume (RMS approximation)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i]
          }
          const rms = Math.sqrt(sum / dataArray.length)

          // BUG-MEDIUM-04 FIX: Calibrated dB calculation using proper reference level
          // Web Audio analyser returns 0-255 values. Typical readings:
          // - Silence/very quiet: RMS 0-5 (0-20 on our scale)
          // - Normal room/quiet office: RMS 5-15 (20-40 on our scale)
          // - Moderate noise/conversation: RMS 15-30 (40-60 on our scale)
          // - Loud environment: RMS 30-50 (60-75 on our scale)
          // - Very loud (temple bells, traffic): RMS 50-80 (75-90 on our scale)
          // - Clipping/distortion: RMS 80+ (90-100 on our scale)
          //
          // Using linear mapping: RMS 0-80 -> noiseLevel 0-100
          // Threshold of 85 means RMS ~68+, which is genuinely loud (temple bells, heavy traffic)
          let noiseLevel = 0
          if (rms > 0) {
            // Linear mapping: RMS 0-80 maps to 0-100
            // RMS of 68+ (threshold 85) is very loud environment
            noiseLevel = Math.min(100, Math.max(0, (rms / 80) * 100))
          }

          // Update store with current noise level
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useVoiceStore } = require('@/stores/voiceStore')
            useVoiceStore.getState().setAmbientNoise(Math.round(noiseLevel))
          } catch (error) {
            console.warn('[VoiceEngine] Failed to update voice store:', error);
            /* Store not available */
          }

          // BUG-MEDIUM-04 FIX: Rolling average to prevent false triggers from spurious spikes
          noiseBuffer.push(noiseLevel)
          if (noiseBuffer.length > BUFFER_SIZE) {
            noiseBuffer.shift()
          }

          // Only trigger onNoiseHigh after calibration AND with sustained high noise
          if (calibrationComplete && noiseBuffer.length === BUFFER_SIZE) {
            const avgNoise = noiseBuffer.reduce((a, b) => a + b, 0) / BUFFER_SIZE
            if (avgNoise > AMBIENT_NOISE_THRESHOLD_DB) {
              onNoiseHigh(Math.round(avgNoise))
            } else {
              onNoiseNormal()
            }
          }
        }, 500)  // Check every 500ms
      })
      .catch((err) => {
        console.warn('[VoiceEngine] Cannot access mic for noise monitoring:', err)
      })
  } catch (err) {
    console.warn('[VoiceEngine] Noise monitoring setup failed:', err)
  }

  return () => {
    if (calibrationTimeout) {
      clearTimeout(calibrationTimeout)
      calibrationTimeout = null
    }
    stopAmbientNoiseMonitoring()
  }
}

export function stopAmbientNoiseMonitoring(): void {
  if (noiseCheckInterval) {
    clearInterval(noiseCheckInterval)
    noiseCheckInterval = null
  }

  if (noiseSource) {
    noiseSource.disconnect()
    noiseSource = null
  }

  if (noiseStream) {
    noiseStream.getTracks().forEach(track => track.stop())
    noiseStream = null
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }

  noiseAnalyser = null
}

export function getCurrentNoiseLevel(): number {
  if (typeof window === 'undefined') return 0
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAmbientNoiseLevel } = require('@/stores/voiceStore')
    return getAmbientNoiseLevel()
  } catch {
    return 0
  }
}

// ─────────────────────────────────────────────────────────────
// INTENT → WORD MAP (Fuzzy matching for voice commands)
// ─────────────────────────────────────────────────────────────
// Enhanced with 100+ keyword variants including:
// - Regional variants (Bhojpuri, Maithili)
// - Common misspellings/transliterations
// - Hinglish variants
// - Elderly speech patterns (slower, more formal)
// ─────────────────────────────────────────────────────────────

type VoiceIntent = 'YES' | 'NO' | 'SKIP' | 'HELP' | 'CHANGE' | 'FORWARD' | 'BACK'

// Enhanced with 100+ keyword variants including:
// - Regional variants (Bhojpuri, Maithili, Tamil, Telugu, Bengali, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia)
// - Common misspellings/transliterations
// - Hinglish variants
// - Elderly speech patterns (slower, more formal)
export const INTENT_WORD_MAP: Record<VoiceIntent, string[]> = {
  YES: [
    // Standard Hindi
    'haan', 'ha', 'haanji', 'theek', 'sahi', 'bilkul', 'kar lo', 'de do',
    'ok', 'okay', 'yes', 'correct', 'accha', 'thik', 'haan ji', 'zaroor',
    'bilkul theek', 'haan haan', 'shi hai',
    // Bhojpuri variants
    'ho', 'hau', 'haan ho', 'hau ji', 'ho ji',
    // Maithili variants
    'hain', 'hain ji',
    // Tamil variants
    'aam', 'aama', 'seri', 'sari', 'thaan', 'um',
    // Telugu variants
    'avunu', 'ou', 'sari', 'saripoindi',
    // Bengali variants
    'haan', 'hyan', 'ji', 'thik', 'thik ache',
    // Kannada variants
    'haudu', 'sari', 'sariyagide', 'houdu',
    // Malayalam variants
    'athe', 'shari', 'venam', 'mathi',
    // Marathi variants
    'ho', 'hoy', 'thik', 'thika', 'barobar',
    // Gujarati variants
    'ha', 'haji', 'thik', 'saru', 'barobar',
    // Punjabi variants
    'haan', 'ji', 'theek', 'sahi',
    // Odia variants
    'haan', 'hau', 'thik', 'thik achhi',
    // Common misspellings/transliterations
    'han', 'haa', 'hann', 'theak', 'thik', 'sahi hai', 'sahii',
    // Elderly formal speech
    'ji haan', 'haan sahab', 'bilkul ji', 'zaroor ji', 'kyun nahi',
    // Hinglish
    'yes sir', 'yes ji', 'correct hai', 'sahi hai ji',
    // Phrases
    'bilkul sahi', 'bilkul kar lo', 'theek hai ji', 'haan bilkul',
  ],
  NO: [
    // Standard Hindi
    'nahi', 'naa', 'na', 'mat', 'mat karo', 'no', 'galat', 'nahi chahiye',
    'nahi karna', 'nahi ji',
    // Bhojpuri variants
    'naa ji', 'nahi ho', 'naa ho',
    // Maithili variants
    'nain', 'nain ji',
    // Tamil variants
    'illa', 'illai', 'venam', 'koodathu',
    // Telugu variants
    'ledu', 'vaddu', 'vachu', 'kadu',
    // Bengali variants
    'na', 'noy', 'nah', 'thik nei',
    // Kannada variants
    'illa', 'alla', 'beda', 'barodilla',
    // Malayalam variants
    'illa', 'alla', 'venam', 'mathi',
    // Marathi variants
    'nako', 'nahi', 'naye', 'navhe',
    // Gujarati variants
    'na', 'nathi', 'nahi', 'thik nathi',
    // Punjabi variants
    'na', 'nahi', 'nahi', 'mat',
    // Odia variants
    'na', 'nahin', 'nahun', 'thik nahun',
    // Common misspellings/transliterations
    'nahin', 'na', 'mat karo', 'galat hai', 'nahi hai',
    // Elderly formal speech
    'mat kijiye', 'nahi sahab', 'ji nahi', 'maaf kijiye nahi',
    // Hinglish
    'no sir', 'no ji', 'galat hai ji', 'nahi chahiye ji',
    // Phrases
    'bilkul nahi', 'nahi bilkul', 'galat bilkul',
  ],
  SKIP: [
    // Standard Hindi
    'skip', 'skip karo', 'chodo', 'chhor do', 'aage jao', 'registration',
    'baad mein', 'baad me', 'later', 'abhi nahi', 'seedha chalo',
    // Bhojpuri variants
    'chhod de', 'rehne de', 'baad me dekhbo',
    // Tamil variants
    'vidu', 'viduvidu', 'pinnadi', 'appuram',
    // Telugu variants
    'vaddey', 'reyi', 'tharvatha', 'appudu',
    // Bengali variants
    'charo', 'chere dao', 'pore', 'porer',
    // Kannada variants
    'bittu', 'bittubidu', 'nantara', 'mel',
    // Malayalam variants
    'mathi', 'porra', 'pinnittu', 'pinne',
    // Marathi variants
    'sod', 'sodun de', 'nantar', 'nantarcha',
    // Gujarati variants
    'chod', 'chodi de', 'pachi', 'pachhi',
    // Punjabi variants
    'chad', 'chad de', 'baad', 'baad vich',
    // Odia variants
    'chhad', 'chhadi de', 'pachhi', 'pachhara',
    // Common misspellings/transliterations
    'chhodo', 'chor do', 'chod do', 'baad mein', 'baad me',
    // Elderly formal speech
    'rehne do ji', 'baad mein dekhte hain', 'abhi mat kijiye',
    // Hinglish
    'skip please', 'skip kar do', 'later please',
    // Phrases
    'seedha registration', 'seedha aage', 'isko chhod ke',
  ],
  HELP: [
    // Standard Hindi
    'sahayata', 'madad', 'help', 'samajh nahi', 'samajha nahi', 'dikkat',
    'problem', 'mushkil', 'nahi samajha', 'mujhe madad chahiye',
    // Bhojpuri variants
    'madad chahi', 'samjhai na', 'kaise karein',
    // Tamil variants
    'udhavi', 'vilakkam', 'purila', 'therila',
    // Telugu variants
    'sahayam', 'sahayam kavali', 'ardham kaledu', 'teliyadam',
    // Bengali variants
    'sahayata', 'madhyam', 'bujhte parchi', 'bujhini',
    // Kannada variants
    'sahaya', 'sahayatake', 'gothilla', 'artha aagilla',
    // Malayalam variants
    'sahayam', 'sahayam venam', 'manassilayilla', 'ariyilla',
    // Marathi variants
    'madat', 'sahayya', 'samjat nahi', 'kase kara',
    // Gujarati variants
    'madad', 'sahay', 'samjato nathi', 'kari',
    // Punjabi variants
    'madad', 'sahayata', 'samajh nahi', 'kivein kara',
    // Odia variants
    'sahayata', 'madhyama', 'bujhiparini', 'kaise karibi',
    // Common misspellings/transliterations
    'sahayta', 'madat', 'samajh nhi', 'samjha nhi', 'dikkt',
    // Elderly formal speech
    'madad kijiye', 'sahayata karein', 'kripya batayein', 'margdarshan chahiye',
    // Hinglish
    'help please', 'help chahiye', 'problem ho rahi',
    // Phrases
    'kuch samajh nahi aa raha', 'kaise karna hai', 'madad kar do',
  ],
  CHANGE: [
    // Standard Hindi
    'badle', 'badlo', 'change', 'doosri', 'alag', 'koi aur', 'doosra',
    'change karo', 'nahi yeh', 'kuch aur',
    // Bhojpuri variants
    'badal de', 'aur dekhao', 'koi aur dekhbo',
    // Tamil variants
    'maathu', 'maathividu', 'vere', 'innum onnu',
    // Telugu variants
    'marachu', 'marukku', 'vere', 'inko onnu',
    // Bengali variants
    'badal', 'badal dao', 'onno', 'ar onno',
    // Kannada variants
    'badal', 'badalidu', 'bere', 'innondu',
    // Malayalam variants
    'maathu', 'maathanam', 'vere', 'innum onnu',
    // Marathi variants
    'badal', 'badalun de', 'dusra', 'kahi tari',
    // Gujarati variants
    'badal', 'badali de', 'bijo', 'kai biju',
    // Punjabi variants
    'badal', 'badal de', 'doja', 'kuj hor',
    // Odia variants
    'badal', 'badali de', 'are', 'aru kichi',
    // Common misspellings/transliterations
    'badlo', 'badal do', 'doosra', 'alag se',
    // Elderly formal speech
    'badal dijiye', 'koi aur dikhayein', 'yeh nahi chahiye',
    // Hinglish
    'change please', 'change kar do', 'other dikhao',
    // Phrases
    'yeh galat hai', 'aur dikhao', 'kuch aur dikhao', 'badal ke dikhao',
  ],
  FORWARD: [
    // Standard Hindi
    'aage', 'agla', 'next', 'continue', 'samajh gaya', 'theek hai',
    'aage chalein', 'jaari rakhein', 'dekhein', 'show karo',
    // Bhojpuri variants
    'aage badho', 'agla dekhbo', 'chaloo rakho',
    // Tamil variants
    'munnadi', 'adutha', 'thodar', 'purinjudhu',
    // Telugu variants
    'mundu', 'tharvatha', 'tharu', 'ardhamaindi',
    // Bengali variants
    'aage', 'porer', 'thik ache', 'bujhte perechi',
    // Kannada variants
    'munde', 'mudde', 'tharu', 'goththu',
    // Malayalam variants
    'munnottu', 'adutha', 'thudaruka', 'manassilayi',
    // Marathi variants
    'puddhe', 'puddhcha', 'thik', 'samjla',
    // Gujarati variants
    'aage', 'aaglun', 'thik', 'samjayu',
    // Punjabi variants
    'agge', 'agla', 'thik', 'samajh gaya',
    // Odia variants
    'aage', 'agala', 'thik', 'bujhiparili',
    // Common misspellings/transliterations
    'aage', 'agla', 'next', 'continue', 'samajh gaya', 'samajh gya',
    // Elderly formal speech
    'aage badhayein', 'dikhaiye', 'sunaiye', 'batayein', 'aage ki baat',
    // Hinglish
    'next please', 'continue karo', 'aage dikhao', 'next screen',
    // Phrases
    'samajh gaya aage', 'theek hai aage', 'aur dikhao', 'aur batao',
  ],
  BACK: [
    // Standard Hindi
    'pichhe', 'wapas', 'pehle wala', 'back', 'previous', 'wapas jao',
    'pichle screen',
    // Bhojpuri variants
    'peeche', 'wapas lao', 'pehle dekhbo',
    // Tamil variants
    'pin', 'pinbu', 'munnadi', 'thirumba',
    // Telugu variants
    'venakki', 'mundu', 'thirigi', 'malli',
    // Bengali variants
    'pichone', 'pichhe', 'aage', 'abari',
    // Kannada variants
    'hinde', 'hindeke', 'munde', 'malli',
    // Malayalam variants
    'pin', 'pinil', 'munnottu', 'thirichum',
    // Marathi variants
    'maghe', 'maghcha', 'pudhcha', 'parat',
    // Gujarati variants
    'pachhu', 'pachhun', 'aage', 'pachu',
    // Punjabi variants
    'piche', 'pichla', 'agge', 'muran',
    // Odia variants
    'pachhi', 'pachhara', 'aage', 'punar',
    // Common misspellings/transliterations
    'piche', 'wapas', 'pehla wala', 'back', 'previous',
    // Elderly formal speech
    'peeche le chaliye', 'purana dikhayein', 'wapas le chalo',
    // Hinglish
    'back please', 'back jao', 'previous screen', 'back screen',
    // Phrases
    'peeche wala screen', 'wapas le jao', 'pehle wala dikhao',
  ],
}

// Confidence scoring interface
export interface IntentResult {
  intent: VoiceIntent
  confidence: number  // 0-1
  matchedWords: string[]
  allScores: Record<VoiceIntent, number>
}

/**
 * Detect intent with confidence scoring
 * Returns intent with confidence level and matched words
 *
 * Confidence calculation:
 * - Number of matched words (0.3 weight)
 * - Position in transcript - earlier = higher confidence (0.3 weight)
 * - Exact phrase match vs single word (0.4 weight)
 */
export function detectIntentWithConfidence(transcript: string): IntentResult {
  const normalized = transcript.toLowerCase().trim()
  const words = normalized.split(/\s+/)

  const scores: Record<VoiceIntent, number> = {
    YES: 0,
    NO: 0,
    SKIP: 0,
    HELP: 0,
    CHANGE: 0,
    FORWARD: 0,
    BACK: 0,
  }

  const matchedWordsMap: Record<VoiceIntent, string[]> = {
    YES: [],
    NO: [],
    SKIP: [],
    HELP: [],
    CHANGE: [],
    FORWARD: [],
    BACK: [],
  }

  for (const [intent, intentWords] of Object.entries(INTENT_WORD_MAP)) {
    let score = 0
    const matchedWords: string[] = []

    for (const word of intentWords) {
      // Use word boundary regex for exact matching
      const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i')

      if (wordBoundaryRegex.test(normalized)) {
        matchedWords.push(word)

        // Base score for match
        score += 1

        // Position bonus - earlier words have higher confidence
        const wordIndex = words.findIndex(w => wordBoundaryRegex.test(w))
        if (wordIndex !== -1) {
          // First 3 words get bonus
          if (wordIndex < 3) {
            score += 0.5
          } else if (wordIndex < 5) {
            score += 0.25
          }
        }

        // Exact phrase match bonus (multi-word phrases)
        if (word.includes(' ')) {
          score += 2 // Extra weight for exact phrase match
        }
      }
    }

    // Normalize score to 0-1 range
    // Max expected score: ~10 matches with position bonuses
    const normalizedScore = Math.min(1, score / 10)
    scores[intent as VoiceIntent] = parseFloat(normalizedScore.toFixed(2))
    matchedWordsMap[intent as VoiceIntent] = matchedWords
  }

  // Find best intent
  let bestIntent: VoiceIntent | null = null
  let bestScore = 0

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent as VoiceIntent
    }
  }

  // Only return intent if confidence is above threshold (0.15)
  // This prevents false positives from weak matches
  const confidenceThreshold = 0.15
  if (bestScore >= confidenceThreshold && bestIntent) {
    return {
      intent: bestIntent,
      confidence: bestScore,
      matchedWords: matchedWordsMap[bestIntent],
      allScores: scores,
    }
  }

  return {
    intent: 'FORWARD' as VoiceIntent, // Default fallback
    confidence: 0,
    matchedWords: [],
    allScores: scores,
  }
}

// ARCH-011 FIX: Use word boundary matching + scoring to prevent false positives
// Backwards compatible wrapper - returns just the intent
export function detectIntent(transcript: string): VoiceIntent | null {
  const result = detectIntentWithConfidence(transcript)

  // Return intent only if confidence is above threshold
  return result.confidence >= 0.15 ? result.intent : null
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
  // P1 FIX: Removed console.log for production
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

let recognition: SpeechRecognitionLike | null = null
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
    try { recognition.stop() } catch (error) { console.warn('[VoiceEngine] recognition.stop() failed:', error); /* noop */ }
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

  const rec = new SpeechRecognition() as unknown as SpeechRecognitionLike
  recognition = rec

  rec.continuous = false
  rec.interimResults = false
  rec.lang = language
  rec.maxAlternatives = 5

  setGlobalVoiceState('LISTENING')
  onStateChange?.('LISTENING')

  rec.onresult = (event: any) => {
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

  rec.onerror = (event: any) => {
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
      try { recognition.stop() } catch (error) { console.warn('[VoiceEngine] recognition.stop() in timeout failed:', error); /* noop */ }
      recognition = null
    }
    setGlobalVoiceState('IDLE')
    onStateChange?.('IDLE')
    onError?.('TIMEOUT')
  }, listenTimeoutMs)

  return () => {
    clearListenTimeout()
    if (recognition) {
      try { recognition.stop() } catch (error) { console.warn('[VoiceEngine] recognition.stop() in cleanup failed:', error); /* noop */ }
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
    try { recognition.stop() } catch (error) { console.warn('[VoiceEngine] recognition.stop() in stopListening failed:', error); /* noop */ }
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

// ─────────────────────────────────────────────────────────────
// SARVAM AI STT INTEGRATION (Enterprise-grade)
// Uses Sarvam AI WebSocket streaming for Indian language support
// Falls back to Web Speech API if Sarvam is not configured
// ─────────────────────────────────────────────────────────────

let sarvamCleanup: (() => void) | null = null

/**
 * Start listening using Sarvam AI STT (preferred) or Web Speech API (fallback)
 * This is the main entry point for voice input with enterprise-grade reliability
 */
export function startListeningWithSarvam(config: VoiceEngineConfig): () => void {
  if (typeof window === 'undefined') return () => { }

  const {
    language = 'hi-IN',
    inputType = 'text',
    isElderly = false,
    useSarvam = true,
    confidenceThreshold = 0.65,
    onStateChange,
    onResult,
    onError,
    onInterimResult,
    onNoiseLevel,
  } = config

  // Check if Sarvam should be used (and is available)
  const shouldUseSarvam = useSarvam && typeof window !== 'undefined'; // Use Sarvam if requested (backend will validate)

  if (!shouldUseSarvam) {
    // Fall back to Web Speech API
    console.log('[VoiceEngine] Using Web Speech API fallback')
    return startListening(config)
  }

  // Use Sarvam AI STT
  console.log('[VoiceEngine] Using Sarvam AI STT with language:', language, 'inputType:', inputType)

  if (!sttEngine) {
    console.warn('[VoiceEngine] Sarvam STT engine not initialized, falling back to Web Speech API')
    return startListening(config)
  }

  // Convert VoiceEngineConfig to STTOptions
  const sttOptions: STTOptions = {
    language,
    inputType,
    isElderly,
    onInterimResult: (text: string) => {
      onInterimResult?.(text)
    },
    onFinalResult: (transcript: string, confidence: number) => {
      setGlobalVoiceState('PROCESSING')
      onStateChange?.('PROCESSING')

      // Normalize confidence to 0-1 scale
      const normalizedConfidence = Math.min(1, Math.max(0, confidence))

      if (normalizedConfidence >= confidenceThreshold) {
        setGlobalVoiceState('SUCCESS')
        onStateChange?.('SUCCESS')
        onResult?.({
          transcript,
          confidence: normalizedConfidence,
          isFinal: true,
        })
      } else {
        setGlobalVoiceState('FAILURE')
        onStateChange?.('FAILURE')
        onError?.('LOW_CONFIDENCE')
      }
    },
    onSilenceDetected: () => {
      setGlobalVoiceState('IDLE')
      onStateChange?.('IDLE')
      onError?.('SILENCE_TIMEOUT')
    },
    onError: (error: string) => {
      console.warn('[VoiceEngine] Sarvam STT error:', error)
      setGlobalVoiceState('FAILURE')
      onStateChange?.('FAILURE')

      // Handle error cascade (3 errors -> keyboard fallback)
      if (error === 'keyboard_fallback') {
        onError?.('KEYBOARD_FALLBACK')
      } else {
        onError?.(error)
      }
    },
    onNoiseLevel: (dbLevel: number) => {
      onNoiseLevel?.(dbLevel)

      // BUG-MEDIUM-04 FIX: Raised threshold from 65dB to 85dB to prevent false-triggering
      // 65dB is normal conversation level - should NOT trigger warning
      // 85dB+ is genuinely loud (temple bells, heavy traffic, crowds)
      if (dbLevel > AMBIENT_NOISE_THRESHOLD_DB) {
        setGlobalVoiceState('NOISE_WARNING')
        onStateChange?.('NOISE_WARNING')
      }
    },
  }

  // Start Sarvam STT
  setGlobalVoiceState('LISTENING')
  onStateChange?.('LISTENING')

  sttEngine.startListening(sttOptions).catch((err: any) => {
    console.error('[VoiceEngine] Sarvam STT start failed:', err)
    setGlobalVoiceState('FAILURE')
    onStateChange?.('FAILURE')
    onError?.(err.message || 'STT_START_FAILED')

    // Auto-fallback to Web Speech API
    console.log('[VoiceEngine] Falling back to Web Speech API')
    return startListening(config)
  })

  // Return cleanup function
  return () => {
    if (sarvamCleanup) {
      sarvamCleanup()
      sarvamCleanup = null
    }
    sttEngine?.stopListening()
  }
}

/**
 * Check if Sarvam AI is configured and available
 */
export function isSarvamAvailable(): boolean {
  return !!(typeof window !== 'undefined' && sttEngine)
}

/**
 * Check if Deepgram AI is configured and available
 */
export function isDeepgramAvailable(): boolean {
  return !!(typeof window !== 'undefined' && deepgramEngine)
}

/**
 * Get STT engine based on language and availability
 * Routing logic:
 * - Hindi + Deepgram available → Deepgram Nova-3 (better latency for common languages)
 * - Regional languages (Tamil, Bengali, etc.) → Sarvam
 * - Deepgram fails → fallback to Sarvam
 * - Both fail → Web Speech API (last resort)
 */
export function getSTTEngine(language: string): 'sarvam' | 'deepgram' {
  const lang = language.toLowerCase()

  // Sarvam excels at regional Indian languages
  const sarvamLanguages = [
    'bhojpuri', 'maithili', 'bengali', 'bangla', 'tamil', 'telugu',
    'kannada', 'malayalam', 'marathi', 'gujarati', 'odia', 'punjabi',
    'assamese', 'sanskrit'
  ]

  if (sarvamLanguages.some(l => lang.includes(l))) {
    return 'sarvam'
  }

  // For Hindi and English, prefer Deepgram Nova-3 if available (better latency)
  if ((lang.includes('hindi') || lang.includes('hi-') || lang.includes('english') || lang.includes('en-')) && isDeepgramAvailable()) {
    return 'deepgram'
  }

  // Default to Sarvam for Indian users (better accent handling)
  return 'sarvam'
}

/**
 * Start listening with unified voice engine (Deepgram → Sarvam → Web Speech fallback chain)
 */
export function startListeningWithFallback(config: VoiceEngineConfig): () => void {
  if (typeof window === 'undefined') return () => { }

  const {
    language = 'hi-IN',
    inputType = 'text',
    isElderly = false,
    confidenceThreshold = 0.65,
    onStateChange,
    onResult,
    onError,
    onInterimResult,
    onNoiseLevel,
  } = config

  // Determine which engine to use
  const preferredEngine = getSTTEngine(language)
  console.log('[VoiceEngine] Preferred STT engine:', preferredEngine, 'for language:', language)

  let fallbackAttempted = false

  // Try preferred engine first
  const tryStartListening = (engineType: 'deepgram' | 'sarvam'): (() => void) => {
    const commonOptions = {
      language,
      inputType,
      isElderly,
      onInterimResult,
      onNoiseLevel,
      onFinalResult: (transcript: string, confidence: number) => {
        setGlobalVoiceState('PROCESSING')
        onStateChange?.('PROCESSING')

        const normalizedConfidence = Math.min(1, Math.max(0, confidence))

        if (normalizedConfidence >= confidenceThreshold) {
          setGlobalVoiceState('SUCCESS')
          onStateChange?.('SUCCESS')
          onResult?.({
            transcript,
            confidence: normalizedConfidence,
            isFinal: true,
          })
        } else {
          setGlobalVoiceState('FAILURE')
          onStateChange?.('FAILURE')
          onError?.('LOW_CONFIDENCE')
        }
      },
      onSilenceDetected: () => {
        setGlobalVoiceState('IDLE')
        onStateChange?.('IDLE')
        onError?.('SILENCE_TIMEOUT')
      },
      onError: (error: string) => {
        console.warn(`[VoiceEngine] ${engineType.toUpperCase()} STT error:`, error)

        if (error === 'keyboard_fallback') {
          onError?.('KEYBOARD_FALLBACK')
          return
        }

        // Try fallback if not already attempted
        if (!fallbackAttempted) {
          fallbackAttempted = true
          const fallbackEngine = engineType === 'deepgram' ? 'sarvam' : 'deepgram'
          const isFallbackAvailable = fallbackEngine === 'deepgram' ? isDeepgramAvailable() : isSarvamAvailable()

          if (isFallbackAvailable) {
            console.log(`[VoiceEngine] Falling back to ${fallbackEngine.toUpperCase()}`)
            tryStartListening(fallbackEngine)
            return
          }
        }

        // Both engines failed - fall back to Web Speech API
        setGlobalVoiceState('FAILURE')
        onStateChange?.('FAILURE')
        console.log('[VoiceEngine] Falling back to Web Speech API')
        startListening(config)
      },
    }

    setGlobalVoiceState('LISTENING')
    onStateChange?.('LISTENING')

    if (engineType === 'deepgram' && deepgramEngine) {
      deepgramEngine.startListening(commonOptions).catch((err: any) => {
        console.error('[VoiceEngine] Deepgram STT start failed:', err)
        commonOptions.onError(err.message || 'STT_START_FAILED')
      })

      return () => {
        deepgramEngine?.stopListening()
      }
    } else if (engineType === 'sarvam' && sttEngine) {
      sttEngine.startListening(commonOptions).catch((err: any) => {
        console.error('[VoiceEngine] Sarvam STT start failed:', err)
        commonOptions.onError(err.message || 'STT_START_FAILED')
      })

      return () => {
        sttEngine?.stopListening()
      }
    } else {
      // Engine not available - try fallback
      commonOptions.onError('ENGINE_NOT_AVAILABLE')
      return () => { }
    }
  }

  return tryStartListening(preferredEngine)
}

/**
 * Get current error count from Sarvam engine (for cascade logic)
 */
export function getSarvamErrorCount(): number {
  return sttEngine?.getErrorCount() || 0
}

/**
 * Reset Sarvam error count (call after successful recognition)
 */
export function resetSarvamErrors(): void {
  sttEngine?.resetErrorCount()
}

/**
 * Get current ambient noise level from Sarvam engine
 */
export function getSarvamNoiseLevel(): number {
  return sttEngine?.getCurrentNoiseLevel() || 0
}

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false
  const speechWindow = window as BrowserSpeechWindow
  const hasTTS = !!window.speechSynthesis
  const hasSTT = !!(
    speechWindow.SpeechRecognition ||
    speechWindow.webkitSpeechRecognition
  )
  const hasSarvam = isSarvamAvailable()

  // If Sarvam is available, we have enterprise-grade STT
  // Otherwise, fall back to browser Web Speech API
  return hasTTS && (hasSarvam || hasSTT)
}

// ─────────────────────────────────────────────────────────────
// HAPTIC FEEDBACK
// ─────────────────────────────────────────────────────────────

export type HapticPattern = 'success' | 'error' | 'warning' | 'voice-detected' | 'listening-start'

/**
 * Trigger haptic feedback for voice states
 * Uses navigator.vibrate API for Android devices
 *
 * Patterns:
 * - success: [50, 100, 50] - Short double tap
 * - error: [200, 100, 200] - Long double tap
 * - warning: [100, 50, 100] - Medium double tap
 * - voice-detected: [30] - Short single tap
 * - listening-start: [50] - Medium single tap
 */
export function triggerHaptic(pattern: HapticPattern): void {
  if (typeof window === 'undefined' || !navigator.vibrate) {
    return // Haptics not supported
  }

  try {
    const patterns: Record<HapticPattern, number | number[]> = {
      'success': [50, 100, 50],      // Short double tap for successful recognition
      'error': [200, 100, 200],      // Long double tap for errors
      'warning': [100, 50, 100],     // Medium double tap for warnings
      'voice-detected': [30],        // Short single tap when voice detected
      'listening-start': [50],       // Medium single tap when listening starts
    }

    navigator.vibrate(patterns[pattern])
  } catch (err) {
    console.warn('[VoiceEngine] Haptic feedback failed:', err)
  }
}

/**
 * Trigger success haptic when voice recognition succeeds
 */
export function triggerSuccessHaptic(): void {
  triggerHaptic('success')
}

/**
 * Trigger error haptic when voice recognition fails
 */
export function triggerErrorHaptic(): void {
  triggerHaptic('error')
}

/**
 * Trigger warning haptic for high noise or low confidence
 */
export function triggerWarningHaptic(): void {
  triggerHaptic('warning')
}

/**
 * Trigger voice detected haptic when user starts speaking
 */
export function triggerVoiceDetectedHaptic(): void {
  triggerHaptic('voice-detected')
}

/**
 * Trigger listening start haptic when microphone opens
 */
export function triggerListeningStartHaptic(): void {
  triggerHaptic('listening-start')
}
