'use client'

// SSR FIX: Force dynamic rendering to prevent build errors
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'

/**
 * Global Error Boundary Component
 * 
 * Catches and displays errors in the Pandit app.
 * Designed for elderly users with clear messaging and easy recovery.
 * 
 * Features:
 * - Bilingual error messages (Hindi/English)
 * - Large, clear error display
 * - Easy retry mechanism
 * - Help contact information
 * - Voice announcement for accessibility
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  // Announce error to user on mount
  useEffect(() => {
    void speakWithSarvam({
      text: 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें या सहायता के लिए संपर्क करें।',
      languageCode: 'hi-IN',
    })
  }, [])

  const handleRetry = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    reset()
  }

  const handleContactHelp = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Announce help contact
    void speakWithSarvam({
      text: 'सहायता के लिए संपर्क करें: support@hmarepanditji.com',
      languageCode: 'hi-IN',
    })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-surface-base">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-24 h-24 bg-error-red/10 rounded-full flex items-center justify-center mx-auto"
        >
          <span className="text-5xl">🙏</span>
        </motion.div>

        {/* Error Heading */}
        <div className="space-y-3">
          <h1 className="font-headline text-3xl font-bold text-text-primary font-devanagari">
            कुछ गलत हो गया
          </h1>
          <p className="text-text-secondary text-xl font-devanagari">
            क्षमा करें, तकनीकी दिक्कत आई।
          </p>
          <p className="text-text-secondary text-lg">
            Something went wrong. Please try again.
          </p>
        </div>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-surface-container-lowest rounded-xl p-4 text-left">
            <p className="text-sm text-text-secondary font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="w-full min-h-[72px] h-auto px-4 py-3 bg-saffron text-white font-bold text-[20px] rounded-2xl shadow-btn-saffron flex items-center justify-center gap-3 focus:ring-4 focus:ring-saffron/50 focus:outline-none"
            aria-label="पुनः प्रयास करें - Try again"
          >
            <span className="material-symbols-outlined text-2xl">refresh</span>
            <span className="text-center block break-words line-clamp-2">
              पुनः प्रयास करें
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleContactHelp}
            className="w-full min-h-[64px] h-auto px-4 py-3 bg-white border-2 border-saffron text-saffron font-bold text-xl rounded-2xl flex items-center justify-center gap-3 focus:ring-4 focus:ring-saffron/30 focus:outline-none"
            aria-label="सहायता से संपर्क करें - Contact help"
          >
            <span className="material-symbols-outlined text-2xl">support_agent</span>
            <span className="text-center block break-words line-clamp-2">
              सहायता से संपर्क करें
            </span>
          </motion.button>
        </div>

        {/* Help Contact Info */}
        <div className="pt-6 border-t border-border-default">
          <p className="text-text-secondary text-lg mb-2">संपर्क करें:</p>
          <a
            href="mailto:support@hmarepanditji.com"
            className="text-saffron text-xl font-bold underline underline-offset-4 hover:text-saffron-dark"
          >
            support@hmarepanditji.com
          </a>
        </div>
      </motion.div>
    </div>
  )
}
