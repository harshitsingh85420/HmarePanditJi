'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'

export function CelebrationOverlay() {
  const { showCelebration, celebrationStepName, dismissCelebration } = useUIStore()

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
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
            {/* Glow ring */}
            <div className="absolute inset-0 glow-ring rounded-full" />

            {/* Center checkmark */}
            <div className="w-20 h-20 bg-saffron rounded-full flex items-center justify-center shadow-card-saffron">
              <span className="material-symbols-outlined text-5xl text-white filled">
                check_circle
              </span>
            </div>

            {/* Success text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <p className="text-lg font-bold text-text-primary">
                {celebrationStepName || 'बहुत अच्छा!'}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
