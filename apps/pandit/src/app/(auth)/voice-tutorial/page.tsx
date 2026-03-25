'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { VOICE_TUTORIAL_SCREEN } from '@/lib/voice-scripts'
import { useVoice } from '@/hooks/useVoice'

export default function VoiceTutorialScreen() {
  const router = useRouter()
  const { setPhase, setVoiceTutorialSeen } = useOnboardingStore()
  const [hasInteracted, setHasInteracted] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  const {
    isListening,
    startListening,
    speak,
    isSpeaking,
  } = useVoice({
    language: 'hi-IN',
    inputType: 'yes_no',
    isElderly: true,
    onResult: (text) => {
      handleVoiceResult(text)
    },
  })

  useEffect(() => {
    isMountedRef.current = true

    // Voice prompt on screen load
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        void speakWithSarvam({
          text: VOICE_TUTORIAL_SCREEN.scripts.main.hindi,
          languageCode: 'hi-IN',
        })
        // Start listening after voice completes (8 seconds + buffer)
        setTimeout(() => {
          if (isMountedRef.current) {
            startListening()
          }
        }, 8500)
      }
    }, 600)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      stopCurrentSpeech()
    }
  }, [startListening])

  const handleVoiceResult = (text: string) => {
    const normalizedText = text.toLowerCase().trim()

    // Check for yes/no responses
    if (
      normalizedText.includes('हाँ') ||
      normalizedText.includes('haan') ||
      normalizedText.includes('yes') ||
      normalizedText.includes('हां')
    ) {
      handleSuccess()
    } else if (
      normalizedText.includes('नहीं') ||
      normalizedText.includes('nahi') ||
      normalizedText.includes('no') ||
      normalizedText.includes('नही')
    ) {
      handleRetry()
    }
  }

  const handleSuccess = () => {
    setSuccessCount((prev) => prev + 1)
    setHasInteracted(true)

    // Speak success message
    const successScript = VOICE_TUTORIAL_SCREEN.scripts.onSuccess
    if (successScript) {
      void speakWithSarvam({
        text: successScript.hindi,
        languageCode: 'hi-IN',
      })
    }

    // Auto-advance after success
    setTimeout(() => {
      setVoiceTutorialSeen(true)
      setPhase('TUTORIAL_SWAGAT')
      router.push('/welcome')
    }, 2000)
  }

  const handleRetry = () => {
    setHasInteracted(true)

    // Speak retry message
    const timeoutScript = VOICE_TUTORIAL_SCREEN.scripts.onTimeout
    if (timeoutScript) {
      void speakWithSarvam({
        text: timeoutScript.hindi,
        languageCode: 'hi-IN',
      })
    }
  }

  const handleManualContinue = () => {
    setVoiceTutorialSeen(true)
    setPhase('TUTORIAL_SWAGAT')
    router.push('/welcome')
  }

  const handleManualTry = () => {
    setHasInteracted(true)
    startListening()
  }

  return (
    <main className="relative mx-auto min-h-dvh w-full flex flex-col bg-surface-base">
      {/* TopBar */}
      <div className="h-[72px] px-4 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              stopCurrentSpeech()
              setPhase('LANGUAGE_SET')
              router.push('/language-set')
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
            {/* Animated Microphone */}
            <motion.div
              animate={
                isListening
                  ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }
                  : {}
              }
              transition={{
                duration: 0.8,
                repeat: isListening ? Infinity : 0,
              }}
              className="text-[80px] inline-block"
            >
              🎤
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-4 px-4 text-center">
        <h2 className="text-[26px] font-bold text-text-primary leading-tight font-devanagari">
          आवाज़ से चलता है
        </h2>
        <p className="text-[18px] text-text-secondary mt-2 font-devanagari">
          यह app आपकी आवाज़ से चलता है
        </p>
      </section>

      {/* Content Body */}
      <section className="px-4 flex-grow mt-6">
        {/* Instruction Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-saffron-lt rounded-2xl border-2 border-saffron/30"
        >
          <div className="flex items-start gap-4">
            <span className="text-[40px]">💡</span>
            <div>
              <p className="text-[18px] font-bold text-text-primary font-devanagari leading-snug">
                जब orange mic दिखे और "सुन रहा हूँ" लिखा हो
              </p>
              <p className="text-[16px] text-text-secondary mt-2 font-devanagari">
                तब बोलिए — "हाँ" या "नहीं"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Interactive Voice Demo Area */}
        <div className="mt-6 p-6 bg-surface-card rounded-2xl border-2 border-border-default">
          <h3 className="text-[20px] font-bold text-text-primary font-devanagari mb-4 text-center">
            अभी कोशिश करें
          </h3>

          {/* Voice Status Indicator */}
          <div className="flex flex-col items-center gap-4">
            {/* Mic Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleManualTry}
              disabled={isListening || isSpeaking}
              className={`w-[100px] h-[100px] rounded-full flex items-center justify-center text-[48px] transition-all focus:ring-4 focus:ring-saffron focus:outline-none ${isListening
                  ? 'bg-saffron text-white animate-pulse'
                  : isSpeaking
                    ? 'bg-surface-dim text-text-secondary'
                    : 'bg-saffron-lt text-saffron'
                }`}
              aria-label="Tap to speak"
            >
              🎤
            </motion.button>

            {/* Status Text */}
            <div className="text-center">
              {isListening ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar"></div>
                    <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar animation-delay-200"></div>
                    <div className="w-1 h-6 bg-saffron rounded-full animate-voice-bar animation-delay-400"></div>
                  </div>
                  <span className="text-[18px] font-bold text-saffron font-devanagari">
                    सुन रहा हूँ...
                  </span>
                </div>
              ) : isSpeaking ? (
                <span className="text-[16px] text-text-secondary font-devanagari">
                  बोला जा रहा है...
                </span>
              ) : (
                <span className="text-[16px] text-text-secondary font-devanagari">
                  mic छूएं और "हाँ" बोलें
                </span>
              )}
            </div>
          </div>

          {/* Success State */}
          {successCount > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 p-4 bg-success-lt rounded-xl flex items-center gap-3"
            >
              <span className="text-[32px]">✅</span>
              <div>
                <p className="text-[18px] font-bold text-success font-devanagari">
                  वाह! बिल्कुल सही
                </p>
                <p className="text-[15px] text-text-secondary font-devanagari">
                  आप बहुत अच्छा कर रहे हैं
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 space-y-3">
          {[
            { icon: '🗣️', text: 'धीरे और साफ़ बोलें' },
            { icon: '📱', text: 'Phone को मुंह के पास रखें' },
            { icon: '🔇', text: 'शांत जगह पर रहें' },
          ].map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * (idx + 4) }}
              className="flex items-center gap-3 p-3 bg-surface-muted rounded-xl"
            >
              <span className="text-[24px]">{tip.icon}</span>
              <span className="text-[16px] text-text-secondary font-devanagari">
                {tip.text}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Buttons */}
      <footer className="p-6 space-y-4 mb-6">
        {/* Continue Button */}
        <button
          onClick={handleManualContinue}
          className="w-full bg-saffron text-white py-4 min-h-[72px] rounded-2xl text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none"
        >
          आगे बढ़ें →
        </button>

        {/* Keyboard Fallback */}
        <p className="text-center text-[16px] text-text-secondary font-devanagari">
          आवाज़ में दिक्कत? आगे बढ़ें — keyboard भी है
        </p>
      </footer>
    </main>
  )
}
