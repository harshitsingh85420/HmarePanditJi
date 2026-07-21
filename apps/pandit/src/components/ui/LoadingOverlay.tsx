'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DiyaLoader } from '../moments/DiyaLoader'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

export interface LoadingOverlayProps {
  isVisible?: boolean
  /** optional English sub-line; omitted by default (Devanagari-first) */
  message?: string
  messageHi?: string
  variant?: 'spinner' | 'dots' | 'voice'
  transparent?: boolean
}

/**
 * LoadingOverlay Component
 *
 * Partial-blocking overlay used while a single action is in flight.
 * The FULL-SCREEN loading state is canon artboard 28 and lives in
 * DiyaLoader — PageLoading below simply renders it.
 *
 * Colours here were previously written against `surface-base` /
 * `text-primary` / `font-devanagari`, none of which exist in
 * tailwind.config.ts, so the overlay rendered with a transparent
 * background and inherited body text. They now use real tokens.
 *
 * @example
 * <LoadingOverlay isVisible={loading} messageHi="एक क्षण…" />
 */
export function LoadingOverlay({
  isVisible = true,
  message,
  messageHi = 'एक क्षण…',
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
        transparent ? 'bg-temple-700/50 backdrop-blur-sm' : 'bg-cream/95'
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
          <p className="text-[20px] font-black text-saffron-700 font-hindi">
            {messageHi}
          </p>
          {message && (
            <p className="text-[18px] font-semibold text-softgrey">{message}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Spinner Icon Component
 */
function SpinnerIcon() {
  const still = useReducedMotion()
  return (
    <div className="relative w-20 h-20">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-saffron/20" />
      {/* Spinning ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-saffron border-t-transparent"
        animate={still ? undefined : { rotate: 360 }}
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
 * Twinkling Dots — canon artboard 28's dot row: three 11px circles,
 * 7px apart, on the sindoor → genda ramp, breathing on scale/opacity
 * with a .2s stagger. (This used to bounce grey-saffron dots on `y`.)
 */
const CANON_DOTS = ['#B23A1A', '#D95F38', '#F2A02C']

function DotsIcon() {
  const still = useReducedMotion()
  return (
    <div className="flex items-center gap-[7px]">
      {CANON_DOTS.map((color, i) => (
        <motion.span
          key={color}
          className="rounded-full"
          style={{ width: 11, height: 11, background: color }}
          animate={still ? undefined : { scale: [0.7, 1.15, 0.7], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Voice Recording Icon Component
 *
 * The sound-wave bars animate scaleY on a fixed 24px box rather than
 * animating `height` — transform/opacity only, and no layout shift.
 */
function VoiceIcon() {
  const still = useReducedMotion()
  return (
    <div className="flex items-center gap-2">
      {/* Microphone icon */}
      <motion.div
        className="w-16 h-16 bg-saffron rounded-full flex items-center justify-center"
        animate={still ? undefined : { scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="material-symbols-outlined text-3xl text-chandan">mic</span>
      </motion.div>
      {/* Sound waves */}
      <div className="flex items-center gap-1 ml-4 h-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-6 bg-saffron rounded-full origin-center"
            animate={still ? undefined : { scaleY: [0.33, 1, 0.33] }}
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
 * Full-page loading state for route transitions (app/loading.tsx).
 * This IS canon artboard 28, so it renders the canon composition
 * instead of the old generic spinner + "लोड हो रहा है..." stack.
 */
export function PageLoading() {
  return <DiyaLoader />
}

export default LoadingOverlay
