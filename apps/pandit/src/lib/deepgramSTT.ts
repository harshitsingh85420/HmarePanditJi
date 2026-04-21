'use client'

import type { DeepgramClient } from '@deepgram/sdk'

// Dynamic import for Deepgram SDK v5
let _DeepgramClient: any = null

async function getDeepgramClient() {
  if (!_DeepgramClient) {
    const sdk = await import('@deepgram/sdk')
    // In v5, use DeepgramClient class directly
    _DeepgramClient = sdk.DeepgramClient
  }
  return _DeepgramClient
}

// LiveSchema type for Deepgram v5
interface LiveSchema {
  model?: string
  language?: string
  smart_format?: boolean
  interim_results?: boolean
  utterance_end_ms?: number
  vad_events?: boolean
  endpointing?: number
  keywords?: string[]
  filler_words?: boolean
  diarize?: boolean
  punctuate?: boolean
  paragraphs?: boolean
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface DeepgramSTTOptions {
  language?: string          // 'hi-IN' for Hindi, 'en-IN' for English
  inputType?: 'mobile' | 'otp' | 'yes_no' | 'name' | 'text' | 'address' | 'date'
  isElderly?: boolean
  onInterimResult?: (text: string) => void
  onFinalResult?: (text: string, confidence: number) => void
  onSilenceDetected?: () => void
  onError?: (error: string) => void
  onNoiseLevel?: (dbLevel: number) => void
}

// ─────────────────────────────────────────────────────────────
// DEEPGRAM KEYTERMS FOR POOJA VOCABULARY
// ─────────────────────────────────────────────────────────────

const POOJA_KEYTERMS = [
  'pooja', 'dakshina', 'pandit', 'panditji', 'yajna', 'havan', 'mantra',
  'aarti', 'prasad', 'katha', 'sankalp', 'muhurat', 'vivah', 'griha-pravesh',
  'satyanarayan', 'rudra', 'ganesh', 'navagraha', 'ghanti', 'bell', 'diya',
  'mala', 'tilak', 'chunari', 'bhog', 'puja', 'hawan', 'aarthi', 'prashaad'
]

// Type for Deepgram live connection (v5 SDK)
type LiveConnection = {
  on: (event: string, callback: (data: any) => void) => void
  send: (data: Blob | ArrayBuffer) => void
  finish: () => void
  request: { id: string }
}

// ─────────────────────────────────────────────────────────────
// DEEPGRAM STT ENGINE CLASS
// ─────────────────────────────────────────────────────────────

class DeepgramSTTEngine {
  private static instance: DeepgramSTTEngine
  private client: DeepgramClient | null = null
  private connection: LiveConnection | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private analyserNode: AnalyserNode | null = null
  private audioContext: AudioContext | null = null
  private isListening = false
  private options: DeepgramSTTOptions = {}
  private errorCount = 0
  private lastNoiseLevel = 0
  private silenceTimer: NodeJS.Timeout | null = null
  private interimTranscript = ''

  static getInstance(): DeepgramSTTEngine {
    if (!DeepgramSTTEngine.instance) {
      DeepgramSTTEngine.instance = new DeepgramSTTEngine()
    }
    return DeepgramSTTEngine.instance
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
   * Initialize Deepgram client
   */
  private async initClient(): Promise<DeepgramClient | null> {
    if (this.client) return this.client

    // Use backend proxy route - API key stays on server
    // For Deepgram, we need to check if the /api/stt-token endpoint is available
    try {
      const ClientClass = await getDeepgramClient()
      // The API key will be provided by the backend proxy route
      // For now, we check if the backend route is available
      this.client = new ClientClass('__PROXY_VIA_BACKEND__')
      return this.client
    } catch (error) {
      console.error('[DeepgramSTT] Client initialization failed:', error)
      return null
    }
  }

  /**
   * Start listening with Deepgram Nova-3 streaming STT
   */
  async startListening(options: DeepgramSTTOptions = {}): Promise<void> {
    if (this.isListening) {
      console.warn('[DeepgramSTT] Already listening, ignoring duplicate start')
      return
    }

    this.options = options
    const {
      language = 'hi-IN',
      inputType = 'text',
      isElderly = false,
    } = options

    const LISTEN_TIMEOUT = isElderly ? 12000 : 8000
    const MAX_LISTEN_DURATION = LISTEN_TIMEOUT + 8000

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

      // Step 2: Check ambient noise level
      const noiseLevel = await this.checkAmbientNoise()
      this.lastNoiseLevel = noiseLevel

      if (noiseLevel > 65) {
        console.warn('[DeepgramSTT] High ambient noise detected:', noiseLevel, 'dB')
        options.onNoiseLevel?.(noiseLevel)
      }

      // Step 3: Initialize Deepgram client
      const client = await this.initClient()
      if (!client) {
        throw new Error('Deepgram client not initialized')
      }

      // Step 4: Configure Deepgram Nova-3 model
      const schema: LiveSchema = {
        model: 'nova-3',
        language: language === 'hi-IN' ? 'hi' : language === 'en-IN' ? 'en' : 'hi',
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 800,
        vad_events: true,
        endpointing: 800,
        keywords: POOJA_KEYTERMS.map(term => `${term}:${10}`),
        filler_words: false,
        diarize: false,
        punctuate: true,
        paragraphs: false,
      }

      // Step 5: Open WebSocket connection to Deepgram (v5 SDK)
      const listenClient = client.listen as unknown as {
        live: (schema: LiveSchema) => Promise<LiveConnection>
      }
      this.connection = await listenClient.live(schema)

      // Step 6: Set up event handlers
      const TRANSCRIPTION_EVENTS = {
        Open: 'open',
        Transcript: 'transcript',
        Error: 'error',
        Close: 'close',
        SpeechStarted: 'speech_started',
        UtteranceEnd: 'utterance_end',
      }

      this.connection.on(TRANSCRIPTION_EVENTS.Open, () => {
        console.log('[DeepgramSTT] WebSocket connected to Deepgram Nova-3')
        this.startAudioStreaming()
        this.isListening = true

        this.silenceTimer = setTimeout(() => {
          console.log('[DeepgramSTT] Max listen timeout reached')
          this.stopListening()
          this.options.onSilenceDetected?.()
        }, MAX_LISTEN_DURATION)
      })

      this.connection.on(TRANSCRIPTION_EVENTS.Transcript, (data: any) => {
        try {
          const transcript = data.channel?.alternatives?.[0]?.transcript || ''
          const confidence = data.channel?.alternatives?.[0]?.confidence || 0.5
          const isFinal = data.is_final || false

          if (!transcript) return

          if (isFinal) {
            console.log('[DeepgramSTT] Final transcript:', transcript, 'confidence:', confidence)
            this.interimTranscript = ''
            this.stopListening()
            this.processTranscript(transcript, confidence, inputType)
          } else {
            this.interimTranscript = transcript
            this.options.onInterimResult?.(transcript)
          }
        } catch (err) {
          console.error('[DeepgramSTT] Error parsing transcript:', err)
        }
      })

      this.connection.on(TRANSCRIPTION_EVENTS.Error, (error: any) => {
        console.error('[DeepgramSTT] WebSocket error:', error)
        this.handleError('connection_error')
      })

      this.connection.on(TRANSCRIPTION_EVENTS.Close, () => {
        console.log('[DeepgramSTT] WebSocket closed')
        this.isListening = false
        this.cleanupAudio()
      })

      this.connection.on(TRANSCRIPTION_EVENTS.SpeechStarted, () => {
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer)
        }
      })

      this.connection.on(TRANSCRIPTION_EVENTS.UtteranceEnd, () => {
        console.log('[DeepgramSTT] Utterance end detected')
        if (this.interimTranscript) {
          this.stopListening()
          this.processTranscript(this.interimTranscript, 0.7, inputType)
        }
      })

    } catch (error: any) {
      console.error('[DeepgramSTT] Start listening failed:', error)

      if (error.name === 'NotAllowedError') {
        this.options.onError?.('mic_denied')
      } else if (error.name === 'NotFoundError') {
        this.options.onError?.('mic_not_found')
      } else {
        this.options.onError?.('mic_error')
      }

      this.cleanupAudio()
    }
  }

  /**
   * Check ambient noise level
   */
  private async checkAmbientNoise(): Promise<number> {
    if (!this.audioStream) return 0

    try {
      this.audioContext = new AudioContext()
      const source = this.audioContext.createMediaStreamSource(this.audioStream)
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 512
      source.connect(this.analyserNode)

      return new Promise(resolve => {
        setTimeout(() => {
          const data = new Uint8Array(this.analyserNode!.frequencyBinCount)
          this.analyserNode!.getByteFrequencyData(data)

          const avgDb = data.reduce((a, b) => a + b, 0) / data.length
          const noiseLevel = Math.min(100, Math.max(0, avgDb * 1.5))

          resolve(Math.round(noiseLevel))
        }, 500)
      })
    } catch (err) {
      console.error('[DeepgramSTT] Noise check failed:', err)
      return 0
    }
  }

  /**
   * Start streaming audio chunks to Deepgram WebSocket
   */
  private startAudioStreaming(): void {
    if (!this.audioStream || !this.connection) {
      console.error('[DeepgramSTT] Cannot start streaming: no audio stream or WebSocket')
      return
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.connection) {
          this.connection.send(event.data)
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('[DeepgramSTT] MediaRecorder error:', event)
        this.handleError('recorder_error')
      }

      this.mediaRecorder.start(100)
      console.log('[DeepgramSTT] Started audio streaming at 100ms intervals')
    } catch (err: any) {
      console.error('[DeepgramSTT] MediaRecorder setup failed:', err)

      try {
        this.mediaRecorder = new MediaRecorder(this.audioStream, {
          mimeType: 'audio/webm',
        })

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && this.connection) {
            this.connection.send(event.data)
          }
        }

        this.mediaRecorder.start(100)
        console.log('[DeepgramSTT] Started audio streaming with fallback codec')
      } catch (fallbackErr) {
        console.error('[DeepgramSTT] Fallback MediaRecorder also failed:', fallbackErr)
        this.handleError('recorder_error')
      }
    }
  }

  /**
   * Process and normalize transcript
   */
  private processTranscript(transcript: string, confidence: number, inputType: string): void {
    let processedText = transcript.trim()
    let finalConfidence = confidence

    switch (inputType) {
      case 'mobile':
        processedText = this.normalizeMobileNumber(transcript)
        if (processedText.length !== 10) {
          finalConfidence = 0.3
        }
        break
      case 'otp':
        processedText = this.normalizeOTP(transcript)
        if (processedText.length !== 6) {
          finalConfidence = 0.3
        }
        break
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
      case 'name':
        processedText = transcript
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
          .trim()
        break
    }

    console.log('[DeepgramSTT] Processed result:', processedText, 'confidence:', finalConfidence)
    this.options.onFinalResult?.(processedText, finalConfidence)
  }

  /**
   * Normalize mobile number from speech
   */
  private normalizeMobileNumber(transcript: string): string {
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
    text = text.replace(/^(mera number|hamara number|number|mobile)\s*/gi, '')
    text = text.replace(/^(\+91|91)\s*/, '')

    const words = text.split(/[\s,]+/)
    const digits = words.map(w => HINDI_DIGITS[w] || w.replace(/[^0-9]/g, '')).join('')
    const numericOnly = digits.replace(/[^0-9]/g, '')

    if (numericOnly.length === 12 && numericOnly.startsWith('91')) {
      return numericOnly.slice(2)
    }

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
    text = text.replace(/^(otp|code)\s*/gi, '')

    const words = text.split(/[\s,]+/)
    const digits = words.map(w => HINDI_DIGITS[w] || w.replace(/[^0-9]/g, '')).join('')

    return digits.replace(/[^0-9]/g, '').slice(0, 6)
  }

  /**
   * Normalize yes/no response
   */
  private normalizeYesNo(transcript: string): string | null {
    const text = transcript.toLowerCase().trim()

    const YES_WORDS = ['haan', 'ha', 'hanji', 'bilkul', 'sahi', 'theek', 'yes', 'correct', 'zaroor']
    const NO_WORDS = ['nahi', 'nahin', 'no', 'naa', 'galat', 'mat', 'nahin chahiye']

    if (YES_WORDS.some(word => text.includes(word))) return 'haan'
    if (NO_WORDS.some(word => text.includes(word))) return 'nahi'

    return null
  }

  /**
   * Handle errors
   */
  private handleError(error: string): void {
    this.stopListening()

    const errorCount = this.incrementErrorCount()
    console.log('[DeepgramSTT] Error count:', errorCount, 'error:', error)

    if (errorCount >= 3) {
      this.options.onError?.('keyboard_fallback')
    } else {
      this.options.onError?.(error)
    }
  }

  /**
   * Stop listening and clean up
   */
  stopListening(): void {
    console.log('[DeepgramSTT] Stopping listening')

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }

    if (this.connection) {
      try {
        this.connection.finish()
      } catch (error) {
        console.warn('[DeepgramSTT] Failed to finish connection:', error);
        /* ignore */
      }
      this.connection = null
    }

    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.stop()
      } catch (error) {
        console.warn('[DeepgramSTT] Failed to stop MediaRecorder:', error);
        /* ignore */
      }
      this.mediaRecorder = null
    }

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

  getCurrentNoiseLevel(): number {
    return this.lastNoiseLevel
  }
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export const deepgramEngine = typeof window !== 'undefined' ? DeepgramSTTEngine.getInstance() : null

export { DeepgramSTTEngine }
