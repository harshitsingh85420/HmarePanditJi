'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'

interface ConfirmationSheetProps {
  transcribedText: string
  confidence: number
  isVisible: boolean
  onConfirm: () => void
  onRetry: () => void
  onEdit: () => void
  autoConfirmSeconds?: number
}

/**
 * ConfirmationSheet (V-04)
 * 
 * Features:
 * - Bottom sheet slide-up animation
 * - Transcribed text (large font)
 * - "हाँ, सही है" (green) button
 * - "नहीं, बदलें" (red) button  
 * - 15s countdown auto-dismiss
 * 
 * Accessibility:
 * - All buttons have aria-label
 * - Keyboard navigation (Tab, Enter, Escape)
 * - Focus indicators visible
 * - Screen reader announcements
 */
export function ConfirmationSheet({
  transcribedText,
  confidence,
  isVisible,
  onConfirm,
  onRetry,
  onEdit,
  autoConfirmSeconds = 15,
}: ConfirmationSheetProps) {
  const [countdown, setCountdown] = useState(autoConfirmSeconds)
  const [progress, setProgress] = useState(100)
  const { setState } = useVoiceStore()
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const retryButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management - focus confirm button when sheet opens
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 100)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      setCountdown(autoConfirmSeconds)
      setProgress(100)
      return
    }

    setState('confirming')

    // BUG-014 CRITICAL FIX: Removed auto-confirm after silence
    // Auto-confirm was dangerous - user could get distracted and wrong data confirmed
    // Now user MUST explicitly click "हाँ, सही है" to confirm
    // 15s countdown auto-dismiss (not auto-confirm)
    const interval = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1
        setProgress((next / autoConfirmSeconds) * 100)

        if (next <= 0) {
          clearInterval(interval)
          // BUG-014 FIX: Do NOT auto-confirm - just reset to idle state
          // User must explicitly confirm by clicking the button
          setState('idle')
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, autoConfirmSeconds, setState])

  const showLowConfidence = confidence > 0 && confidence < 0.80

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // On Escape, dismiss and reset
        setState('idle')
      } else if (e.key === 'Enter') {
        // On Enter, confirm
        onConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, onConfirm, setState])

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-text-primary"
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0, 0, 1] }}
            className="fixed bottom-[100px] left-0 right-0 z-40 bg-surface-card max-w-md mx-auto
                       rounded-t-[20px] shadow-sheet overflow-hidden max-h-[60vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-sheet-title"
            aria-describedby="confirmation-sheet-description"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2" aria-hidden="true">
              <div className="w-12 h-1 bg-border-default rounded-full" />
            </div>

            <div className="px-6 pb-6 flex flex-col gap-5">
              {/* What was said */}
              <div id="confirmation-sheet-description">
                <p className="text-text-secondary text-base font-label mb-2">
                  आपने कहा:
                </p>

                <div className="bg-saffron-tint rounded-card-sm px-4 py-3">
                  <p
                    id="confirmation-sheet-title"
                    className="text-text-primary font-devanagari text-2xl font-bold"
                    aria-live="polite"
                  >
                    {transcribedText}
                  </p>
                </div>

                {/* Low confidence warning */}
                {showLowConfidence && (
                  <p className="text-warning-amber text-base mt-2 flex items-center gap-1" role="alert">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">warning</span>
                    पक्का करें — थोड़ा unsure हूँ
                  </p>
                )}
              </div>

              {/* Countdown progress */}
              <div className="flex items-center gap-3" role="timer" aria-label={`Countdown: ${countdown} seconds remaining`}>
                <span className="material-symbols-outlined text-text-secondary text-base" aria-hidden="true">
                  timer
                </span>
                <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-saffron"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-text-secondary text-base font-mono w-12 text-right" aria-live="off">
                  {countdown}s
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  ref={confirmButtonRef}
                  whileTap={{ scale: 0.97 }}
                  onClick={onConfirm}
                  className="flex-1 min-h-[64px] rounded-btn bg-trust-green text-white font-bold text-base
                           flex items-center justify-center gap-2 shadow-btn-green focus:outline-none focus:ring-2 focus:ring-trust-green focus:ring-offset-2"
                  aria-label="Confirm: Yes, this is correct"
                >
                  <span className="material-symbols-outlined text-xl filled" aria-hidden="true">check_circle</span>
                  <span>हाँ, सही है</span>
                </motion.button>

                <motion.button
                  ref={retryButtonRef}
                  whileTap={{ scale: 0.97 }}
                  onClick={onRetry}
                  className="flex-1 min-h-[64px] rounded-btn border-2 border-error-red text-error-red
                           font-bold text-base flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-error-red focus:ring-offset-2"
                  aria-label="Retry: No, change my answer"
                >
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">refresh</span>
                  <span>नहीं, बदलें</span>
                </motion.button>
              </div>

              {/* Edit button (keyboard) */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onEdit}
                className="w-full min-h-[64px] text-text-secondary font-medium text-base underline-offset-2
                         flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2"
                aria-label="Edit: Type your answer using keyboard"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">edit</span>
                <span>टाइप करके सुधारें</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
