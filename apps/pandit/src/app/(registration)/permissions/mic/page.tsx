'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function MicPermissionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleGrant = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        router.push('/location-permission')
      })
      .catch(() => {
        setError('mic_denied')
      })
  }

  const handleRetry = () => {
    setError(null)
    handleGrant()
  }

  const handleSkip = () => {
    router.push('/location-permission')
  }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col items-center justify-center px-4 xs:px-6 py-8 xs:py-12">
      {/* Icon */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 bg-saffron-lt rounded-full flex items-center justify-center mb-6 xs:mb-8">
        <span className="text-5xl xs:text-6xl sm:text-7xl">🎤</span>
      </motion.div>

      {/* Title */}
      <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-text-primary text-center mb-2 xs:mb-4">
        माइक्रोफ़ोन अनुमति
      </h1>
      <p className="text-base xs:text-lg sm:text-xl text-text-secondary text-center mb-6 xs:mb-8">
        आवाज़ से चलने वाले app के लिए ज़रूरी
      </p>

      {/* Info Card */}
      <div className="w-full bg-saffron-lt rounded-2xl p-4 xs:p-6 mb-6 xs:mb-8">
        <div className="flex items-start gap-3 xs:gap-4">
          <span className="text-3xl xs:text-4xl">💡</span>
          <div>
            <p className="text-base xs:text-lg font-bold text-text-primary">क्यों ज़रूरी है?</p>
            <p className="text-sm xs:text-base text-text-secondary mt-1 xs:mt-2">
              ग्राहक का नाम, शहर, और पूजा की जानकारी आवाज़ से दर्ज करने के लिए
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="w-full bg-success-lt rounded-xl p-3 xs:p-4 mb-6 xs:mb-8 flex items-start gap-3">
        <span className="text-2xl xs:text-3xl">🔒</span>
        <p className="text-sm xs:text-base font-bold text-success">
          आपकी आवाज़ कभी रिकॉर्ड नहीं होती — केवल तब सुनता है जब आप बोलें
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-3 xs:space-y-4 w-full">
        <button
          onClick={handleGrant}
          disabled={error === 'mic_denied'}
          className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white font-bold text-lg rounded-2xl shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none px-6 py-4"
        >
          <span className="material-symbols-outlined text-xl xs:text-2xl">mic</span>
          <span className="text-base xs:text-lg">{error === 'mic_denied' ? 'सेटिंग्स खोलें' : 'हाँ, अनुमति दें'}</span>
        </button>

        {error === 'mic_denied' ? (
          <button
            onClick={handleRetry}
            className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] border-2 border-saffron text-saffron font-bold text-lg rounded-2xl active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none px-6 py-4"
          >
            फिर से कोशिश करें
          </button>
        ) : (
          <button
            onClick={handleSkip}
            className="w-full min-h-[52px] xs:min-h-[56px] text-text-secondary font-medium underline-offset-4 active:opacity-70 focus:ring-2 focus:ring-primary focus:outline-none px-6 py-4"
          >
            बाद में चालू करूँगा
          </button>
        )}
      </div>

      {/* Footer note */}
      <p className="pb-6 xs:pb-8 text-center text-sm xs:text-base text-text-placeholder mt-6 xs:mt-8">
        आप बाद में सेटिंग्स से कभी भी माइक्रोफ़ोन बंद कर सकते हैं
      </p>
    </main>
  )
}
