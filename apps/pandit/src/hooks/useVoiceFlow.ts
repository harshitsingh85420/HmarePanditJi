'use client'

import { useState, useEffect, useRef } from 'react'
import {
  speak, startListening, stopListening, stopSpeaking,
  detectIntent, LANGUAGE_TO_BCP47, VoiceState,
  isGlobalMicMuted, subscribeToMicMute, subscribeToTranscript
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
}: UseVoiceFlowOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE')
  const isMounted = useRef(false)
  const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'

  useEffect(() => {
    isMounted.current = true

    // Make sure the global loop is running if autoListen is true
    if (autoListen && !isGlobalMicMuted) {
      startListening({ language: bcp47 })
    }

    const unsubMute = subscribeToMicMute(() => {
      if (!isGlobalMicMuted && autoListen) {
        startListening({ language: bcp47 })
      }
    })

    const unsubTranscript = subscribeToTranscript((transcript) => {
      if (!isMounted.current || isGlobalMicMuted || !autoListen) return
      
      const intent = detectIntent(transcript)
      if (intent && onIntent) {
        // App visually/vocally confirms the action as requested
        const ackMap: Record<string, string> = {
          YES: 'आपने कहा: हाँ।',
          NO: 'आपने कहा: नहीं।',
          SKIP: 'आपने कहा: छोड़ें।',
          HELP: 'आपने कहा: मदद।',
          CHANGE: 'आपने कहा: बदलें।',
          FORWARD: 'आपने कहा: आगे।',
          BACK: 'आपने कहा: पीछे।'
        }
        const ackText = ackMap[intent] || `आपने कहा: ${transcript}`
        
        speak(ackText, bcp47, () => {
          if (isMounted.current) onIntent(intent)
        })
      } else if (onIntent) {
        onIntent(`RAW:${transcript}`)
      }
    })

    const ttsDelay = setTimeout(() => {
      speak(voiceScript, bcp47, () => {
        // We no longer trigger mic starts here, because the global
        // loop is ALREADY running in parallel to the voice!
      })
    }, 500)

    return () => {
      isMounted.current = false
      unsubMute()
      unsubTranscript()
      clearTimeout(ttsDelay)
      stopSpeaking()
      // Notice we DO NOT call stopListening() here. 
      // It stays strictly ON all the time across screen boundaries.
    }
  }, [autoListen, bcp47, onIntent, voiceScript])

  const isListening = autoListen && !isGlobalMicMuted

  return { voiceState, isListening }
}
