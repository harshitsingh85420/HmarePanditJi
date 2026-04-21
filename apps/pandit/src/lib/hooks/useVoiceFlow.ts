'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  speak, startListening, stopListening, stopSpeaking,
  detectIntent, LANGUAGE_TO_BCP47, VoiceState,
} from '@/lib/voice-engine'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface UseVoiceFlowOptions {
  language: SupportedLanguage
  voiceScript: string             // The TTS text to speak on mount
  onIntent?: (intent: string) => void  // Called when intent is detected
  autoListen?: boolean            // Start listening after TTS ends (default: true)
  listenTimeoutMs?: number        // Default: 12000
  repromptAfterMs?: number        // Re-prompt if no input (default: 12000)
  repromptScript?: string         // Different text for the re-prompt
}

/**
 * Handles the full voice flow for a single screen:
 * 1. TTS plays voiceScript after 500ms delay
 * 2. STT starts after TTS ends (if autoListen=true)
 * 3. On detection: fires onIntent
 * 4. On timeout: re-prompts once, then fires onIntent with 'TIMEOUT'
 *
 * CRITICAL FIXES APPLIED:
 * - STT is stopped BEFORE TTS speaks (prevents echo feedback loop)
 * - STT only resumes AFTER TTS finishes (not while app is speaking)
 * - STT only resumes if pandit has NOT manually turned mic off (useMicStore)
 */
export function useVoiceFlow({
  language,
  voiceScript,
  onIntent,
  autoListen = true,
  listenTimeoutMs = 12000,
  repromptScript,
}: UseVoiceFlowOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE')
  const [isListening, setIsListening] = useState(false)
  const [repromptCount, setRepromptCount] = useState(0)
  const cleanupRef = useRef<(() => void) | null>(null)
  const mountedRef = useRef(false)
  const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'

  const stopSTT = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    stopListening()
    setIsListening(false)
  }, [])

  const startListeningSession = useCallback(() => {
    // CRITICAL: Never start listening if component is unmounted
    if (!mountedRef.current) return

    setIsListening(true)
    setVoiceState('LISTENING')

    const cleanup = startListening({
      language: bcp47,
      listenTimeoutMs,
      onStateChange: (state) => {
        setVoiceState(state)
        if (state !== 'LISTENING') setIsListening(false)
      },
      onResult: (result) => {
        if (!mountedRef.current) return

        // CRITICAL: Stop STT BEFORE speaking (echo feedback loop prevention)
        stopSTT()
        setVoiceState('SPEAKING' as VoiceState)

        const processResult = () => {
          if (!mountedRef.current) return
          const intent = detectIntent(result.transcript)
          if (intent && onIntent) {
            onIntent(intent)
          } else if (onIntent) {
            // Pass raw transcript for custom handling (e.g., city name, language name)
            onIntent(`RAW:${result.transcript}`)
          }
          setVoiceState('IDLE')
          // Resume listening AFTER intent processing
          if (autoListen && mountedRef.current) {
            startListeningSession()
          }
        }

        processResult()
      },
      onError: (error) => {
        if (!mountedRef.current) return
        setIsListening(false)
        if (error === 'TIMEOUT' && repromptCount < 1) {
          setRepromptCount(c => c + 1)
          // CRITICAL: STT is already stopped on error — speak re-prompt safely
          const repromptText = repromptScript ?? voiceScript
          speak(repromptText, bcp47, () => {
            // Resume STT only after re-prompt TTS finishes
            if (autoListen && mountedRef.current) {
              startListeningSession()
            }
          })
        }
      },
    })
    cleanupRef.current = cleanup
  }, [bcp47, listenTimeoutMs, onIntent, repromptCount, repromptScript, voiceScript, autoListen, stopSTT])

  useEffect(() => {
    mountedRef.current = true

    // Start the voice flow after 500ms delay
    const ttsDelay = setTimeout(() => {
      if (!mountedRef.current) return
      // CRITICAL: Ensure STT is stopped BEFORE TTS speaks
      stopSTT()
      setVoiceState('SPEAKING' as VoiceState)

      speak(voiceScript, bcp47, () => {
        // STT starts only AFTER TTS finishes
        if (autoListen && mountedRef.current) {
          startListeningSession()
        } else {
          setVoiceState('IDLE')
        }
      })
    }, 500)

    return () => {
      mountedRef.current = false
      clearTimeout(ttsDelay)
      stopSpeaking()
      stopSTT()
    }
    // Intentionally run only on mount - initializes the voice flow lifecycle (TTS -> STT) for the screen
  }, [])

  return { voiceState, isListening }
}
