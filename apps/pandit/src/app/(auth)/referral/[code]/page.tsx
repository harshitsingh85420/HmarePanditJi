'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSafeRegistrationStore, useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import { speakWithSarvam } from '@/lib/sarvam-tts'

interface ReferralValidationResponse {
  valid: boolean
  referrerName?: string
  benefit?: string
  referrerBenefit?: string
  error?: string
}

export default function ReferralLandingPage() {
  const router = useRouter()
  const params = useParams()

  // SSR FIX: Use safe store hooks that don't throw during SSR
  const { setReferralCode, setCurrentStep } = useSafeRegistrationStore()
  const { navigate, setSection } = useSafeNavigationStore()
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [referrerName, setReferrerName] = useState('')
  const [benefit, setBenefit] = useState('')

  // Manual entry state
  const [manualCode, setManualCode] = useState('')
  const [validatingManual, setValidatingManual] = useState(false)
  const [manualError, setManualError] = useState('')

  const referralCode = (params?.code as string) ?? ''

  useEffect(() => {
    navigate(`/referral/${referralCode}`, 'identity')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setSection('identity')
  }, [navigate, referralCode])

  useEffect(() => {
    // Validate referral code from URL
    const validateCode = async () => {
      if (!referralCode || referralCode.length < 6) {
        setIsValid(false)
        return
      }

      try {
        const response = await fetch('/api/referral/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: referralCode }),
        })

        const data: ReferralValidationResponse = await response.json()

        if (data.valid) {
          setIsValid(true)
          setReferrerName(data.referrerName || 'Pandit Ji')
          setBenefit(data.benefit || '')
          setReferralCode(referralCode.toUpperCase())
        } else {
          setIsValid(false)
        }
      } catch (error) {
        console.error('[Referral] Validation error:', error)
        setIsValid(false)
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

  // F-DEV2-05: Manual referral code validation
  const handleManualValidate = async (e: FormEvent) => {
    e.preventDefault()
    setManualError('')

    // Validate format: 6-10 alphanumeric
    const codeFormat = /^[A-Za-z0-9]{6,10}$/
    if (!codeFormat.test(manualCode)) {
      setManualError('कोड 6-10 अक्षरों का होना चाहिए')
      return
    }

    setValidatingManual(true)

    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: manualCode }),
      })

      const data: ReferralValidationResponse = await response.json()

      if (data.valid) {
        setReferralCode(manualCode.toUpperCase())
        setReferrerName(data.referrerName || 'Pandit Ji')
        setBenefit(data.benefit || '')
        setIsValid(true)
        setManualCode('')

        void speakWithSarvam({
          text: `बहुत अच्छा! ${data.referrerName} ने आपको आमंत्रित किया है।`,
          languageCode: 'hi-IN',
        })
      } else {
        setManualError(data.error || 'Invalid code')
        void speakWithSarvam({
          text: 'यह कोड मान्य नहीं है। कृपया जांचें और फिर से कोशिश करें।',
          languageCode: 'hi-IN',
        })
      }
    } catch (error) {
      console.error('[Referral] Manual validation error:', error)
      setManualError('Validation failed. Please try again.')
    } finally {
      setValidatingManual(false)
    }
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
                  <p className="text-white/80 text-base">रेफरल कोड</p>
                  <p className="text-2xl font-bold">{referralCode.toUpperCase()}</p>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4">
                <p className="text-white/90 text-base font-bold mb-3">
                  आपको मिलेगा:
                </p>
                <ul className="space-y-2 text-base mb-4">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">payments</span>
                    <span>₹100 का welcome bonus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">discount</span>
                    <span>First booking पर 10% discount</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">emoji_events</span>
                    <span>Referrer को ₹50 मिलेंगे</span>
                  </li>
                </ul>

                {benefit && (
                  <p className="text-white/70 text-sm italic">
                    {benefit}
                  </p>
                )}
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
                    <p className="text-text-secondary text-base">पूजा के बाद सीधे बैंक में</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                    verified
                  </span>
                  <div>
                    <p className="text-text-primary font-medium">सत्यापित प्रोफ़ाइल</p>
                    <p className="text-text-secondary text-base">विश्वासनीय और सुरक्षित</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                    trending_up
                  </span>
                  <div>
                    <p className="text-text-primary font-medium">बढ़ी हुई कमाई</p>
                    <p className="text-text-secondary text-base">ऑनलाइन और ऑफलाइन दोनों</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white font-bold text-lg rounded-2xl shadow-btn-saffron active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none"
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
                  <p className="text-text-secondary text-base">
                    कोड: <span className="font-mono">{referralCode}</span>
                  </p>
                </div>
              </div>

              <p className="text-text-secondary text-base mb-4">
                कृपया अपने रेफरल कोड की जांच करें या अपने मित्र से सही कोड प्राप्त करें।
              </p>
            </motion.div>

            {/* Manual Entry Form */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-card rounded-card shadow-card p-6 mb-8"
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">
                या मैन्युअल कोड दर्ज करें
              </h2>
              <form onSubmit={handleManualValidate} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="REFERRAL CODE"
                    maxLength={10}
                    className="w-full min-h-[52px] xs:min-h-[56px] px-4 text-lg border-2 border-border-default rounded-2xl focus:border-saffron focus:outline-none bg-surface-card uppercase tracking-wider"
                    aria-label="Enter referral code manually"
                  />
                  {manualError && (<p className="mt-2 text-base xs:text-lg text-error-red">{manualError}</p>)}
                  {validatingManual && (<div className="flex items-center gap-2 mt-2"><div className="w-4 h-4 border-2 border-saffron border-t-transparent rounded-full animate-spin" /><p className="text-text-secondary text-base">जांच हो रही है...</p></div>)}
                </div>
                <button
                  type="submit"
                  disabled={validatingManual || manualCode.length < 6}
                  className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white font-bold text-lg rounded-2xl shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validatingManual ? 'जांच हो रही है...' : 'कोड लगाएं'}
                </button>
              </form>
            </motion.div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] border-2 border-saffron text-saffron font-bold text-lg rounded-2xl active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none"
              >
                बिना referral के जारी रखें
              </button>
              <button
                onClick={handleGoHome}
                className="w-full min-h-[52px] xs:min-h-[56px] text-text-secondary font-medium underline-offset-4 active:opacity-70 focus:ring-2 focus:ring-primary focus:outline-none"
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
