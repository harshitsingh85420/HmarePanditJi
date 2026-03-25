'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { LANGUAGE_CONFIRM_SCREEN } from '@/lib/voice-scripts'
import { replaceScriptPlaceholders } from '@/lib/voice-scripts'
import { useVoice } from '@/hooks/useVoice'

export default function LanguageConfirmScreen() {
  const router = useRouter()
  const {
    detectedCity,
    selectedLanguage,
    setPhase,
    setLanguageConfirmed,
  } = useOnboardingStore()
  const [isListening, setIsListening] = useState(false)
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  const { startListening } = useVoice({
    language: 'hi-IN',
    inputType: 'yes_no',
    isElderly: true,
    onResult: (text) => handleVoiceResult(text),
  })

  useEffect(() => {
    isMountedRef.current = true

    // Voice prompt on screen load with city and language
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        const script = replaceScriptPlaceholders(
          LANGUAGE_CONFIRM_SCREEN.scripts.main,
          {
            CITY: detectedCity || 'आपका शहर',
            LANGUAGE: selectedLanguage,
          }
        )
        void speakWithSarvam({
          text: script.hindi,
          languageCode: 'hi-IN',
        })
        // Start listening after voice completes (4 seconds + buffer)
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsListening(true)
            startListening()
          }
        }, 4500)
      }
    }, 600)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      stopCurrentSpeech()
    }
  }, [detectedCity, selectedLanguage, startListening])

  const handleVoiceResult = (text: string) => {
    const normalizedText = text.toLowerCase().trim()

    // Detect YES intent
    if (
      normalizedText.includes('हाँ') ||
      normalizedText.includes('haan') ||
      normalizedText.includes('yes') ||
      normalizedText.includes('हां') ||
      normalizedText.includes('sahi') ||
      normalizedText.includes('ठीक')
    ) {
      handleConfirm()
    }
    // Detect CHANGE/BACK intent
    else if (
      normalizedText.includes('बदलें') ||
      normalizedText.includes('badlein') ||
      normalizedText.includes('change') ||
      normalizedText.includes('nahi') ||
      normalizedText.includes('नहीं') ||
      normalizedText.includes('other') ||
      normalizedText.includes('दूसरी')
    ) {
      handleChange()
    }
  }

  const handleConfirm = () => {
    stopCurrentSpeech()
    // Speak confirmation
    const yesScript = LANGUAGE_CONFIRM_SCREEN.scripts.onYesConfirmed
    if (yesScript) {
      void speakWithSarvam({
        text: yesScript.hindi,
        languageCode: 'hi-IN',
      })
    }

    setLanguageConfirmed(true)
    setPhase('LANGUAGE_SET')
    router.push('/language-set')
  }

  const handleChange = () => {
    stopCurrentSpeech()
    // Speak change requested
    const changeScript = LANGUAGE_CONFIRM_SCREEN.scripts.onChangeRequested
    if (changeScript) {
      void speakWithSarvam({
        text: changeScript.hindi,
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
              setPhase('MANUAL_CITY')
              router.push('/manual-city')
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
            <span className="text-[64px]">🗣️</span>
            <div className="mt-2 text-[20px] font-bold text-text-secondary font-devanagari">
              {detectedCity || 'शहर'}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-4 px-4 text-center">
        <h2 className="text-[26px] font-bold text-text-primary leading-tight font-devanagari">
          {detectedCity} के हिसाब से
        </h2>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 p-6 bg-saffron-lt rounded-2xl inline-block"
        >
          <p className="text-[32px] font-bold text-saffron font-devanagari">
            {selectedLanguage}
          </p>
          <p className="text-[18px] text-text-secondary mt-2 font-devanagari">
            सेट हो रही है
          </p>
        </motion.div>
      </section>

      {/* Content Body */}
      <section className="px-4 flex-grow mt-8">
        <div className="p-6 bg-surface-card rounded-2xl border-2 border-border-default">
          <div className="flex items-start gap-4">
            <span className="text-[32px]">💡</span>
            <div>
              <p className="text-[18px] font-bold text-text-primary font-devanagari leading-snug">
                यह भाषा आपके शहर में सबसे ज्यादा बोली जाती है
              </p>
              <p className="text-[16px] text-text-secondary mt-2 font-devanagari">
                गलत है? "बदलें" बोलें या नीचे बटन दबाएं
              </p>
            </div>
          </div>
        </div>

        {/* Voice Listening Indicator */}
        {isListening && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar"></div>
              <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar animation-delay-200"></div>
              <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar animation-delay-400"></div>
            </div>
            <span className="text-[16px] text-text-secondary font-devanagari ml-2">
              सुन रहा हूँ... "हाँ" या "बदलें" बोलें
            </span>
          </div>
        )}
      </section>

      {/* Footer Buttons */}
      <footer className="p-6 space-y-4 mb-6">
        <button
          onClick={handleConfirm}
          className="w-full bg-saffron text-white py-4 min-h-[72px] rounded-2xl text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none"
          aria-label="Confirm language selection"
        >
          ✅ हाँ, सही है
        </button>
        <button
          onClick={handleChange}
          className="w-full bg-surface-card text-text-primary py-4 min-h-[72px] rounded-2xl text-[20px] font-bold border-2 border-border-default active:scale-[0.98] transition-transform focus:ring-2 focus:ring-saffron focus:outline-none"
          aria-label="Change language selection"
        >
          🔄 बदलें — दूसरी भाषा चुनें
        </button>
      </footer>
    </main>
  )
}
