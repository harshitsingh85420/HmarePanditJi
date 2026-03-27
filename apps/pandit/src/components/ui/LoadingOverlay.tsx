'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

export interface LoadingOverlayProps {
  isVisible?: boolean
  message?: string
  messageHi?: string
  variant?: 'spinner' | 'dots' | 'voice'
  transparent?: boolean
}

/**
 * LoadingOverlay Component
 * 
 * Full-screen loading overlay for elderly users.
 * Features large, clear loading indicators and bilingual messages.
 * 
 * Variants:
 * - spinner: Classic circular spinner
 * - dots: Bouncing dots (like voice recording)
 * - voice: Voice-specific loading animation
 * 
 * @example
 * <LoadingOverlay isVisible={loading} message="Loading..." messageHi="लोड हो रहा है..." />
 */
export function LoadingOverlay({
  isVisible = true,
  message = 'Loading...',
  messageHi = 'लोड हो रहा है...',
  variant = 'spinner',
  transparent = false,
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        transparent ? 'bg-black/50 backdrop-blur-sm' : 'bg-surface-base/90'
      )}
      role="alert"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Loading Indicator */}
        {variant === 'spinner' && <SpinnerIcon />}
        {variant === 'dots' && <DotsIcon />}
        {variant === 'voice' && <VoiceIcon />}

        {/* Message */}
        <div className="text-center space-y-2">
          <p className="text-[20px] font-bold text-text-primary font-devanagari">
            {messageHi}
          </p>
          <p className="text-[18px] text-text-secondary">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Spinner Icon Component
 */
function SpinnerIcon() {
  return (
    <div className="relative w-20 h-20">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-saffron/20" />
      {/* Spinning ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-saffron border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-saffron rounded-full" />
      </div>
    </div>
  )
}

/**
 * Bouncing Dots Icon Component
 */
function DotsIcon() {
  return (
    <div className="flex items-center gap-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-4 h-4 bg-saffron rounded-full"
          animate={{
            y: [0, -16, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Voice Recording Icon Component
 */
function VoiceIcon() {
  return (
    <div className="flex items-center gap-2">
      {/* Microphone icon */}
      <motion.div
        className="w-16 h-16 bg-saffron rounded-full flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <span className="material-symbols-outlined text-3xl text-white">mic</span>
      </motion.div>
      {/* Sound waves */}
      <div className="flex items-end gap-1 ml-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="w-2 bg-saffron rounded-full"
            animate={{
              height: [8, 24, 8],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Page Loading Component
 * 
 * Full-page loading state for route transitions.
 * Used in app/loading.tsx
 */
export function PageLoading() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base">
      <SpinnerIcon />
      <p className="mt-6 text-[20px] font-bold text-text-primary font-devanagari">
        लोड हो रहा है...
      </p>
      <p className="mt-2 text-[18px] text-text-secondary">
        Please wait...
      </p>
    </div>
  )
}

export default LoadingOverlay
