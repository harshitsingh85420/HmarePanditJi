'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { TopBar } from '@/components/ui/TopBar'
import { Button } from '@/components/ui/Button'
import { SahayataBar } from '@/components/ui/SahayataBar'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useUIStore } from '@/stores/uiStore'

const OTP_EXPIRY_SECONDS = 5 * 60  // 5 minutes
const OTP_LENGTH = 6

export default function OTPScreen() {
  const router = useRouter()
  const { data, setOtp, markStepComplete } = useRegistrationStore()
  const { triggerCelebration } = useUIStore()
  
  const [otp, setOtpValue] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [wrongCount, setWrongCount] = useState(0)
  const [showResend, setShowResend] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null))

  useEffect(() => {
    if ('OTPCredential' in window) {
      const ac = new AbortController()
      
      navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: ac.signal,
      } as CredentialRequestOptions).then((otpParams: any) => {
        if (otpParams && 'code' in otpParams) {
          const code = otpParams.code as string
          const digits = code.split('').slice(0, OTP_LENGTH)
          setOtpValue(digits)
          setTimeout(() => verifyOTP(digits.join('')), 500)
        }
      }).catch(() => {})

      return () => ac.abort()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const resendTimer = setTimeout(() => setShowResend(true), 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(resendTimer)
    }
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isExpired = secondsLeft === 0
  const timerColor = secondsLeft < 60 ? 'text-error-red' : secondsLeft < 120 ? 'text-warning-amber' : 'text-text-secondary'

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtpValue(newOtp)
    setError('')

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(d => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      setTimeout(() => verifyOTP(newOtp.join('')), 300)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pasted.length === OTP_LENGTH) {
      const digits = pasted.split('')
      setOtpValue(digits)
      inputRefs.current[OTP_LENGTH - 1]?.focus()
      setTimeout(() => verifyOTP(pasted), 300)
    }
    e.preventDefault()
  }

  const verifyOTP = async (otpCode: string) => {
    if (otpCode.length !== OTP_LENGTH) return
    if (isExpired) {
      setError('OTP expire ho gaya. Naya OTP mangaiye.')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const isValid = otpCode.length === 6
      
      if (isValid) {
        setOtp(otpCode)
        markStepComplete('otp')
        triggerCelebration('OTP Verification')
        
        setTimeout(() => router.push('/profile'), 1500)
      } else {
        setWrongCount(prev => prev + 1)
        setOtpValue(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
        
        if (wrongCount >= 2) {
          setError('OTP teen baar galat ho gaya. Naya OTP mangaiye ya sahayata lein.')
        } else {
          setError('OTP galat hai. Dobara check karein.')
        }
      }
    } catch (err) {
      setError('Kuch problem aayi. Dobara koshish karein.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setSecondsLeft(OTP_EXPIRY_SECONDS)
    setShowResend(false)
    setWrongCount(0)
    setError('')
    setOtpValue(Array(OTP_LENGTH).fill(''))
    setTimeout(() => setShowResend(true), 30000)
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      <TopBar currentStep={2} totalSteps={6} />

      <main className="flex-1 px-5 pt-4 pb-32 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 bg-trust-green-bg border-l-4 border-trust-green
                     px-4 py-3 rounded-r-card-sm"
        >
          <span className="material-symbols-outlined text-trust-green text-xl filled">check_circle</span>
          <p className="text-trust-green font-devanagari font-medium">
            OTP +91 {data.mobile?.slice(0,5)}XXXXX par bhej diya gaya
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-5 flex items-center gap-2 text-text-secondary text-sm"
        >
          <span className="animate-spin-slow material-symbols-outlined text-sm text-saffron">sync</span>
          <span className="font-label">SMS se apne aap fill ho sakta hai...</span>
        </motion.div>

        <div className="bg-surface-card rounded-card p-6 shadow-card">
          <p className="text-text-disabled text-xs font-label mb-3">Step 2 of 6 — Mobile Verify</p>
          <h1 className="font-devanagari text-title font-bold text-text-primary mb-6">
            OTP boliye ya type karein
          </h1>

          <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                animate={digit ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.2 }}
                className={`relative aspect-square flex-1 max-w-[48px] flex items-center justify-center
                           rounded-card-sm border-2 transition-all duration-200
                           ${digit 
                             ? 'bg-saffron-tint border-saffron-border' 
                             : index === otp.findIndex(d => !d) 
                               ? 'border-saffron bg-surface-card shadow-[0_0_0_3px_rgba(255,140,0,0.12)]'
                               : 'bg-surface-muted border-border-default'
                           }
                           ${error ? 'border-error-red bg-error-red/5' : ''}`}
              >
                <input
                  ref={el => { inputRefs.current[index] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="absolute inset-0 w-full h-full bg-transparent text-center 
                            text-2xl font-bold text-text-primary border-none outline-none"
                  autoFocus={index === 0}
                />
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-5">
            <span className={`material-symbols-outlined text-xl ${timerColor}`}>schedule</span>
            <span className={`font-bold text-xl font-label tracking-wider ${timerColor}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-error-red text-sm font-devanagari text-center mb-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center gap-3">
            {showResend ? (
              <>
                <button
                  onClick={handleResend}
                  className="flex items-center gap-2 text-saffron font-semibold text-base hover:opacity-80"
                >
                  <span className="material-symbols-outlined text-lg">sms</span>
                  Dobara SMS bhejein
                </button>
                <div className="w-10 h-px bg-border-default" />
                <button className="flex items-center gap-2 text-saffron font-semibold text-base">
                  <span className="material-symbols-outlined text-lg">call</span>
                  Call karke OTP bolein
                </button>
              </>
            ) : (
              <p className="text-text-disabled text-xs font-label">
                OTP nahi mila? 30 seconds mein resend option aayega...
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={() => verifyOTP(otp.join(''))}
            disabled={otp.some(d => !d) || isVerifying || isExpired}
            loading={isVerifying}
          >
            {isVerifying ? 'Verify ho raha hai...' : 'Aage Badhein'}
          </Button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <SahayataBar />
      </div>
    </div>
  )
}
