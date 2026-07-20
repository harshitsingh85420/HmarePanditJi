'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { useEffect } from 'react'

/**
 * CelebrationOverlay (T-02) — the small step-completion उत्सव.
 *
 * Canon-skinned to frame 34 (उत्सव · बुकिंग स्वीकार): the leaf badge
 * #1E7A46 under 0 12px 30px rgba(30,122,70,.4), a #FFF6E9 glyph, and the
 * step name at 20/900 #155C34. Confetti uses canon accents only — the old
 * Tailwind default `orange-500` appears nowhere in the artboards.
 *
 * Features:
 * - Leaf glow ring
 * - Checkmark stamp
 * - Confetti (8 particles, canon palette)
 * - 1.4s duration
 *
 * Accessibility:
 * - Reduced motion support (framer-motion honours the OS setting)
 * - Screen reader announcement
 * - Step name at the 18sp body floor
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

  // Confetti colors — canon accents only (gold, brass, genda, leaf, sindoor)
  const confettiColors = ['#E7B54A', '#B8860B', '#F2A02C', '#1E7A46', '#B23A1A']

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
            {/* Leaf glow ring — canon rgba(30,122,70,.4) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, repeatType: 'loop' as const }}
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 20px 4px rgba(30,122,70,0.35)' }}
              aria-hidden="true"
            />

            {/* Center checkmark — canon leaf badge, stamped at -8deg */}
            <motion.div
              initial={{ scale: 2.6, rotate: -24, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: '#1E7A46', boxShadow: '0 12px 30px rgba(30,122,70,.4)' }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="material-symbols-outlined text-[48px] leading-none text-chandan filled"
                aria-hidden="true"
              >
                check
              </motion.span>
            </motion.div>

            {/* Success text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <p
                className="text-[20px] font-black font-hindi leading-snug text-leaf-700"
                aria-live="polite"
              >
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
