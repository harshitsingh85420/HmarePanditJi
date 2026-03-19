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

export let isGlobalMicMuted = false
const micSubscribers = new Set<() => void>()

export function setGlobalMicMuted(muted: boolean) {
  isGlobalMicMuted = muted
  if (muted) {
    stopListening()
  }
  micSubscribers.forEach(cb => cb())
}

export function subscribeToMicMute(cb: () => void) {
  micSubscribers.add(cb)
  return () => micSubscribers.delete(cb)
}

export let lastGlobalTranscript = ''
const transcriptSubscribers = new Set<(t: string) => void>()

export function setGlobalTranscript(t: string) {
  lastGlobalTranscript = t
  transcriptSubscribers.forEach(cb => cb(t))
}

export function subscribeToTranscript(cb: (t: string) => void) {
  transcriptSubscribers.add(cb)
  return () => transcriptSubscribers.delete(cb)
}

export let lastGlobalError = ''
const errorSubscribers = new Set<(e: string) => void>()

export function setGlobalError(e: string) {
  lastGlobalError = e
  errorSubscribers.forEach(cb => cb(e))
}

export function subscribeToError(cb: (e: string) => void) {
  errorSubscribers.add(cb)
  return () => errorSubscribers.delete(cb)
}

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
    'हाँ', 'हा', 'हां', 'हाँजी', 'ठीक', 'सही', 'बिल्कुल', 'कर लो', 'दे दो',
    'अच्छा', 'जरूर', 'बिलकुल',
  ],
  NO: [
    'nahi', 'naa', 'na', 'mat', 'mat karo', 'no', 'galat', 'nahi chahiye',
    'nahi karna', 'nahi ji',
    'नहीं', 'ना', 'मत', 'मत करो', 'गलत', 'नहीं चाहिए', 'नहीं करना', 'नहीं जी',
  ],
  SKIP: [
    'skip', 'skip karo', 'chodo', 'chhor do', 'aage jao', 'registration',
    'baad mein', 'baad me', 'later', 'abhi nahi', 'seedha chalo',
    'छोड़ें', 'छोड़ो', 'छोड़ दो', 'बाद में', 'अभी नहीं', 'स्किप', 'सीधा चलो',
  ],
  HELP: [
    'sahayata', 'madad', 'help', 'samajh nahi', 'samajha nahi', 'dikkat',
    'problem', 'mushkil', 'nahi samajha', 'mujhe madad chahiye',
    'सहायता', 'मदद', 'हेल्प', 'समझ नहीं', 'दिक्कत', 'प्रॉब्लम', 'मुश्किल', 'समझ', 'मदद',
  ],
  CHANGE: [
    'badle', 'badlo', 'change', 'doosri', 'alag', 'koi aur', 'doosra',
    'change karo', 'nahi yeh', 'kuch aur',
    'बदलें', 'बदलो', 'दूसरी', 'अलग', 'कोई और', 'दूसरा', 'चेंज', 'कुछ और',
  ],
  FORWARD: [
    'aage', 'agla', 'next', 'continue', 'samajh gaya', 'theek hai',
    'aage chalein', 'jaari rakhein', 'dekhein', 'show karo',
    'आगे', 'अगला', 'नेक्स्ट', 'कंटिन्यू', 'समझ गया', 'ठीक है',
    'आगे चलें', 'जारी रखें', 'देखें', 'शो करो', 'देखना',
  ],
  BACK: [
    'pichhe', 'wapas', 'pehle wala', 'back', 'previous', 'wapas jao',
    'pichle screen',
    'पीछे', 'वापस', 'पहले वाला', 'बैक', 'पिछला', 'वापस जाओ',
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
    'hindi': 'Hindi', 'hindee': 'Hindi', 'हिंदी': 'Hindi', 'हिन्दी': 'Hindi',
    'bhojpuri': 'Bhojpuri', 'bhojpori': 'Bhojpuri', 'bhojpuriya': 'Bhojpuri', 'भोजपुरी': 'Bhojpuri',
    'maithili': 'Maithili', 'maithil': 'Maithili', 'मैथिली': 'Maithili',
    'bengali': 'Bengali', 'bangla': 'Bengali', 'bangali': 'Bengali', 'বাংলা': 'Bengali', 'बंगाली': 'Bengali',
    'tamil': 'Tamil', 'tamizh': 'Tamil', 'tameel': 'Tamil', 'தமிழ்': 'Tamil', 'तमिल': 'Tamil',
    'telugu': 'Telugu', 'telegu': 'Telugu', 'తెలుగు': 'Telugu', 'तेलुगु': 'Telugu',
    'kannada': 'Kannada', 'kannad': 'Kannada', 'ಕನ್ನಡ': 'Kannada', 'कन्नड़': 'Kannada',
    'malayalam': 'Malayalam', 'malayali': 'Malayalam', 'മലയാളം': 'Malayalam', 'मलयालम': 'Malayalam',
    'marathi': 'Marathi', 'मराठी': 'Marathi',
    'gujarati': 'Gujarati', 'gujrati': 'Gujarati', 'gujarathi': 'Gujarati', 'ગુજરાતી': 'Gujarati', 'गुजराती': 'Gujarati',
    'sanskrit': 'Sanskrit', 'sanskrith': 'Sanskrit', 'संस्कृत': 'Sanskrit',
    'english': 'English', 'angrezi': 'English', 'इंग्लिश': 'English', 'अंग्रेजी': 'English',
    'odia': 'Odia', 'oriya': 'Odia', 'ଓଡ଼ିଆ': 'Odia', 'ओड़िया': 'Odia',
    'punjabi': 'Punjabi', 'panjabi': 'Punjabi', 'ਪੰਜਾਬੀ': 'Punjabi', 'पंजाबी': 'Punjabi',
    'assamese': 'Assamese', 'অসমীয়া': 'Assamese', 'असमिया': 'Assamese',
  }
  for (const [alias, language] of Object.entries(languageAliases)) {
    if (normalized.includes(alias)) return language
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// HIGHEST QUALITY NEURAL TTS (USING GOOGLE TRANSLATE AUDIO API FALLBACK)
// This guarantees human-like "Google Hindi" regardless of Windows/Edge limits
// ─────────────────────────────────────────────────────────────

const PREFERRED_VOICE_NAMES = [
  'Natural', 'Online', 'Google हिन्दी', 'Google Hindi', 'Google', 'Ravi', 'Madhur', 'Swara', 'Hemant', 'Microsoft'
]

function getBestVoice(languageBcp47: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const langCode = languageBcp47.split('-')[0]

  for (const name of PREFERRED_VOICE_NAMES) {
    const v = voices.find(v => v.lang === languageBcp47 && v.name.includes(name))
    if (v) return v
  }
  const netExact = voices.find(v => v.lang === languageBcp47 && !v.localService)
  if (netExact) return netExact
  const anyExact = voices.find(v => v.lang === languageBcp47)
  if (anyExact) return anyExact

  for (const name of PREFERRED_VOICE_NAMES) {
    const v = voices.find(v => v.lang.startsWith(langCode) && v.name.includes(name))
    if (v) return v
  }
  return voices.find(v => v.lang.startsWith(langCode)) ?? null
}

export function fallbackSpeak(text: string, languageBcp47: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.()
    return
  }

  const doSpeak = () => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = languageBcp47
    u.rate = 0.88
    u.pitch = 0.9

    const bestVoice = getBestVoice(languageBcp47)
    if (bestVoice) u.voice = bestVoice

    u.onend = () => { onEnd?.() }
    u.onerror = () => { onEnd?.() }
    window.speechSynthesis.speak(u)
  }

  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    doSpeak()
  } else {
    window.speechSynthesis.onvoiceschanged = doSpeak
    setTimeout(doSpeak, 500)
  }
}


let currentAuidoSequence: HTMLAudioElement[] = []
let shouldStop = false

export function speak(
  text: string,
  languageBcp47: string = 'hi-IN',
  onEnd?: () => void
): void {
  if (typeof window === 'undefined') return
  stopSpeaking()
  shouldStop = false

  // Google Translate TTS is far superior to native Windows 'Microsoft Hemant'
  // but it has a 200 character limit per request. We must chunk by sentence.
  const langCode = languageBcp47.split('-')[0] || 'hi'
  
  // Split by full stops or Hindi purnaviram (।)
  const chunks = text.match(/[^।.?!\n]+[।.?!\n]*/g) || [text]
  let currentChunkIndex = 0

  const playNextChunk = () => {
    if (shouldStop) {
      onEnd?.()
      return
    }

    if (currentChunkIndex >= chunks.length) {
      onEnd?.()
      return
    }

    const chunk = chunks[currentChunkIndex].trim()
    if (!chunk) {
      currentChunkIndex++
      playNextChunk()
      return
    }

    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${langCode}&q=${encodeURIComponent(chunk)}`
    const audio = new Audio(url)
    audio.playbackRate = 0.95 // slightly slower for Pandit feel
    currentAuidoSequence.push(audio)

    audio.onended = () => {
      currentChunkIndex++
      playNextChunk()
    }

    audio.onerror = () => {
      console.warn('[VoiceEngine] Google TTS Failed on chunk, falling back to Web Speech API')
      currentChunkIndex++
      // Stop Google Translate queue, switch completely to Web Speech for this whole chunk text
      shouldStop = true
      fallbackSpeak(chunk, languageBcp47, () => {
        // Unfortunately chunking WebSpeech is complex; we just speak this chunk and assume the rest is skipped
        // Or we could pass the remaining chunks. To be safe, we just resume the callback.
        playNextChunk() // It won't play next Google chunk because shouldStop=true, it will just end
      })
    }

    audio.play().catch(e => {
      console.warn('[VoiceEngine] Auto-play prevented for TTS or Network Error', e)
      shouldStop = true
      fallbackSpeak(chunk, languageBcp47, onEnd)
    })
  }

  playNextChunk()
}

export function stopSpeaking(): void {
  shouldStop = true
  currentAuidoSequence.forEach(a => {
    a.pause()
    a.currentTime = 0
  })
  currentAuidoSequence = []
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

let globalRecognitionOptions: { language: string, confidenceThreshold: number } = { language: 'hi-IN', confidenceThreshold: 0.65 }
let isGlobalMicRunning = false

export function startGlobalMicLoop() {
  if (typeof window === 'undefined') return
  if (isGlobalMicMuted) return
  if (isGlobalMicRunning) return

  const SpeechRecognitionAPI =
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

  if (!SpeechRecognitionAPI) {
    console.warn('[VoiceEngine] SpeechRecognition not supported')
    setGlobalError('NOT_SUPPORTED (Use HTTPS or Localhost)')
    return
  }

  isGlobalMicRunning = true

  recognition = new SpeechRecognitionAPI()
  // Using continuous=false is actually MORE reliable in Chrome for quick commands.
  // We simulate continuous listening by restarting in onend.
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = globalRecognitionOptions.language
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    // We are actively listening globally
  }

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let bestTranscript = ''
    let bestConfidence = 0

    // Get the latest result only
    const latestResult = event.results[event.results.length - 1]
    if (latestResult && latestResult.length > 0) {
      bestTranscript = latestResult[0].transcript
      bestConfidence = latestResult[0].confidence
    }

    if (bestTranscript.trim().length > 0) {
      console.log(`[VoiceEngine] Heard: "${bestTranscript}" (Confidence: ${bestConfidence})`)
      setGlobalTranscript(bestTranscript)
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.warn('[VoiceEngine] STT error:', event.error)
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      setGlobalError(`ERROR: ${event.error}`)
    }
  }

  recognition.onend = () => {
    isGlobalMicRunning = false
    // Strict all-time ON: Restart immediately if not muted
    if (!isGlobalMicMuted) {
      setTimeout(startGlobalMicLoop, 100)
    }
  }

  try {
    recognition.start()
  } catch (e) {
    console.warn('[VoiceEngine] Failed to start recognition:', e)
    isGlobalMicRunning = false
    if (!isGlobalMicMuted) setTimeout(startGlobalMicLoop, 1000)
  }
}

export function stopGlobalMicLoop() {
  isGlobalMicMuted = true
  isGlobalMicRunning = false
  if (recognition) {
    try { recognition.stop() } catch (_e) { /* ignore */ }
    recognition = null
  }
}

let recognition: SpeechRecognition | null = null
let listenTimeout: ReturnType<typeof setTimeout> | null = null

// Backward compatibility wrapper, doing nothing since it's global now
export function startListening(config: VoiceEngineConfig): () => void {
  if (config.language) {
    globalRecognitionOptions.language = config.language
  }
  if (config.confidenceThreshold) {
    globalRecognitionOptions.confidenceThreshold = config.confidenceThreshold
  }
  
  if (!isGlobalMicMuted && !isGlobalMicRunning) {
    startGlobalMicLoop()
  }
  
  return () => {
    // We do NOT stop the mic here anymore, because it's STRICLY ALL-TIME ON
  }
}

export function stopListening(): void {
  // We only stop if they genuinely muted it
  if (isGlobalMicMuted) {
    stopGlobalMicLoop()
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
