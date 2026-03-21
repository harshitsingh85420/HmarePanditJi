'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useVoiceStore } from '@/stores/voiceStore'
import { normalizeNumberInput, normalizeOtpInput, normalizeYesNo } from '@/lib/utils'

export type VoiceInputType = 'mobile' | 'otp' | 'yes_no' | 'text' | 'name'

interface UseVoiceOptions {
  language?: string
  inputType?: VoiceInputType
  isElderly?: boolean
  onResult?: (text: string, confidence: number) => void
  onError?: (errorCount: number) => void
  onNoiseDetected?: () => void
  autoStart?: boolean
}

interface UseVoiceReturn {
  isListening: boolean
  isProcessing: boolean
  transcribedText: string
  confidence: number
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => void
  isSpeaking: boolean
  isSupported: boolean
}

export function useVoice({
  language = 'hi-IN',
  inputType = 'text',
  isElderly = false,
  onResult,
  onError,
  onNoiseDetected,
  autoStart = false,
}: UseVoiceOptions = {}): UseVoiceReturn {
  const { setState, setTranscribedText, setConfidence, incrementError, resetErrors } = useVoiceStore()

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcribedText, setLocalTranscribed] = useState('')
  const [confidence, setLocalConfidence] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const LISTEN_TIMEOUT = isElderly ? 12000 : 8000

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const processTranscript = useCallback((transcript: string, rawConfidence: number) => {
    let processedText = transcript
    let finalConfidence = rawConfidence

    switch (inputType) {
      case 'mobile': {
        processedText = normalizeNumberInput(transcript)
        if (processedText.length !== 10) {
          finalConfidence = 0.3
        }
        break
      }
      case 'otp': {
        processedText = normalizeOtpInput(transcript)
        if (processedText.length !== 6) {
          finalConfidence = 0.3
        }
        break
      }
      case 'yes_no': {
        const answer = normalizeYesNo(transcript)
        if (answer) {
          processedText = answer === 'yes' ? 'yes' : 'no'
          finalConfidence = 0.95
        } else {
          finalConfidence = 0.2
        }
        break
      }
      case 'name': {
        processedText = transcript.replace(/\b\w/g, c => c.toUpperCase())
        break
      }
      default: {
        processedText = transcript.trim()
      }
    }

    return { text: processedText, confidence: finalConfidence }
  }, [inputType])

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      setIsListening(true)
      setState('listening')

      timeoutRef.current = setTimeout(() => {
        if (recognition) {
          recognition.stop()
        }
      }, LISTEN_TIMEOUT + 10000)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      const resultIndex = event.resultIndex
      const result = results[resultIndex]

      if (result.isFinal) {
        setIsListening(false)
        setIsProcessing(true)
        setState('processing')

        let bestTranscript = result[0].transcript
        let bestConfidence = result[0].confidence

        for (let i = 1; i < result.length; i++) {
          if (result[i].confidence > bestConfidence) {
            bestTranscript = result[i].transcript
            bestConfidence = result[i].confidence
          }
        }

        setTimeout(() => {
          const { text, confidence: finalConfidence } = processTranscript(bestTranscript, bestConfidence)

          setIsProcessing(false)

          if (finalConfidence < 0.4) {
            incrementError()
            onError?.(useVoiceStore.getState().errorCount)
          } else {
            setLocalTranscribed(text)
            setLocalConfidence(finalConfidence)
            setTranscribedText(text)
            setConfidence(finalConfidence)
            setState('confirming')
            resetErrors()
            onResult?.(text, finalConfidence)
          }
        }, 500)
      } else {
        setLocalTranscribed(result[0].transcript)
      }
    }

    recognition.onerror = (_event) => {
      setIsListening(false)
      setIsProcessing(false)
      incrementError()
      onError?.(useVoiceStore.getState().errorCount)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    recognitionRef.current = recognition

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyserRef.current = analyser

        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length

        if (avg > 65) {
          onNoiseDetected?.()
        }

        recognition.start()
      })
      .catch(() => {
        setState('idle')
      })
  }, [isSupported, isListening, language, LISTEN_TIMEOUT, processTranscript,
    setState, setTranscribedText, setConfidence, incrementError, resetErrors,
    onResult, onError, onNoiseDetected])

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort()
    setIsListening(false)
    setIsProcessing(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voices = window.speechSynthesis.getVoices()
    const indianVoice = voices.find(v =>
      v.lang.startsWith('hi') || v.name.includes('India') || v.name.includes('Hindi')
    )
    if (indianVoice) utterance.voice = indianVoice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [language])

  useEffect(() => {
    if (autoStart && isSupported) {
      const timer = setTimeout(startListening, 2000)
      return () => clearTimeout(timer)
    }
  }, [autoStart, isSupported, startListening])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [])

  return {
    isListening,
    isProcessing,
    transcribedText,
    confidence,
    startListening,
    stopListening,
    speak,
    isSpeaking,
    isSupported,
  }
}
