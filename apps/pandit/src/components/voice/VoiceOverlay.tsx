'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'
import { useEffect, useRef } from 'react'

interface VoiceOverlayProps {
  question: string
  interimText?: string
  onSilenceTimeout?: () => void
}

export function VoiceOverlay({ question, interimText, onSilenceTimeout }: VoiceOverlayProps) {
  const { state, transcribedText, confidence, ambientNoiseLevel, errorCount, setState } = useVoiceStore()
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastTranscriptRef = useRef<string>('')

  const isListening = state === 'listening'
  const isProcessing = state === 'processing'
  const isConfirming = state === 'confirming'
  const isError = state === 'error_1' || state === 'error_2' || state === 'error_3'

  // BUG-003/018 FIX: Use confidence value to show low confidence warning
  const showLowConfidence = confidence > 0 && confidence < 0.7

  // BUG-MEDIUM-04 FIX: Raised threshold from 65dB to 85dB to prevent false-triggering
  // 65dB is normal conversation level - should NOT trigger warning
  // 85dB+ is genuinely loud (temple bells, heavy traffic, crowds)
  const isHighNoise = ambientNoiseLevel > 85
  const isMediumNoise = ambientNoiseLevel > 40

  // UI-015 FIX: Fast speech detection based on transcript length
  const showFastSpeechWarning = transcribedText && transcribedText.split(/\s+/).length > 8 && isListening

  // CRITICAL FIX: Don't show timeout overlay in VoiceOverlay when ErrorOverlay is handling it
  // The ErrorOverlay has better UX with retry/keyboard buttons
  const showTimeoutInVoiceOverlay = false // Disabled - ErrorOverlay handles timeout now

  // Auto-hide after 3s silence
  useEffect(() => {
    if (!isListening) {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      return
    }

    // Check if transcript has changed
    if (transcribedText !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcribedText
      // Reset timer on new speech
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    } else if (transcribedText) {
      // Start silence timer if we have text but no new input
      silenceTimerRef.current = setTimeout(() => {
        onSilenceTimeout?.()
        setState('confirming')
      }, 3000)
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [isListening, transcribedText, onSilenceTimeout, setState])

  return (
    <div className="fixed inset-0 z-40 pointer-events-none" role="region" aria-label="Voice input overlay">
      {/* TIMEOUT OVERLAY - DISABLED: ErrorOverlay now handles timeout with better UX */}
      {/* CRITICAL FIX: Prevents multiple overlays from stacking and blocking UI */}
      <AnimatePresence>
        {showTimeoutInVoiceOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring' as const, damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl"
            >
              {/* Large timeout emoji */}
              <div className="text-[64px] mb-4">⏰</div>

              {/* Large bold title */}
              <p className="text-[24px] font-bold text-text-primary mb-2">
                {errorCount === 1 ? 'समय समाप्त' : errorCount === 2 ? 'फिर समय समाप्त' : 'अंतिम प्रयास'}
              </p>

              {/* Secondary text */}
              <p className="text-[18px] text-text-secondary mb-4">
                {errorCount === 1
                  ? 'कृपया धीरे और साफ़ बोलें'
                  : errorCount === 2
                    ? 'कीबोर्ड का उपयोग करें'
                    : 'टाइप करना बेहतर होगा'}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`w-3 h-3 rounded-full ${n <= errorCount ? 'bg-saffron' : 'bg-border-default'
                      }`}
                  />
                ))}
              </div>

              {/* Helper text */}
              <p className="text-[16px] text-text-placeholder">
                {errorCount >= 2 ? '👇 नीचे कीबोर्ड बटन दबाएं' : '🎤 फिर से बोलें या कीबोर्ड चुनें'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing ring animation for listening state */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <div className="relative">
              {/* Outer pulsing ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' as const }}
                className="absolute inset-0 rounded-full border-4 border-saffron/30"
              />
              {/* Inner pulsing ring */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0.4 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' as const, delay: 0.5 }}
                className="absolute inset-0 rounded-full border-4 border-saffron/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice wave animation with saffron-glow */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-saffron-light/20 to-transparent h-32 saffron-glow-active"
            role="status"
            aria-label="Voice waveform visualization"
          >
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="waveform-bar bg-gradient-to-t from-saffron to-orange-400"
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Noise Indicator with saffron-glow */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-40 right-4 bg-surface-card rounded-card shadow-card p-3 pointer-events-auto saffron-glow-active"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-text-secondary text-[20px]">
                mic
              </span>
              <span className="text-text-secondary text-[16px] font-semibold">आसपास का शोर</span>
            </div>

            {/* Noise level bars */}
            <div className="flex items-end gap-1 h-12">
              {[6, 10, 14, 18, 22].map((height, i) => {
                let barColor = 'bg-trust-green'
                if (isHighNoise) barColor = 'bg-error-red'
                else if (isMediumNoise) barColor = 'bg-warning-amber'

                return (
                  <motion.div
                    key={i}
                    className={`w-2 rounded-full ${barColor}`}
                    animate={{
                      height: isListening ? [8, height, 8] : 8,
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: isListening ? Infinity : 0,
                      delay: i * 0.1,
                    }}
                  />
                )
              })}
            </div>

            {/* Noise level text - UI-010 FIX: Increased from 12px to 18px */}
            {isHighNoise && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 flex items-center gap-2 bg-error-red-bg border-2 border-error-red rounded-lg px-5 py-3"
              >
                <span className="text-[24px]">⚠️</span>
                <div>
                  <p className="text-[18px] font-bold text-error-red">बहुत ज़्यादा शोर!</p>
                  <p className="text-[18px] text-text-secondary font-medium">कीबोर्ड का उपयोग करें</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question display */}
      <div className="absolute bottom-32 left-4 right-4">
        <div className="bg-surface-card rounded-card shadow-card p-5">
          <p className="text-text-primary font-medium mb-3 text-[18px]">{question}</p>

          {/* BUG-003/018 FIX: Low confidence warning */}
          {showLowConfidence && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-4 bg-warning-amber-bg border-2 border-warning-amber rounded-lg flex items-center gap-3"
            >
              <span className="text-[28px]">❓</span>
              <div>
                <p className="text-[18px] font-bold text-warning-amber">साफ़ नहीं सुनाई दिया</p>
                <p className="text-[18px] text-text-secondary font-medium">कृपया फिर से बोलें या कीबोर्ड का उपयोग करें</p>
              </div>
            </motion.div>
          )}

          {/* UI-015 FIX: Fast speech warning */}
          {showFastSpeechWarning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-4 bg-warning-amber-bg border-2 border-warning-amber rounded-lg flex items-center gap-3"
            >
              <span className="text-[28px]">🐢</span>
              <div>
                <p className="text-[18px] font-bold text-warning-amber">थोड़ा धीरे बोलें</p>
                <p className="text-[18px] text-text-secondary font-medium">ताकि मैं सही से समझ सकूं</p>
              </div>
            </motion.div>
          )}

          {interimText && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text-secondary text-[16px]"
            >
              {interimText}
            </motion.p>
          )}

          {transcribedText && isConfirming && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-saffron font-semibold text-[18px]"
            >
              {transcribedText}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
