'use client'

// SSR FIX: Force dynamic rendering to prevent Html import error during build
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'

/**
 * Global Error Boundary Component (Root Level)
 *
 * Catches unhandled errors at the root level.
 * This is the last resort error handler for the entire app.
 *
 * Features:
 * - Bilingual error messages (Hindi/English)
 * - Large, clear error display
 * - Easy retry mechanism
 * - Voice announcement for accessibility
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Announce error to user on mount
  useEffect(() => {
    void speakWithSarvam({
      text: 'क्षमा करें, एक गंभीर त्रुटि हुई है। कृपया पृष्ठ को रीफ्रेश करें या सहायता के लिए संपर्क करें।',
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

  const handleReload = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    window.location.reload()
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-surface-base">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        {/* Critical Error Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-28 h-28 bg-error-red/20 rounded-full flex items-center justify-center mx-auto"
        >
          <span className="text-6xl">⚠️</span>
        </motion.div>

        {/* Error Heading */}
        <div className="space-y-3">
          <h1 className="font-headline text-3xl font-bold text-text-primary font-devanagari">
            गंभीर त्रुटि
          </h1>
          <p className="text-text-secondary text-xl font-devanagari">
            क्षमा करें, एक गंभीर तकनीकी दिक्कत हुई है।
          </p>
          <p className="text-text-secondary text-lg">
            A critical error has occurred. Please refresh the page.
          </p>
        </div>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-error-red/10 rounded-xl p-4 text-left">
            <p className="text-sm text-error-red font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-error-red mt-2 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleReload}
            className="w-full min-h-[72px] h-auto px-4 py-3 bg-saffron text-white font-bold text-[20px] rounded-2xl shadow-btn-saffron flex items-center justify-center gap-3 focus:ring-4 focus:ring-saffron/50 focus:outline-none"
            aria-label="पृष्ठ रीफ्रेश करें - Refresh page"
          >
            <span className="material-symbols-outlined text-2xl">refresh</span>
            <span className="text-center block break-words line-clamp-2">
              पृष्ठ रीफ्रेश करें
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="w-full min-h-[64px] h-auto px-4 py-3 bg-white border-2 border-saffron text-saffron font-bold text-xl rounded-2xl flex items-center justify-center gap-3 focus:ring-4 focus:ring-saffron/30 focus:outline-none"
            aria-label="पुनः प्रयास करें - Try again"
          >
            <span className="material-symbols-outlined text-2xl">replay</span>
            <span className="text-center block break-words line-clamp-2">
              पुनः प्रयास करें
            </span>
          </motion.button>
        </div>

        {/* Help Contact Info */}
        <div className="pt-6 border-t border-border-default">
          <p className="text-text-secondary text-lg mb-2">सहायता के लिए संपर्क करें:</p>
          <a
            href="mailto:support@hmarepanditji.com"
            className="text-saffron text-xl font-bold underline underline-offset-4 hover:text-saffron-dark block"
          >
            support@hmarepanditji.com
          </a>
          <a
            href="tel:+911234567890"
            className="text-saffron text-xl font-bold underline underline-offset-4 hover:text-saffron-dark block mt-2"
          >
            +91 12345 67890
          </a>
        </div>
      </motion.div>
    </div>
  )
}
