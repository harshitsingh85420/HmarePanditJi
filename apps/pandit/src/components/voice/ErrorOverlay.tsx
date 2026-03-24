'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'

interface ErrorOverlayProps {
  onRetry: () => void
  onUseKeyboard: () => void
}

export function ErrorOverlay({ onRetry, onUseKeyboard }: ErrorOverlayProps) {
  const { state, errorCount, ambientNoiseLevel } = useVoiceStore()

  const isError1 = state === 'error_1'
  const isError2 = state === 'error_2'
  const isError3 = state === 'error_3'

  // BUG-002 FIX: On V-07 (error_3), let pointer events pass through to keyboard toggle behind
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFinalError = state === 'error_3'

  const isHighNoise = ambientNoiseLevel > 65

  // BUG-004 FIX: Show noise warning if noise level is high
  const shouldShowNoiseWarning = isHighNoise

  const getErrorConfig = () => {
    if (isError1) return {
      title: 'सुनाई नहीं दिया',
      message: 'कृपया धीरे और साफ़ बोलें।',
      icon: 'hearing',
      iconColor: 'text-warning-amber',
      bgColor: 'bg-warning-amber-bg',
      borderColor: 'border-warning-amber',
      showRetry: true,
      showKeyboard: true,
      hint: '🎤 धीरे और साफ़ बोलें',
    }
    if (isError2) return {
      title: 'फिर से कोशिश करें',
      message: 'थोड़ा धीरे बोलें, या कीबोर्ड का उपयोग करें।',
      icon: 'mic_off',
      iconColor: 'text-error-red',
      bgColor: 'bg-error-red-bg',
      borderColor: 'border-error-red',
      showRetry: true,
      showKeyboard: true,
      hint: '⌨️ कीबोर्ड या 🎤 फिर से बोलें',
    }
    if (isError3) return {
      title: 'कीबोर्ड का उपयोग करें',
      message: 'आवाज़ नहीं समझ आई। आप टाइप कर सकते हैं।',
      icon: 'keyboard',
      iconColor: 'text-text-saffron',
      bgColor: 'bg-surface-card',
      borderColor: 'border-border-default',
      showRetry: false,
      showKeyboard: true,
      hint: '⌨️ नीचे टाइप करें',
    }
    return null
  }

  const error = getErrorConfig()
  if (!error) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        // BUG-005 FIX: Push overlay up by bottom-[100px] so footer buttons are accessible above it
        className="fixed bottom-[100px] left-0 right-0 z-40 px-4 pb-safe pointer-events-none"
      >
        <div className="max-w-md mx-auto w-full pointer-events-auto mb-4">
          {/* BUG-005 FIX: Added max-h-[70vh] and overflow-y-auto to prevent blocking footer */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${error.bgColor} ${error.borderColor} border-2 rounded-card p-4 shadow-card saffron-glow-active max-h-[70vh] overflow-y-auto`}
          >
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, damping: 15 }}
                className={`w-12 h-12 rounded-full bg-surface-card flex items-center justify-center`}
              >
                <span className={`material-symbols-outlined text-2xl ${error.iconColor}`}>
                  {error.icon}
                </span>
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text-saffron">{error.title}</h3>
                <p className="text-text-secondary text-lg">{error.message}</p>
              </div>
            </div>

            {/* Ambient noise warning (if applicable) */}
            {/* BUG-004 FIX: Show noise warning on all error states when noise is high */}
            {shouldShowNoiseWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-warning-amber-bg rounded-card-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-warning-amber text-lg">
                  volume_up
                </span>
                <p className="text-warning-amber text-lg font-medium">
                  आसपास शोर ज़्यादा है। शांत जगह जाएं।
                </p>
              </motion.div>
            )}

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((n) => (
                <motion.div
                  key={n}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{
                    scale: n <= errorCount ? 1 : 0.8,
                    opacity: n <= errorCount ? 1 : 0.5,
                  }}
                  className={`w-3 h-3 rounded-full transition-colors ${n <= errorCount
                    ? n === 3
                      ? 'bg-saffron'
                      : n === 2
                        ? 'bg-error-red'
                        : 'bg-warning-amber'
                    : 'bg-border-default'
                    }`}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {error.showRetry && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onRetry}
                  className={`flex-1 min-h-[64px] rounded-btn font-bold flex items-center justify-center gap-2 text-base ${isError2
                    ? 'bg-saffron text-white shadow-btn-saffron'
                    : 'border-2 border-saffron text-saffron'
                    }`}
                >
                  <span className="material-symbols-outlined text-lgl">refresh</span>
                  <span>{isError2 ? 'आखिरी कोशिश' : 'फिर से बोलें'}</span>
                </motion.button>
              )}

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={onUseKeyboard}
                className={`flex-1 min-h-[64px] rounded-btn font-bold flex items-center justify-center gap-2 text-base ${isError3
                  ? 'bg-saffron text-white shadow-btn-saffron'
                  : 'border-2 border-saffron text-saffron'
                  }`}
              >
                <span className="material-symbols-outlined text-lgl">keyboard</span>
                <span>{isError3 ? 'टाइप करें' : 'कीबोर्ड'}</span>
              </motion.button>
            </div>

            {/* Helper hint */}
            <p className="mt-4 text-center text-base text-text-lglaceholder">
              {error.hint}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
