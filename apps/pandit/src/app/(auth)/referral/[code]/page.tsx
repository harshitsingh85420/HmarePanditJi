'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { speakWithSarvam } from '@/lib/sarvam-tts'

export default function ReferralLandingPage() {
  const router = useRouter()
  const params = useParams()
  const { setReferralCode, setCurrentStep } = useRegistrationStore()
  const { navigate, setSection } = useNavigationStore()
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [referrerName, setReferrerName] = useState('')

  const referralCode = params.code as string

  useEffect(() => {
    navigate(`/referral/${referralCode}`, 'identity')
    setSection('identity')
  }, [navigate, referralCode])

  useEffect(() => {
    // Validate referral code (in real app, this would be an API call)
    const validateCode = async () => {
      // Simulated validation - in production, fetch from API
      const validCodes = ['PANDIT2024', 'SHARMA123', 'KASHI42', 'VARANASI']
      const isValidCode = validCodes.some(code => 
        code.toLowerCase() === referralCode.toLowerCase() ||
        referralCode.length >= 6
      )
      
      setIsValid(isValidCode)
      
      if (isValidCode) {
        setReferralCode(referralCode.toUpperCase())
        // Simulated referrer name
        setReferrerName('पंडित जी')
      }
    }

    validateCode()
  }, [referralCode, setReferralCode])

  useEffect(() => {
    if (isValid !== null) {
      const timer = setTimeout(() => {
        if (isValid) {
          void speakWithSarvam({
            text: `बहुत अच्छा! ${referrerName} ने आपको आमंत्रित किया है। अब पंजीकरण शुरू करें।`,
            languageCode: 'hi-IN',
          })
        } else {
          void speakWithSarvam({
            text: 'यह रेफरल कोड मान्य नहीं है। कृपया जांचें और फिर से कोशिश करें।',
            languageCode: 'hi-IN',
          })
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isValid, referrerName])

  const handleContinue = () => {
    setCurrentStep('language')
    router.push('/identity')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (isValid === null) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center bg-surface-base">
        <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-text-secondary">Validating referral code...</p>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 bg-surface-base">
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-saffron-light rounded-full flex items-center justify-center mb-8 mx-auto"
        >
          <span className="text-6xl">🎁</span>
        </motion.div>

        {isValid ? (
          <>
            {/* Title */}
            <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
              आपको आमंत्रित किया गया है!
            </h1>
            <p className="text-text-secondary text-center mb-8">
              {referrerName} ने आपको HmarePanditJi में शामिल होने के लिए आमंत्रित किया है
            </p>

            {/* Referral Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-br from-saffron to-saffron-dark rounded-card p-6 mb-8 text-white shadow-card-saffron"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-3xl">card_giftcard</span>
                <div>
                  <p className="text-white/80 text-sm">Referral Code</p>
                  <p className="text-2xl font-bold">{referralCode.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <p className="text-white/90 text-sm mb-2">आपको मिलेगा:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check</span>
                    <span>प्राथमिकता समर्थन</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check</span>
                    <span>विशेष ऑफ़र</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check</span>
                    <span>त्वरित सत्यापन</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Benefits Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-card rounded-card shadow-card p-6 mb-8"
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">
                HmarePanditJi के साथ जुड़ने के फायदे:
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                    payments
                  </span>
                  <div>
                    <p className="text-text-primary font-medium">तुरंत भुगतान</p>
                    <p className="text-text-secondary text-sm">पूजा के बाद सीधे बैंक में</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                    verified
                  </span>
                  <div>
                    <p className="text-text-primary font-medium">सत्यापित प्रोफ़ाइल</p>
                    <p className="text-text-secondary text-sm">विश्वासनीय और सुरक्षित</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                    trending_up
                  </span>
                  <div>
                    <p className="text-text-primary font-medium">बढ़ी हुई कमाई</p>
                    <p className="text-text-secondary text-sm">ऑनलाइन और ऑफलाइन दोनों</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97]"
              >
                पंजीकरण शुरू करें →
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Invalid Code */}
            <h1 className="text-2xl font-bold text-error-red text-center mb-2">
              अमान्य रेफरल कोड
            </h1>
            <p className="text-text-secondary text-center mb-8">
              यह कोड मान्य नहीं है या समाप्त हो गया है
            </p>

            {/* Error Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-error-red-bg border-2 border-error-red rounded-card p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-error-red text-3xl">
                  error
                </span>
                <div>
                  <p className="text-error-red font-bold">कोड काम नहीं कर रहा</p>
                  <p className="text-text-secondary text-sm">
                    कोड: <span className="font-mono">{referralCode}</span>
                  </p>
                </div>
              </div>
              
              <p className="text-text-secondary text-sm">
                कृपया अपने रेफरल कोड की जांच करें या अपने मित्र से सही कोड प्राप्त करें।
              </p>
            </motion.div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97]"
              >
                होमपेज पर जाएं
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
