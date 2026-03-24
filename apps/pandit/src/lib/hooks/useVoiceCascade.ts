'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useVoiceStore } from '@/stores/voiceStore'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { startListeningWithSarvam, type VoiceEngineConfig } from '@/lib/voice-engine'

/**
 * 3-Error Cascade Voice Recovery System
 * 
 * Implements the exact flow from HPJ_Voice_Complete_Guide.md:
 * - 1st error (V-05): Gentle retry with clearer instruction
 * - 2nd error (V-06): Even clearer instruction with example
 * - 3rd error (V-07): Seamless switch to keyboard mode
 * 
 * This prevents Pandit Ji from getting stuck or frustrated.
 */

interface UseVoiceCascadeOptions {
  language?: string
  inputType?: 'mobile' | 'otp' | 'yes_no' | 'name' | 'text'
  isElderly?: boolean
  questionText?: string        // The question we're asking (for reprompt)
  exampleAnswer?: string       // Example of expected answer
  onSuccessfulInput?: (text: string, confidence: number) => void
  onKeyboardFallback?: () => void
  confidenceThreshold?: number
}

interface UseVoiceCascadeReturn {
  isListening: boolean
  isProcessing: boolean
  errorCount: number
  startListeningWithCascade: () => void
  stopListening: () => void
  resetCascade: () => void
  switchToKeyboard: () => void
  isKeyboardMode: boolean
}

export function useVoiceCascade({
  language = 'hi-IN',
  inputType = 'text',
  isElderly = true,
  questionText,
  exampleAnswer,
  onSuccessfulInput,
  onKeyboardFallback,
  confidenceThreshold = 0.6,
}: UseVoiceCascadeOptions): UseVoiceCascadeReturn {
  const {
    state,
    errorCount,
    transcribedText,
    confidence,
    setState,
    setTranscribedText,
    setConfidence,
    incrementError,
    resetErrors,
    isKeyboardMode,
    switchToKeyboard: storeSwitchToKeyboard,
  } = useVoiceStore()

  const isListeningRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  const isListening = state === 'listening'
  const isProcessing = state === 'processing'

  // Get the appropriate error message based on error count
  const getErrorMessage = useCallback((count: number): string => {
    switch (count) {
      case 0:
        return questionText || 'कृपया कहें'
      case 1:
        // V-05: First error - gentle retry
        return `माफ़ कीजिए, फिर से कहें। ${exampleAnswer ? `जैसे: "${exampleAnswer}"` : ''}`
      case 2:
        // V-06: Second error - clearer instruction with example
        return `ज़ोर से और धीरे-धीरे कहें। ${exampleAnswer ? `उदाहरण: "${exampleAnswer}"` : 'माइक के पास बोलें'}`
      default:
        // V-07: Third error - will trigger keyboard
        return 'कीबोर्ड से चुनें'
    }
  }, [questionText, exampleAnswer])

  // Play error reprompt voice
  const playErrorReprompt = useCallback(async (count: number) => {
    const message = getErrorMessage(count)
    await speakWithSarvam({
      text: message,
      languageCode: language as any,
      pace: 0.85,
    })
  }, [getErrorMessage, language])

  // Handle successful input
  const handleSuccess = useCallback((text: string, conf: number) => {
    resetErrors()
    onSuccessfulInput?.(text, conf)
  }, [resetErrors, onSuccessfulInput])

  // Handle error with cascade logic
  const handleError = useCallback(async (error: string) => {
    console.log('[VoiceCascade] Error:', error, 'count:', errorCount)

    if (error === 'KEYBOARD_FALLBACK' || errorCount >= 2) {
      // Third error (or explicit fallback) - switch to keyboard
      storeSwitchToKeyboard()
      onKeyboardFallback?.()
      
      await speakWithSarvam({
        text: 'कोई बात नहीं। अब बटन दबाकर चुनें।',
        languageCode: language as any,
        pace: 0.85,
      })
      return
    }

    // First or second error - gentle retry with voice
    incrementError()
    
    // Wait a moment, then reprompt
    setTimeout(async () => {
      const newCount = errorCount + 1
      await playErrorReprompt(newCount)
    }, 500)
  }, [errorCount, incrementError, storeSwitchToKeyboard, onKeyboardFallback, language, playErrorReprompt])

  // Start listening with cascade
  const startListeningWithCascade = useCallback(() => {
    if (isKeyboardMode) return
    if (isListeningRef.current) return

    resetErrors()
    isListeningRef.current = true

    const config: VoiceEngineConfig = {
      language,
      inputType,
      isElderly,
      useSarvam: true,
      confidenceThreshold,
      onStateChange: (state) => {
        console.log('[VoiceCascade] State:', state)
        
        if (state === 'LISTENING') {
          setState('listening')
        } else if (state === 'PROCESSING') {
          setState('processing')
        } else if (state === 'SUCCESS') {
          setState('idle')
          isListeningRef.current = false
        } else if (state === 'FAILURE') {
          setState('error_1')
          isListeningRef.current = false
        } else if (state === 'IDLE') {
          setState('idle')
          isListeningRef.current = false
        } else if (state === 'NOISE_WARNING') {
          // Noise too high - handled separately
        }
      },
      onResult: (result) => {
        isListeningRef.current = false
        handleSuccess(result.transcript, result.confidence)
      },
      onError: (error) => {
        isListeningRef.current = false
        handleError(error)
      },
    }

    cleanupRef.current = startListeningWithSarvam(config)
  }, [
    isKeyboardMode,
    language,
    inputType,
    isElderly,
    confidenceThreshold,
    setState,
    handleSuccess,
    handleError,
  ])

  // Stop listening
  const stopListening = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    isListeningRef.current = false
    setState('idle')
  }, [setState])

  // Reset cascade
  const resetCascade = useCallback(() => {
    resetErrors()
    stopListening()
    isListeningRef.current = false
  }, [resetErrors, stopListening])

  // Switch to keyboard mode
  const switchToKeyboard = useCallback(() => {
    storeSwitchToKeyboard()
    stopListening()
    onKeyboardFallback?.()
  }, [storeSwitchToKeyboard, stopListening, onKeyboardFallback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  return {
    isListening,
    isProcessing,
    errorCount,
    startListeningWithCascade,
    stopListening,
    resetCascade,
    switchToKeyboard,
    isKeyboardMode,
  }
}
