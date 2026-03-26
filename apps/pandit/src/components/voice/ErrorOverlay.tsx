'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'
import { useEffect, useRef } from 'react'

interface ErrorOverlayProps {
  onRetry: () => void
  onUseKeyboard: () => void
}

/**
 * ErrorOverlay (V-05/V-06/V-07)
 * 
 * Features:
 * - Error 1: "माफ़ कीजिए, फिर से बोलिए"
 * - Error 2: "आवाज़ समझ नहीं आई"
 * - Error 3: "Keyboard से जवाब दीजिए" + auto-open keyboard
 * 
 * Accessibility:
 * - All buttons have aria-label
 * - Keyboard navigation (Tab, Enter, Escape)
 * - Focus indicators visible
 * - Screen reader announcements
 */
export function ErrorOverlay({ onRetry, onUseKeyboard }: ErrorOverlayProps) {
  const { state, errorCount, ambientNoiseLevel } = useVoiceStore()
  const retryButtonRef = useRef<HTMLButtonElement>(null)
  const keyboardButtonRef = useRef<HTMLButtonElement>(null)

  const isError1 = state === 'error_1'
  const isError2 = state === 'error_2'
  const isError3 = state === 'error_3'

  // BUG-002 FIX: On V-07 (error_3), let pointer events pass through to keyboard toggle behind
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFinalError = state === 'error_3'

  // BUG-MEDIUM-04 FIX: Raised threshold from 65dB to 85dB to prevent false-triggering
  // 65dB is normal conversation level - should NOT trigger warning
  // 85dB+ is genuinely loud (temple bells, heavy traffic, crowds)
  const isHighNoise = ambientNoiseLevel > 85

  // BUG-004 FIX: Show noise warning if noise level is high
  const shouldShowNoiseWarning = isHighNoise

  // Focus management - focus retry button when overlay opens
  useEffect(() => {
    if (isError1 || isError2) {
      setTimeout(() => {
        retryButtonRef.current?.focus()
      }, 100)
    } else if (isError3) {
      setTimeout(() => {
        keyboardButtonRef.current?.focus()
      }, 100)
    }
  }, [isError1, isError2, isError3])

  // Keyboard navigation
  useEffect(() => {
    if (!isError1 && !isError2 && !isError3) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // On Escape, focus keyboard button
        keyboardButtonRef.current?.focus()
      } else if (e.key === 'Enter') {
        // On Enter, trigger focused button
        if (document.activeElement === retryButtonRef.current) {
          onRetry()
        } else if (document.activeElement === keyboardButtonRef.current) {
          onUseKeyboard()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isError1, isError2, isError3, onRetry, onUseKeyboard])

  const getErrorConfig = () => {
    if (isError1) return {
      title: 'माफ़ कीजिए',
      message: 'फिर से बोलिए',
      icon: 'hearing',
      iconColor: 'text-warning-amber',
      bgColor: 'bg-warning-amber-bg',
      borderColor: 'border-warning-amber',
      showRetry: true,
      showKeyboard: true,
      hint: '🎤 फिर से बोलें',
    }
    if (isError2) return {
      title: 'आवाज़ समझ नहीं आई',
      message: 'कृपया धीरे बोलें या कीबोर्ड चुनें',
      icon: 'mic_off',
      iconColor: 'text-error-red',
      bgColor: 'bg-error-red-bg',
      borderColor: 'border-error-red',
      showRetry: true,
      showKeyboard: true,
      hint: '⌨️ कीबोर्ड या 🎤 बोलें',
    }
    if (isError3) return {
      title: 'Keyboard से जवाब दीजिए',
      message: 'आवाज़ नहीं समझ आई। कृपया टाइप करें।',
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
        className="fixed bottom-[100px] left-0 right-0 z-40 px-4 pb-safe pointer-events-none"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-overlay-title"
        aria-describedby="error-overlay-description"
      >
        <div className="max-w-md mx-auto w-full pointer-events-auto mb-4">
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
                aria-hidden="true"
              >
                <span className={`material-symbols-outlined text-2xl ${error.iconColor}`}>
                  {error.icon}
                </span>
              </motion.div>
              <div className="flex-1">
                <h3 id="error-overlay-title" className="text-lg font-bold text-text-saffron">{error.title}</h3>
                <p id="error-overlay-description" className="text-text-secondary text-lg">{error.message}</p>
              </div>
            </div>

            {/* Ambient noise warning (if applicable) */}
            {shouldShowNoiseWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-warning-amber-bg rounded-card-sm flex items-center gap-2"
                role="alert"
              >
                <span className="material-symbols-outlined text-warning-amber text-lg" aria-hidden="true">
                  volume_up
                </span>
                <p className="text-warning-amber text-lg font-medium">
                  आसपास शोर ज़्यादा है। शांत जगह जाएं।
                </p>
              </motion.div>
            )}

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mb-4" aria-label={`Error ${errorCount} of 3`}>
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
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {error.showRetry && (
                <motion.button
                  ref={retryButtonRef}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onRetry}
                  className={`flex-1 min-h-[64px] rounded-btn font-bold flex items-center justify-center gap-2 text-base ${isError2
                    ? 'bg-saffron text-white shadow-btn-saffron'
                    : 'border-2 border-saffron text-saffron'
                    } focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2`}
                  aria-label={isError2 ? 'Retry: Last attempt to use voice' : 'Retry: Try speaking again'}
                >
                  <span className="material-symbols-outlined text-lgl" aria-hidden="true">refresh</span>
                  <span>{isError2 ? 'आखिरी कोशिश' : 'फिर से बोलें'}</span>
                </motion.button>
              )}

              <motion.button
                ref={keyboardButtonRef}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={onUseKeyboard}
                className={`flex-1 min-h-[64px] rounded-btn font-bold flex items-center justify-center gap-2 text-base ${isError3
                  ? 'bg-saffron text-white shadow-btn-saffron'
                  : 'border-2 border-saffron text-saffron'
                  } focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2`}
                aria-label="Use keyboard to type your answer"
              >
                <span className="material-symbols-outlined text-lgl" aria-hidden="true">keyboard</span>
                <span>{isError3 ? 'टाइप करें' : 'कीबोर्ड'}</span>
              </motion.button>
            </div>

            {/* Helper hint */}
            <p className="mt-4 text-center text-base text-text-placeholder" aria-hidden="true">
              {error.hint}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
