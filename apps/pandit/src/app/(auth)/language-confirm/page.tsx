'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useSafeOnboardingStore } from '@/lib/stores/ssr-safe-stores'
import { LANGUAGE_DISPLAY, type SupportedLanguage } from '@/lib/onboarding-store'
import { LANGUAGE_CHOICE_CONFIRM_SCREEN, replaceScriptPlaceholders } from '@/lib/voice-scripts'

export default function LanguageConfirmScreen() {
  const router = useRouter()

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { pendingLanguage, setPhase, setSelectedLanguage } = useSafeOnboardingStore()
  const langInfo = LANGUAGE_DISPLAY[(pendingLanguage || 'Hindi') as SupportedLanguage]

  useEffect(() => {
    const script = replaceScriptPlaceholders(
      LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.main,
      { LANGUAGE: langInfo.latinName }
    )

    void speakWithSarvam({
      text: script.hindi,
      languageCode: 'hi-IN',
      pace: 0.90,
    })
  }, [langInfo])

  const handleConfirm = () => {
    if (pendingLanguage) {
      setSelectedLanguage(pendingLanguage)
      setPhase('LANGUAGE_SET')
      const yesScript = LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.onYesConfirmed
      void speakWithSarvam({ text: yesScript?.hindi ?? 'बहुत अच्छा।', languageCode: 'hi-IN' })
      setTimeout(() => router.push('/language-set'), 500)
    }
  }

  const handleChange = () => {
    const noScript = LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.onNoSaid
    void speakWithSarvam({ text: noScript?.hindi ?? 'ठीक है, फिर से चुनते हैं।', languageCode: 'hi-IN' })
    router.push('/language-list')
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col shadow-2xl">
      {/* Top Bar */}
      <header className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center justify-between border-b border-border-default">
        <button onClick={handleChange} className="min-h-[52px] xs:min-h-[56px] min-w-[52px] xs:min-w-[56px] p-2 hover:bg-black/5 rounded-full" aria-label="Go back"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></button>
        <button onClick={() => { }} className="min-h-[52px] xs:min-h-[56px] min-w-[52px] xs:min-w-[56px] text-2xl active:opacity-50">🌐</button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 xs:px-6 py-6 xs:py-8">
        {/* Language Card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="flex flex-col items-center gap-6 xs:gap-8"
        >
          {/* Glow Effect Behind Emoji */}
          <div className="relative">
            <div className="absolute inset-0 bg-saffron/20 blur-3xl rounded-full animate-pulse" />
            <motion.span
              className="relative text-7xl xs:text-8xl sm:text-9xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
            >
              {langInfo.emoji}
            </motion.span>
          </div>

          {/* Language Display */}
          <div className="text-center space-y-3 xs:space-y-4">
            {/* Short Name (Hero) */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl xs:text-6xl sm:text-[72px] font-bold text-saffron leading-tight"
            >
              {langInfo.shortName}
            </motion.h1>

            {/* Script Character */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl xs:text-3xl text-vedic-gold"
            >
              {langInfo.scriptChar}
            </motion.p>

            {/* Full Native Name */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg xs:text-xl text-text-secondary mt-4"
            >
              {langInfo.nativeName}
            </motion.p>
          </div>
        </motion.div>

        {/* Prompt */}
        <div className="mt-6 xs:mt-8 text-center">
          <p className="text-lg xs:text-xl sm:text-2xl font-bold text-text-primary">क्या यह सही है?</p>
          <p className="text-base xs:text-lg sm:text-xl text-saffron mt-2">'हाँ' या 'नहीं' बोलें</p>
        </div>
      </div>

      {/* Footer Buttons */}
      <footer className="px-4 xs:px-6 pb-6 xs:pb-8 pt-4 xs:pt-6 bg-surface-base/90 backdrop-blur-sm border-t border-border-default">
        <div className="grid grid-cols-2 gap-3 xs:gap-4">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleChange} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] border-3 border-border-default rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold text-saffron bg-surface-card active:bg-saffron-light">✗ नहीं</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold shadow-btn-saffron">✓ हाँ</motion.button>
        </div>
      </footer>
    </main>
  )
}
