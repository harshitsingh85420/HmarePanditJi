'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { LANGUAGE_SET_SCREEN } from '@/lib/voice-scripts'
import { replaceScriptPlaceholders } from '@/lib/voice-scripts'

// Confetti particle component
function Confetti({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 0, rotate: 0 }}
      animate={{
        y: 400,
        opacity: [0, 1, 1, 0],
        rotate: [0, 180, 360],
        x: x + Math.sin(delay) * 50,
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeOut',
      }}
      className={`absolute w-3 h-3 ${color} rounded-sm`}
      style={{ left: `${x}%` }}
    />
  )
}

export default function LanguageSetScreen() {
  const router = useRouter()
  const { selectedLanguage, setPhase } = useOnboardingStore()
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    // Celebration voice message on screen load
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        const script = replaceScriptPlaceholders(LANGUAGE_SET_SCREEN.scripts.main, {
          LANGUAGE: selectedLanguage,
        })
        void speakWithSarvam({
          text: script.hindi,
          languageCode: 'hi-IN',
        })
      }
    }, 300)

    // Auto-advance to voice tutorial after 1.8 seconds (per prompt spec)
    const advanceTimer = setTimeout(() => {
      setPhase('VOICE_TUTORIAL')
      router.push('/voice-tutorial')
    }, 1800)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      clearTimeout(advanceTimer)
      stopCurrentSpeech()
    }
  }, [selectedLanguage, router, setPhase])

  // Generate confetti particles
  const confettiColors = [
    'bg-saffron',
    'bg-yellow-400',
    'bg-orange-400',
    'bg-red-400',
    'bg-pink-400',
    'bg-purple-400',
  ]
  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    x: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
  }))

  return (
    <main className="relative mx-auto min-h-dvh w-full flex flex-col bg-surface-base overflow-hidden">
      {/* Celebration Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-saffron-lt via-surface-base to-saffron-lt pointer-events-none" />

      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {confettiParticles.map((particle) => (
            <Confetti
              key={particle.id}
              delay={particle.delay}
              x={particle.x}
              color={particle.color}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* TopBar */}
      <div className="relative h-[72px] px-4 flex items-center justify-center border-b border-outline-variant sticky top-0 bg-surface-base/90 z-50 backdrop-blur-sm">
        <span className="text-[32px] text-saffron">ॐ</span>
        <h1 className="text-[20px] font-bold text-text-primary ml-2">HmarePanditJi</h1>
      </div>

      {/* Main Content */}
      <section className="relative flex-grow flex flex-col items-center justify-center px-4">
        {/* Success Icon with Glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-saffron rounded-full blur-3xl opacity-30 animate-pulse" />

          {/* Success Circle */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="relative w-[160px] h-[160px] bg-saffron rounded-full flex items-center justify-center shadow-2xl"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="text-[80px]"
            >
              ✓
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <h2 className="text-[32px] font-bold text-text-primary font-devanagari">
            बहुत अच्छा!
          </h2>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-4 p-6 bg-saffron-lt rounded-2xl"
          >
            <p className="text-[20px] text-text-secondary font-devanagari">
              भाषा सेट हो गई
            </p>
            <p className="text-[36px] font-bold text-saffron mt-2 font-devanagari">
              {selectedLanguage}
            </p>
          </motion.div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          className="mt-12 w-full max-w-[280px] h-2 bg-surface-dim rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            className="h-full bg-saffron"
          />
        </motion.div>
        <p className="mt-4 text-[16px] text-text-secondary font-devanagari">
          आगे बढ़ रहे हैं...
        </p>
      </section>

      {/* Footer with decorative elements */}
      <footer className="relative p-6 flex justify-center">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-3 h-3 bg-saffron rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            className="w-3 h-3 bg-saffron rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            className="w-3 h-3 bg-saffron rounded-full"
          />
        </div>
      </footer>
    </main>
  )
}
