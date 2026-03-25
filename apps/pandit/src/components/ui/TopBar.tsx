'use client'

import { motion } from 'framer-motion'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
  currentStep?: number
  totalSteps?: number
  showComplete?: boolean
  headline?: string
}

export default function TopBar({
  showBack = false,
  onBack,
  onLanguageChange,
  currentStep,
  totalSteps = 6,
  showComplete = false,
  headline,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface-base shadow-[0px_8px_24px_rgba(144,77,0,0.06)] border-b border-outline-variant/10">
      <div className="flex flex-col">
        {/* Top Row: Navigation & Controls */}
        <div className="flex items-center justify-between px-5 h-16">
          {/* Left: Back Arrow or Placeholder */}
          <div className="w-[56px] h-[56px] flex items-center justify-center">
            {showBack && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="w-[56px] h-[56px] flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors active:scale-90 duration-150"
                aria-label="Go back"
              >
                <span className="material-symbols-outlined text-saffron">arrow_back</span>
              </motion.button>
            )}
          </div>

          {/* Center: Headline (State 2) OR empty */}
          {headline && (
            <span className="font-headline font-bold text-saffron text-lg">
              {headline}
            </span>
          )}

          {/* Right: Language Button */}
          {onLanguageChange && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onLanguageChange}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-outline-variant/30 text-saffron font-medium text-lg hover:bg-saffron/5 transition-colors"
              aria-label="Change language"
            >
              <span className="material-symbols-outlined text-[20px]">language</span>
              <span className="font-label">भाषा</span>
            </motion.button>
          )}
        </div>

        {/* Bottom Row: Progress Pills (only for onboarding state) */}
        {showComplete !== true && currentStep !== undefined && (
          <div className="flex items-center justify-between gap-2 px-5 pb-4">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNum = i + 1
              const isCompleted = stepNum < currentStep
              const isCurrent = stepNum === currentStep

              return (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${isCompleted || isCurrent ? 'bg-saffron-container' : 'bg-surface-variant'
                    }`}
                >
                  {isCurrent && (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-[-3px] border-2 border-saffron-container/40 rounded-full" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Complete State Badge */}
        {showComplete && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary-container/30 rounded-full w-fit">
              <span className="material-symbols-outlined text-secondary text-lg filled">check_circle</span>
              <span className="font-label text-on-secondary-container font-bold text-lg">
                Registration Complete ✅
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
