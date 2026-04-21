'use client'

// Prevent static generation for error pages
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  // Announce 404 to user on mount
  useEffect(() => {
    void speakWithSarvam({
      text: 'क्षमा करें, यह पृष्ठ नहीं मिला। कृपया होम पेज पर वापस जाएं।',
      languageCode: 'hi-IN',
    })
  }, [])

  const handleGoHome = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    router.push('/')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        {/* 404 Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-28 h-28 bg-saffron/10 rounded-full flex items-center justify-center mx-auto"
        >
          <span className="text-6xl">🙏</span>
        </motion.div>

        {/* Error Heading */}
        <div className="space-y-3">
          <h1 className="font-headline text-4xl font-bold text-text-primary font-devanagari">
            पृष्ठ नहीं मिला
          </h1>
          <p className="text-text-secondary text-xl font-devanagari">
            माफ़ कीजिए, आप ढूंढ रहे पेज नहीं मिला।
          </p>
          <p className="text-text-secondary text-lg">
            Sorry, the page you are looking for was not found.
          </p>
        </div>

        {/* Home Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleGoHome}
          className="w-full min-h-[72px] h-auto px-4 py-3 bg-primary-container text-white font-bold text-[20px] rounded-2xl shadow-btn-saffron flex items-center justify-center gap-3 focus:ring-4 focus:ring-primary/50 focus:outline-none"
          aria-label="होम पेज पर जाएं - Go to home page"
        >
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-center block break-words line-clamp-2">
            होम पेज पर जाएं
          </span>
        </motion.button>

        {/* Help Contact */}
        <div className="pt-6 border-t border-border-default">
          <p className="text-text-secondary text-lg mb-2">सहायता के लिए संपर्क करें:</p>
          <a
            href="mailto:support@hmarepanditji.com"
            className="text-saffron text-xl font-bold underline underline-offset-4 hover:text-saffron-dark block"
          >
            support@hmarepanditji.com
          </a>
        </div>
      </motion.div>
    </div>
  )
}
