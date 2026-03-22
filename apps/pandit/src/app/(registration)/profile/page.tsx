'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useNavigationStore } from '@/stores/navigationStore'

export default function ProfileDetails() {
  const router = useRouter()
  const { setName, setCurrentStep, markStepComplete } = useRegistrationStore()
  const { navigate, setSection, canNavigateBack, goBack } = useNavigationStore()
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    navigate('/profile', 'part1-registration')
    setSection('part1-registration')
  }, [navigate, setSection])

  const handleBack = () => {
    if (canNavigateBack()) {
      const prev = goBack()
      if (prev) router.push(prev)
      else router.push('/otp')
    } else {
      router.push('/otp')
    }
  }

  const { isListening } = useSarvamVoiceFlow({
    language: 'Hindi',
    script: 'अब मुझे आपका पूरा नाम चाहिए। जैसा आपके आधार कार्ड में है। बोलें या नीचे टाइप करें।',
    autoListen: true,
    listenTimeoutMs: 15000,
    repromptScript: 'कृपया अपना पूरा नाम बोलें।',
    repromptTimeoutMs: 12000,
    initialDelayMs: 800,
    pauseAfterMs: 500,
    onIntent: (intent) => {
      if (typeof intent === 'string') {
        if (intent.startsWith('RAW:')) {
          const rawName = intent.slice(4)
          const capitalizedName = rawName.replace(/\b\w/g, c => c.toUpperCase())
          setFullName(capitalizedName)
          handleContinue(capitalizedName)
        } else if (intent === 'BACK') {
          handleBack()
        }
      }
    },
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'अब मुझे आपका पूरा नाम चाहिए। जैसा आपके आधार कार्ड में है। बोलें या नीचे टाइप करें।',
        languageCode: 'hi-IN',
        speaker: 'meera',
        pace: 0.82,
      })
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const handleContinue = (nameValue: string) => {
    if (nameValue.trim().length < 3) {
      setError('कृपया अपना पूरा नाम दर्ज करें')
      void speakWithSarvam({
        text: 'कृपया अपना पूरा नाम दर्ज करें',
        languageCode: 'hi-IN',
      })
      return
    }

    setName(nameValue)
    markStepComplete('profile')
    setCurrentStep('complete')

    void speakWithSarvam({
      text: 'बहुत अच्छा पंडित जी! आपका पंजीकरण पूरा हो गया है।',
      languageCode: 'hi-IN',
      speaker: 'meera',
      pace: 0.82,
    })

    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleSubmit = () => {
    handleContinue(fullName)
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 bg-surface-base">
      {/* Top Bar with Back Button */}
      <header className="flex items-center gap-2 mb-8">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center text-vedic-gold rounded-full active:bg-black/5"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-2xl text-saffron">ॐ</span>
        <span className="text-lg font-bold text-text-primary">HmarePanditJi</span>
      </header>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          {['mobile', 'otp', 'profile'].map((step, i) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${step === 'profile' ? 'w-6 bg-saffron' : 'w-2 bg-border-default'
                }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-text-secondary">
          Step 3 of 3
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-saffron-light rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <span className="text-4xl">👤</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          आपका नाम
        </h1>
        <p className="text-text-secondary text-center mb-8">
          जैसा आपके आधार कार्ड में है
        </p>

        {/* Input */}
        <div className="mb-4">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="पंडित राम कुमार शर्मा"
            className="w-full h-16 px-4 text-xl border-2 border-border-default rounded-btn focus:border-saffron focus:outline-none bg-surface-card"
          />
          {error && (
            <p className="mt-2 text-sm text-error-red">{error}</p>
          )}
        </div>

        {/* Voice indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-end gap-1 h-6">
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-2" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-3" />
            </div>
            <span className="text-saffron text-sm">सुन रहा हूँ...</span>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!fullName.trim()}
          className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          पंजीकरण पूरा करें ✓
        </button>
      </div>

      {/* Footer hint */}
      <p className="pb-8 text-center text-sm text-text-placeholder">
        🎤 "नाम बोलें" या "पीछे जाएं" बोलें
      </p>
    </main>
  )
}
