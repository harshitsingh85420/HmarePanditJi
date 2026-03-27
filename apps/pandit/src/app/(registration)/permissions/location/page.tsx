'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'

export default function LocationPermissionPage() {
  const router = useRouter()
  const { setPhase } = useOnboardingStore()

  useEffect(() => {
    setPhase('LOCATION_PERMISSION')
    void speakWithSarvam({ text: 'कृपया location की अनुमति दें।', languageCode: 'hi-IN' })
  }, [setPhase])

  const handleAllow = () => {
    if (!navigator.geolocation) { handleSkip(); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
          .then(r => r.json())
          .then(d => {
            const city = d.address.city || d.address.town || d.address.village || 'Unknown'
            void speakWithSarvam({ text: `शहर मिल गया: ${city}`, languageCode: 'hi-IN' })
            setTimeout(() => router.push('/permissions/notifications'), 1500)
          })
          .catch(() => handleSkip())
      },
      () => handleSkip(),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSkip = () => {
    void speakWithSarvam({ text: 'कोई बात नहीं। वाराणसी सेट कर रहा हूँ।', languageCode: 'hi-IN' })
    setTimeout(() => router.push('/permissions/notifications'), 1500)
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col items-center justify-center px-4 xs:px-6 py-8 xs:py-12">
      <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 bg-saffron-lt rounded-full flex items-center justify-center mb-6 xs:mb-8"><span className="text-5xl xs:text-6xl sm:text-7xl">📍</span></div>
      <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-text-primary text-center mb-2 xs:mb-4">लोकेशन अनुमति</h1>
      <p className="text-base xs:text-lg sm:text-xl text-text-secondary text-center mb-6 xs:mb-8">आपके शहर की पूजाएं दिखाने के लिए</p>
      <div className="w-full bg-success-lt rounded-xl p-3 xs:p-4 mb-6 xs:mb-8 flex items-start gap-3"><span className="text-2xl xs:text-3xl">🔒</span><p className="text-sm xs:text-base font-bold text-success">आपका location किसी को नहीं दिखेगा</p></div>
      <div className="space-y-3 xs:space-y-4 w-full"><button onClick={handleAllow} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white font-bold text-lg rounded-2xl shadow-btn-saffron active:scale-[0.97]">हाँ, अनुमति दें</button><button onClick={handleSkip} className="w-full min-h-[52px] xs:min-h-[56px] text-text-secondary font-medium underline-offset-4">बाद में चुनूँगा</button></div>
    </main>
  )
}
