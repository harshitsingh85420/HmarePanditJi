'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useEffect } from 'react'

export default function HelpPage() {
  const router = useRouter()

  useEffect(() => {
    void speakWithSarvam({ text: 'कैसे मदद करें? हमारी Team तैयार है।', languageCode: 'hi-IN' })
  }, [])

  const handleGoBack = () => router.back()

  const handleLanguageSwitch = () => {
    // TODO: Implement language switcher - toggle between Hindi/English UI
    console.log('[HelpPage] Language switch clicked')
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col">
      {/* Top Bar */}
      <div className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center justify-between border-b border-border-default">
        <div className="flex items-center gap-2">
          <button onClick={handleGoBack} className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none" aria-label="Go back">
            <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-2xl xs:text-3xl sm:text-[32px] text-saffron">ॐ</span>
          <h1 className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">HmarePanditJi</h1>
        </div>
        <button onClick={handleLanguageSwitch} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] px-4 xs:px-6 flex items-center gap-2 text-sm xs:text-base sm:text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"><span>हिन्दी / English</span></button>
      </div>

      {/* Illustration */}
      <section className="mt-2 xs:mt-4 px-4 flex justify-center">
        <div className="w-full max-w-[280px] h-32 xs:h-36 sm:h-[160px] relative flex items-center justify-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center">
            <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="text-6xl xs:text-7xl sm:text-[80px] block">🤝</motion.span>
          </motion.div>
        </div>
      </section>

      {/* Title */}
      <section className="mt-2 xs:mt-4 px-4 text-center">
        <h2 className="text-xl xs:text-2xl sm:text-[28px] font-bold text-text-primary leading-tight font-devanagari">कैसे मदद करें?</h2>
        <p className="text-sm xs:text-base sm:text-[20px] text-text-secondary mt-1 xs:mt-2 font-devanagari">हमारी Team तैयार है</p>
      </section>

      {/* Content */}
      <section className="px-4 flex-grow mt-4 xs:mt-6">
        <a href="tel:18004654357" className="flex items-center gap-3 xs:gap-4 bg-saffron rounded-card shadow-cta px-4 xs:px-5 py-0 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] active:scale-[0.98] transition-transform mb-4">
          <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-[56px] sm:h-[56px] flex items-center justify-center shrink-0"><span className="text-2xl xs:text-3xl sm:text-4xl">📞</span></div>
          <div><p className="text-base xs:text-lg sm:text-[20px] font-bold text-white">हमारी Team से बात करें</p><p className="text-sm xs:text-base sm:text-[16px] text-white/85 mt-0.5">1800-HMJ-HELP | बिल्कुल Free</p></div>
        </a>
        <a href="https://wa.me/911234567890" className="flex items-center gap-3 xs:gap-4 rounded-card px-4 xs:px-5 py-0 min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] active:scale-[0.98] transition-transform bg-[#25D366] mb-4">
          <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-[56px] sm:h-[56px] flex items-center justify-center shrink-0"><span className="text-2xl xs:text-3xl sm:text-4xl">💬</span></div>
          <div><p className="text-base xs:text-lg sm:text-[18px] font-bold text-white">WhatsApp पर लिखें</p><p className="text-sm xs:text-base sm:text-[16px] text-white/90 mt-0.5">Message भेजें, जवाब आएगा</p></div>
        </a>
        <div className="flex items-center gap-3 xs:gap-4 my-4 xs:my-6"><div className="flex-1 h-0.5 xs:h-[2px] bg-surface-dim" /><span className="text-sm xs:text-base sm:text-[18px] text-saffron font-medium">─── या ───</span><div className="flex-1 h-0.5 xs:h-[2px] bg-surface-dim" /></div>
        <button className="text-base xs:text-lg sm:text-[18px] font-semibold border-b-2 border-saffron-lt pb-0.5 hover:border-saffron transition-colors w-full text-left py-2">खुद से मदद — FAQ देखें</button>
        <p className="text-sm xs:text-base sm:text-[16px] text-saffron mt-4 xs:mt-6">⏱️ जवाब का समय: सुबह 8 बजे – रात 10 बजे (सभी दिन)</p>
      </section>
    </main>
  )
}
