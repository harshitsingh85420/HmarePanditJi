'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { LANGUAGE_CHOICE_CONFIRM_SCREEN } from '@/lib/voice-scripts'
import { replaceScriptPlaceholders } from '@/lib/voice-scripts'

const LANGUAGE_NAMES: Record<string, string> = {
  Hindi: 'हिंदी',
  Bhojpuri: 'भोजपुरी',
  Maithili: 'मैथिली',
  Bengali: 'বাংলা',
  Tamil: 'தமிழ்',
  Telugu: 'తెలుగు',
  Kannada: 'ಕನ್ನಡ',
  Malayalam: 'മലയാളം',
  Marathi: 'मराठी',
  Gujarati: 'ગુજરાતી',
  Punjabi: 'ਪੰਜਾਬੀ',
  Odia: 'ଓଡ଼ିଆ',
  Assamese: 'অসমীয়া',
  Sanskrit: 'संस्कृत',
  English: 'English',
}

export default function LanguageChoiceConfirmScreen() {
  const router = useRouter()
  const { pendingLanguage, setPhase, setSelectedLanguage, setLanguageConfirmed } =
    useOnboardingStore()
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  const languageName = pendingLanguage ? LANGUAGE_NAMES[pendingLanguage] : 'भाषा'

  useEffect(() => {
    isMountedRef.current = true

    // Voice prompt on screen load
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        const script = replaceScriptPlaceholders(
          LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.main,
          { LANGUAGE: languageName }
        )
        void speakWithSarvam({
          text: script.hindi,
          languageCode: 'hi-IN',
        })
      }
    }, 600)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      stopCurrentSpeech()
    }
  }, [languageName])

  const handleConfirm = () => {
    // Speak confirmation
    const yesScript = LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.onYesConfirmed
    if (yesScript) {
      void speakWithSarvam({
        text: yesScript.hindi,
        languageCode: 'hi-IN',
      })
    }

    if (pendingLanguage) {
      setSelectedLanguage(pendingLanguage)
    }
    setLanguageConfirmed(true)
    setPhase('LANGUAGE_SET')
    router.push('/language-set')
  }

  const handleReject = () => {
    // Speak rejection
    const noScript = LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.onNoSaid
    if (noScript) {
      void speakWithSarvam({
        text: noScript.hindi,
        languageCode: 'hi-IN',
      })
    }

    setPhase('LANGUAGE_LIST')
    router.push('/language-list')
  }

  return (
    <main className="relative mx-auto min-h-dvh w-full flex flex-col bg-surface-base">
      {/* TopBar */}
      <div className="h-[72px] px-4 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              stopCurrentSpeech()
              setPhase('LANGUAGE_LIST')
              router.push('/language-list')
            }}
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
          onClick={() => { }}
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
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="text-[64px]"
            >
              🗣️
            </motion.span>
          </motion.div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-4 px-4 text-center">
        <h2 className="text-[26px] font-bold text-text-primary leading-tight font-devanagari">
          आपने चुनी
        </h2>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 p-6 bg-saffron-lt rounded-2xl inline-block"
        >
          <p className="text-[36px] font-bold text-saffron font-devanagari">
            {languageName}
          </p>
        </motion.div>
        <p className="text-[20px] text-text-secondary mt-4 font-devanagari">
          क्या यह सही है?
        </p>
      </section>

      {/* Content Body */}
      <section className="px-4 flex-grow mt-8">
        <div className="p-6 bg-surface-card rounded-2xl border-2 border-border-default">
          <div className="flex items-start gap-4">
            <span className="text-[32px]">❓</span>
            <div>
              <p className="text-[18px] font-bold text-text-primary font-devanagari leading-snug">
                हाँ या नहीं बोलें
              </p>
              <p className="text-[16px] text-text-secondary mt-2 font-devanagari">
                या नीचे बटन दबाएं
              </p>
            </div>
          </div>
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
        <button
          onClick={handleConfirm}
          className="w-full bg-saffron text-white py-4 min-h-[72px] rounded-2xl text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none"
        >
          ✅ हाँ, सही है
        </button>
        <button
          onClick={handleReject}
          className="w-full bg-surface-card text-text-primary py-4 min-h-[72px] rounded-2xl text-[20px] font-bold border-2 border-border-default active:scale-[0.98] transition-transform focus:ring-2 focus:ring-saffron focus:outline-none"
        >
          ❌ नहीं, बदलें
        </button>
      </footer>
    </main>
  )
}
