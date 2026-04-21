'use client'

/**
 * Deepgram Nova-3 STT Engine
 * 
 * Deepgram Nova-3 provides excellent latency for Hindi and English.
 * Use this for users who prefer Hindi/English without strong regional accents.
 * For Bhojpuri, Maithili, Bengali, and other regional languages, use Sarvam AI.
 * 
 * Documentation: https://developers.deepgram.com/docs
 */

export interface DeepgramSTTOptions {
  language?: string          // 'hi-IN', 'en-IN'
  inputType?: 'mobile' | 'otp' | 'yes_no' | 'name' | 'text'
  isElderly?: boolean
  onInterimResult?: (text: string) => void
  onFinalResult?: (text: string, confidence: number) => void
  onSilenceDetected?: () => void
  onError?: (error: string) => void
  onNoiseLevel?: (dbLevel: number) => void
}

// Deepgram custom prompts for context
const DEEPGRAM_HINTS: Record<string, string> = {
  mobile: 'mobile phone number digits in Hindi or English, Indian format, 10 digits',
  otp: 'six digit one time password verification code',
  yes_no: 'yes or no response in Hindi or English, haan or nahi',
  name: 'Indian Hindu name, proper noun capitalization',
  text: 'Hindi text with possible English code-mixing, spiritual religious context',
}

class DeepgramSTTEngine {
  private static instance: DeepgramSTTEngine
  private ws: WebSocket | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private isListening = false
  private options: DeepgramSTTOptions = {}
  private errorCount = 0

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

  /**
   * Start listening with Deepgram streaming STT
   */
  async startListening(options: DeepgramSTTOptions = {}): Promise<void> {
    if (this.isListening) {
      console.warn('[DeepgramSTT] Already listening')
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
      // Get microphone
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      })

      // Get token from server
      const tokenResponse = await fetch('/api/deepgram-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get Deepgram token: ${tokenResponse.statusText}`)
      }

      const { token } = await tokenResponse.json()

      // Open WebSocket to Deepgram
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=${language}&smart_format=true&interim_results=true&endpointing=300&filler_words=true`
      this.ws = new WebSocket(wsUrl, ['token', token])

      this.ws.onopen = () => {
        console.log('[DeepgramSTT] Connected')

        // Send configuration
        const config = {
          smart_format: true,
          diarize: false,
          interim_results: true,
          endpointing: 300,
          filler_words: true,
          hints: DEEPGRAM_HINTS[inputType] || DEEPGRAM_HINTS.text,
        }

        this.ws!.send(JSON.stringify({ type: 'Configure', ...config }))

        // Start streaming audio
        this.startAudioStreaming()
        this.isListening = true

        // Max timeout
        setTimeout(() => {
          if (this.isListening) {
            this.stopListening()
            this.options.onSilenceDetected?.()
          }
        }, MAX_LISTEN_DURATION)
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'Results') {
            const result = data.channel?.alternatives?.[0]
            if (!result) return

            const transcript = result.transcript || ''
            const confidence = result.confidence || 0.5
            const isFinal = data.is_final

            if (isFinal) {
              console.log('[DeepgramSTT] Final:', transcript, confidence)
              this.stopListening()
              this.processTranscript(transcript, confidence, inputType)
            } else {
              // Interim result
              this.options.onInterimResult?.(transcript)
            }
          }
        } catch (err) {
          console.error('[DeepgramSTT] Parse error:', err)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[DeepgramSTT] WebSocket error:', error)
        this.handleError('connection_error')
      }

      this.ws.onclose = () => {
        console.log('[DeepgramSTT] Closed')
        this.isListening = false
        this.cleanupAudio()
      }

    } catch (error: any) {
      console.error('[DeepgramSTT] Start failed:', error)
      this.options.onError?.(error.message || 'START_FAILED')
      this.cleanupAudio()
    }
  }

  private startAudioStreaming(): void {
    if (!this.audioStream || !this.ws) return

    try {
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(event.data)
        }
      }

      this.mediaRecorder.start(100)
    } catch (err) {
      console.error('[DeepgramSTT] MediaRecorder error:', err)
      this.handleError('recorder_error')
    }
  }

  private processTranscript(transcript: string, confidence: number, inputType: string): void {
    let processedText = transcript.trim()
    let finalConfidence = confidence

    // Basic normalization based on input type
    switch (inputType) {
      case 'mobile':
        processedText = processedText.replace(/[^0-9]/g, '').slice(0, 10)
        if (processedText.length !== 10) finalConfidence = 0.3
        break
      case 'otp':
        processedText = processedText.replace(/[^0-9]/g, '').slice(0, 6)
        if (processedText.length !== 6) finalConfidence = 0.3
        break
      case 'yes_no': {
        const lower = processedText.toLowerCase()
        if (lower.includes('haan') || lower.includes('yes')) {
          processedText = 'haan'
          finalConfidence = 0.95
        } else if (lower.includes('nahi') || lower.includes('no')) {
          processedText = 'nahi'
          finalConfidence = 0.95
        } else {
          finalConfidence = 0.2
        }
        break
      }
    }

    this.options.onFinalResult?.(processedText, finalConfidence)
  }

  private handleError(error: string): void {
    this.stopListening()
    this.errorCount++

    if (this.errorCount >= 3) {
      this.options.onError?.('keyboard_fallback')
    } else {
      this.options.onError?.(error)
    }
  }

  stopListening(): void {
    if (this.ws) {
      try { this.ws.close() } catch (error) { console.warn('[DeepgramSTT] Failed to close WebSocket:', error); /* noop */ }
      this.ws = null
    }

    if (this.mediaRecorder) {
      try { this.mediaRecorder.stop() } catch (error) { console.warn('[DeepgramSTT] Failed to stop MediaRecorder:', error); /* noop */ }
      this.mediaRecorder = null
    }

    this.cleanupAudio()
    this.isListening = false
  }

  private cleanupAudio(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
  }
}

export const deepgramSTT = typeof window !== 'undefined' ? DeepgramSTTEngine.getInstance() : null

/**
 * Convenience function for one-time listening
 * Used by OTP and other quick input screens
 */
export function listenOnce(
  language: string = 'hi',
  timeoutMs: number = 12000,
  onResult: (transcript: string) => void,
  onTimeout: () => void
): () => void {
  const engine = deepgramSTT

  if (!engine) {
    onTimeout()
    return () => { }
  }

  let timer: ReturnType<typeof setTimeout> | null = null
  let isComplete = false

  const cleanup = () => {
    if (timer) clearTimeout(timer)
    if (!isComplete) {
      engine.stopListening()
    }
  }

  engine.startListening({
    language: language === 'hi' ? 'hi-IN' : language,
    inputType: 'otp',
    isElderly: true,
    onFinalResult: (text, confidence) => {
      if (isComplete) return
      isComplete = true
      cleanup()

      // Only call onResult if confidence is acceptable
      if (confidence >= 0.5 && text.length > 0) {
        onResult(text)
      } else {
        onTimeout()
      }
    },
    onError: () => {
      if (isComplete) return
      isComplete = true
      cleanup()
      onTimeout()
    },
  }).catch(() => {
    if (isComplete) return
    isComplete = true
    cleanup()
    onTimeout()
  })

  // Safety timeout
  timer = setTimeout(() => {
    if (isComplete) return
    isComplete = true
    cleanup()
    onTimeout()
  }, timeoutMs)

  return cleanup
}
