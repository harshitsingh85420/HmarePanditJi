'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'

interface EmergencySOSFloatingProps {
  isVisible?: boolean
}

export function EmergencySOSFloating({ isVisible = true }: EmergencySOSFloatingProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSOSPress = async () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
    await speakWithSarvam({
      text: 'SOS बटन दबाया गया। क्या आप वास्तव में आपातकालीन स्थिति में हैं?',
      languageCode: 'hi-IN',
      pace: 0.85,
    })
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
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Call Family */}
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.location.href = 'tel:+91'
                speakWithSarvam({ text: 'परिवार को कॉल किया जा रहा है।', languageCode: 'hi-IN' })
              }}
              className="min-h-[56px] px-4 bg-surface-card rounded-2xl shadow-card flex items-center gap-3 border-l-4 border-saffron"
            >
              <div className="w-10 h-10 rounded-xl bg-saffron-lt flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-saffron" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <span className="font-bold text-text-primary">परिवार को कॉल करें</span>
            </motion.button>

            {/* Call Team */}
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.location.href = 'tel:+911800PANDIT'
                speakWithSarvam({ text: 'टीम से संपर्क किया जा रहा है।', languageCode: 'hi-IN' })
              }}
              className="min-h-[56px] px-4 bg-surface-card rounded-2xl shadow-card flex items-center gap-3 border-l-4 border-trust-green"
            >
              <div className="w-10 h-10 rounded-xl bg-trust-green-bg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-trust-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <span className="font-bold text-text-primary">टीम से संपर्क करें</span>
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
        className="relative min-w-[72px] min-h-[72px] bg-saffron rounded-full shadow-btn-saffron flex items-center justify-center border-4 border-white"
        aria-label="Emergency SOS"
      >
        <div className="absolute inset-0 rounded-full bg-saffron/20 animate-ping" />
        <svg className="w-9 h-9 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </motion.button>

      {/* Expand Toggle */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleExpand}
        className="min-w-[56px] min-h-[56px] bg-surface-card rounded-full shadow-card flex items-center justify-center border-2 border-saffron/30"
        aria-label={isExpanded ? 'Close emergency options' : 'Expand emergency options'}
      >
        <svg
          className={`w-6 h-6 text-saffron transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {/* SOS Label Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-saffron text-white px-4 py-2 rounded-full shadow-btn-saffron flex items-center gap-2"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span className="font-bold text-base">SOS आपातकालीन</span>
      </motion.div>
    </div>
  )
}

export default EmergencySOSFloating
