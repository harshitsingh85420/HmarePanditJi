'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { HELP_SCREEN } from '@/lib/voice-scripts'

export default function HelpScreen() {
  const router = useRouter()
  const { setPhase } = useOnboardingStore()
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    // Voice prompt on screen load
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        void speakWithSarvam({
          text: HELP_SCREEN.scripts.main.hindi,
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

  const handleCallTeam = () => {
    // Open phone dialer with helpline number
    window.location.href = 'tel:1800726348'
  }

  const handleGoBack = () => {
    setPhase('LANGUAGE_CONFIRM')
    router.push('/language-confirm')
  }

  return (
    <main className="relative mx-auto min-h-dvh w-full flex flex-col bg-surface-base">
      {/* TopBar */}
      <div className="h-[72px] px-4 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoBack}
            className="w-[64px] h-[64px] flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Go back"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-[32px] text-saffron">ॐ</span>
          <h1 className="text-[20px] font-bold text-text-primary">HmarePanditJi</h1>
        </div>
        <button
          onClick={() => {}}
          className="min-h-[64px] px-6 flex items-center gap-2 text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"
          aria-label="Language switcher"
        >
          <span>हिन्दी / English</span>
        </button>
      </div>

      {/* Illustration Area */}
      <section className="mt-4 px-4 flex justify-center">
        <div className="w-[280px] h-[160px] relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[80px] block"
            >
              🤝
            </motion.span>
          </motion.div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-4 px-4 text-center">
        <h2 className="text-[28px] font-bold text-text-primary leading-tight font-devanagari">
          सहायता (Help)
        </h2>
        <p className="text-[18px] text-text-secondary mt-2 font-devanagari">
          हम आपकी मदद के लिए यहाँ हैं
        </p>
      </section>

      {/* Content Body */}
      <section className="px-4 flex-grow mt-8">
        {/* Help Message Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-saffron-lt rounded-2xl border-2 border-saffron/30"
        >
          <div className="flex items-start gap-4">
            <span className="text-[40px]">💬</span>
            <div>
              <p className="text-[18px] font-bold text-text-primary font-devanagari leading-snug">
                कोई बात नहीं
              </p>
              <p className="text-[16px] text-text-secondary mt-2 font-devanagari">
                हमारी team से बात करें — बिल्कुल मुफ़्त
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features List */}
        <div className="mt-6 space-y-4">
          {[
            { icon: '📞', title: 'फोन पर सहायता', desc: 'हमारी team आपको call करेगी' },
            { icon: '🆓', title: 'पूर्णतः निःशुल्क', desc: 'कोई खर्च नहीं' },
            { icon: '🗣️', title: 'आपकी भाषा में', desc: 'हिंदी / English / क्षेत्रीय' },
            { icon: '⚡', title: 'तुरंत सहायता', desc: '24x7 उपलब्ध' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * (idx + 3) }}
              className="p-4 bg-surface-card rounded-xl border-2 border-border-default flex items-start gap-3"
            >
              <span className="text-[28px]">{item.icon}</span>
              <div>
                <h3 className="text-[18px] font-bold text-text-primary font-devanagari">
                  {item.title}
                </h3>
                <p className="text-[15px] text-text-secondary font-devanagari">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Voice Listening Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar"></div>
            <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar animation-delay-200"></div>
            <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar animation-delay-400"></div>
          </div>
          <span className="text-[16px] text-text-secondary font-devanagari ml-2">
            सुन रहा हूँ...
          </span>
        </div>
      </section>

      {/* Footer Buttons */}
      <footer className="p-6 space-y-4 mb-6">
        {/* Call Team Button - Primary CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleCallTeam}
          className="w-full bg-success text-white py-4 min-h-[72px] rounded-2xl text-[22px] font-bold active:scale-[0.98] transition-transform shadow-lg focus:ring-2 focus:ring-success focus:outline-none flex items-center justify-center gap-3"
        >
          <span className="text-[28px]">📞</span>
          <span>1800-PANDIT (1800726348)</span>
        </motion.button>

        {/* Free Call Badge */}
        <div className="flex items-center justify-center gap-2 text-success">
          <span className="text-[20px]">✓</span>
          <span className="text-[16px] font-bold">फोन बिल्कुल निःशुल्क</span>
        </div>

        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="w-full bg-surface-card text-text-primary py-4 min-h-[72px] rounded-2xl text-[20px] font-bold border-2 border-border-default active:scale-[0.98] transition-transform focus:ring-2 focus:ring-saffron focus:outline-none"
        >
          ← वापस जाएं
        </button>
      </footer>
    </main>
  )
}
