'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useRegistrationStore } from '@/stores/registrationStore'

export default function NotificationsPermission() {
  const router = useRouter()
  const { setCurrentStep, markStepComplete } = useRegistrationStore()
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'क्या आप notification की अनुमति देंगे? जब नई पूजा होगी, हम आपको बताएंगे। हाँ बोलें या नहीं बोलें।',
        languageCode: 'hi-IN',
        pace: 0.82,
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleGrant = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setGranted(true)
        markStepComplete('notification_permission')
        void speakWithSarvam({
          text: 'बहुत अच्छा! notification चालू है।',
          languageCode: 'hi-IN',
        })
        setTimeout(() => {
          router.push('/onboarding/complete')
        }, 1500)
      }
    } catch {
      // Permission denied
    }
  }

  const handleSkip = () => {
    setCurrentStep('notification_permission')
    router.push('/onboarding/complete')
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 bg-surface-base">
      {/* Top Bar */}
      <header className="flex items-center gap-2 mb-8">
        <span className="text-2xl text-saffron">ॐ</span>
        <span className="text-lg font-bold text-text-primary">HmarePanditJi</span>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-saffron-light rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <span className="text-4xl">🔔</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          Notification चालू करें
        </h1>
        <p className="text-text-secondary text-center mb-8">
          नई पूजा और बुकिंग की जानकारी तुरंत पाएं
        </p>

        {/* Benefits Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface-card rounded-card shadow-card p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-text-primary mb-4">
            आपको क्या मिलेगा:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-trust-green text-xl mt-0.5">
                notifications_active
              </span>
              <div>
                <p className="text-text-primary font-medium">नई पूजा की notification</p>
                <p className="text-text-secondary text-base">जब कोई ग्राहक पूजा बुक करे</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-trust-green text-xl mt-0.5">
                payment
              </span>
              <div>
                <p className="text-text-primary font-medium">भुगतान की जानकारी</p>
                <p className="text-text-secondary text-base">जब पैसा आपके खाते में आए</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-trust-green text-xl mt-0.5">
                event
              </span>
              <div>
                <p className="text-text-primary font-medium">पूजा का समय याद दिलाना</p>
                <p className="text-text-secondary text-base">ताकि आप समय पर पहुँचें</p>
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGrant}
            className="w-full min-h-[56px] bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none"
          >
            हाँ, notification चालू करें
          </button>
          <button
            onClick={handleSkip}
            className="w-full min-h-[56px] text-text-secondary font-medium underline-offset-2 active:opacity-70 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            बाद में चालू करूँगा
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="pb-8 text-center text-base text-text-placeholder">
        आप बाद में सेटिंग्स से कभी भी notification बंद कर सकते हैं
      </p>
    </main>
  )
}
