'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'

interface VoiceOverlayProps {
  question: string
  interimText?: string
}

export function VoiceOverlay({ question, interimText }: VoiceOverlayProps) {
  const { state, transcribedText, confidence, ambientNoiseLevel } = useVoiceStore()

  const isListening = state === 'listening'
  const isProcessing = state === 'processing'
  const isConfirming = state === 'confirming'

  // Noise level interpretation
  const isHighNoise = ambientNoiseLevel > 65
  const isMediumNoise = ambientNoiseLevel > 40

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Voice wave animation */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-saffron-light/20 to-transparent h-32"
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

      {/* Ambient Noise Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-40 right-4 bg-surface-card rounded-card shadow-card p-3 pointer-events-auto"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-text-secondary text-sm">
                mic
              </span>
              <span className="text-text-secondary text-xs font-medium">Ambient Noise</span>
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
                    style={{ height }}
                    animate={{
                      scaleY: isListening ? [0.3, 1, 0.3] : 0.3,
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

            {/* Noise level text */}
            {isHighNoise && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-warning-amber text-xs mt-1"
              >
                शोर ज़्यादा है
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question display */}
      <div className="absolute bottom-32 left-4 right-4">
        <div className="bg-surface-card rounded-card shadow-card p-4">
          <p className="text-text-primary font-medium mb-2">{question}</p>

          {interimText && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text-secondary text-sm"
            >
              {interimText}
            </motion.p>
          )}

          {transcribedText && isConfirming && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-saffron font-semibold"
            >
              {transcribedText}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
