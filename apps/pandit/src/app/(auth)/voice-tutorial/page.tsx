'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useRouter } from 'next/navigation'
import { useSafeOnboardingStore } from '@/lib/stores/ssr-safe-stores'

export default function VoiceTutorialPage() {
  const router = useRouter()

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { phase, setPhase } = useSafeOnboardingStore()
  const [isListening, setIsListening] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    void speakWithSarvam({
      text: 'यह app आपकी आवाज़ से चलता है। जब mic दिखे, तब बोलिए।',
      languageCode: 'hi-IN',
    })
  }, [])

  const startListening = () => {
    setIsListening(true)
    setTimeout(() => {
      setIsListening(false)
      setHasInteracted(true)
    }, 2000)
  }

  const handleManualTry = () => {
    setHasInteracted(true)
    startListening()
  }

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[390px] xs:max-w-[430px] flex flex-col bg-surface-base">
      {/* TopBar */}
      <div className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              stopCurrentSpeech()
              setPhase('LANGUAGE_SET')
              router.push('/language-set')
            }}
            className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-2xl xs:text-3xl sm:text-[32px] text-saffron">ॐ</span>
          <h1 className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">HmarePanditJi</h1>
        </div>
        <button
          onClick={() => { }}
          className="min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] px-4 xs:px-6 flex items-center gap-2 text-sm xs:text-base sm:text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"
          aria-label="Language switcher"
        >
          <span>हिन्दी / English</span>
        </button>
      </div>

      {/* Illustration Area */}
      <section className="mt-2 xs:mt-4 px-4 flex justify-center">
        <div className="w-full max-w-[280px] h-32 xs:h-36 sm:h-[160px] relative flex items-center justify-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center">
            {/* Animated Microphone */}
            <motion.div
              animate={isListening ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.8, repeat: isListening ? Infinity : 0 }}
              className="text-6xl xs:text-7xl sm:text-[80px] inline-block"
            >
              🎤
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-2 xs:mt-4 px-4 text-center">
        <h2 className="text-xl xs:text-2xl sm:text-[26px] font-bold text-text-primary leading-tight font-devanagari">
          आवाज़ से चलता है
        </h2>
        <p className="text-sm xs:text-base sm:text-[18px] text-text-secondary mt-1 xs:mt-2 font-devanagari">
          यह app आपकी आवाज़ से चलता है
        </p>
      </section>

      {/* Content Body */}
      <section className="px-4 xs:px-6 flex-grow mt-4 xs:mt-6">
        {/* Instruction Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="p-4 xs:p-6 bg-saffron-lt rounded-2xl border-2 border-saffron/30">
          <div className="flex items-start gap-3 xs:gap-4">
            <span className="text-3xl xs:text-4xl sm:text-[40px]">💡</span>
            <div>
              <p className="text-base xs:text-lg sm:text-[18px] font-bold text-text-primary font-devanagari leading-snug">
                जब orange mic दिखे और "सुन रहा हूँ" लिखा हो
              </p>
              <p className="text-sm xs:text-base sm:text-[16px] text-text-secondary mt-1 xs:mt-2 font-devanagari">
                तब बोलिए — "हाँ" या "नहीं"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 xs:mt-6 p-4 xs:p-6 bg-saffron-lt/50 rounded-2xl border-2 border-dashed border-saffron">
          <div className="text-center">
            <p className="text-sm xs:text-base sm:text-lg font-medium text-text-secondary mb-3 xs:mb-4">अभी कोशिश करें</p>
            <button
              onClick={handleManualTry}
              className={`w-20 h-20 xs:w-24 xs:h-24 sm:w-[100px] sm:h-[100px] rounded-full flex items-center justify-center text-4xl xs:text-5xl sm:text-[48px] transition-all focus:ring-4 focus:ring-saffron focus:outline-none ${isListening ? 'bg-saffron text-white scale-110' : 'bg-white border-2 border-saffron'}`}
            >
              🎤
            </button>
            {hasInteracted && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm xs:text-base sm:text-lg text-success font-bold mt-3 xs:mt-4">
                ✅ बहुत अच्छा!
              </motion.p>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 xs:px-6 pb-6 xs:pb-8 pt-3 xs:pt-4 bg-surface-base/90 backdrop-blur-sm border-t border-border-default">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/mobile')}
          className="w-full bg-saffron text-white py-3 xs:py-4 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] rounded-2xl text-lg xs:text-xl sm:text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none"
        >
          समझ गया, आगे बढ़ें →
        </motion.button>
      </footer>
    </main>
  )
}
