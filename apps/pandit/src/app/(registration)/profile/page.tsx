'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useNavigationStore } from '@/stores/navigationStore'

export default function ProfileDetails() {
  const router = useRouter()
  const { data, setName, setCurrentStep, markStepComplete } = useRegistrationStore()
  const { navigate, setSection, canNavigateBack, goBack } = useNavigationStore()

  // BUG-015 FIX: Initialize from persisted store for back-navigation/refresh survival
  const [fullName, setFullName] = useState(() => data.name || '')
  const [error, setError] = useState('')
  // BUG-030 FIX: Prevent shaky thumb spam during submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  // BUG-014 FIX: Route guard - redirect to mobile if OTP not completed
  useEffect(() => {
    if (!data.mobile || data.mobile.length !== 10) {
      void speakWithSarvam({
        text: 'मोबाइल नंबर नहीं मिला। कृपया पहले मोबाइल दर्ज करें।',
        languageCode: 'hi-IN',
      })
      router.push('/mobile')
      return
    }
    if (!data.otp || data.otp.length !== 6) {
      void speakWithSarvam({
        text: 'OTP सत्यापन अधूरा है। कृपया पहले OTP पूरा करें।',
        languageCode: 'hi-IN',
      })
      router.push('/otp')
      return
    }

    navigate('/profile', 'part1-registration')
    setSection('part1-registration')

    // BUG-011 FIX: Stop any ongoing speech on unmount
    return () => {
      stopCurrentSpeech()
    }
  }, [data.mobile, data.otp, navigate, router, setSection])

  // BUG-015 FIX: Persist keystrokes to store immediately for crash/refresh survival
  useEffect(() => {
    if (fullName.trim().length > 0) {
      setName(fullName.trim())
    }
  }, [fullName, setName])

  const handleBack = () => {
    if (canNavigateBack()) {
      const prev = goBack()
      if (prev) router.push(prev)
      else router.push('/otp')
    } else {
      router.push('/otp')
    }
  }

  // BUG-012 FIX: Removed duplicate useEffect - useSarvamVoiceFlow handles all voice logic
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

  const handleContinue = (nameValue: string) => {
    if (nameValue.trim().length < 3) {
      setError('कृपया अपना पूरा नाम दर्ज करें')
      void speakWithSarvam({
        text: 'कृपया अपना पूरा नाम दर्ज करें',
        languageCode: 'hi-IN',
      })
      return
    }

    // BUG-030 FIX: Prevent double submission
    if (isSubmitting) return

    setIsSubmitting(true)
    setName(nameValue)
    markStepComplete('profile')
    setCurrentStep('complete')

    void speakWithSarvam({
      text: 'बहुत अच्छा पंडित जी! आपका पंजीकरण पूरा हो गया है।',
      languageCode: 'hi-IN',
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
          className="w-[56px] h-[56px] flex items-center justify-center text-saffron rounded-full active:bg-black/5"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-2xl text-saffron">ॐ</span>
        <span className="text-lg font-bold text-text-lgrimary">HmarePanditJi</span>
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
        <p className="text-center text-lg text-text-secondary">
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
          <span className="text-lgxl">👤</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-lgrimary text-center mb-2">
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
            className="w-full h-16 px-4 text-lgl border-2 border-border-default rounded-btn focus:border-saffron focus:outline-none bg-surface-card"
          />
          {error && (
            <p className="mt-2 text-lg text-error-red">{error}</p>
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
            <span className="text-saffron text-lg">सुन रहा हूँ...</span>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!fullName.trim() || isSubmitting}
          className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'पंजीकरण हो रहा है...' : 'पंजीकरण पूरा करें ✓'}
        </button>
      </div>

      {/* Footer hint */}
      <p className="pb-8 text-center text-lg text-text-lglaceholder">
        🎤 &quot;नाम बोलें&quot; या &quot;पीछे जाएं&quot; बोलें
      </p>
    </main>
  )
}
