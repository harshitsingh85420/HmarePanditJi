'use client'

import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'

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
  const handleHelpClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Voice announcement
    void speakWithSarvam({
      text: 'सहायता के लिए संपर्क करें: support@hmarepanditji.com',
      languageCode: 'hi-IN',
    })

    // Call custom onClick if provided
    onClick?.()
  }

  if (!isVisible) return null

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleHelpClick}
      className="fixed bottom-24 right-4 w-16 h-16 bg-saffron text-white rounded-full shadow-lg z-40 flex items-center justify-center focus:ring-4 focus:ring-saffron/50 focus:outline-none saffron-glow-active"
      aria-label="सहायता - Help"
      title="सहायता - Help"
    >
      <span className="material-symbols-outlined text-3xl">help</span>
    </motion.button>
  )
}

export default HelpButton
