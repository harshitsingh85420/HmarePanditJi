'use client'

import { motion } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'

interface CelebrationOverlayProps {
  stepName?: string
  currentStep?: number
  totalSteps?: number
}

export function CelebrationOverlay({
  stepName,
  currentStep,
  totalSteps = 6,
}: CelebrationOverlayProps) {
  const { celebrationStepName } = useUIStore()
  const { getCompletionPercentage } = useRegistrationStore()

  const displayName = stepName || celebrationStepName
  const percentage = getCompletionPercentage()
  const stepNumber = currentStep || Math.ceil((percentage / 100) * totalSteps)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] celebration-bg flex items-center justify-center p-8"
    >
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-10">
        {/* Hero: Large Saffron Glowing Circle */}
        <div className="relative">
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-2xl transform scale-150" />

          {/* Main Circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative w-32 h-32 bg-primary-container rounded-full flex items-center justify-center shadow-[0px_8px_24px_rgba(144,77,0,0.25)] border-4 border-surface-container-lowest glow-ring"
          >
            <span
              className="material-symbols-outlined text-surface-container-lowest text-6xl font-bold filled"
              style={{ fontVariationSettings: "'wght' 700, 'FILL' 1" }}
            >
              check
            </span>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="font-headline text-3xl md:text-4xl text-primary font-bold leading-tight tracking-tight">
            {displayName} ho gaya! 🙏
          </h1>
          <p className="font-body italic text-lg text-on-surface-variant opacity-80">
            Bahut achha, Pandit Ji.
          </p>
        </motion.div>

        {/* Progress Update Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-xs pt-8"
        >
          <div className="flex items-center justify-between gap-3">
            {Array.from({ length: totalSteps }, (_, i) => {
              const isCompleted = i + 1 <= stepNumber
              const isNewlyCompleted = i + 1 === stepNumber

              return (
                <div
                  key={i}
                  className={`relative h-2.5 flex-1 rounded-full transition-all duration-300 ${isCompleted ? 'bg-primary-container' : 'bg-surface-variant'
                    }`}
                >
                  {isNewlyCompleted && (
                    <div className="absolute inset-0 glow-ring ring-2 ring-primary-container ring-offset-2 ring-offset-surface" />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-xs font-label uppercase tracking-widest text-outline">
            Step {stepNumber} of {totalSteps} Complete
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
