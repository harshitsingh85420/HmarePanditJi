'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useVoiceStore } from '@/stores/voiceStore'

export function useAmbientNoise() {
  const [noiseLevel, setNoiseLevel] = useState(0)
  const { setAmbientNoise } = useVoiceStore()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()

  const startNoiseDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyserRef.current = analyser

      const detect = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setNoiseLevel(average)
        setAmbientNoise(average)

        // BUG-MEDIUM-04 FIX: Increased threshold from 65 to 75 to prevent false-triggering
        if (average > 75) {
          // Increment error count to trigger keyboard fallback
          useVoiceStore.getState().incrementError()
        }

        animationFrameRef.current = requestAnimationFrame(detect)
      }

      detect()
    } catch (error) {
      console.error('Failed to start noise detection:', error)
    }
  }, []) // Removed setAmbientNoise from dependency array as it's accessed via getState()

  const stopNoiseDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    }
    setNoiseLevel(0)
  }, [])

  useEffect(() => {
    return () => {
      stopNoiseDetection()
    }
  }, [stopNoiseDetection])

  return { noiseLevel, startNoiseDetection, stopNoiseDetection }
}
