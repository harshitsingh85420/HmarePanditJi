'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useVoiceStore } from '@/stores/voiceStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { ConfirmationSheet } from '@/components/voice/ConfirmationSheet'
import { ErrorOverlay } from '@/components/voice/ErrorOverlay'

const NUMBER_WORDS: Record<string, string> = {
  'ek': '1', 'do': '2', 'teen': '3', 'char': '4', 'chaar': '4',
  'paanch': '5', 'chhah': '6', 'chhe': '6', 'saat': '7',
  'aath': '8', 'nau': '9', 'shoonya': '0', 'zero': '0',
}

function normalizeOTP(transcript: string): string {
  const text = transcript.toLowerCase().replace(/\s+/g, ' ').trim()
  const words = text.split(' ')
  const digits = words.map(w => NUMBER_WORDS[w] ?? w).join('')
  return digits.replace(/\D/g, '').slice(0, 6)
}

export default function OTPScreen() {
  const router = useRouter()
  const { data, setOtp, markStepComplete, setCurrentStep } = useRegistrationStore()
  const { navigate, setSection } = useNavigationStore()
  const { resetErrors, switchToKeyboard } = useVoiceStore()

  const [otp, setOtpLocal] = useState<string[]>(() => {
    if (data.otp && data.otp.length === 6) {
      return data.otp.split('')
    }
    return ['', '', '', '', '', '']
  })
  const [error, setError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [resendTimer, setResendTimer] = useState(30)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const formattedMobile = `${data.mobile.slice(0, 5)} ${data.mobile.slice(5)}`

  useEffect(() => {
    navigate('/otp', 'part1-registration')
    setSection('part1-registration')

    // Auto-read OTP using WebOTP API (Android only)
    if ('credentials' in navigator && 'PublicKeyCredential' in window) {
      // @ts-ignore - WebOTP API
      if (navigator.credentials.get) {
        // @ts-ignore
        navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: AbortSignal.timeout(30000),
        }).then((credential: any) => {
          const code = credential.code
          if (code && code.length === 6) {
            const otpArray = code.split('')
            setOtpLocal(otpArray)
            handleOTPSubmit(code)
          }
        }).catch(() => {
          // Silently fail - user can enter manually
        })
      }
    }

    // Voice prompt
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: `हमने ${formattedMobile.split('').join('... ')} पर OTP भेजा है। 6 अंकों का OTP बोलें — या नीचे टाइप करें।`,
        languageCode: 'hi-IN',
        speaker: 'meera',
        pace: 0.82,
      })
    }, 600)

    return () => clearTimeout(timer)
  }, [navigate, setSection, data.mobile])

  // Resend timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleBack = () => {
    router.push('/mobile')
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1)

    const newOtp = [...otp]
    newOtp[index] = value
    setOtpLocal(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(d => d !== '')) {
      const otpString = newOtp.join('')
      setShowConfirm(true)
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOTPSubmit = async (otpValue: string) => {
    if (otpValue.length === 6) {
      setIsSubmitting(true)
      setNetworkError(null)
      try {
        // Simulate API call to verify OTP - add error handling
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate 5% network failure rate for testing
            if (Math.random() < 0.05) {
              reject(new Error('Network error'))
            } else {
              resolve(true)
            }
          }, 1000)
        })

        setOtp(otpValue)
        markStepComplete('otp')
        setCurrentStep('otp')
        void speakWithSarvam({
          text: 'बहुत अच्छा। OTP सही है। अब प्रोफाइल बना रहे हैं।',
          languageCode: 'hi-IN',
        })
        setTimeout(() => {
          router.push('/profile')
        }, 1500)
      } catch (error) {
        setNetworkError('नेटवर्क धीमा है। कृपया पुनः प्रयास करें।')
        void speakWithSarvam({
          text: 'नेटवर्क धीमा है। कृपया पुनः प्रयास करें।',
          languageCode: 'hi-IN',
        })
        setAttemptsLeft(prev => prev - 1)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setError('OTP 6 अंकों का होना चाहिए')
      setAttemptsLeft(prev => prev - 1)
      setErrorCount(prev => prev + 1)
    }
  }

  const handleConfirm = useCallback(() => {
    const otpValue = otp.join('')
    handleOTPSubmit(otpValue)
  }, [otp, setOtp, markStepComplete, setCurrentStep, router])

  const handleRetry = useCallback(() => {
    setShowConfirm(false)
    setOtpLocal(['', '', '', '', '', ''])
    setErrorCount(0)
    resetErrors()
    inputRefs.current[0]?.focus()
  }, [resetErrors])

  const handleUseKeyboard = useCallback(() => {
    switchToKeyboard()
    inputRefs.current[0]?.focus()
  }, [switchToKeyboard])

  const handleResend = () => {
    setResendTimer(30)
    setAttemptsLeft(3)
    setError('')
    void speakWithSarvam({
      text: 'नया OTP भेजा गया है।',
      languageCode: 'hi-IN',
    })
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      {/* Top Bar - Fixed at top */}
      <header className="flex items-center gap-2 px-6 pt-4 pb-2 bg-surface-base sticky top-0 z-20">
        <button
          onClick={handleBack}
          className="w-12 h-12 flex items-center justify-center text-vedic-gold rounded-full active:bg-black/5"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl text-saffron">ॐ</span>
          <span className="text-lg font-bold text-text-primary">HmarePanditJi</span>
        </div>
      </header>

      {/* Progress - Fixed below header */}
      <div className="px-6 pb-4 bg-surface-base">
        <div className="flex items-center justify-center gap-2 mb-2">
          {['mobile', 'otp', 'profile'].map((step, i) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${step === 'otp' ? 'w-6 bg-saffron' : 'w-2 bg-border-default'
                }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-text-secondary">
          Step 2 of 3
        </p>
      </div>

      {/* Scrollable Content */}
      <div className={`flex-1 overflow-y-auto px-6 ${errorCount > 0 ? 'pb-[420px]' : 'pb-[180px]'}`}>
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-saffron-light rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <span className="text-4xl">🔐</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          OTP Verification
        </h1>
        <p className="text-text-secondary text-center mb-2">
          {formattedMobile} पर भेजा गया
        </p>
        <p className="text-saffron text-center text-sm font-medium mb-8">
          {attemptsLeft} प्रयास बाकी
        </p>

        {/* OTP Input */}
        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleOTPKeyDown(index, e)}
              maxLength={1}
              className="w-12 h-16 text-2xl text-center border-2 border-border-default rounded-btn focus:border-saffron focus:outline-none bg-surface-card"
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-error-red text-sm text-center mb-4">{error}</p>
        )}

        {/* Resend */}
        <div className="text-center mb-6">
          {resendTimer > 0 ? (
            <p className="text-text-secondary text-sm">
              OTP फिर से भेजेंगे: <span className="font-bold text-saffron">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-saffron text-sm font-bold underline-offset-2"
            >
              OTP फिर से भेजें
            </button>
          )}
        </div>
      </div>

      {/* Fixed Bottom CTA - One-handed reachable */}
      <footer className="sticky bottom-0 z-30 px-6 py-4 bg-surface-base border-t border-border-default">
        <button
          onClick={async () => {
            const otpValue = otp.join('')
            if (otpValue.length === 6) {
              await handleOTPSubmit(otpValue)
            }
          }}
          disabled={otp.every(d => d === '') || isSubmitting}
          className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>सत्यापित हो रहा है...</span>
            </>
          ) : (
            <span>Verify OTP →</span>
          )}
        </button>
        <p className="pt-3 text-center text-sm text-text-placeholder">
          🎤 "एक दो तीन..." बोलें या टाइप करें
        </p>
      </footer>

      {/* Overlays */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmationSheet
            transcribedText={otp.join(' ')}
            confidence={0.9}
            isVisible={showConfirm}
            onConfirm={handleConfirm}
            onRetry={handleRetry}
            onEdit={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorCount > 0 && (
          <ErrorOverlay
            onRetry={handleRetry}
            onUseKeyboard={handleUseKeyboard}
          />
        )}
      </AnimatePresence>

      {/* Network Error Overlay */}
      <AnimatePresence>
        {networkError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-[100px] left-0 right-0 z-40 px-4 pointer-events-none"
          >
            <div className="max-w-md mx-auto w-full pointer-events-auto mb-4">
              <div className="bg-error-red-bg border-2 border-error-red rounded-card p-4 shadow-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-error-red">
                      network_check
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-primary">नेटवर्क त्रुटि</h3>
                    <p className="text-text-secondary text-sm">{networkError}</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setNetworkError(null)
                    const otpValue = otp.join('')
                    if (otpValue.length === 6) {
                      await handleOTPSubmit(otpValue)
                    }
                  }}
                  className="w-full h-14 bg-saffron text-white font-bold rounded-btn flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  <span>पुनः प्रयास करें</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
