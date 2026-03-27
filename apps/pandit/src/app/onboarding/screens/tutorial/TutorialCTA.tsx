'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import type { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialCTAProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onRegisterNow?: () => void
  onLater?: () => void
}

export default function TutorialCTA({
  language,
  onLanguageChange,
  onBack,
  onNext,
  onSkip,
  onRegisterNow,
  onLater,
  currentDot
}: TutorialCTAProps) {
  const router = useRouter()

  const handleStart = () => {
    if (onRegisterNow) {
      onRegisterNow()
    } else {
      void speakWithSarvam({ text: 'चलिए शुरू करते हैं।', languageCode: 'hi-IN', onEnd: () => router.push('/mobile') })
    }
  }

  const handleLaterClick = () => {
    if (onLater) {
      onLater()
    } else {
      void speakWithSarvam({ text: 'ठीक है। जब चाहें शुरू करें।', languageCode: 'hi-IN', onEnd: () => router.push('/dashboard') })
    }
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-vedic-cream flex flex-col">
      <TopBar showBack onBack={onBack} onLanguageChange={onLanguageChange} />
      <ProgressDots total={12} current={12} />
      <div className="flex-1 px-4 xs:px-6 py-6 xs:py-8 flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} className="text-center">
          <div className="text-7xl xs:text-8xl sm:text-9xl mb-4 xs:mb-6">🎉</div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-vedic-brown mb-2 xs:mb-4">बधाई हो!</h1>
          <p className="text-base xs:text-lg sm:text-xl text-text-secondary mb-6 xs:mb-8">आपने ट्यूटोरियल पूरा कर लिया</p>
          <div className="bg-saffron-lt border-2 border-saffron rounded-2xl p-6 xs:p-8 mb-6 xs:mb-8">
            <p className="text-lg xs:text-xl sm:text-2xl font-bold text-text-primary mb-2 xs:mb-4">अब क्या होगा?</p>
            <ul className="text-sm xs:text-base sm:text-lg text-text-secondary space-y-2 xs:space-y-3 text-left"><li>✓ 10 मिनट में Registration</li><li>✓ बिल्कुल मुफ़्त</li><li>✓ पहली पूजा 24 घंटे में</li></ul>
          </div>
        </motion.div>
      </div>
      <div className="px-4 xs:px-6 pb-6 xs:pb-8 pt-4 xs:pt-6 bg-surface-base/90 backdrop-blur-sm border-t border-border-default">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleStart} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold shadow-btn-saffron active:scale-[0.98]">Registration शुरू करें →</motion.button>
        <button onClick={onBack} className="w-full min-h-[52px] xs:min-h-[56px] text-center text-base xs:text-lg text-saffron font-medium mt-3 xs:mt-4 underline underline-offset-4 active:bg-saffron-light rounded-xl">बाद में करूँगा</button>
      </div>
    </main>
  )
}
