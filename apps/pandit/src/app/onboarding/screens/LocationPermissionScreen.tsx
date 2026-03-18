'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/part0/TopBar'
import { SupportedLanguage } from '@/lib/onboarding-store'
import { speak, LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'

interface LocationPermissionScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  onGranted: (city: string, state: string) => void
  onDenied: () => void
}

export default function LocationPermissionScreen({
  language,
  onLanguageChange,
  onGranted,
  onDenied,
}: LocationPermissionScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'
    const timer = setTimeout(() => {
      speak(
        'Namaste Pandit Ji. Main aapka shehar jaanna chahta hoon taaki aapko sahi bhasha aur seva mil sake.',
        bcp47
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [language])

  const handleAllow = () => {
    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          )
          const data = await res.json()
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            ''
          const state = data?.address?.state || ''
          onGranted(city, state)
        } catch {
          onDenied()
        } finally {
          setIsLoading(false)
        }
      },
      () => {
        setIsLoading(false)
        onDenied()
      }
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={false} onLanguageChange={onLanguageChange} />

      {/* Illustration */}
      <section className="mt-4 px-4 flex justify-center">
        <div className="w-full max-w-[358px] h-[160px] relative flex items-center justify-center">
          <div className="absolute w-[140px] h-[140px] bg-[#FEF3C7] rounded-full" />
          <svg className="relative z-10 w-32 h-32" fill="none" viewBox="0 0 100 100">
            <path d="M50 5L60 15L75 20L85 35L80 55L65 75L50 95L35 75L20 55L15 35L25 20L40 15L50 5Z" fill="#FAF0E6" stroke="#F0E6D3" strokeWidth="1" />
          </svg>
          {/* Animated pin */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div className="absolute top-5 left-1/2 -translate-x-1/2">
                <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#F09942] opacity-60 animate-ping" />
                <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#F09942] opacity-30 animate-ping" style={{ animationDelay: '1s' }} />
              </div>
              <svg className="w-8 h-8 text-[#F09942]" fill="currentColor" viewBox="0 0 24 24" style={{ animation: 'pinDrop 0.6s ease-out forwards' }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Title */}
      <section className="mt-4 px-4">
        <h2 className="text-[26px] font-bold text-[#2D1B00] leading-tight">
          आपका शहर जानना क्यों ज़रूरी है?
        </h2>
      </section>

      {/* Benefits */}
      <section className="px-4 flex-grow">
        <hr className="my-6 border-[#F0E6D3]" />
        <div className="space-y-6">
          {[
            { title: 'आपकी भाषा खुद सेट हो जाएगी', sub: 'टाइपिंग की ज़रूरत नहीं' },
            { title: 'आपके शहर की पूजाएं मिलेंगी', sub: 'दूर-दराज़ की नहीं' },
            { title: 'ग्राहक आपको ढूंढ पाएंगे', sub: 'नए ग्राहक, नई आमदनी' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F09942] flex items-center justify-center mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#2D1B00]">{item.title}</h3>
                <p className="text-[16px] font-normal text-[#9B7B52]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy card */}
        <div className="mt-8 p-4 bg-[#DCFCE7] rounded-xl flex items-center gap-3">
          <span className="text-[20px]">🔒</span>
          <p className="text-[16px] font-semibold text-[#15803D] leading-snug">
            आपका पूरा पता कभी नहीं दिखेगा किसी को भी
          </p>
        </div>
      </section>

      {/* Buttons */}
      <footer className="p-4 space-y-4 mb-4">
        <button
          onClick={handleAllow}
          disabled={isLoading}
          className="w-full bg-[#F09942] text-white py-4 rounded-xl text-[18px] font-bold active:scale-[0.98] transition-transform shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : '✅'} हाँ, मेरा शहर जानें
        </button>
        <button
          onClick={onDenied}
          className="w-full text-[#9B7B52] text-[16px] font-medium text-center block py-2"
        >
          छोड़ें — हाथ से भरूँगा
        </button>
      </footer>

      <style>{`
        @keyframes pinDrop {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
