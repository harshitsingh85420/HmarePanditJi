'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConfirmButtons } from '@/components/ui/Button'

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

  useEffect(() => {
    if (!isVisible) {
      setCountdown(autoConfirmSeconds)
      setProgress(100)
      return
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1
        setProgress((next / autoConfirmSeconds) * 100)

        if (next <= 0) {
          clearInterval(interval)
          setTimeout(onConfirm, 2000)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, autoConfirmSeconds, onConfirm])

  const showLowConfidence = confidence > 0 && confidence < 0.8

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-text-primary"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card max-w-md mx-auto
                       rounded-t-[20px] shadow-sheet overflow-hidden"
            style={{ maxHeight: '70vh' }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-8 h-1 bg-border-default rounded-pill" />
            </div>

            <div className="px-6 pb-6 flex flex-col gap-5">
              <div>
                <p className="text-text-secondary text-xs font-label mb-2">Aapne kaha:</p>

                <div className="bg-saffron-tint rounded-card-sm px-4 py-3">
                  <p className="text-text-primary font-devanagari text-2xl font-bold">{transcribedText}</p>
                </div>

                {showLowConfidence && (
                  <p className="text-warning-amber text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Pakka karein — thoda unsure hoon
                  </p>
                )}
              </div>

              <ConfirmButtons onConfirm={onConfirm} onRetry={onRetry} />

              <div className="flex flex-col gap-1.5">
                <div className="h-1 bg-surface-dim rounded-pill overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-container rounded-pill"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-text-disabled text-xs font-label">
                    {countdown} seconds mein apne aap confirm ho jaayega
                  </p>

                  <button onClick={onEdit} className="text-primary text-xs font-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">edit</span>
                    Edit karein?
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
