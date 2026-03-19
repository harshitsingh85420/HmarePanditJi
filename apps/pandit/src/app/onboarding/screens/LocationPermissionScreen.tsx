'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/part0/TopBar'
import { SupportedLanguage } from '@/lib/onboarding-store'
import { LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'

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

  useVoiceFlow({
    language: language,
    voiceScript: 'नमस्ते पंडित जी। मैं आपका शहर जानना चाहता हूँ ताकि आपको सही भाषा और सेवा मिल सके।',
    onIntent: (intent) => {
      if (intent === 'YES') handleAllow()
      if (intent === 'NO' || intent === 'SKIP' || intent === 'FORWARD') onDenied()
    }
  })

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

      {/* Illustration — India map outline + animated pin */}
      <section className="mt-4 px-4 flex justify-center">
        <div className="w-full max-w-[280px] h-[180px] relative flex items-center justify-center">
          {/* Warm glow disc */}
          <div className="absolute w-[160px] h-[160px] rounded-full bg-[#FEF3C7]" />
          {/* India map outline SVG */}
          <svg
            viewBox="0 0 200 220"
            className="relative z-10 w-[140px] h-[154px]"
            fill="#FAF6EE"
            stroke="#E8C87A"
            strokeWidth="1.5"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Simplified India outline — recognisable silhouette */}
            <path d="
              M100,4
              L114,8 L128,14 L140,22 L148,30 L154,42
              L158,56 L160,68 L156,78 L164,86 L168,98
              L164,108 L158,116 L152,122 L156,132 L158,142
              L154,152 L148,160 L140,166 L132,172 L124,178
              L116,182 L110,190 L106,196 L100,210
              L94,196 L90,190 L84,182 L76,178 L68,172
              L60,166 L52,160 L46,152 L42,142 L44,132
              L48,122 L42,116 L36,108 L32,98 L36,86
              L44,78 L40,68 L42,56 L46,42 L52,30
              L60,22 L72,14 L86,8 Z
            " />
            {/* Kashmir region bump */}
            <path d="M86,8 L80,4 L74,2 L70,6 L72,14" fill="#F0E6D3" stroke="#E8C87A" strokeWidth="1" />
            {/* North-east India protrusion */}
            <path d="M158,78 L164,72 L172,76 L174,84 L168,90 L164,86" fill="#F0E6D3" stroke="#E8C87A" strokeWidth="1" />
            {/* Sri Lanka (small island below) */}
            <ellipse cx="120" cy="218" rx="7" ry="5" fill="#F5ECD0" stroke="#E8C87A" strokeWidth="1" />
          </svg>

          {/* Animated location pin — centred on map */}
          <div className="absolute z-20" style={{ top: '28%', left: '50%', transform: 'translateX(-50%)' }}>
            {/* Ripple rings */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F09942] opacity-50 animate-ping" />
              <div
                className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#F09942] opacity-25 animate-ping"
                style={{ animationDelay: '0.6s' }}
              />
            </div>
            {/* Pin icon */}
            <svg
              className="w-8 h-8 text-[#F09942] drop-shadow-md"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ animation: 'pinDrop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Title */}
      <section className="mt-4 px-4 animate-fade-in">
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
            <div key={i} className={`flex items-start gap-4 opacity-0 animate-fade-up stagger-${i + 1}`}>
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
        <div className="mt-8 p-4 bg-[#DCFCE7] rounded-xl flex items-center gap-3 animate-fade-up stagger-4" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <span className="text-[20px]">🔒</span>
          <p className="text-[16px] font-semibold text-[#15803D] leading-snug">
            आपका पूरा पता कभी नहीं दिखेगा किसी को भी
          </p>
        </div>
      </section>

      {/* Buttons */}
      <footer className="p-4 space-y-4 mb-4 animate-fade-up stagger-5" style={{ opacity: 0, animationFillMode: 'forwards' }}>
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
