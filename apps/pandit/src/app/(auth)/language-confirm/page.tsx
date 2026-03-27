'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { LANGUAGE_DISPLAY } from '@/lib/onboarding-store'

export default function LanguageConfirmScreen() {
  const router = useRouter()
  const { pendingLanguage, setPhase, setSelectedLanguage } = useOnboardingStore()
  const langInfo = LANGUAGE_DISPLAY[pendingLanguage || 'Hindi']

  useEffect(() => {
    void speakWithSarvam({
      text: `आपने ${langInfo.latinName} चुनी। क्या यह सही है? 'हाँ' बोलें।`,
      languageCode: 'hi-IN',
    })
  }, [langInfo])

  const handleConfirm = () => {
    if (pendingLanguage) {
      setSelectedLanguage(pendingLanguage)
      setPhase('LANGUAGE_SET')
      void speakWithSarvam({ text: 'बहुत अच्छा! भाषा सेट हो रही है।', languageCode: 'hi-IN' })
      setTimeout(() => router.push('/language-set'), 500)
    }
  }

  const handleChange = () => {
    router.push('/language-list')
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col shadow-2xl">
      {/* Top Bar */}
      <header className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center justify-between border-b border-border-default">
        <button onClick={handleChange} className="min-h-[52px] xs:min-h-[56px] min-w-[52px] xs:min-w-[56px] p-2 hover:bg-black/5 rounded-full" aria-label="Go back"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></button>
        <button onClick={() => {}} className="min-h-[52px] xs:min-h-[56px] min-w-[52px] xs:min-w-[56px] text-2xl active:opacity-50">🌐</button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 xs:px-6 py-6 xs:py-8">
        {/* Language Card */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, type: 'spring' }} className="space-y-4 xs:space-y-6 text-center">
          <div className="text-6xl xs:text-7xl sm:text-8xl">{langInfo.scriptChar}</div>
          <div>
            <h1 className="text-4xl xs:text-5xl sm:text-[56px] font-bold text-saffron leading-tight">{langInfo.nativeName}</h1>
            <p className="text-lg xs:text-xl sm:text-[24px] font-normal text-text-secondary mt-2">{langInfo.latinName}</p>
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
