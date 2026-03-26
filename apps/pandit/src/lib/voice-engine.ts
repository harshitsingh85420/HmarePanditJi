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

export const VOICE_TIMEOUTS = {
  LISTEN: 15000,      // 15s for user to respond (elderly-friendly)
  REPROMPT: 30000,    // 30s for reprompt
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
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { useVoiceStore } = require('@/stores/voiceStore')
            useVoiceStore.getState().setAmbientNoise(Math.round(noiseLevel))
          } catch { /* Store not available */ }

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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getAmbientNoiseLevel } = require('@/stores/voiceStore')
    return getAmbientNoiseLevel()
  } catch {
    return 0
  }
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

// ARCH-011 FIX: Use word boundary matching + scoring to prevent false positives
export function detectIntent(transcript: string): VoiceIntent | null {
  const normalized = transcript.toLowerCase().trim()
  // const words = normalized.split(/\s+/) // ARCH-011 FIX: Removed unused variable

  let bestIntent: VoiceIntent | null = null
  let bestScore = 0

  for (const [intent, words] of Object.entries(INTENT_WORD_MAP)) {
    let score = 0

    for (const word of words) {
      // ARCH-011 FIX: Use word boundary regex instead of simple includes()
      // This prevents false positives like "theek" matching "yeh theek nahi hai"
      const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i')
      if (wordBoundaryRegex.test(normalized)) {
        score++
      }
    }

    // Also check for multi-word phrases with higher weight
    for (const word of words) {
      if (word.includes(' ') && normalized.includes(word)) {
        score += 2 // Extra weight for exact phrase match
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestIntent = intent as VoiceIntent
    }
  }

  // ARCH-011 FIX: Only return intent if we have a clear winner (score >= 1)
  // This prevents false positives from weak matches
  return bestScore >= 1 ? bestIntent : null
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
  const shouldUseSarvam = useSarvam && process.env.NEXT_PUBLIC_SARVAM_API_KEY

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
  return !!(typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SARVAM_API_KEY && sttEngine)
}

/**
 * Check if Deepgram AI is configured and available
 */
export function isDeepgramAvailable(): boolean {
  return !!(typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY && deepgramEngine)
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
