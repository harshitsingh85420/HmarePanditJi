'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'

interface VoiceOverlayProps {
  question: string
  interimText?: string
}

export function VoiceOverlay({ question, interimText }: VoiceOverlayProps) {
  const { state, transcribedText, confidence, ambientNoiseLevel, errorCount } = useVoiceStore()

  const isListening = state === 'listening'
  const isProcessing = state === 'processing'
  const isConfirming = state === 'confirming'
  const isError = state === 'error_1' || state === 'error_2' || state === 'error_3'

  // BUG-003/018 FIX: Use confidence value to show low confidence warning
  const showLowConfidence = confidence > 0 && confidence < 0.7

  // Noise level interpretation
  const isHighNoise = ambientNoiseLevel > 65
  const isMediumNoise = ambientNoiseLevel > 40

  // UI-015 FIX: Fast speech detection based on transcript length
  const showFastSpeechWarning = transcribedText && transcribedText.split(/\s+/).length > 8 && isListening

  // CRITICAL FIX: Don't show timeout overlay in VoiceOverlay when ErrorOverlay is handling it
  // The ErrorOverlay has better UX with retry/keyboard buttons
  const showTimeoutInVoiceOverlay = false // Disabled - ErrorOverlay handles timeout now

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
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
              <p className="text-[24px] font-bold text-vedic-brown mb-2">
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

      {/* Voice wave animation with saffron-glow */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-saffron-light/20 to-transparent h-32 saffron-glow-active"
          >
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="waveform-bar"
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
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
            <div className="flex items-end gap-1 h-8">
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
                className="mt-2 flex items-center gap-2 bg-error-red-bg border-2 border-error-red rounded-lg px-3 py-2"
              >
                <span className="text-[24px]">⚠️</span>
                <div>
                  <p className="text-[18px] font-bold text-error-red">बहुत ज़्यादा शोर!</p>
                  <p className="text-[14px] text-text-secondary">कीबोर्ड का उपयोग करें</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question display */}
      <div className="absolute bottom-32 left-4 right-4">
        <div className="bg-surface-card rounded-card shadow-card p-4">
          <p className="text-text-primary font-medium mb-2">{question}</p>

          {/* BUG-003/018 FIX: Low confidence warning */}
          {showLowConfidence && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 bg-warning-amber-bg border-2 border-warning-amber rounded-lg flex items-center gap-2"
            >
              <span className="text-[28px]">❓</span>
              <div>
                <p className="text-[16px] font-bold text-warning-amber">साफ़ नहीं सुनाई दिया</p>
                <p className="text-[14px] text-text-secondary">कृपया फिर से बोलें या कीबोर्ड का उपयोग करें</p>
              </div>
            </motion.div>
          )}

          {/* UI-015 FIX: Fast speech warning */}
          {showFastSpeechWarning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 bg-warning-amber-bg border-2 border-warning-amber rounded-lg flex items-center gap-2"
            >
              <span className="text-[28px]">🐢</span>
              <div>
                <p className="text-[16px] font-bold text-warning-amber">थोड़ा धीरे बोलें</p>
                <p className="text-[14px] text-text-secondary">ताकि मैं सही से समझ सकूं</p>
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
