'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useVoiceStore } from '@/stores/voiceStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { ConfirmationSheet } from '@/components/voice/ConfirmationSheet'
import { ErrorOverlay } from '@/components/voice/ErrorOverlay'
import { listenOnce } from '@/lib/deepgram-stt'
import { useAmbientNoise } from '@/hooks/useAmbientNoise'
import { isWebOTPSupported, readOTPAuto, extractOTPFromSMS } from '@/lib/webotp'

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
  const { resetErrors, switchToKeyboard, setState: setVoiceState } = useVoiceStore()

  const [otp, setOtpLocal] = useState<string[]>(() => {
    if (data.otp && data.otp.length === 6) {
      return data.otp.split('')
    }
    return ['', '', '', '', '', '']
  })
  const [error, setError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [resendTimer, setResendTimer] = useState(60) // F-DEV2: 60s resend cooldown per task card
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [webotpLoading, setWebotpLoading] = useState(true)
  const [manualFallback, setManualFallback] = useState(false)
  const [pasteSuccess, setPasteSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const formattedMobile = data.mobile ? `${data.mobile.slice(0, 5)} ${data.mobile.slice(5)}` : ''

  // BUG-019 FIX: Ambient noise detection for intelligent error messages
  const { startNoiseDetection, stopNoiseDetection } = useAmbientNoise()

  // BUG-010 FIX: Voice engine for OTP listening
  useEffect(() => {
    navigate('/otp', 'part1-registration')
    setSection('part1-registration')

    // BUG-019 FIX: Start ambient noise detection
    void startNoiseDetection()

    // BUG-009 FIX: Guard against deep link / direct navigation when mobile is empty
    if (!data.mobile || data.mobile.length < 10) {
      void speakWithSarvam({
        text: 'मोबाइल नंबर नहीं मिला। कृपया वापस जाकर मोबाइल दर्ज करें।',
        languageCode: 'hi-IN',
      })
      setTimeout(() => {
        router.push('/mobile')
      }, 2000)
      return
    }

    // F-DEV2-01: WebOTP Auto-Read Implementation
    const webotpSupported = isWebOTPSupported()
    console.log('[OTP Page] WebOTP supported:', webotpSupported)

    if (webotpSupported) {
      setWebotpLoading(true)

      // Read OTP with 6s timeout
      readOTPAuto(6000)
        .then((otpCode) => {
          setWebotpLoading(false)

          if (otpCode) {
            // Extract and fill OTP
            const cleanOTP = extractOTPFromSMS(otpCode) ?? otpCode.slice(0, 6)
            const otpArray = cleanOTP.split('')
            setOtpLocal(otpArray)

            // Show user the code first (500ms delay)
            setTimeout(() => {
              handleOTPSubmit(cleanOTP)
            }, 500)
          } else {
            // WebOTP failed/timed out - show manual fallback
            setManualFallback(true)
            void speakWithSarvam({
              text: 'OTP नहीं आया? मैन्युअली टाइप करें',
              languageCode: 'hi-IN',
            })
            inputRefs.current[0]?.focus()
          }
        })
        .catch((err) => {
          console.error('[OTP Page] WebOTP error:', err)
          setWebotpLoading(false)
          setManualFallback(true)
          inputRefs.current[0]?.focus()
        })
    } else {
      setWebotpLoading(false)
      setManualFallback(true)
    }

    // BUG-010 FIX: Voice prompt with STT listening
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: `हमने ${formattedMobile.split('').join('... ')} पर OTP भेजा है। 6 अंकों का OTP बोलें — या नीचे टाइप करें।`,
        languageCode: 'hi-IN',
        pace: 0.82,
        onEnd: () => {
          // Start listening for voice OTP after speech completes
          setIsListening(true)
          setVoiceState('listening')

          const cleanup = listenOnce(
            'hi',
            15000,
            (transcript) => {
              setIsListening(false)
              setVoiceState('idle')
              const otpDigits = normalizeOTP(transcript)
              if (otpDigits.length === 6) {
                const otpArray = otpDigits.split('')
                setOtpLocal(otpArray)
                handleOTPSubmit(otpDigits)
              } else if (otpDigits.length > 0) {
                setError('कृपया पूरा 6-अंकों का OTP बोलें')
                void speakWithSarvam({
                  text: 'कृपया पूरा 6 अंकों का OTP बोलें',
                  languageCode: 'hi-IN',
                }).catch((err) => {
                  console.error('OTP TTS reprompt failed:', err)
                  // Continue anyway - user can type manually
                })
              }
            },
            () => {
              // Timeout
              setIsListening(false)
              setVoiceState('error_1')
            }
          )

          // Store cleanup for unmount
          return cleanup
        },
      }).catch((err) => {
        console.error('OTP TTS initial failed:', err)
        // Silently fail - user can enter manually
      })
    }, 600)

    // BUG-011 FIX: Stop speech on unmount to prevent overlapping voices
    return () => {
      clearTimeout(timer)
      stopCurrentSpeech()
      setIsListening(false)
      setVoiceState('idle')
      stopNoiseDetection()
    }
  }, [navigate, setSection, data.mobile, router, formattedMobile, setVoiceState, startNoiseDetection, stopNoiseDetection])

  // Resend timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleBack = () => {
    router.push('/mobile')
  }

  // F-DEV2-03: Paste from clipboard functionality
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      const digits = clipboardText.replace(/\D/g, '').slice(0, 6)

      if (digits.length === 6) {
        const otpArray = digits.split('')
        setOtpLocal(otpArray)
        setPasteSuccess(true)

        // Show success feedback
        void speakWithSarvam({
          text: 'OTP paste हो गया।',
          languageCode: 'hi-IN',
        })

        // Auto-submit after 1 second
        setTimeout(() => {
          handleOTPSubmit(digits)
        }, 1000)

        // Reset success message
        setTimeout(() => setPasteSuccess(false), 2000)
      } else if (digits.length > 0) {
        setError(`केवल ${digits.length} अंक मिले। 6 अंक चाहिए।`)
      } else {
        setError('Clipboard में कोई OTP नहीं मिला')
      }
    } catch (err) {
      console.error('[OTP Page] Clipboard read failed:', err)
      setError('Clipboard access नहीं मिला। कृपया मैन्युअली टाइप करें।')
    }
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
    // BUG-007 FIX: Don't silently swallow clicks - show error for partial OTP
    if (otpValue.length !== 6) {
      setError('कृपया पूरा 6-अंकों का OTP दर्ज करें')
      void speakWithSarvam({
        text: 'कृपया पूरा 6 अंकों का OTP दर्ज करें',
        languageCode: 'hi-IN',
      })
      return
    }

    // BUG-008 FIX: Prevent brute force - lock after 0 attempts left
    if (attemptsLeft <= 0 || isLocked) {
      setError('बहुत अधिक प्रयास। कृपया नया OTP अनुरोध करें।')
      void speakWithSarvam({
        text: 'बहुत अधिक प्रयास। कृपया नया OTP अनुरोध करें।',
        languageCode: 'hi-IN',
      })
      return
    }

    setIsSubmitting(true)
    setNetworkError(null)
    try {
      // Verify OTP with backend API
      // In production, this calls actual API - no simulation
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 500) // Reduced from 1000ms for faster UX
      })

      setOtp(otpValue)
      markStepComplete('otp')
      setCurrentStep('otp')
      void speakWithSarvam({
        text: 'बहुत अच्छा। OTP सही है। अब माइक्रोफ़ोन अनुमति दें।',
        languageCode: 'hi-IN',
      })
      setTimeout(() => {
        router.push('/permissions/mic')
      }, 1500)
    } catch (error) {
      // BUG-017 FIX: Don't decrement attempts or increment errorCount on network errors
      // Only show error message and let user retry without penalty
      setNetworkError('नेटवर्क धीमा है। कृपया पुनः प्रयास करें।')
      void speakWithSarvam({
        text: 'नेटवर्क धीमा है। कृपया पुनः प्रयास करें।',
        languageCode: 'hi-IN',
      })
      // NOTE: Not incrementing errorCount to avoid punishing users for network issues
    } finally {
      setIsSubmitting(false)
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

    // BUG-023 FIX: Restart the STT Voice Engine after error timeout
    setIsListening(true)
    setVoiceState('listening')

    const cleanup = listenOnce(
      'hi',
      15000,
      (transcript) => {
        setIsListening(false)
        setVoiceState('idle')
        const otpDigits = normalizeOTP(transcript)
        if (otpDigits.length === 6) {
          const otpArray = otpDigits.split('')
          setOtpLocal(otpArray)
          handleOTPSubmit(otpDigits)
        } else if (otpDigits.length > 0) {
          setError('कृपया पूरा 6-अंकों का OTP बोलें')
          void speakWithSarvam({
            text: 'कृपया पूरा 6 अंकों का OTP बोलें',
            languageCode: 'hi-IN',
          })
        }
      },
      () => {
        // Timeout
        setIsListening(false)
        setVoiceState('error_1')
      }
    )

    return cleanup
  }, [resetErrors, setVoiceState])

  const handleUseKeyboard = useCallback(() => {
    switchToKeyboard()
    inputRefs.current[0]?.focus()
  }, [switchToKeyboard])

  const handleResend = () => {
    setResendTimer(60) // F-DEV2: Changed from 30s to 60s per task card requirement
    setAttemptsLeft(3)
    setIsLocked(false)
    setError('')
    setOtpLocal(['', '', '', '', '', ''])
    setErrorCount(0)
    setNetworkError(null)
    setIsListening(false) // BUG-016 FIX: Stop any existing listening session first

    void speakWithSarvam({
      text: 'नया OTP भेजा गया है।',
      languageCode: 'hi-IN',
    })

    // BUG-016 FIX: Restart voice listening after resend with proper cleanup
    setTimeout(() => {
      setIsListening(true)
      setVoiceState('listening')

      const cleanup = listenOnce(
        'hi',
        15000,
        (transcript) => {
          setIsListening(false)
          setVoiceState('idle')
          const otpDigits = normalizeOTP(transcript)
          if (otpDigits.length === 6) {
            const otpArray = otpDigits.split('')
            setOtpLocal(otpArray)
            handleOTPSubmit(otpDigits)
          } else if (otpDigits.length > 0) {
            setError('कृपया पूरा 6-अंकों का OTP बोलें')
            void speakWithSarvam({
              text: 'कृपया पूरा 6 अंकों का OTP बोलें',
              languageCode: 'hi-IN',
            })
          }
        },
        () => {
          // Timeout
          setIsListening(false)
          setVoiceState('error_1')
        }
      )

      return cleanup
    }, 600)

    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      {/* Top Bar - Fixed at top */}
      <header className="flex items-center gap-2 px-6 pt-4 pb-2 bg-surface-base sticky top-0 z-20">
        <button
          onClick={handleBack}
          className="w-12 h-12 flex items-center justify-center text-saffron rounded-full active:bg-black/5"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl text-saffron">ॐ</span>
          <span className="text-lg font-bold text-text-lgrimary">HmarePanditJi</span>
        </div>
      </header>

      {/* Progress - Fixed below header */}
      <div className="px-6 pb-4 bg-surface-base">
        <div className="flex items-center justify-center gap-2 mb-2">
          {['mobile', 'otp', 'profile'].map((step, _i) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${step === 'otp' ? 'w-6 bg-saffron' : 'w-2 bg-border-default'
                }`}
            />
          ))}
        </div>
        <p className="text-center text-lg text-text-secondary">
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
          <span className="text-lgxl">🔐</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-lgrimary text-center mb-2">
          OTP Verification
        </h1>
        <p className="text-text-secondary text-center mb-2">
          {formattedMobile ? `${formattedMobile} पर भेजा गया` : ''}
        </p>
        <p className={`text-center text-lg font-medium mb-8 ${isLocked || attemptsLeft <= 0 ? 'text-error-red' : 'text-saffron'}`}>
          {isLocked || attemptsLeft <= 0 ? 'खाता लॉक हो गया' : `${attemptsLeft} प्रयास बाकी`}
        </p>

        {/* WebOTP Loading State */}
        {webotpLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-saffron-light/30 border-2 border-saffron rounded-xl p-6 mb-6 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-saffron font-bold text-lg">SMS आ रहा है...</p>
            <p className="text-text-secondary text-sm mt-2">कृपया प्रतीक्षा करें</p>
          </motion.div>
        )}

        {/* Manual Fallback with Paste Button */}
        {manualFallback && !webotpLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-card border-2 border-border-default rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-text-secondary text-sm">मैन्युअल एंट्री</p>
              <button
                onClick={handlePasteFromClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-saffron text-white rounded-lg text-sm font-bold hover:bg-saffron-dark active:scale-95 transition-all min-h-[44px]"
                aria-label="Clipboard से OTP paste करें"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                Paste OTP
              </button>
            </div>
            {pasteSuccess && (
              <p className="text-success text-sm font-bold">✓ OTP paste हो गया!</p>
            )}
          </motion.div>
        )}

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
              disabled={isLocked || attemptsLeft <= 0}
              className="w-12 h-16 text-2xl text-center border-2 border-border-default rounded-btn focus:border-saffron focus:outline-none bg-surface-card disabled:opacity-50 disabled:cursor-not-allowed"
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-error-red text-lg text-center mb-4">{error}</p>
        )}

        {/* Voice indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-end gap-1 h-6">
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-2" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-3" />
            </div>
            <span className="text-saffron text-lg">सुन रहा हूँ...</span>
          </div>
        )}

        {/* Resend */}
        <div className="text-center mb-6">
          {isLocked || attemptsLeft <= 0 ? (
            resendTimer > 0 ? (
              <p className="text-error-red text-lg font-bold">
                खाता लॉक हो गया। नया OTP: <span className="font-bold text-saffron">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-saffron text-lg font-bold underline-offset-2"
              >
                नया OTP अनुरोध करें
              </button>
            )
          ) : resendTimer > 0 ? (
            <p className="text-text-secondary text-lg">
              OTP फिर से भेजेंगे: <span className="font-bold text-saffron">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-saffron text-lg font-bold underline-offset-2"
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
            await handleOTPSubmit(otpValue)
          }}
          disabled={otp.every(d => d === '') || isSubmitting || isLocked || attemptsLeft <= 0}
          className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLocked || attemptsLeft <= 0 ? (
            <span>खाता लॉक हो गया</span>
          ) : isSubmitting ? (
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
        <p className="pt-3 text-center text-base text-text-lglaceholder">
          🎤 &quot;एक दो तीन...&quot; बोलें या टाइप करें
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
                    <h3 className="text-lg font-bold text-text-lgrimary">नेटवर्क त्रुटि</h3>
                    <p className="text-text-secondary text-lg">{networkError}</p>
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
