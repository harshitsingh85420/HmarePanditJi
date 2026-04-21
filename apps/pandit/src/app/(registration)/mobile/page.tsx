'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { useSafeRegistrationStore, useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export default function MobileNumberScreen() {
  const router = useRouter()

  const { setMobile: saveMobile, setCurrentStep, markStepComplete } = useSafeRegistrationStore()
  const { setSection } = useSafeNavigationStore()

  const [mobile, setMobileLocal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSection('part1-registration')
    setCurrentStep('mobile')
  }, [setSection, setCurrentStep])

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobileLocal(value)
    setError('')
  }

  const handleSubmit = useCallback(async () => {
    if (mobile.length !== 10) {
      setError('कृपया सही 10-digit मोबाइल नंबर डालें (Please enter a valid 10-digit number)')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // DEVELOPMENT MODE: Skip API check, just go to OTP with mock data
      const isDevelopment = process.env.NODE_ENV === 'development'

      if (isDevelopment) {
        console.log('[DEV MODE] Skipping API check, navigating to OTP')
        saveMobile(mobile)
        markStepComplete('mobile')
        // Always use register mode in dev, OTP will be mocked as "123456"
        router.push(`/otp?mode=register&phone=${mobile}`)
        return
      }

      // PRODUCTION MODE: Check if user exists
      const checkResponse = await fetch(`${API_BASE}/auth/check?phone=${mobile}`)
      const checkData = await checkResponse.json()
      const exists = checkData.exists || false

      saveMobile(mobile)
      markStepComplete('mobile')

      if (exists) {
        router.push(`/otp?mode=login&phone=${mobile}`)
      } else {
        router.push(`/otp?mode=register&phone=${mobile}`)
      }
    } catch (err) {
      console.error('Failed to check user:', err)
      // Fallback to registration on API error
      saveMobile(mobile)
      markStepComplete('mobile')
      router.push(`/otp?mode=register&phone=${mobile}`)
    } finally {
      setIsLoading(false)
    }
  }, [mobile, saveMobile, markStepComplete, router])

  const handleBack = () => {
    router.push('/onboarding?phase=TUTORIAL_CTA')
  }

  const handleLanguageChange = useCallback(() => {
    setShowLanguageSheet(true)
  }, [])

  const handleLanguageSelect = useCallback((lang: string) => {
    setShowLanguageSheet(false)
    // Language changes immediately
  }, [])

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFFBF5] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 splash-gradient-animated rounded-b-[40%] opacity-90 -z-10" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute top-40 -left-20 w-48 h-48 bg-white/30 rounded-full blur-2xl" />

      {/* Top Bar - Fixed with visible logo and working language button */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 pt-4 pb-3 bg-saffron/95 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-12 h-12 flex items-center justify-center text-white bg-white/20 rounded-full active:bg-white/30 transition-all"
            aria-label="Go back to tutorial"
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

      {/* Hero Icon */}
      <div className="flex-1 overflow-y-auto px-6 pb-48 pt-10 z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-28 h-28 mb-8"
        >
          <div className="absolute inset-0 bg-white/40 rounded-full blur-xl animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-white to-orange-50 rounded-full shadow-xl flex items-center justify-center border-4 border-white">
            <Smartphone className="w-14 h-14 text-orange-500" />
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1 text-yellow-400"
            >
              <Sparkles className="w-8 h-8" fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center w-full"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            स्वागत है (Welcome)
          </h1>
          <p className="text-gray-600 text-lg mb-10 font-medium">
            अपना मोबाइल नंबर दर्ज करें
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className={`relative bg-white rounded-3xl p-2 shadow-xl transition-all duration-300 ${isFocused ? 'shadow-orange-200 ring-4 ring-orange-100 scale-[1.02]' : 'shadow-black/5'}`}>
            <div className="flex items-center gap-3 px-4 h-16">
              <div className="flex items-center gap-2 pr-4 border-r-2 border-gray-100">
                <span className="text-2xl">🇮🇳</span>
                <span className="text-xl font-bold text-gray-800">+91</span>
              </div>
              <input
                ref={inputRef}
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={handleMobileChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="98765 43210"
                className="flex-1 w-full text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-300 tracking-wider"
                autoFocus
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-red-500 font-semibold"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Guidance Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-10 bg-orange-50/80 backdrop-blur-sm border border-orange-100 rounded-2xl p-5 w-full max-w-sm"
        >
          <p className="text-gray-700 text-center font-medium leading-relaxed">
            नए उपयोगकर्ता <strong className="text-orange-600 font-bold">Register</strong> होंगे और<br />
            मौजूदा उपयोगकर्ता <strong className="text-orange-600 font-bold">Login</strong> होंगे।
          </p>
        </motion.div>
      </div>

      {/* Footer & Action Button */}
      <motion.footer
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
        className="fixed bottom-0 left-0 w-full z-30 px-6 py-6 pb-safe bg-white/80 backdrop-blur-xl border-t border-gray-100"
      >
        <div className="max-w-sm mx-auto">
          <button
            onClick={handleSubmit}
            disabled={mobile.length !== 10 || isLoading}
            className={`
              w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all duration-300
              ${mobile.length === 10 && !isLoading
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 active:scale-95 hover:shadow-xl hover:shadow-orange-500/40'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>कृपया प्रतीक्षा करें...</span>
              </>
            ) : (
              <>
                <span>आगे बढ़ें (Continue)</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>

          {/* Progress Indicator */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <div className="h-2 w-8 rounded-full bg-orange-500"></div>
            <div className="h-2 w-2 rounded-full bg-gray-200"></div>
            <div className="h-2 w-2 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </motion.footer>

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
