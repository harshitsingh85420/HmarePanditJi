'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'

interface ErrorOverlayProps {
  onRetry?: () => void
  onKeyboard?: () => void
  show?: boolean
}

export default function ErrorOverlay({
  onRetry,
  onKeyboard,
  show = true,
}: ErrorOverlayProps) {
  const { state, errorCount } = useVoiceStore()

  if (!show) return null

  const isError = state === 'error_1' || state === 'error_2' || state === 'error_3'
  const isKeyboard = state === 'keyboard'

  if (!isError && !isKeyboard) return null

  // Different messages for different error counts
  const getErrorMessage = () => {
    switch (state) {
      case 'error_1':
        return {
          title: 'समझ नहीं आया',
          subtitle: 'थोड़ा धीरे और साफ़ बोलें',
          icon: '🤔',
          color: 'warning',
        }
      case 'error_2':
        return {
          title: 'फिर से कोशिश करें',
          subtitle: 'या Keyboard का उपयोग करें',
          icon: '🔄',
          color: 'warning',
        }
      case 'error_3':
      case 'keyboard':
        return {
          title: 'Keyboard से भरें',
          subtitle: 'आवाज़ नहीं पहचान पाए',
          icon: '⌨️',
          color: 'error',
        }
      default:
        return {
          title: 'त्रुटि',
          subtitle: 'कृपया पुनः प्रयास करें',
          icon: '⚠️',
          color: 'warning',
        }
    }
  }

  const error = getErrorMessage()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6"
      >
        <div className="max-w-[390px] mx-auto">
          <div
            className={`rounded-2xl shadow-2xl p-5 border-2 ${
              error.color === 'error'
                ? 'bg-error-lt border-error'
                : 'bg-warning-amber-bg border-warning-amber'
            }`}
          >
            {/* Icon and Title */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{error.icon}</span>
              <div>
                <h3 className="font-bold text-lg text-vedic-brown">
                  {error.title}
                </h3>
                <p className="text-sm text-vedic-gold">
                  {error.subtitle}
                </p>
              </div>
            </div>

            {/* Progress indicators for error count */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    num <= errorCount
                      ? num === 3
                        ? 'bg-error'
                        : 'bg-warning-amber'
                      : 'bg-vedic-border'
                  }`}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {state !== 'keyboard' && onRetry && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onRetry}
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-bold"
                >
                  फिर से कोशिश करें
                </motion.button>
              )}
              {onKeyboard && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onKeyboard}
                  className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 ${
                    state === 'keyboard'
                      ? 'bg-primary text-white'
                      : 'bg-white border-2 border-vedic-border text-vedic-brown'
                  }`}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <rect x="2" y="5" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="2" />
                    <path d="M5 8h1M7 8h1M9 8h1M11 8h1M13 8h1M5 11h1M7 11h1M9 11h3M13 11h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Keyboard
                </motion.button>
              )}
            </div>

            {/* Help text for keyboard mode */}
            {state === 'keyboard' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-vedic-gold mt-3 text-center"
              >
                ⌨️ Keyboard से आसानी से भर सकते हैं
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
