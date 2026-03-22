'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!isVisible) {
      setCountdown(autoConfirmSeconds)
      setProgress(100)
      return
    }

    setState('confirming')

    const interval = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1
        setProgress((next / autoConfirmSeconds) * 100)

        if (next <= 0) {
          clearInterval(interval)
          // 2-second silence gate before confirming
          setTimeout(() => {
            onConfirm()
            setState('idle')
          }, 2000)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, autoConfirmSeconds, onConfirm, setState])

  const showLowConfidence = confidence > 0 && confidence < 0.80

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
          />

          {/* BUG-005 FIX: Bottom Sheet - Push up by bottom-[100px] so footer buttons are accessible above */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0, 0, 1] }}
            className="fixed bottom-[100px] left-0 right-0 z-40 bg-surface-card max-w-md mx-auto
                       rounded-t-[20px] shadow-sheet overflow-hidden"
            style={{ maxHeight: '60vh' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-8 h-1 bg-border-default rounded-full" />
            </div>

            <div className="px-6 pb-6 flex flex-col gap-5">
              {/* What was said */}
              <div>
                <p className="text-text-secondary text-xs font-label mb-2">
                  आपने कहा:
                </p>

                <div className="bg-saffron-tint rounded-card-sm px-4 py-3">
                  <p className="text-text-primary font-devanagari text-2xl font-bold">
                    {transcribedText}
                  </p>
                </div>

                {/* Low confidence warning */}
                {showLowConfidence && (
                  <p className="text-warning-amber text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    पक्का करें — थोड़ा unsure हूँ
                  </p>
                )}
              </div>

              {/* Countdown progress */}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-text-secondary text-sm">
                  timer
                </span>
                <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-saffron"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
                <span className="text-text-secondary text-sm font-mono w-8 text-right">
                  {countdown}s
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onConfirm}
                  className="flex-1 h-[60px] rounded-btn bg-saffron text-white font-bold
                           flex items-center justify-center gap-2 shadow-btn-saffron"
                >
                  <span className="material-symbols-outlined text-lg filled">check_circle</span>
                  <span>हाँ, सही है</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onRetry}
                  className="flex-1 h-[60px] rounded-btn border-2 border-saffron text-saffron
                           font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  <span>नहीं, बदलें</span>
                </motion.button>
              </div>

              {/* Edit button (keyboard) - BUG-004 FIX: min-h-[56px] for 52px touch target */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onEdit}
                className="w-full min-h-[56px] text-text-secondary font-medium underline-offset-2
                         flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">edit</span>
                <span>टाइप करके सुधारें</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
