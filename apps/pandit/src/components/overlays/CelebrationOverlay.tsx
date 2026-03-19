'use client'

import { motion } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'

export function CelebrationOverlay() {
  const { celebrationStepName } = useUIStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      style={{
        background: 'radial-gradient(circle, rgba(255,140,0,0.08) 0%, rgba(255,255,255,1) 70%)',
      }}
    >
      <div className="flex flex-col items-center gap-8 text-center px-8">
        {/* Saffron checkmark circle */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-saffron rounded-full blur-2xl opacity-20 scale-150" />
          
          {/* Circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative w-32 h-32 bg-saffron rounded-full flex items-center justify-center shadow-btn-saffron"
          >
            <span 
              className="material-symbols-outlined text-white text-6xl"
              style={{ fontVariationSettings: "'wght' 700" }}
            >
              check
            </span>
          </motion.div>
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-2"
        >
          <h1 className="font-serif text-2xl font-bold text-saffron-dark font-devanagari">
            {celebrationStepName} ho gaya! 🙏
          </h1>
          <p className="text-text-secondary text-base italic font-devanagari">
            Bahut achha, Pandit Ji.
          </p>
        </motion.div>

        {/* Progress pills indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2"
        >
          <span className="text-text-disabled text-xs font-label">Saving...</span>
        </motion.div>
      </div>
    </motion.div>
  )
}
