'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { useEffect } from 'react'

/**
 * CelebrationOverlay (T-02)
 * 
 * Features:
 * - Saffron glow ring
 * - Checkmark draw animation
 * - Confetti (5-10 particles)
 * - 1.4s duration
 * 
 * Accessibility:
 * - Reduced motion support
 * - Screen reader announcement
 */
export function CelebrationOverlay() {
  const { showCelebration, celebrationStepName, dismissCelebration } = useUIStore()

  // Auto-dismiss after 1.4s
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        dismissCelebration()
      }, 1400)
      return () => clearTimeout(timer)
    }
  }, [showCelebration, dismissCelebration])

  // Confetti colors
  const confettiColors = ['#F09942', '#DC6803', '#FEF3C7', '#1B6D24', '#BA1A1A']

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          role="status"
          aria-label="Success celebration animation"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{
              type: 'spring' as const,
              damping: 15,
              stiffness: 300,
              delay: 0.1
            }}
            className="relative"
          >
            {/* Saffron glow ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, repeatType: 'loop' as const }}
              className="absolute inset-0 rounded-full glow-ring"
              aria-hidden="true"
            />

            {/* Center checkmark with saffron background */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="w-20 h-20 bg-gradient-to-br from-saffron to-orange-500 rounded-full flex items-center justify-center shadow-card-saffron"
            >
              <motion.span
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="material-symbols-outlined text-5xl text-white filled"
                aria-hidden="true"
              >
                check_circle
              </motion.span>
            </motion.div>

            {/* Success text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <p className="text-lg font-bold text-text-primary" aria-live="polite">
                {celebrationStepName || 'बहुत अच्छा!'}
              </p>
            </motion.div>

            {/* Confetti particles (8 particles) */}
            <div className="absolute inset-0" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200 + 50,
                    opacity: [1, 1, 0],
                    scale: [0, 1, 0.5],
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 1.4,
                    delay: 0.2 + i * 0.05,
                    ease: 'easeOut'
                  }}
                  className="absolute left-1/2 top-1/2 w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: confettiColors[i % confettiColors.length],
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
