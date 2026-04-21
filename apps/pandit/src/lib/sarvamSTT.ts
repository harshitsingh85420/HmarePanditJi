'use client'

import { SarvamAIClient } from 'sarvamai'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface STTOptions {
  language?: string          // 'hi-IN', 'bhojpuri', 'maithili', or 'unknown' for auto-detect
  inputType?: 'mobile' | 'otp' | 'yes_no' | 'name' | 'text' | 'address' | 'date'
  isElderly?: boolean        // Use 12s timeout instead of 8s
  onInterimResult?: (text: string) => void     // Real-time partial transcription
  onFinalResult?: (text: string, confidence: number) => void
  onSilenceDetected?: () => void
  onError?: (error: string) => void
  onNoiseLevel?: (dbLevel: number) => void
}

// ─────────────────────────────────────────────────────────────
// SARVAM CUSTOM PROMPTS FOR CONTEXTUAL ASR
// These dramatically improve accuracy for domain-specific words
// ─────────────────────────────────────────────────────────────

export const SARVAM_PROMPTS: Record<string, string> = {
  mobile: `This is a mobile phone number dictation in Indian context. The user will say digits in Hindi, Bhojpuri, Maithili, or English.
    Common patterns: "nau ath saat shoonya" = 9870, "ek do teen" = 123, "mera number hai..." = ignore this preamble.
    Number words to digits: ek=1, aik=1, do=2, teen=3, chaar=4, char=4, paanch=5, panch=5, chhah=6, chhe=6, saat=7, aath=8, nau=9, shoonya=0, zero=0, sifar=0.
    Hindi numbers: एक=1, दो=2, तीन=3, चार=4, पांच=5, छह=6, सात=7, आठ=8, नौ=9, शून्य=0.
    The user may say preambles like "mera number hai", "hamara number hai", "number hai", "mobile number" — ignore these completely.
    Output only the digits in sequence. Expected length: 10 digits. Strip +91 or 91 country code if present.`,

  otp: `This is a 6-digit OTP (One Time Password) verification. User will say 6 digits one by one or in groups.
    Convert Hindi/Bhojpuri number words to digits: ek=1, do=2, teen=3, char=4, paanch=5, chhah=6, saat=7, aath=8, nau=9, shoonya=0, zero=0.
    Common patterns: "ek char do paanch saat nau" = 142579, "one four two five seven nine" = 142579.
    Output exactly 6 digits. If user says more or less, take the first 6 digits.`,

  yes_no: `User will say yes or no in Hindi, Bhojpuri, Maithili, or English.
    Yes variants: haan, ha, haa, hanji, haanji, bilkul, sahi, theek, ji haan, yes, correct, zaroor, thik hai, sahi hai, haan haan.
    No variants: nahi, nahin, no, naa, galat, badlen, mat karo, nahi chahiye, galat hai, na ji.
    Output only: "haan" for yes, "nahi" for no.`,

  name: `User will say their name. This is a Hindu priest (Pandit) in India, typically 50-70 years old.
    Common first names: Ram, Shyam, Krishna, Ganesh, Vishnu, Mahesh, Suresh, Ramesh, Dinesh, Rajesh, Mukesh, Kamlesh, Brajesh, Yogesh, Naresh, Harish.
    Common surnames: Sharma, Mishra, Dubey, Tiwari, Pandey, Shukla, Joshi, Iyer, Iyengar, Trivedi, Pathak, Bhatt, Ojha, Pande, Upadhyay, Dwivedi, Chaturvedi.
    Religious titles: Pandit, Panditji, Shastri, Acharya, Maharaj, Swami, Guruji.
    Capitalize the first letter of each word. Preserve common spellings.`,

  text: `User is speaking in Hindi, Bhojpuri, or Maithili, possibly mixed with English (Hinglish).
    This is a spiritual/religious context. Common words: pooja, dakshina, pandit, yajna, havan, mantra, aarti, prasad, katha, sankalp, muhurat, vivah, griha-pravesh, satyanarayan, rudra, ganesh, navagraha.
    Temple-related: ghanti, bell, diya, mala, tilak, chunari, prasad, bhog.
    Transcribe exactly as spoken. Do not autocorrect religious terms.`,

  address: `User is dictating their address in India. Common patterns:
    "House number", "Mohalla", "Tola", "Gali", "Street", "Road", "Area", "Locality", "Post", "Police Station", "District", "State".
    Common words: makaan number, ghar, mohalla, tola, gali, sadak, road, area, locality, post office, thana, zila, rajya.
    Capitalize proper nouns. Keep numbers as digits.`,

  date: `User is saying a date for booking a pooja or event.
    Common patterns: "25 March", "25/03/2026", "25 March 2026", "pachchees March", "aane wala mangalwar".
    Date words: ek=1, do=2, teen=3, chaar=4, paanch=5, chhah=6, saat=7, aath=8, nau=9, das=10, gyarah=11, baarah=12, terah=13, chaudah=14, pandrah=15, solah=16, satrah=17, atharah=18, unnees=19, bees=20, ikkis=21, baais=22, teis=23, chaubis=24, pachchees=25, chhabbis=26, sattais=27, aththais=28, untis=29, tees=30.
    Months: January, February, March, April, May, June, July, August, September, October, November, December.
    Days: Somwar (Monday), Mangalwar (Tuesday), Budhwar (Wednesday), Guruwar (Thursday), Shukrawar (Friday), Shanivar (Saturday), Ravivar (Sunday).
    Output in format: "DD Month YYYY" or "DD/MM/YYYY".`,
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE ROUTING LOGIC
// Routes to Sarvam (regional) or Deepgram (Hindi/Bhojpuri primary)
// ─────────────────────────────────────────────────────────────

export function getSTTProvider(language: string): 'sarvam' | 'deepgram' {
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

  // For Hindi and English, use Deepgram Nova-3 (better latency for common languages)
  // But if user has strong accent, prefer Sarvam
  if (lang.includes('hindi') || lang.includes('hi-')) {
    // Check if Bhojpuri/Maithili influence detected (code-mixing)
    return 'sarvam' // Prefer Sarvam for Indian Hindi due to accent handling
  }

  // Default to Sarvam for Indian users
  return 'sarvam'
}

// ─────────────────────────────────────────────────────────────
// SARVAM STT ENGINE CLASS
// ─────────────────────────────────────────────────────────────

class SarvamSTTEngine {
  private static instance: SarvamSTTEngine
  private ws: WebSocket | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private analyserNode: AnalyserNode | null = null
  private audioContext: AudioContext | null = null
  private isListening = false
  private noiseCheckInterval: NodeJS.Timeout | null = null
  private silenceTimer: NodeJS.Timeout | null = null
  private options: STTOptions = {}
  private errorCount = 0
  private lastNoiseLevel = 0

  static getInstance(): SarvamSTTEngine {
    if (!SarvamSTTEngine.instance) {
      SarvamSTTEngine.instance = new SarvamSTTEngine()
    }
    return SarvamSTTEngine.instance
  }

  getIsListening(): boolean {
    return this.isListening
  }

  getErrorCount(): number {
    return this.errorCount
  }

  resetErrorCount(): void {
    this.errorCount = 0
  }

  incrementErrorCount(): number {
    this.errorCount++
    return this.errorCount
  }

  /**
   * Start listening with Sarvam AI streaming STT
   */
  async startListening(options: STTOptions = {}): Promise<void> {
    if (this.isListening) {
      console.warn('[SarvamSTT] Already listening, ignoring duplicate start')
      return
    }

    this.options = options
    const {
      language = 'unknown',
      inputType = 'text',
      isElderly = false,
    } = options

    const LISTEN_TIMEOUT = isElderly ? 12000 : 8000
    const MAX_LISTEN_DURATION = LISTEN_TIMEOUT + 8000 // Max 16-20 seconds

    try {
      // Step 1: Get microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })

      // Step 2: Check ambient noise level BEFORE starting STT
      const noiseLevel = await this.checkAmbientNoise()
      this.lastNoiseLevel = noiseLevel

      // If noise is too high (>65dB), warn user but continue
      // Typical silence: 0-20, Normal room: 20-40, Loud: 40-60, Very loud: 60-75, Extremely loud: 75+
      // CRITICAL: 65dB threshold per Tech Lead review - temple bells, crowds, traffic trigger keyboard fallback
      if (noiseLevel > 65) {
        console.warn('[SarvamSTT] High ambient noise detected:', noiseLevel, 'dB')
        options.onNoiseLevel?.(noiseLevel)
      }

      // Step 3: Get a session token from our API route
      const tokenResponse = await fetch('/api/stt-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get STT token: ${tokenResponse.statusText}`)
      }

      const { apiKey } = await tokenResponse.json()

      // Step 4: Determine provider (Sarvam vs Deepgram)
      const provider = getSTTProvider(language)
      console.log('[SarvamSTT] Using provider:', provider, 'for language:', language)

      // Step 5: Open WebSocket to Sarvam Streaming STT
      const wsUrl = `wss://api.sarvam.ai/speech-to-text-translate/streaming`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[SarvamSTT] WebSocket connected')

        // Send configuration message first (required before audio)
        const config = {
          api_key: apiKey,
          language_code: language === 'unknown' ? 'hi-IN' : language,
          model: 'saaras:v3',
          mode: 'transcribe',
          vad_enabled: true,
          vad_threshold: 0.5,
          prompt: SARVAM_PROMPTS[inputType] || SARVAM_PROMPTS.text,
          sampling_rate: 16000,
          audio_format: 'pcm',
        }

        this.ws!.send(JSON.stringify({ type: 'config', ...config }))
        console.log('[SarvamSTT] Sent config:', config)

        // Step 6: Start recording and streaming audio
        this.startAudioStreaming()
        this.isListening = true

        // Set maximum listen timeout (safety fallback)
        this.silenceTimer = setTimeout(() => {
          console.log('[SarvamSTT] Max listen timeout reached')
          this.stopListening()
          this.options.onSilenceDetected?.()
        }, MAX_LISTEN_DURATION)
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // console.log('[SarvamSTT] Received:', data)

          if (data.type === 'interim') {
            // Real-time partial transcription — show to user immediately
            const transcript = data.transcript || ''
            this.options.onInterimResult?.(transcript)
          } else if (data.type === 'final') {
            // Final transcription — process and validate
            const transcript = data.transcript || ''
            const confidence = data.confidence || 0.5

            console.log('[SarvamSTT] Final transcript:', transcript, 'confidence:', confidence)

            this.stopListening()
            this.processTranscript(transcript, confidence, inputType)
          } else if (data.type === 'vad_silence') {
            // Sarvam's VAD detected the user stopped speaking
            console.log('[SarvamSTT] VAD silence detected')
            // Let the final transcript flow naturally
          } else if (data.type === 'error') {
            console.error('[SarvamSTT] Server error:', data)
            this.handleError('server_error')
          }
        } catch (err) {
          console.error('[SarvamSTT] Error parsing WebSocket message:', err)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[SarvamSTT] WebSocket error:', error)
        this.handleError('connection_error')
      }

      this.ws.onclose = (event) => {
        console.log('[SarvamSTT] WebSocket closed:', event.code, event.reason)
        this.isListening = false

        // Clean up audio stream
        this.cleanupAudio()
      }

    } catch (error: any) {
      console.error('[SarvamSTT] Start listening failed:', error)

      if (error.name === 'NotAllowedError') {
        this.options.onError?.('mic_denied')
      } else if (error.name === 'NotFoundError') {
        this.options.onError?.('mic_not_found')
      } else if (error.name === 'NotReadableError') {
        this.options.onError?.('mic_not_readable')
      } else {
        this.options.onError?.('mic_error')
      }

      this.cleanupAudio()
    }
  }

  /**
   * Check ambient noise level before starting STT
   * Returns noise level in dB (0-100 scale)
   */
  private async checkAmbientNoise(): Promise<number> {
    if (!this.audioStream) return 0

    try {
      this.audioContext = new AudioContext()
      const source = this.audioContext.createMediaStreamSource(this.audioStream)
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 512
      source.connect(this.analyserNode)

      // Measure noise for 500ms
      return new Promise(resolve => {
        setTimeout(() => {
          const data = new Uint8Array(this.analyserNode!.frequencyBinCount)
          this.analyserNode!.getByteFrequencyData(data)

          // Calculate average volume (RMS approximation)
          const avgDb = data.reduce((a, b) => a + b, 0) / data.length

          // Convert to approximate dB (0-100 scale)
          const noiseLevel = Math.min(100, Math.max(0, avgDb * 1.5))

          resolve(Math.round(noiseLevel))
        }, 500)
      })
    } catch (err) {
      console.error('[SarvamSTT] Noise check failed:', err)
      return 0
    }
  }

  /**
   * Start streaming audio chunks to Sarvam WebSocket
   */
  private startAudioStreaming(): void {
    if (!this.audioStream || !this.ws) {
      console.error('[SarvamSTT] Cannot start streaming: no audio stream or WebSocket')
      return
    }

    // Sarvam requires PCM 16-bit at 16kHz
    // MediaRecorder with audio/webm;codecs=pcm should work
    try {
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=pcm',
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(event.data)
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('[SarvamSTT] MediaRecorder error:', event)
        this.handleError('recorder_error')
      }

      // Send audio chunks every 100ms for real-time streaming
      this.mediaRecorder.start(100)
      console.log('[SarvamSTT] Started audio streaming at 100ms intervals')
    } catch (err: any) {
      console.error('[SarvamSTT] MediaRecorder setup failed:', err)

      // Fallback: try audio/webm without codecs specification
      try {
        this.mediaRecorder = new MediaRecorder(this.audioStream, {
          mimeType: 'audio/webm',
        })

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(event.data)
          }
        }

        this.mediaRecorder.start(100)
        console.log('[SarvamSTT] Started audio streaming with fallback codec')
      } catch (fallbackErr) {
        console.error('[SarvamSTT] Fallback MediaRecorder also failed:', fallbackErr)
        this.handleError('recorder_error')
      }
    }
  }

  /**
   * Process and normalize transcript based on input type
   */
  private processTranscript(transcript: string, confidence: number, inputType: string): void {
    let processedText = transcript.trim()
    let finalConfidence = confidence

    console.log('[SarvamSTT] Processing transcript:', processedText, 'type:', inputType)

    switch (inputType) {
      case 'mobile': {
        processedText = this.normalizeMobileNumber(transcript)
        if (processedText.length !== 10) {
          console.warn('[SarvamSTT] Mobile number length mismatch:', processedText.length)
          finalConfidence = 0.3
        }
        break
      }
      case 'otp': {
        processedText = this.normalizeOTP(transcript)
        if (processedText.length !== 6) {
          console.warn('[SarvamSTT] OTP length mismatch:', processedText.length)
          finalConfidence = 0.3
        }
        break
      }
      case 'yes_no': {
        const answer = this.normalizeYesNo(transcript)
        if (answer) {
          processedText = answer
          finalConfidence = 0.95
        } else {
          finalConfidence = 0.2
        }
        break
      }
      case 'name': {
        // Capitalize first letter of each word
        processedText = transcript
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
          .trim()
        break
      }
      case 'address': {
        // Basic cleanup, preserve as-is
        processedText = transcript.trim().replace(/\s+/g, ' ')
        break
      }
      case 'date': {
        // Normalize date format
        processedText = this.normalizeDate(transcript)
        break
      }
    }

    console.log('[SarvamSTT] Processed result:', processedText, 'confidence:', finalConfidence)
    this.options.onFinalResult?.(processedText, finalConfidence)
  }

  /**
   * Normalize mobile number from speech
   */
  private normalizeMobileNumber(transcript: string): string {
    const HINDI_DIGITS: Record<string, string> = {
      'ek': '1', 'aik': '1', 'एक': '1', 'one': '1', 'won': '1',
      'do': '2', 'दो': '2', 'two': '2', 'too': '2',
      'teen': '3', 'तीन': '3', 'three': '3', 'tri': '3',
      'char': '4', 'chaar': '4', 'चार': '4', 'four': '4', 'for': '4',
      'paanch': '5', 'panch': '5', 'पांच': '5', 'five': '5', 'faiv': '5',
      'chhah': '6', 'chhe': '6', 'chha': '6', 'छह': '6', 'six': '6', 'siks': '6',
      'saat': '7', 'सात': '7', 'seven': '7', 'sevan': '7',
      'aath': '8', 'आठ': '8', 'eight': '8', 'eit': '8',
      'nau': '9', 'नौ': '9', 'nine': '9', 'nain': '9',
      'shoonya': '0', 'zero': '0', 'sifar': '0', 'शून्य': '0', 'zee-ro': '0',
    }

    let text = transcript.toLowerCase()

    // Strip preambles
    text = text.replace(/^(mera number|hamara number|number|ye number|is number|mera mobile|phone number|mobile|cell number)\s*/gi, '')

    // Strip country code
    text = text.replace(/^(\+91|91|plus 91)\s*/, '')

    const words = text.split(/[\s,]+/)
    const digits = words.map(w => HINDI_DIGITS[w] || w.replace(/[^0-9]/g, '')).join('')
    const numericOnly = digits.replace(/[^0-9]/g, '')

    // Handle 12-digit format (with 91 prefix)
    if (numericOnly.length === 12 && numericOnly.startsWith('91')) {
      return numericOnly.slice(2)
    }

    // Return first 10 digits
    return numericOnly.slice(0, 10)
  }

  /**
   * Normalize OTP from speech
   */
  private normalizeOTP(transcript: string): string {
    const HINDI_DIGITS: Record<string, string> = {
      'ek': '1', 'aik': '1', 'एक': '1', 'one': '1',
      'do': '2', 'दो': '2', 'two': '2',
      'teen': '3', 'तीन': '3', 'three': '3',
      'char': '4', 'chaar': '4', 'चार': '4', 'four': '4',
      'paanch': '5', 'panch': '5', 'पांच': '5', 'five': '5',
      'chhah': '6', 'chhe': '6', 'छह': '6', 'six': '6',
      'saat': '7', 'सात': '7', 'seven': '7',
      'aath': '8', 'आठ': '8', 'eight': '8',
      'nau': '9', 'नौ': '9', 'nine': '9',
      'shoonya': '0', 'zero': '0', 'sifar': '0', 'शून्य': '0',
    }

    let text = transcript.toLowerCase()

    // Strip OTP preambles
    text = text.replace(/^(otp|code|verification code|otp code)\s*/gi, '')

    const words = text.split(/[\s,]+/)
    const digits = words.map(w => HINDI_DIGITS[w] || w.replace(/[^0-9]/g, '')).join('')

    return digits.replace(/[^0-9]/g, '').slice(0, 6)
  }

  /**
   * Normalize yes/no response
   */
  private normalizeYesNo(transcript: string): string | null {
    const text = transcript.toLowerCase().trim()

    const YES_WORDS = [
      'haan', 'ha', 'haa', 'hanji', 'haanji', 'bilkul', 'sahi', 'theek',
      'ji haan', 'yes', 'correct', 'zaroor', 'thik hai', 'sahi hai', 'haan haan',
      'haan ji', 'thik', 'sahi', 'accha', 'ok', 'okay'
    ]

    const NO_WORDS = [
      'nahi', 'nahin', 'no', 'naa', 'galat', 'badlen', 'mat karo',
      'nahi chahiye', 'galat hai', 'na ji', 'nahin ji', 'mat', 'nahi nahi'
    ]

    // Check for yes
    if (YES_WORDS.some(word => text.includes(word))) {
      return 'haan'
    }

    // Check for no
    if (NO_WORDS.some(word => text.includes(word))) {
      return 'nahi'
    }

    return null
  }

  /**
   * Normalize date from speech
   */
  private normalizeDate(transcript: string): string {
    // Basic normalization - can be enhanced
    let text = transcript.trim()

    // Convert Hindi number words to digits (basic mapping)
    const HINDI_NUMBERS: Record<string, string> = {
      'ek': '1', 'do': '2', 'teen': '3', 'chaar': '4', 'paanch': '5',
      'chhah': '6', 'saat': '7', 'aath': '8', 'nau': '9', 'das': '10',
      'gyarah': '11', 'baarah': '12', 'pachchees': '25', 'tees': '30'
    }

    for (const [hindi, digit] of Object.entries(HINDI_NUMBERS)) {
      text = text.replace(new RegExp(hindi, 'gi'), digit)
    }

    return text
  }

  /**
   * Handle errors with cascade logic
   */
  private handleError(error: string): void {
    this.stopListening()

    const errorCount = this.incrementErrorCount()
    console.log('[SarvamSTT] Error count:', errorCount, 'error:', error)

    if (errorCount >= 3) {
      // Third error - suggest keyboard fallback
      this.options.onError?.('keyboard_fallback')
    } else {
      this.options.onError?.(error)
    }
  }

  /**
   * Stop listening and clean up
   */
  stopListening(): void {
    console.log('[SarvamSTT] Stopping listening')

    // Clear timers
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }

    if (this.noiseCheckInterval) {
      clearInterval(this.noiseCheckInterval)
      this.noiseCheckInterval = null
    }

    // Close WebSocket
    if (this.ws) {
      try {
        this.ws.close()
      } catch (error) {
        console.warn('[SarvamSTT] Failed to close WebSocket:', error);
        /* ignore */
      }
      this.ws = null
    }

    // Stop MediaRecorder
    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.stop()
      } catch (error) {
        console.warn('[SarvamSTT] Failed to stop MediaRecorder:', error);
        /* ignore */
      }
      this.mediaRecorder = null
    }

    // Clean up audio
    this.cleanupAudio()

    this.isListening = false
  }

  /**
   * Clean up audio resources
   */
  private cleanupAudio(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect()
      this.analyserNode = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  /**
   * Get current noise level
   */
  getCurrentNoiseLevel(): number {
    return this.lastNoiseLevel
  }

  /**
   * Explicit cleanup method for WebSocket and audio resources
   * Call this on component unmount to prevent memory leaks
   */
  cleanup(): void {
    console.log('[SarvamSTT] Cleaning up resources')

    // Close WebSocket
    if (this.ws) {
      try {
        this.ws.close()
      } catch (error) {
        console.warn('[SarvamSTT] Failed to close WebSocket:', error);
        /* ignore */
      }
      this.ws = null
    }

    // Stop MediaRecorder
    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.stop()
      } catch (error) {
        console.warn('[SarvamSTT] Failed to stop MediaRecorder:', error);
        /* ignore */
      }
      this.mediaRecorder = null
    }

    // Stop audio stream tracks
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }

    // Clear noise check interval
    if (this.noiseCheckInterval) {
      clearInterval(this.noiseCheckInterval)
      this.noiseCheckInterval = null
    }

    // Clear silence timer
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }

    // Clean up audio context and analyser
    if (this.analyserNode) {
      this.analyserNode.disconnect()
      this.analyserNode = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    // Reset state
    this.isListening = false
    this.options = {}
  }
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export const sttEngine = typeof window !== 'undefined' ? SarvamSTTEngine.getInstance() : null

export { SarvamSTTEngine }
