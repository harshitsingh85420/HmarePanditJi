'use client'

import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useReduced } from '@/lib/motion'

interface HelpButtonProps {
  onClick?: () => void
  isVisible?: boolean
}

/**
 * Floating Help Button Component
 * 
 * A prominent floating help button for elderly users to get assistance.
 * Positioned at bottom-right for easy thumb access.
 * 
 * Features:
 * - 64px × 64px touch target (exceeds 56px minimum)
 * - High contrast saffron color
 * - Floating position for visibility
 * - Bilingual label (Hindi/English)
 * - Haptic feedback on tap
 * - Voice announcement on click
 */
export function HelpButton({ onClick, isVisible = true }: HelpButtonProps) {
  const reduced = useReduced()

  const handleHelpClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Voice announcement
    void speakWithSarvam({
      text: 'सहायता खुल रही है।',
      languageCode: 'hi-IN',
    })

    // Call custom onClick if provided
    onClick?.()
  }

  if (!isVisible) return null

  return (
    // CANON: sindoor controls are never a flat fill — they carry the
    // 180deg #C44A22→#B23A1A gradient, the 0 6px 16px rgba(178,58,26,.3)
    // raised lift, a gold hairline, and #FFF6E9 (chandan) on-sindoor ink.
    <motion.button
      initial={reduced ? false : { scale: 0, opacity: 0 }}
      animate={reduced ? undefined : { scale: 1, opacity: 1 }}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      onClick={handleHelpClick}
      className="fixed bottom-28 left-4 w-14 h-14 bg-sindoor text-chandan border-[1.5px] border-gold/60 rounded-full shadow-btn z-40 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none"
      aria-label="सहायता - Help"
      title="सहायता - Help"
    >
      <span className="material-symbols-outlined text-[28px]">help</span>
    </motion.button>
  )
}

export default HelpButton
