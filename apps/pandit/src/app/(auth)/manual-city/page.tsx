'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { MANUAL_CITY_SCREEN } from '@/lib/voice-scripts'
import { CITY_LANGUAGE_MAP } from '@/lib/onboarding-store'

const POPULAR_CITIES = [
  'Varanasi',
  'Delhi',
  'Lucknow',
  'Patna',
  'Haridwar',
  'Rishikesh',
  'Prayagraj',
  'Ayodhya',
  'Mathura',
  'Vrindavan',
  'Jaipur',
  'Ujjain',
]

export default function ManualCityScreen() {
  const router = useRouter()
  const { setPhase, setDetectedCity, setSelectedLanguage } = useOnboardingStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    // Voice prompt on screen load
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        void speakWithSarvam({
          text: MANUAL_CITY_SCREEN.scripts.main.hindi,
          languageCode: 'hi-IN',
        })
      }
    }, 600)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      stopCurrentSpeech()
    }
  }, [])

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setIsConfirming(true)

    // Speak confirmation
    const cityDetectedScript = MANUAL_CITY_SCREEN.scripts.onCityDetected
    if (cityDetectedScript) {
      const script = cityDetectedScript.hindi.replace(
        '{CITY}',
        city
      )
      void speakWithSarvam({
        text: script,
        languageCode: 'hi-IN',
      })
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      handleConfirm(city)
    }, 2000)
  }

  const handleConfirm = (city: string) => {
    const detectedLanguage = CITY_LANGUAGE_MAP[city.toLowerCase()] || 'Hindi'
    setDetectedCity(city, '') // Empty state for manual entry
    setSelectedLanguage(detectedLanguage)
    setPhase('LANGUAGE_CONFIRM')
    router.push('/language-confirm')
  }

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="relative mx-auto min-h-dvh w-full flex flex-col bg-surface-base">
      {/* TopBar */}
      <div className="h-[72px] px-4 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              stopCurrentSpeech()
              setPhase('LOCATION_PERMISSION')
              router.push('/location-permission')
            }}
            className="w-[64px] h-[64px] flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Go back to location permission"
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
        <div className="w-[280px] h-[140px] relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-[80px]"
          >
            🏙️
          </motion.div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-4 px-4">
        <h2 className="text-[26px] font-bold text-text-primary leading-tight">
          अपना शहर बताइए
        </h2>
        <p className="text-[18px] text-text-secondary mt-2 font-devanagari">
          बोल सकते हैं या नीचे से चुन सकते हैं
        </p>
      </section>

      {/* Content Body */}
      <section className="px-4 flex-grow mt-6">
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="शहर खोजें / Search city..."
            className="w-full min-h-[72px] px-6 py-4 bg-surface-card border-2 border-border-default rounded-2xl text-[20px] font-devanagari focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            aria-label="Search for city"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[24px] text-text-secondary">
            🔍
          </span>
        </div>

        {/* Voice Input Hint */}
        <div className="mb-6 p-4 bg-saffron-lt rounded-xl flex items-center gap-3">
          <span className="text-[32px]">🎤</span>
          <p className="text-[18px] font-bold text-text-primary font-devanagari">
            बोलें: "वाराणसी" या "Delhi"
          </p>
        </div>

        {/* City Chips Grid */}
        <div className="flex flex-wrap gap-3">
          {filteredCities.map((city) => (
            <motion.button
              key={city}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCitySelect(city)}
              className={`min-h-[64px] px-6 rounded-full border-2 font-bold text-[18px] transition-all focus:ring-2 focus:ring-saffron focus:outline-none ${selectedCity === city
                ? 'bg-saffron text-white border-saffron'
                : 'bg-surface-card text-text-primary border-border-default hover:border-saffron/50'
                }`}
            >
              {city}
            </motion.button>
          ))}
        </div>

        {/* Confirmation State */}
        {isConfirming && selectedCity && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6 p-6 bg-success-lt rounded-2xl flex items-center gap-4"
          >
            <span className="text-[32px]">✅</span>
            <div>
              <p className="text-[20px] font-bold text-success">
                {selectedCity} चुना गया
              </p>
              <p className="text-[16px] text-text-secondary">
                आगे बढ़ रहे हैं...
              </p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <footer className="p-6 space-y-4 mb-6">
        {/* Loading State */}
        {isConfirming && selectedCity && (
          <div className="flex items-center justify-center gap-2 text-success">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[16px] font-bold font-devanagari">आगे बढ़ रहे हैं...</span>
          </div>
        )}
        <button
          onClick={() => {
            if (selectedCity) {
              handleConfirm(selectedCity)
            }
          }}
          disabled={!selectedCity}
          className="w-full bg-saffron text-white py-4 min-h-[72px] rounded-2xl text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Continue to language confirmation"
        >
          आगे बढ़ें →
        </button>
      </footer>
    </main>
  )
}
