'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'

export default function LanguageChoicePage() {
  const router = useRouter()
  const { setPhase } = useOnboardingStore()

  useEffect(() => {
    void speakWithSarvam({ text: 'कृपया अपनी भाषा चुनें।', languageCode: 'hi-IN' })
  }, [])

  const handleSelect = (lang: string) => {
    void speakWithSarvam({ text: `${lang} चुनी गई।`, languageCode: 'hi-IN', onEnd: () => {
      setPhase('LANGUAGE_CONFIRM')
      router.push('/language-confirm')
    }})
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col">
      {/* Top Bar */}
      <div className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center justify-between border-b border-border-default">
        <div className="flex items-center gap-2">
          <button onClick={() => { stopCurrentSpeech(); setPhase('LANGUAGE_LIST'); router.push('/language-list'); }} className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none" aria-label="Go back">
            <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-2xl xs:text-3xl sm:text-[32px] text-saffron">ॐ</span>
          <h1 className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">HmarePanditJi</h1>
        </div>
        <button onClick={() => {}} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] px-4 xs:px-6 flex items-center gap-2 text-sm xs:text-base sm:text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"><span>हिन्दी / English</span></button>
      </div>

      {/* Illustration */}
      <section className="mt-2 xs:mt-4 px-4 flex justify-center">
        <div className="w-full max-w-[280px] h-32 xs:h-36 sm:h-[160px] relative flex items-center justify-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center">
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: 2 }} className="text-5xl xs:text-6xl sm:text-[64px]">🗣️</motion.span>
          </motion.div>
        </div>
      </section>

      {/* Title */}
      <section className="mt-2 xs:mt-4 px-4 text-center">
        <h2 className="text-xl xs:text-2xl sm:text-[28px] font-bold text-text-primary leading-tight font-devanagari">भाषा पुष्टि करें</h2>
        <p className="text-sm xs:text-base sm:text-[20px] text-text-secondary mt-1 xs:mt-2 font-devanagari">क्या आप इस भाषा में आगे बढ़ना चाहते हैं?</p>
      </section>

      {/* Content */}
      <section className="px-4 flex-grow mt-4 xs:mt-6">
        <div className="bg-saffron-lt border-2 border-saffron rounded-2xl p-4 xs:p-6 mb-6 xs:mb-8">
          <div className="flex items-center gap-3 xs:gap-4 mb-3 xs:mb-4">
            <span className="text-3xl xs:text-4xl sm:text-[40px]">🌐</span>
            <div>
              <p className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">चयनित भाषा</p>
              <p className="text-sm xs:text-base sm:text-[18px] text-text-secondary">Hindi (हिंदी)</p>
            </div>
          </div>
          <p className="text-sm xs:text-base sm:text-lg text-text-secondary">यह भाषा आपके शहर के आधार पर चुनी गई है।</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 xs:px-6 pb-6 xs:pb-8 pt-4 xs:pt-6 bg-surface-base/90 backdrop-blur-sm border-t border-border-default space-y-3 xs:space-y-4">
        <button onClick={() => handleSelect('Hindi')} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white font-bold text-lg rounded-2xl shadow-btn-saffron active:scale-[0.97]">हाँ, आगे बढ़ें</button>
        <button onClick={() => router.push('/language-list')} className="w-full min-h-[52px] xs:min-h-[56px] border-2 border-saffron text-saffron font-bold text-lg rounded-2xl active:scale-[0.97]">भाषा बदलें</button>
      </footer>
    </main>
  )
}
