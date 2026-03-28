'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useSafeOnboardingStore } from '@/lib/stores/ssr-safe-stores'
import { LOCATION_PERMISSION_SCREEN } from '@/lib/voice-scripts'

export default function LocationPermissionScreen() {
  const router = useRouter()

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { setPhase, setDetectedCity } = useSafeOnboardingStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        void speakWithSarvam({ text: LOCATION_PERMISSION_SCREEN.scripts.main.hindi, languageCode: 'hi-IN' })
      }
    }, 600)
    return () => { isMountedRef.current = false; clearTimeout(timer); stopCurrentSpeech(); }
  }, [])

  const handleAllowClick = async () => {
    setLoading(true)
    setError(null)
    if (!navigator.geolocation) { setError('Geolocation not supported'); handleDeny(); return; }
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }))
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`)
      const data = await res.json()
      const city = data.address.city || data.address.town || data.address.village || 'Unknown'
      const state = data.address.state || 'Unknown'
      setDetectedCity(city, state)
      setPhase('LANGUAGE_CONFIRM')
      void speakWithSarvam({ text: `शहर मिल गया: ${city}`, languageCode: 'hi-IN' })
      setTimeout(() => router.push('/language-confirm'), 1500)
    } catch {
      setLoading(false)
      setError('लोकेशन नहीं मिल पाया')
      void speakWithSarvam({ text: 'लोकेशन नहीं मिल पाया। कृपया फिर से कोशिश करें।', languageCode: 'hi-IN' })
    }
  }

  const handleDeny = () => { setPhase('MANUAL_CITY'); router.push('/manual-city'); }
  const handleSkip = () => { setDetectedCity('Varanasi', 'UP'); handleDeny(); }

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[390px] xs:max-w-[430px] flex flex-col bg-surface-base">
      {/* TopBar */}
      <div className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base z-50">
        <div className="flex items-center gap-2"><span className="text-2xl xs:text-3xl sm:text-[32px] text-saffron">ॐ</span><h1 className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">HmarePanditJi</h1></div>
        <button onClick={() => { }} className="min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] px-4 xs:px-6 flex items-center gap-2 text-sm xs:text-base sm:text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"><span>हिन्दी / English</span></button>
      </div>

      {/* Illustration */}
      <section className="mt-2 xs:mt-4 px-4 flex justify-center"><div className="w-full max-w-[280px] h-32 xs:h-36 sm:h-[160px] relative flex items-center justify-center"><motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center"><motion.div animate={{ scale: [0.8, 1.5], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }} className="absolute w-10 h-12 xs:w-11 xs:h-[50px] sm:w-12 sm:h-[52px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-saffron"></motion.div><motion.svg initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="w-10 h-12 xs:w-11 xs:h-[50px] sm:w-12 sm:h-[52px] text-saffron relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></motion.svg></motion.div></div></section>

      {/* Title */}
      <section className="mt-2 xs:mt-4 px-4 text-center"><h2 className="text-xl xs:text-2xl sm:text-[26px] font-bold text-text-primary leading-tight">आपका शहर जानना क्यों ज़रूरी है?</h2></section>

      {/* Content */}
      <section className="px-4 flex-grow mt-4 xs:mt-6">
        <hr className="my-4 xs:my-6 border-outline-variant" />
        <div className="space-y-4 xs:space-y-6">{[{ title: 'आपकी भाषा खुद सेट हो जाएगी', desc: 'टाइपिंग की ज़रूरत नहीं' }, { title: 'आपके शहर की पूजाएं मिलेंगी', desc: 'दूर-दराज़ की नहीं' }, { title: 'ग्राहक आपको ढूंढ पाएंगे', desc: 'नए ग्राहक, नई आमदनी' }].map((item, idx) => (<motion.div key={idx} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 * (idx + 1) }} className="flex items-start gap-3 xs:gap-4"><div className="flex-shrink-0 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-saffron flex items-center justify-center mt-1"><span className="text-white text-sm xs:text-base sm:text-[20px]">✓</span></div><div><h3 className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">{item.title}</h3><p className="text-sm xs:text-base sm:text-[18px] font-semibold text-text-secondary">{item.desc}</p></div></motion.div>))}</div>
        <div className="mt-6 xs:mt-8 p-3 xs:p-4 bg-success-lt rounded-xl flex items-center gap-2 xs:gap-3"><span className="text-xl xs:text-2xl sm:text-[24px]">🔒</span><p className="text-sm xs:text-base sm:text-[18px] font-bold text-success leading-snug">आपका पूरा पता कभी नहीं दिखेगा किसी को भी</p></div>
      </section>

      {/* Footer */}
      <footer className="p-4 xs:p-6 space-y-3 xs:space-y-4 mb-4 xs:mb-6">
        {error && (<div role="alert" aria-live="polite" className="w-full bg-error-red-bg border-2 border-error-red rounded-xl p-3 xs:p-4 flex items-center gap-2 xs:gap-3"><span className="text-xl xs:text-2xl sm:text-[24px]">⚠️</span><p className="text-sm xs:text-base sm:text-[18px] font-bold text-error-red">{error}</p></div>)}
        <button onClick={handleAllowClick} disabled={loading} className="w-full bg-saffron text-white py-3 xs:py-4 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] rounded-2xl text-lg xs:text-xl sm:text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">{loading ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 xs:h-6 xs:w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>लोकेशन जांची जा रही है...</span>) : ('✅ हाँ, मेरा शहर जानें')}</button>
        <button onClick={handleSkip} className="w-full text-saffron text-base xs:text-lg sm:text-[20px] font-bold text-center block active:opacity-75 py-3 xs:py-4 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] focus:ring-2 focus:ring-primary focus:outline-none rounded-2xl">छोड़ें — हाथ से भरूँगा</button>
      </footer>
    </main>
  )
}
