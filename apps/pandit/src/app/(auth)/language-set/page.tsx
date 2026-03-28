'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts'
import { useSafeOnboardingStore } from '@/lib/stores/ssr-safe-stores'
import { LANGUAGE_DISPLAY, type SupportedLanguage } from '@/lib/onboarding-store'
import { getCelebrationScript } from '@/lib/voice-scripts'

export default function LanguageSetScreen() {
  const router = useRouter()

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { selectedLanguage, setPhase } = useSafeOnboardingStore()
  const langInfo = LANGUAGE_DISPLAY[(selectedLanguage || 'Hindi') as SupportedLanguage]

  useEffect(() => {
    // Get the language-specific celebration script
    const celebrationScript = getCelebrationScript(selectedLanguage || 'Hindi')

    void speakWithSarvam({
      text: celebrationScript.hindi,
      languageCode: LANGUAGE_TO_SARVAM_CODE[selectedLanguage || 'Hindi'],
      pace: 0.92, // Slightly warmer, more upbeat for celebration
      onEnd: () => setTimeout(() => { setPhase('VOICE_TUTORIAL'); router.push('/voice-tutorial'); }, 1800),
    })
  }, [selectedLanguage, setPhase, router])

  return (
    <main className="w-full min-h-dvh bg-gradient-to-b from-saffron-lt via-surface-base to-surface-base flex flex-col items-center justify-center px-4 xs:px-6 relative overflow-hidden">
      {/* Celebration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i} initial={{ y: -20, opacity: 0, rotate: Math.random() * 360 }} animate={{ y: 200, opacity: 1, rotate: Math.random() * 360 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, repeat: Infinity }} className="absolute text-2xl xs:text-3xl" style={{ left: `${Math.random() * 100}%` }}>{['🎉', '✨', '🪔'][Math.floor(Math.random() * 3)]}</motion.div>
        ))}
      </div>

      {/* Success */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' }}
        className="text-center z-10 flex flex-col items-center"
      >
        {/* Animated Emoji with Glow */}
        <div className="relative mb-6 xs:mb-8">
          <motion.div
            className="absolute inset-0 bg-saffron/20 blur-3xl rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.span
            className="relative text-8xl xs:text-9xl"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          >
            {langInfo.emoji}
          </motion.span>
        </div>

        {/* Text Section */}
        <div className="space-y-3 xs:space-y-4">
          <motion.h1
            className="text-6xl xs:text-7xl font-bold text-saffron"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            {langInfo.shortName}
          </motion.h1>

          <motion.p
            className="text-2xl xs:text-3xl text-vedic-gold"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {langInfo.scriptChar}
          </motion.p>

          <motion.p
            className="text-xl xs:text-2xl text-text-primary"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {langInfo.nativeName}
          </motion.p>

          <motion.p
            className="text-lg xs:text-xl text-text-secondary mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            सेट हो गई ✓
          </motion.p>
        </div>
      </motion.div>
    </main>
  )
}
