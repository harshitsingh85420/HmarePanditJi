'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'

type TopBarState = 'no-back' | 'with-back' | 'complete'

interface TopBarProps {
  state?: TopBarState
  currentStep?: number     // 1-6 for registration steps
  totalSteps?: number      // Default 6
  onBack?: () => void      // Custom back handler
  showLanguage?: boolean
}

export function TopBar({
  state = 'with-back',
  currentStep,
  totalSteps = 6,
  onBack,
  showLanguage = true,
}: TopBarProps) {
  const router = useRouter()
  const { isListening } = useVoiceStore() as { isListening: boolean }

  const handleBack = () => {
    // If voice is listening, pause it first (do not navigate immediately)
    if (isListening) {
      // The voice hook cleanup handles this
    }
    
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-surface-base shadow-top-bar">
      <div className="flex items-center justify-between px-5 h-14">
        {/* Left: Back Arrow */}
        <div className="w-10 h-10 flex items-center justify-center">
          {state !== 'no-back' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-text-primary text-2xl">arrow_back</span>
            </motion.button>
          )}
        </div>

        {/* Center: Progress Pills OR Complete Badge */}
        <div className="flex-1 flex items-center justify-center px-4">
          {state === 'complete' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-trust-green-bg rounded-pill">
              <span className="material-symbols-outlined text-trust-green text-base filled">check_circle</span>
              <span className="text-trust-green font-bold text-xs">Registration Complete ✅</span>
            </div>
          ) : currentStep !== undefined ? (
            <ProgressPills current={currentStep} total={totalSteps} />
          ) : null}
        </div>

        {/* Right: Language Button */}
        <div className="w-10 h-10 flex items-center justify-center">
          {showLanguage && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center w-10 h-10"
              aria-label="Change language"
            >
              <span className="material-symbols-outlined text-text-secondary text-xl">language</span>
              <span className="text-[10px] text-text-secondary font-label leading-none mt-0.5">Bhasha</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  )
}

// Progress Pills Component
interface ProgressPillsProps {
  current: number    // 1-based current step
  total: number
}

function ProgressPills({ current, total }: ProgressPillsProps) {
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < current
        const isCurrent = stepNum === current
        const isUpcoming = stepNum > current

        return (
          <div key={i} className="relative">
            {isCurrent && (
              // Pulse ring for current pill
              <motion.div
                className="absolute inset-[-3px] rounded-pill border-2 border-saffron"
                style={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <motion.div
              className={`h-2 rounded-pill transition-all duration-300 ${
                isCompleted || isCurrent ? 'bg-saffron' : 'bg-border-default'
              } ${isCurrent ? 'w-6' : 'w-5'}`}
              initial={false}
              animate={{ 
                width: isCurrent ? 24 : 20,
                backgroundColor: isCompleted || isCurrent ? '#FF8C00' : '#E5E5EA'
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
