'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'

export default function MicDeniedRecovery() {
  const router = useRouter()
  const [micEnabled, setMicEnabled] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'माइक्रोफ़ोन की अनुमति ज़रूरी है। कृपया सेटिंग्स में जाकर माइक्रोफ़ोन चालू करें।',
        languageCode: 'hi-IN',
        speaker: 'meera',
        pace: 0.82,
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleOpenSettings = () => {
    // On mobile, this would open app settings
    // For web, we can only show instructions
    void speakWithSarvam({
      text: 'ब्राउज़र की सेटिंग्स में जाएं और माइक्रोफ़ोन की अनुमति दें।',
      languageCode: 'hi-IN',
    })
  }

  const handleRetry = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setMicEnabled(true)
      void speakWithSarvam({
        text: 'बहुत अच्छा! माइक्रोफ़ोन चालू है।',
        languageCode: 'hi-IN',
      })
      setTimeout(() => {
        router.push('/onboarding/permissions/location')
      }, 1500)
    } catch {
      setMicEnabled(false)
    }
  }

  const handleContinueWithoutVoice = () => {
    router.push('/onboarding/permissions/location')
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 bg-surface-base">
      {/* Top Bar */}
      <header className="flex items-center gap-2 mb-8">
        <span className="text-2xl text-saffron">ॐ</span>
        <span className="text-lg font-bold text-text-primary">HmarePanditJi</span>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-warning-amber-bg rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <span className="text-4xl">🔇</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          माइक्रोफ़ोन की अनुमति चाहिए
        </h1>
        <p className="text-text-secondary text-center mb-8">
          यह ऐप आपकी आवाज़ से चलता है
        </p>

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-warning-amber-bg border-2 border-warning-amber rounded-card p-6 mb-8"
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-warning-amber text-2xl">
              mic_off
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-1">
                माइक्रोफ़ोन बंद है
              </h2>
              <p className="text-text-secondary text-sm">
                कृपया माइक्रोफ़ोन चालू करें ताकि आप आवाज़ से पंजीकरण कर सकें।
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-saffron text-lg">check</span>
              <span>ब्राउज़र सेटिंग्स में जाएं</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-saffron text-lg">check</span>
              <span>माइक्रोफ़ोन की अनुमति दें</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-saffron text-lg">check</span>
              <span>पेज को रीफ्रेश करें</span>
            </li>
          </ul>
        </motion.div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleOpenSettings}
            className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>सेटिंग्स खोलें</span>
          </button>

          <button
            onClick={handleRetry}
            className="w-full h-14 border-2 border-saffron text-saffron font-bold text-lg rounded-btn active:scale-[0.97]"
          >
            फिर से कोशिश करें
          </button>

          <button
            onClick={handleContinueWithoutVoice}
            className="w-full h-14 text-text-secondary font-medium underline-offset-2 active:opacity-70"
          >
            बिना आवाज़ के जारी रखें
          </button>
        </div>
      </div>
    </main>
  )
}
