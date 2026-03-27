'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'

export default function NotificationsPermissionPage() {
  const router = useRouter()
  const { setPhase } = useOnboardingStore()

  useEffect(() => {
    setPhase('REGISTRATION')
    void speakWithSarvam({ text: 'क्या आप notification की अनुमति देंगे? नई पूजा की जानकारी मिलेगी।', languageCode: 'hi-IN' })
  }, [setPhase])

  const handleEnable = async () => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      void speakWithSarvam({ text: 'बहुत अच्छा! Notifications चालू हो गए।', languageCode: 'hi-IN' })
    } catch { /* ignore */ }
    setTimeout(() => router.push('/complete'), 1500)
  }

  const handleSkip = () => {
    void speakWithSarvam({ text: 'कोई बात नहीं। आप बाद में सेटिंग्स से चालू कर सकते हैं।', languageCode: 'hi-IN' })
    setTimeout(() => router.push('/complete'), 1500)
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col items-center justify-center px-4 xs:px-6 py-8 xs:py-12">
      <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 bg-saffron-lt rounded-full flex items-center justify-center mb-6 xs:mb-8"><span className="text-5xl xs:text-6xl sm:text-7xl">🔔</span></div>
      <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-text-primary text-center mb-2 xs:mb-4">सूचनाएं</h1>
      <p className="text-base xs:text-lg sm:text-xl text-text-secondary text-center mb-6 xs:mb-8">नई पूजा की जानकारी तुरंत पाएं</p>
      <div className="w-full bg-success-lt rounded-xl p-3 xs:p-4 mb-6 xs:mb-8 flex items-start gap-3"><span className="text-2xl xs:text-3xl">✓</span><p className="text-sm xs:text-base font-bold text-success">कभी भी बंद कर सकते हैं</p></div>
      <div className="space-y-3 xs:space-y-4 w-full"><button onClick={handleEnable} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white font-bold text-lg rounded-2xl shadow-btn-saffron active:scale-[0.97]">चालू करें</button><button onClick={handleSkip} className="w-full min-h-[52px] xs:min-h-[56px] text-text-secondary font-medium underline-offset-4">छोड़ें</button></div>
    </main>
  )
}
