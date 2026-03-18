'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  speak, startListening, stopListening, stopSpeaking,
  detectIntent, LANGUAGE_TO_BCP47, VoiceState,
} from '@/lib/voice-engine'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface UseVoiceFlowOptions {
  language: SupportedLanguage
  voiceScript: string
  onIntent?: (intent: string) => void
  autoListen?: boolean
  listenTimeoutMs?: number
  repromptAfterMs?: number
  repromptScript?: string
}

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
  const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'

  const startListeningSession = useCallback(() => {
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
        const intent = detectIntent(result.transcript)
        if (intent && onIntent) {
          onIntent(intent)
        } else if (onIntent) {
          onIntent(`RAW:${result.transcript}`)
        }
      },
      onError: (error) => {
        setIsListening(false)
        if (error === 'TIMEOUT' && repromptCount < 1) {
          setRepromptCount(c => c + 1)
          const repromptText = repromptScript ?? voiceScript
          speak(repromptText, bcp47, () => {
            if (autoListen) startListeningSession()
          })
        }
      },
    })
    cleanupRef.current = cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bcp47, listenTimeoutMs, repromptCount, repromptScript, voiceScript, autoListen])

  useEffect(() => {
    const ttsDelay = setTimeout(() => {
      speak(voiceScript, bcp47, () => {
        if (autoListen) startListeningSession()
      })
    }, 500)

    return () => {
      clearTimeout(ttsDelay)
      stopSpeaking()
      stopListening()
      cleanupRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { voiceState, isListening }
}
