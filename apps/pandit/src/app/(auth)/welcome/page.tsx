'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { TUTORIAL_SWAGAT } from '@/lib/voice-scripts'
import ProgressDots from '@/components/ProgressDots'

export default function WelcomeScreen() {
  const router = useRouter()
  const { setPhase, selectedLanguage } = useOnboardingStore()
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    // Voice prompt on screen load
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        void speakWithSarvam({
          text: TUTORIAL_SWAGAT.scripts.main.hindi,
          languageCode: 'hi-IN',
        })
      }
    }, 600)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      stopCurrentSpeech()
    }
  }, [])

  const handleSkip = () => {
    setPhase('REGISTRATION')
    router.push('/mobile')
  }

  const handleContinue = () => {
    setPhase('TUTORIAL_INCOME')
    router.push('/dashboard')
  }

  return (
    <main className="relative mx-auto min-h-dvh w-full flex flex-col bg-surface-base">
      {/* Sacred Gradient Backdrop */}
      <div className="fixed inset-0 bg-sacred pointer-events-none -z-10" />

      {/* TopBar */}
      <div className="h-[72px] px-4 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base/90 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-[32px] text-saffron">ॐ</span>
          <h1 className="text-[20px] font-bold text-text-primary">HmarePanditJi</h1>
        </div>
        <button
          onClick={() => { }}
          className="min-h-[64px] px-6 flex items-center gap-2 text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"
          aria-label="Language switcher"
        >
          <span>हिन्दी / English</span>
        </button>
      </div>

      {/* Progress Dots */}
      <ProgressDots total={12} current={1} />

      {/* Illustration Area */}
      <section className="mt-4 px-4 flex justify-center">
        <div className="w-[320px] h-[200px] relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Animated Welcome Illustration */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[80px] mb-4"
            >
              🙏
            </motion.div>
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 bg-saffron rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="w-3 h-3 bg-saffron rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                className="w-3 h-3 bg-saffron rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-4 px-4 text-center">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[28px] font-bold text-text-primary leading-tight font-devanagari"
        >
          नमस्ते पंडित जी
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[20px] text-text-secondary mt-2 font-devanagari"
        >
          HmarePanditJi में आपका बहुत-बहुत स्वागत है
        </motion.p>
      </section>

      {/* Content Body */}
      <section className="px-4 flex-grow mt-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-saffron-lt rounded-2xl border-2 border-saffron/30"
        >
          <div className="flex items-start gap-4">
            <span className="text-[40px]">✨</span>
            <div>
              <p className="text-[18px] font-bold text-text-primary font-devanagari leading-snug">
                यह platform आपके लिए ही बना है
              </p>
              <p className="text-[16px] text-text-secondary mt-2 font-devanagari">
                अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mool Mantra Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-6 bg-surface-card rounded-2xl border-2 border-border-default"
        >
          <div className="flex items-start gap-4">
            <span className="text-[40px]">🕉️</span>
            <div>
              <p className="text-[16px] font-bold text-text-secondary font-devanagari">
                हमारा Mool Mantra याद रखिए
              </p>
              <p className="text-[20px] font-bold text-saffron mt-2 font-devanagari leading-snug">
                App पंडित के लिए है, पंडित App के लिए नहीं
              </p>
            </div>
          </div>
        </motion.div>

        {/* Voice Listening Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar"></div>
            <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar animation-delay-200"></div>
            <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar animation-delay-400"></div>
          </div>
          <span className="text-[16px] text-text-secondary font-devanagari ml-2">
            सुन रहा हूँ... "Skip" या "जानें" बोलें
          </span>
        </div>
      </section>

      {/* Footer Buttons */}
      <footer className="p-6 space-y-4 mb-6">
        <button
          onClick={handleContinue}
          className="w-full bg-saffron text-white py-4 min-h-[72px] rounded-2xl text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none"
        >
          जानें →
        </button>
        <button
          onClick={handleSkip}
          className="w-full bg-surface-card text-text-primary py-4 min-h-[72px] rounded-2xl text-[20px] font-bold border-2 border-border-default active:scale-[0.98] transition-transform focus:ring-2 focus:ring-saffron focus:outline-none"
        >
          Skip — सीधे Registration
        </button>
      </footer>
    </main>
  )
}
