'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'

export default function LoginPage() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)

  const { isListening: voiceListening } = useSarvamVoiceFlow({
    language: 'Hindi',
    script: 'क्या यह आप हैं? हाँ या नहीं बोलें।',
    initialDelayMs: 500,
    pauseAfterMs: 500,
    onIntent: (intent) => {
      if (intent === 'YES') handleConfirm()
      else if (intent === 'NO') handleNotMatch()
    },
  })

  useEffect(() => {
    setIsListening(voiceListening)
  }, [voiceListening])

  const handleBack = () => router.back()
  const handleConfirm = () => {
    void speakWithSarvam({ text: 'स्वागत है!', languageCode: 'hi-IN', onEnd: () => router.push('/dashboard') })
  }
  const handleNotMatch = () => {
    void speakWithSarvam({ text: 'कोई बात नहीं। नया पंजीकरण शुरू करते हैं।', languageCode: 'hi-IN', onEnd: () => router.push('/mobile') })
  }

  return (
    <main className="min-h-dvh flex flex-col px-4 xs:px-6 pt-12 xs:pt-16 bg-surface-base">
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-6 xs:mb-8">
        <div className="flex items-center gap-2 xs:gap-3">
          <button onClick={handleBack} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] min-w-[52px] xs:min-w-[56px] sm:min-w-[64px] flex items-center justify-center text-saffron rounded-full active:bg-black/5 border-2 border-saffron/30" aria-label="Go back">
            <svg className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-3xl xs:text-4xl sm:text-[40px] text-saffron font-bold">ॐ</span>
            <span className="text-lg xs:text-xl sm:text-[22px] font-bold text-text-primary">HmarePanditJi</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[96px] min-w-[52px] xs:min-w-[56px] sm:min-w-[96px] bg-saffron-light rounded-full flex items-center justify-center mb-4 xs:mb-6 mx-auto">
          <span className="text-4xl xs:text-5xl sm:text-[48px]">🧑‍🦳</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl xs:text-4xl sm:text-[36px] font-bold text-text-primary text-center mb-2 xs:mb-3">पहले से पंजीकृत?</h1>
        <p className="text-2xl xs:text-3xl sm:text-[28px] font-bold text-saffron text-center mb-6 xs:mb-8">लॉगिन करें</p>

        {/* Identity Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-surface-card rounded-card shadow-card p-4 xs:p-6 mb-6 xs:mb-8">
          <div className="flex items-center gap-3 xs:gap-4 mb-3 xs:mb-4">
            <div className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] min-w-[52px] xs:min-w-[56px] sm:min-w-[72px] bg-saffron-light rounded-full flex items-center justify-center">
              <span className="text-3xl xs:text-4xl sm:text-[36px]">🧑‍🦳</span>
            </div>
            <div>
              <h2 className="text-lg xs:text-xl sm:text-[24px] font-bold text-text-primary">पंडित रामेश्वर शर्मा</h2>
              <p className="text-sm xs:text-base sm:text-[18px] text-text-secondary">वाराणसी, उत्तर प्रदेश</p>
            </div>
          </div>
          <div className="border-t border-border-default pt-3 xs:pt-4">
            <div className="flex items-center gap-2 xs:gap-3 text-sm xs:text-base sm:text-[18px] text-text-secondary">
              <span className="material-symbols-outlined text-lg xs:text-xl sm:text-[24px] text-trust-green filled">check_circle</span>
              <span>आधार सत्यापित</span>
            </div>
          </div>
        </motion.div>

        {/* Voice indicator */}
        {isListening && (<div className="flex items-center justify-center gap-2 mb-4 xs:mb-6"><div className="flex items-end gap-1 h-10 xs:h-12"><div className="w-2 bg-saffron rounded-full animate-voice-bar" /><div className="w-2 bg-saffron rounded-full animate-voice-bar-2" /><div className="w-2 bg-saffron rounded-full animate-voice-bar-3" /></div><span className="text-saffron text-lg xs:text-xl sm:text-[22px] font-bold">सुन रहा हूँ...</span></div>)}

        {/* Buttons */}
        <div className="space-y-2 xs:space-y-3">
          <button onClick={handleConfirm} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] bg-saffron text-white font-bold text-lg xs:text-xl sm:text-[22px] rounded-2xl shadow-btn-saffron active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none">हाँ, यह मैं हूँ</button>
          <button onClick={handleNotMatch} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] border-2 border-saffron text-saffron font-bold text-lg xs:text-xl sm:text-[22px] rounded-2xl active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none">नहीं, यह मैं नहीं हूँ</button>
        </div>

        {/* Voice hint */}
        <p className="mt-4 xs:mt-6 text-center text-base xs:text-lg sm:text-[20px] text-text-placeholder">🎤 'हाँ', 'नहीं', या 'पीछे जाएं' बोलें</p>
      </div>
    </main>
  )
}
