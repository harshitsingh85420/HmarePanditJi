'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { VoiceField } from '@/components/voice/VoiceField'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useSafeOnboardingStore } from '@/lib/stores/ssr-safe-stores'
import { MANUAL_CITY_SCREEN } from '@/lib/voice-scripts'
import { CITY_LANGUAGE_MAP } from '@/lib/onboarding-store'

const POPULAR_CITIES = ['Varanasi', 'Delhi', 'Lucknow', 'Patna', 'Haridwar', 'Rishikesh', 'Prayagraj', 'Ayodhya', 'Mathura', 'Vrindavan', 'Jaipur', 'Ujjain']

// Spoken keywords for the NCR pilot cities; anything else falls through as free text
const CITY_CHOICES = [
  { label: 'दिल्ली (Delhi)', value: 'Delhi', keywords: ['दिल्ली', 'delhi', 'dilli'] },
  { label: 'नोएडा (Noida)', value: 'Noida', keywords: ['नोएडा', 'noida'] },
  { label: 'गुरुग्राम (Gurugram)', value: 'Gurugram', keywords: ['गुरुग्राम', 'गुड़गांव', 'gurugram', 'gurgaon'] },
  { label: 'गाज़ियाबाद (Ghaziabad)', value: 'Ghaziabad', keywords: ['गाज़ियाबाद', 'गाजियाबाद', 'ghaziabad'] },
  { label: 'फ़रीदाबाद (Faridabad)', value: 'Faridabad', keywords: ['फरीदाबाद', 'फ़रीदाबाद', 'faridabad'] },
]

export default function ManualCityScreen() {
  const router = useRouter()

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { setPhase, setDetectedCity, setSelectedLanguage } = useSafeOnboardingStore()
  const [searchQuery, setSearchQuery] = useState('')
  const searchQueryRef = useRef('')
  useEffect(() => { searchQueryRef.current = searchQuery }, [searchQuery])
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        void speakWithSarvam({ text: MANUAL_CITY_SCREEN.scripts.main.hindi, languageCode: 'hi-IN' })
      }
    }, 600)
    return () => { isMountedRef.current = false; clearTimeout(timer); stopCurrentSpeech(); }
  }, [])

  const handleSelect = (city: string) => {
    setSelectedCity(city)
    setIsConfirming(true)
    const lang = CITY_LANGUAGE_MAP[city.toLowerCase()] || 'Hindi'
    setSelectedLanguage(lang)
    setDetectedCity(city, 'Unknown')
    void speakWithSarvam({ text: `${city} — सही है? 'हाँ' बोलें।`, languageCode: 'hi-IN' })
  }

  const handleConfirm = () => {
    if (selectedCity) {
      setDetectedCity(selectedCity, 'Unknown')
      setPhase('LANGUAGE_CONFIRM')
      void speakWithSarvam({ text: 'बहुत अच्छा। आगे बढ़ रहे हैं।', languageCode: 'hi-IN' })
      setTimeout(() => router.push('/language-confirm'), 1000)
    }
  }

  const handleSkip = () => {
    if (selectedCity) {
      setDetectedCity(selectedCity, 'Unknown')
      setPhase('LANGUAGE_CONFIRM')
      router.push('/language-confirm')
    }
  }

  const filteredCities = POPULAR_CITIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <header className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] pt-4 xs:pt-6 pb-2 px-4 xs:px-6 flex flex-col items-center bg-gradient-to-b from-saffron-lt/50 to-transparent border-b border-saffron/30">
        <span className="text-6xl xs:text-7xl sm:text-[80px] font-bold font-body text-saffron animate-gentle-float" aria-label="पवित्र ओम प्रतीक">ॐ</span>
        <div className="flex items-center gap-2 font-bold font-body text-xl xs:text-2xl sm:text-[28px] text-text-primary mt-2"><span className="text-3xl xs:text-4xl sm:text-[40px] text-saffron">ॐ</span><span>HmarePanditJi</span></div>
      </header>

      {/* Back & Language */}
      <div className="flex items-center justify-between px-4 xs:px-6 py-2 xs:py-3">
        <button onClick={() => router.back()} aria-label="पीछे जाएं" className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] min-w-[52px] xs:min-w-[56px] sm:min-w-[72px] p-1 xs:p-2 active:opacity-50 text-text-primary focus:ring-4 focus:ring-saffron focus:outline-none rounded-full hover:bg-surface-muted">
          <svg className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        <button onClick={() => { }} aria-label="भाषा बदलें" className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center gap-2 xs:gap-3 text-lg xs:text-xl sm:text-[24px] font-bold font-body text-text-primary active:opacity-50 focus:ring-4 focus:ring-saffron focus:outline-none border-3 border-border-default rounded-2xl bg-surface-card hover:bg-surface-muted transition-colors shadow-card"><span>हिन्दी</span><span className="text-lg xs:text-xl sm:text-[24px] text-text-secondary">/</span><span>English</span></button>
      </div>

      {/* Content */}
      <section className="flex-grow px-4 xs:px-6 pt-3 xs:pt-4 flex flex-col gap-4 xs:gap-6 overflow-y-auto">
        {/* Title */}
        <div className="text-center space-y-1 xs:space-y-2"><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl xs:text-2xl sm:text-[28px] font-body text-saffron font-bold">कोई बात नहीं।</motion.p><motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl xs:text-4xl sm:text-[40px] font-body font-bold leading-tight text-text-primary">अपना शहर बताइए</motion.h1></div>

        {/* Voice-first city input (spoken choice with free-text + keyboard fallback) */}
        <VoiceField
          label="अपना शहर बताइए"
          promptText="अपना शहर बोलें। जैसे: दिल्ली, नोएडा, या वाराणसी।"
          value={searchQuery}
          onChange={setSearchQuery}
          mode="choice"
          choices={CITY_CHOICES}
          onComplete={() => {
            const v = searchQueryRef.current.trim()
            if (v.length > 1) handleSelect(v)
          }}
          placeholder="अपना शहर लिखें..."
        />

        {/* Divider */}
        <div className="flex items-center gap-3 xs:gap-4 text-base xs:text-lg sm:text-[24px] font-body font-bold text-saffron/60"><div className="h-0.5 xs:h-[3px] flex-grow bg-surface-dim"></div><span>या नीचे से चुनें</span><div className="h-0.5 xs:h-[3px] flex-grow bg-surface-dim"></div></div>

        {/* Cities */}
        <div className="space-y-3 xs:space-y-4"><h2 className="text-xl xs:text-2xl sm:text-[28px] font-body font-bold text-text-secondary">लोकप्रिय शहर</h2><div className="flex gap-3 xs:gap-4 overflow-x-auto no-scrollbar pb-2">{filteredCities.map((city, cIdx) => (<motion.button key={city} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 * cIdx }} onClick={() => handleSelect(city)} className="whitespace-nowrap px-8 xs:px-10 py-4 xs:py-5 min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] bg-surface-card border-3 border-saffron text-text-primary rounded-2xl font-body font-bold text-xl xs:text-2xl sm:text-[28px] active:bg-saffron-light shrink-0 focus:ring-4 focus:ring-saffron focus:outline-none hover:border-saffron/60 shadow-card">{city}</motion.button>))}</div></div>
      </section>

      {/* Footer */}
      <footer className="px-4 xs:px-6 pb-6 xs:pb-8 pt-3 xs:pt-4 bg-surface-base/90 backdrop-blur-sm border-t border-border-default">
        {isConfirming ? (<div className="space-y-3 xs:space-y-4"><p className="text-center text-lg xs:text-xl sm:text-[26px] text-text-primary font-bold">क्या यह सही है?</p><div className="grid grid-cols-2 gap-3 xs:gap-4"><motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] border-3 border-border-default rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold text-saffron bg-surface-card active:bg-saffron-light">✗ नहीं</motion.button><motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold shadow-btn-saffron">✓ हाँ</motion.button></div></div>) : (<motion.button whileTap={{ scale: 0.97 }} disabled={!selectedCity} onClick={handleSkip} className={`w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] rounded-2xl text-lg xs:text-xl sm:text-[26px] font-bold transition-all ${selectedCity ? 'bg-saffron text-white shadow-btn-saffron' : 'bg-surface-dim text-saffron cursor-not-allowed'}`}>{selectedCity ? `${selectedCity} — सही है →` : 'शहर चुनें'}</motion.button>)}
      </footer>
    </main>
  )
}
