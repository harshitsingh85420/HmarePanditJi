'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSafeRegistrationStore, useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

function OTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get mode from URL: 'login' or 'register'
  const mode = searchParams?.get('mode') || 'register'
  const phoneFromURL = searchParams?.get('phone') || ''

  // SSR FIX: Use safe store hooks
  const { setOtp: saveOTP, markStepComplete, setCurrentStep, data } = useSafeRegistrationStore()
  const { setSection } = useSafeNavigationStore()

  const [otp, setOTP] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Use phone from URL or store
  const mobile = phoneFromURL || data.mobile || ''

  useEffect(() => {
    setSection('part1-registration')
    setCurrentStep('otp')
  }, [setSection, setCurrentStep, mode])

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return

    const newOTP = [...otp]
    newOTP[index] = value
    setOTP(newOTP)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle key press for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Submit OTP
  const handleSubmitOTP = useCallback(async () => {
    const otpString = otp.join('')

    if (otpString.length !== 6) {
      setError('कृपया सही 6-digit OTP डालें')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // DEVELOPMENT MODE: Accept "123456" as valid OTP
      const isDevelopment = process.env.NODE_ENV === 'development'

      if (isDevelopment) {
        console.log('[DEV MODE] Checking mock OTP:', otpString)

        if (otpString === '123456') {
          // Valid mock OTP
          markStepComplete('otp')
          saveOTP(otpString)

          if (mode === 'login') {
            router.push('/dashboard')
          } else {
            markStepComplete('profile')
            router.push('/complete')
          }
          return
        } else {
          setError('OTP गलत है। Development mode में "123456" डालें')
          setOTP(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
          setIsLoading(false)
          return
        }
      }

      // PRODUCTION MODE: Call real API
      const endpoint = mode === 'login' ? '/auth/login-otp' : '/auth/register-otp'

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, otp: otpString }),
      })

      const data = await response.json()

      if (data.success) {
        // Success!
        markStepComplete('otp')
        saveOTP(otpString)

        if (mode === 'login') {
          // LOGIN SUCCESS → Go to dashboard
          router.push('/dashboard')
        } else {
          // REGISTRATION SUCCESS → Go to profile completion
          markStepComplete('profile')
          router.push('/complete')
        }
      } else {
        setError('OTP गलत है। कृपया फिर से कोशिश करें')
        setOTP(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      console.error('OTP verification failed:', err)
      setError('Verification में समस्या आयी। कृपया फिर से कोशिश करें')
    } finally {
      setIsLoading(false)
    }
  }, [otp, mode, mobile, markStepComplete, saveOTP, router])

  // Resend OTP
  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0) return

    setIsLoading(true)
    setError('')
    setResendTimer(30)

    try {
      const endpoint = mode === 'login' ? '/auth/login-otp' : '/auth/register-otp'

      await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile }),
      })

      // Start countdown
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      console.error('Failed to resend OTP:', err)
    } finally {
      setIsLoading(false)
    }
  }, [mode, mobile, resendTimer])

  // Go back to mobile number screen
  const handleBack = () => {
    router.push('/mobile')
  }

  const handleLanguageChange = useCallback(() => {
    setShowLanguageSheet(true)
  }, [])

  const handleLanguageSelect = useCallback((lang: string) => {
    setShowLanguageSheet(false)
  }, [])

  const formattedMobile = mobile ? `${mobile.slice(0, 5)} ${mobile.slice(5)}` : mobile

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFFBF5] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-saffron/10 to-transparent rounded-b-[40%] opacity-60 -z-10" />

      {/* Top Bar - Saffron header matching mobile page */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 pt-4 pb-3 bg-saffron/95 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-12 h-12 flex items-center justify-center text-white bg-white/20 rounded-full active:bg-white/30 transition-all"
            aria-label="Go back"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>ॐ</span>
            <span className="text-lg font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>HmarePanditJi</span>
          </div>
        </div>
        <button
          onClick={handleLanguageChange}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white active:bg-white/30 transition-all flex items-center justify-center"
          aria-label="Change language"
        >
          <span className="text-2xl">🌐</span>
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 pb-4 bg-surface-base">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-saffron"></div>
          <div className="h-2 w-6 rounded-full bg-saffron"></div>
          <div className="h-2 w-2 rounded-full bg-border-default"></div>
        </div>
        <p className="text-center text-lg text-text-secondary">Step 2 / 3</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-48">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-saffron-light rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <span className="text-3xl">🔐</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          {mode === 'login' ? 'Login OTP' : 'Registration OTP'}
        </h1>
        <p className="text-text-secondary text-center mb-8">
          {formattedMobile} पर भेजा गया OTP डालें
        </p>

        {/* OTP Input */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-2xl text-center border-2 border-border-default rounded-lg focus:border-saffron focus:outline-none bg-surface-card"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <p className="mt-3 text-center text-error text-base font-medium">{error}</p>
        )}

        {/* Development Mode Hint */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 bg-saffron/10 border-2 border-saffron/30 rounded-xl p-4 text-center">
            <p className="text-saffron font-bold text-lg">🔧 Development Mode</p>
            <p className="text-text-secondary text-sm mt-1">Use OTP: <span className="font-mono font-bold text-2xl text-saffron">123456</span></p>
          </div>
        )}

        {/* Resend OTP */}
        <div className="text-center mt-8">
          <button
            onClick={handleResendOTP}
            disabled={resendTimer > 0 || isLoading}
            className="text-saffron font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? `${resendTimer} सेकंड में resend करें` : 'OTP Resend करें'}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <p className="text-saffron font-semibold text-lg animate-pulse">
              Verifying...
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-30 px-6 py-4 bg-surface-base border-t border-border-default">
        <button
          onClick={handleSubmitOTP}
          disabled={otp.join('').length !== 6 || isLoading}
          className="w-full h-16 bg-gradient-to-b from-saffron to-saffron-light text-white font-bold text-xl rounded-xl shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Verify OTP →</span>
          {isLoading && (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </button>
        <p className="pt-3 text-center text-base text-text-placeholder">
          📱 {formattedMobile} पर OTP भेजा गया है
        </p>
      </footer>

      {/* Language Bottom Sheet */}
      <LanguageBottomSheet
        isOpen={showLanguageSheet}
        currentLanguage="Hindi"
        onSelect={handleLanguageSelect}
        onClose={() => setShowLanguageSheet(false)}
      />
    </div>
  )
}

export default function OTPScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-surface-base">
        <p className="text-2xl text-saffron animate-pulse">🔐</p>
      </div>
    }>
      <OTPContent />
    </Suspense>
  )
}
