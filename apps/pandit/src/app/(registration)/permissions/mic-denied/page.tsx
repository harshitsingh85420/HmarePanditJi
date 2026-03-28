'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'

/**
 * P-02-B: Mic Denied Recovery Screen
 * Spec: 3-step instructions, 3 action buttons (Settings, Keyboard mode, Back), sad mic icon, voice prompt
 */
export default function MicDeniedPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'माइक्रोफ़ोन की अनुमति नहीं मिली। Settings खोलें और अनुमति दें, या Keyboard से काम करें।',
        languageCode: 'hi-IN',
        pace: 0.85,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleOpenSettings = () => {
    // Re-trigger permission prompt (browser will show settings if already denied once)
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(() => {
        void speakWithSarvam({ text: 'बहुत अच्छा! माइक्रोफ़ोन चालू हो गया।', languageCode: 'hi-IN' })
        setTimeout(() => router.push('/permissions/location'), 1500)
      })
      .catch(() => {
        void speakWithSarvam({
          text: 'कृपया फ़ोन की Settings में जाकर माइक्रोफ़ोन की अनुमति दें।',
          languageCode: 'hi-IN',
        })
      })
  }

  const handleKeyboardMode = () => {
    void speakWithSarvam({
      text: 'ठीक है पंडित जी। आप कीबोर्ड से सारा काम कर सकते हैं।',
      languageCode: 'hi-IN',
    })
    setTimeout(() => router.push('/permissions/location'), 1500)
  }

  const handleGoBack = () => {
    router.push('/permissions/mic')
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col px-5 xs:px-6 py-10">
      {/* Sad Mic Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex justify-center mb-6"
      >
        <div className="w-28 h-28 xs:w-32 xs:h-32 rounded-full bg-surface-muted flex items-center justify-center relative">
          <span className="text-5xl">🎤</span>
          {/* Red X overlay */}
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-error-red flex items-center justify-center border-2 border-white">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl xs:text-3xl font-bold text-text-primary text-center mb-2 font-devanagari"
      >
        माइक्रोफ़ोन बंद है
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-base xs:text-lg text-text-secondary text-center mb-7 font-devanagari"
      >
        कोई बात नहीं — आप आगे बढ़ सकते हैं
      </motion.p>

      {/* 3-Step Instructions Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface-card rounded-2xl p-5 xs:p-6 shadow-card mb-6"
      >
        <p className="font-bold text-text-primary mb-4 font-devanagari">माइक्रोफ़ोन चालू करने के लिए:</p>
        <ol className="space-y-4">
          {[
            { step: '1', text: 'फ़ोन की सेटिंग्स खोलें', icon: '⚙️' },
            { step: '2', text: 'ऐप्स → ब्राउज़र → अनुमतियाँ', icon: '📱' },
            { step: '3', text: 'माइक्रोफ़ोन → अनुमति दें', icon: '🎤' },
          ].map(({ step, text, icon }) => (
            <li key={step} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{step}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="text-text-primary font-devanagari">{text}</span>
              </div>
            </li>
          ))}
        </ol>
      </motion.div>

      {/* 3 Action Buttons — per spec P-02-B */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="space-y-3"
      >
        {/* Primary: Settings */}
        <button
          onClick={handleOpenSettings}
          className="w-full min-h-[56px] xs:min-h-[72px] bg-saffron text-white font-bold text-lg rounded-2xl shadow-btn-saffron active:scale-[0.97] focus:ring-2 focus:ring-saffron focus:outline-none flex items-center justify-center gap-2 font-devanagari"
          aria-label="सेटिंग्स खोलें"
          id="btn-mic-settings"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94L2.86 14.52c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
          सेटिंग्स खोलें
        </button>

        {/* Secondary: Keyboard mode */}
        <button
          onClick={handleKeyboardMode}
          className="w-full min-h-[56px] xs:min-h-[72px] border-2 border-saffron text-saffron font-bold text-lg rounded-2xl active:scale-[0.97] focus:ring-2 focus:ring-saffron focus:outline-none flex items-center justify-center gap-2 font-devanagari"
          aria-label="कीबोर्ड से करें"
          id="btn-mic-keyboard"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
          </svg>
          कीबोर्ड से करें
        </button>

        {/* Tertiary: Go back */}
        <button
          onClick={handleGoBack}
          className="w-full min-h-[48px] text-text-secondary font-medium active:opacity-70 focus:outline-none font-devanagari"
          aria-label="वापस जाएं"
          id="btn-mic-back"
        >
          ← वापस जाएं
        </button>
      </motion.div>
    </main>
  )
}
