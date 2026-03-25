'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'

interface EmergencySOSFloatingProps {
  isVisible?: boolean
}

/**
 * Global Emergency SOS Floating Button
 * Provides quick access to emergency features from any screen
 * Designed for elderly users - large touch target, high contrast
 */
export function EmergencySOSFloating({ isVisible = true }: EmergencySOSFloatingProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSOSPress = async () => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }

    // Voice confirmation
    await speakWithSarvam({
      text: 'SOS बटन दबाया गया। क्या आप वास्तव में आपातकालीन स्थिति में हैं?',
      languageCode: 'hi-IN',
      pace: 0.85,
    })

    // Navigate to full SOS screen
    router.push('/emergency')
  }

  const handleExpand = async () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      await speakWithSarvam({
        text: 'आपातकालीन सहायता उपलब्ध है।',
        languageCode: 'hi-IN',
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Quick Actions (when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Call Family Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.location.href = 'tel:+91'
                speakWithSarvam({
                  text: 'परिवार को कॉल किया जा रहा है।',
                  languageCode: 'hi-IN',
                })
              }}
              className="min-h-[56px] px-4 bg-surface-card rounded-2xl shadow-card flex items-center gap-3 border-2 border-saffron/30"
            >
              <span className="material-symbols-outlined text-saffron text-2xl">family_restroom</span>
              <span className="font-devanagari font-bold text-text-primary">परिवार को कॉल करें</span>
            </motion.button>

            {/* Call Team Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.location.href = 'tel:+911800PANDIT'
                speakWithSarvam({
                  text: 'टीम से संपर्क किया जा रहा है।',
                  languageCode: 'hi-IN',
                })
              }}
              className="min-h-[56px] px-4 bg-surface-card rounded-2xl shadow-card flex items-center gap-3 border-2 border-trust-green/30"
            >
              <span className="material-symbols-outlined text-trust-green text-2xl">support_agent</span>
              <span className="font-devanagari font-bold text-text-primary">टीम से संपर्क करें</span>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main SOS Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSOSPress}
        className="relative min-w-[64px] min-h-[64px] bg-gradient-to-b from-saffron to-saffron-dark rounded-full shadow-btn-saffron flex items-center justify-center border-4 border-white sos-pulse"
        aria-label="Emergency SOS"
      >
        <span className="material-symbols-outlined text-4xl text-white material-symbols-filled">
          emergency
        </span>

        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-saffron/30 animate-ping" />
      </motion.button>

      {/* Expand Toggle */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleExpand}
        className="min-w-[56px] min-h-[56px] bg-surface-card rounded-full shadow-card flex items-center justify-center border-2 border-saffron/30 focus:ring-2 focus:ring-saffron focus:outline-none"
        aria-label={isExpanded ? 'Close emergency options' : 'Expand emergency options'}
      >
        <span className={`material-symbols-outlined text-saffron text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </motion.button>

      {/* SOS Label Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-saffron text-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">emergency</span>
        <span className="font-devanagari font-bold text-base">SOS आपातकालीन</span>
      </motion.div>
    </div>
  )
}

export default EmergencySOSFloating
