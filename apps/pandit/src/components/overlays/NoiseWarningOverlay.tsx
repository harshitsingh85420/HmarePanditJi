'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useVoiceStore } from '@/stores/voiceStore'
import { speakWithSarvam } from '@/lib/sarvam-tts'

/**
 * Ambient Noise Pre-Check Flow
 * 
 * As specified in HPJ_Voice_Complete_Guide.md:
 * - Detects ambient noise >65dB before STT session starts
 * - Interrupts flow with friendly warning
 * - Suggests keyboard mode or quieter location
 * - Prevents Pandit Ji from getting frustrated by failed voice input
 * 
 * Usage: Wrap voice input screens with this component or use the hook
 */

interface NoiseWarningOverlayProps {
  onSwitchToKeyboard?: () => void
  onRetry?: () => void
  isVisible: boolean
}

export function NoiseWarningOverlay({
  onSwitchToKeyboard,
  onRetry,
  isVisible,
}: NoiseWarningOverlayProps) {
  const [noiseLevel, setNoiseLevel] = useState(0)
  const { ambientNoiseLevel, resetErrors } = useVoiceStore()

  useEffect(() => {
    setNoiseLevel(ambientNoiseLevel)
  }, [ambientNoiseLevel])

  useEffect(() => {
    if (isVisible && ambientNoiseLevel > 65) {
      // Play warning voice
      void speakWithSarvam({
        text: 'मंदिर में शोर है। कृपया शांत जगह जाएं या बटन दबाकर चुनें।',
        languageCode: 'hi-IN',
        pace: 0.85,
      })
    }
  }, [isVisible, ambientNoiseLevel])

  const getNoiseMessage = (level: number) => {
    if (level > 85) {
      return {
        title: 'बहुत ज्यादा शोर',
        subtitle: 'आवाज़ सुनाई नहीं दे रही',
        suggestion: 'कृपया शांत जगह जाएं',
      }
    } else if (level > 75) {
      return {
        title: 'काफी शोर है',
        subtitle: 'पृष्ठभूमि में घंटी या भीड़ की आवाज़',
        suggestion: 'थोड़ा शांत कोने में जाएं',
      }
    } else {
      return {
        title: 'शोर है',
        subtitle: 'पृष्ठभूमि में आवाज़ें हैं',
        suggestion: 'ध्यान से सुनने की कोशिश करें',
      }
    }
  }

  const message = getNoiseMessage(noiseLevel)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Warning Card */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="relative w-full max-w-md mx-4 mb-6 bg-surface-card rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-warning-amber to-warning-amber/80 p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <span className="material-symbols-outlined text-3xl text-white">
                    volume_up
                  </span>
                </motion.div>
                <div>
                  <h3 className="font-bold text-white text-lg font-devanagari">
                    {message.title}
                  </h3>
                  <p className="text-white/90 text-sm font-devanagari">
                    {message.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Noise Level Indicator */}
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm font-devanagari">
                    शोर का स्तर
                  </span>
                  <span className={`font-bold ${noiseLevel > 85 ? 'text-red-600' :
                    noiseLevel > 75 ? 'text-orange-600' :
                      'text-warning-amber'
                    }`}>
                    {noiseLevel}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-surface-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, noiseLevel)}%`,
                      backgroundColor: noiseLevel > 85 ? '#DC2626' :
                        noiseLevel > 75 ? '#EA580C' :
                          '#F59E0B'
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full rounded-full"
                  />
                </div>

                {/* Threshold Marker */}
                <div className="relative mt-1">
                  <div
                    className="absolute w-0.5 h-2 bg-red-600 left-2/3"
                  />
                  <span className="absolute text-xs text-red-600 -top-5 left-2/3">
                    सीमा (65%)
                  </span>
                </div>
              </div>

              {/* Suggestion */}
              <div className="bg-warning-amber-bg border border-warning-amber/20 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-warning-amber text-lg flex-shrink-0">
                    tips_and_updates
                  </span>
                  <p className="text-warning-amber text-sm font-devanagari">
                    {message.suggestion}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onRetry}
                  className="flex-1 h-12 bg-surface-muted rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-text-secondary">
                    refresh
                  </span>
                  <span className="text-text-secondary font-bold font-devanagari">
                    फिर से जांचें
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onSwitchToKeyboard}
                  className="flex-1 h-12 bg-saffron text-white rounded-xl flex items-center justify-center gap-2 shadow-btn-saffron active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined">
                    keyboard
                  </span>
                  <span className="font-bold font-devanagari">
                    बटन दबाएं
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Hook to check ambient noise before starting voice input
 * Returns whether it's safe to start listening
 */
export function useAmbientNoiseCheck() {
  const { ambientNoiseLevel, setAmbientNoise } = useVoiceStore()
  const [isChecking, setIsChecking] = useState(false)
  const [isNoiseHigh, setIsNoiseHigh] = useState(false)

  const checkNoise = async (): Promise<boolean> => {
    setIsChecking(true)
    setIsNoiseHigh(false)

    // Wait for noise level to be measured
    await new Promise(resolve => setTimeout(resolve, 1000))

    const level = ambientNoiseLevel
    const isHigh = level > 65

    setIsNoiseHigh(isHigh)
    setIsChecking(false)

    return !isHigh
  }

  const reset = () => {
    setIsNoiseHigh(false)
    setAmbientNoise(0)
  }

  return {
    isChecking,
    isNoiseHigh,
    noiseLevel: ambientNoiseLevel,
    checkNoise,
    reset,
  }
}

/**
 * Pre-Check Flow Component
 * Wraps voice input screens and automatically checks noise
 */
interface NoisePreCheckProviderProps {
  children: React.ReactNode
  onNoiseHigh?: () => void
  enabled?: boolean
}

export function NoisePreCheckProvider({
  children,
  onNoiseHigh,
  enabled = true,
}: NoisePreCheckProviderProps) {
  const { isNoiseHigh, checkNoise, noiseLevel } = useAmbientNoiseCheck()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (!enabled || hasChecked) return

    const runCheck = async () => {
      const isOk = await checkNoise()
      setHasChecked(true)

      if (!isOk) {
        onNoiseHigh?.()
      }
    }

    runCheck()
  }, [enabled, hasChecked, checkNoise, onNoiseHigh])

  return (
    <>
      {children}
      <NoiseWarningOverlay
        isVisible={isNoiseHigh && hasChecked}
        onSwitchToKeyboard={onNoiseHigh}
        onRetry={async () => {
          setHasChecked(false)
          setTimeout(() => setHasChecked(true), 1000)
        }}
      />
    </>
  )
}

// Export current noise level for debugging
export async function getCurrentNoiseLevel(): Promise<number> {
  if (typeof window === 'undefined') return 0
  try {
    // Dynamic import to avoid circular dependency
    const voiceStoreModule = await import('@/stores/voiceStore')
    return voiceStoreModule.useVoiceStore.getState().ambientNoiseLevel
  } catch {
    return 0
  }
}
