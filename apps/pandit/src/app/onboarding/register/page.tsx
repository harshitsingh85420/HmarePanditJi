'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { speak, startListening, stopListening, stopSpeaking, setManualMicOff } from '@/lib/voice-engine'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useVoiceStore } from '@/stores/voiceStore'

export default function RegisterPage() {
  const router = useRouter()
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { data, setMobile, setOtp: setOtpStore, setName: setNameStore, setCurrentStep, markStepComplete } = useRegistrationStore()
  const { isMicManuallyOff, toggleMic } = useVoiceStore()

  const [step, setStep] = useState<'mobile' | 'otp' | 'profile'>('mobile')
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [name, setNameInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')

  const cleanupRef = useRef<(() => void) | null>(null)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize mic state
  useEffect(() => {
    setManualMicOff(isMicManuallyOff)
  }, [isMicManuallyOff])

  // Speak step instructions
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    if (step === 'mobile') {
      timers.push(setTimeout(() => {
        speak(
          'Bahut achha Pandit Ji. Ab registration shuru karte hain. Pehle aapka mobile number chahiye.',
          'hi-IN',
          () => {
            setTimeout(() => {
              startListeningForMobile()
            }, 500)
          }
        )
      }, 500))
    } else if (step === 'otp') {
      timers.push(setTimeout(() => {
        speak(
          'Aapke mobile par 6 digit ka OTP bheja hai. Woh boliye.',
          'hi-IN',
          () => {
            setTimeout(() => {
              startListeningForOTP()
            }, 500)
          }
        )
      }, 500))
    } else if (step === 'profile') {
      timers.push(setTimeout(() => {
        speak(
          'Ab aapka poora naam chahiye. Jaise aapke Aadhaar card mein hai.',
          'hi-IN',
          () => {
            setTimeout(() => {
              startListeningForName()
            }, 500)
          }
        )
      }, 500))
    }

    return () => {
      timers.forEach(clearTimeout)
      stopListening()
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const startListeningForMobile = () => {
    cleanupRef.current?.()
    setIsListening(true)

    cleanupRef.current = startListening({
      language: 'hi-IN',
      listenTimeoutMs: 15000,
      onResult: (result) => {
        const transcript = result.transcript.toLowerCase()
        const digits = extractDigits(transcript)

        if (digits.length >= 10) {
          const mobile = digits.slice(0, 10)
          setMobileNumber(mobile)
          setMobile(mobile)
          setIsListening(false)
          handleMobileSubmit(mobile)
        } else {
          setError('Mobile number 10 digits ka hona chahiye')
          speak('Mobile number 10 digits ka hona chahiye. Dobara boliye.', 'hi-IN')
          setIsListening(false)
        }
      },
      onError: () => {
        setIsListening(false)
      }
    })
  }

  const startListeningForOTP = () => {
    cleanupRef.current?.()
    setIsListening(true)

    cleanupRef.current = startListening({
      language: 'hi-IN',
      listenTimeoutMs: 15000,
      onResult: (result) => {
        const transcript = result.transcript.toLowerCase()
        const digits = extractDigits(transcript)

        if (digits.length >= 6) {
          const otpDigits = digits.slice(0, 6).split('')
          setOtp(otpDigits)
          setOtpStore(otpDigits.join(''))
          setIsListening(false)
          handleOTPSubmit(otpDigits.join(''))
        } else {
          setError('OTP 6 digits ka hona chahiye')
          speak('OTP 6 digits ka hona chahiye. Dobara boliye.', 'hi-IN')
          setIsListening(false)
        }
      },
      onError: () => {
        setIsListening(false)
      }
    })
  }

  const startListeningForName = () => {
    cleanupRef.current?.()
    setIsListening(true)

    cleanupRef.current = startListening({
      language: 'hi-IN',
      listenTimeoutMs: 15000,
      onResult: (result) => {
        const transcript = result.transcript
        const capitalizedName = capitalizeWords(transcript)

        setNameInput(capitalizedName)
        setNameStore(capitalizedName)
        setIsListening(false)
        handleNameSubmit(capitalizedName)
      },
      onError: () => {
        setIsListening(false)
      }
    })
  }

  const extractDigits = (text: string): string => {
    const hindiDigits: Record<string, string> = {
      'ek': '1', 'aik': '1', 'one': '1', 'एक': '1',
      'do': '2', 'two': '2', 'दो': '2',
      'teen': '3', 'three': '3', 'तीन': '3',
      'char': '4', 'chaar': '4', 'चार': '4', 'four': '4',
      'paanch': '5', 'panch': '5', 'पांच': '5', 'five': '5',
      'chhah': '6', 'chhe': '6', 'छह': '6', 'six': '6',
      'saat': '7', 'सात': '7', 'seven': '7',
      'aath': '8', 'आठ': '8', 'eight': '8',
      'nau': '9', 'नौ': '9', 'nine': '9',
      'shoonya': '0', 'zero': '0', 'sifar': '0', 'शून्य': '0',
    }

    const words = text.split(/[\s,]+/)
    let digits = ''

    for (const word of words) {
      if (hindiDigits[word]) {
        digits += hindiDigits[word]
      } else if (/[0-9]/.test(word)) {
        digits += word.replace(/[^0-9]/g, '')
      }
    }

    return digits
  }

  const capitalizeWords = (text: string): string => {
    return text.replace(/\b\w/g, c => c.toUpperCase())
  }

  const handleMobileSubmit = (_mobile: string) => {
    setError('')
    markStepComplete('mobile')
    setStep('otp')
  }

  const handleOTPSubmit = (_otpValue: string) => {
    setError('')
    markStepComplete('otp')
    setStep('profile')
  }

  const handleNameSubmit = (_nameValue: string) => {
    setError('')
    markStepComplete('profile')
    setCurrentStep('complete')
    completeRegistration()
  }

  const completeRegistration = () => {
    speak('Bahut achha Pandit Ji! Aapka registration complete ho gaya hai.', 'hi-IN', () => {
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    })
  }

  const handleBack = () => {
    stopSpeaking()
    router.replace('/onboarding?phase=TUTORIAL_CTA')
  }

  const handleManualMobileSubmit = () => {
    const digits = mobileNumber.replace(/[^0-9]/g, '')
    if (digits.length === 10) {
      setMobile(digits)
      handleMobileSubmit(digits)
    } else {
      setError('Mobile number 10 digits ka hona chahiye')
    }
  }

  const handleOTPFocus = (index: number) => {
    otpInputRefs.current[index]?.focus()
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1)

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }

    const otpString = newOtp.join('')
    if (newOtp.every(d => d !== '')) {
      setOtpStore(otpString)
      handleOTPSubmit(otpString)
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-vedic-cream flex flex-col">
      {/* Top bar with Back button and Mic toggle */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-vedic-border bg-vedic-cream sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Back"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center active:opacity-50 text-vedic-gold"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-xl text-primary font-bold">ॐ</span>
          <span className="ml-2 text-lg font-semibold text-vedic-brown">HmarePanditJi</span>
        </div>

        <button
          type="button"
          onClick={toggleMic}
          className={`w-10 h-10 flex items-center justify-center ${isMicManuallyOff ? 'text-error' : 'text-vedic-gold'}`}
        >
          {isMicManuallyOff ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
            </svg>
          )}
        </button>
      </header>

      {/* Progress indicator */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {['mobile', 'otp', 'profile'].map((s, _i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${s === step ? 'w-6 bg-primary' : 'w-2 bg-vedic-border'
                }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-vedic-gold mt-2">
          Step {step === 'mobile' ? '1' : step === 'otp' ? '2' : '3'} of 3
        </p>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        {step === 'mobile' && (
          <div className="w-full max-w-sm">
            <div className="text-6xl mb-6 text-center">📱</div>
            <h1 className="text-2xl font-bold text-vedic-brown text-center mb-2">
              Mobile Number
            </h1>
            <p className="text-vedic-gold text-center mb-8">
              Aapka 10-digit mobile number
            </p>

            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
              placeholder="98765 43210"
              maxLength={10}
              className="w-full h-16 px-4 text-2xl text-center border-2 border-vedic-border rounded-xl focus:border-primary focus:outline-none mb-4"
            />

            {isListening && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-end gap-1 h-6">
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar" />
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar-2" />
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar-3" />
                </div>
                <span className="text-primary text-sm">सुन रहा हूँ...</span>
              </div>
            )}

            {error && (
              <p className="text-error text-sm text-center mb-4">{error}</p>
            )}

            <button
              onClick={handleManualMobileSubmit}
              className="w-full h-16 bg-primary text-white rounded-xl font-bold text-lg shadow-cta active:scale-98"
            >
              Aage Badhein →
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="w-full max-w-sm">
            <div className="text-6xl mb-6 text-center">🔐</div>
            <h1 className="text-2xl font-bold text-vedic-brown text-center mb-2">
              OTP Verification
            </h1>
            <p className="text-vedic-gold text-center mb-8">
              6-digit OTP boliye ya likhein
            </p>

            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onFocus={() => handleOTPFocus(index)}
                  maxLength={1}
                  className="w-12 h-16 text-2xl text-center border-2 border-vedic-border rounded-xl focus:border-primary focus:outline-none"
                />
              ))}
            </div>

            {isListening && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-end gap-1 h-6">
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar" />
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar-2" />
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar-3" />
                </div>
                <span className="text-primary text-sm">सुन रहा हूँ...</span>
              </div>
            )}

            {error && (
              <p className="text-error text-sm text-center mb-4">{error}</p>
            )}
          </div>
        )}

        {step === 'profile' && (
          <div className="w-full max-w-sm">
            <div className="text-6xl mb-6 text-center">👤</div>
            <h1 className="text-2xl font-bold text-vedic-brown text-center mb-2">
              Aapka Naam
            </h1>
            <p className="text-vedic-gold text-center mb-8">
              Jaise aapke Aadhaar card mein hai
            </p>

            <input
              type="text"
              value={name}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Pandit Ram Kumar Sharma"
              className="w-full h-16 px-4 text-xl border-2 border-vedic-border rounded-xl focus:border-primary focus:outline-none mb-4"
            />

            {isListening && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-end gap-1 h-6">
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar" />
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar-2" />
                  <div className="w-1.5 bg-primary rounded-full animate-voice-bar-3" />
                </div>
                <span className="text-primary text-sm">सुन रहा हूँ...</span>
              </div>
            )}

            {error && (
              <p className="text-error text-sm text-center mb-4">{error}</p>
            )}

            <button
              onClick={() => handleNameSubmit(name)}
              disabled={!name.trim()}
              className="w-full h-16 bg-primary text-white rounded-xl font-bold text-lg shadow-cta active:scale-98 disabled:opacity-50"
            >
              Registration Complete करें ✓
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="pb-8 px-6 text-center">
        <p className="text-xs text-vedic-gold">
          {isMicManuallyOff ? '🔇 Mic Off - Tap mic icon to enable' : '🎤 Boliye - App sunega'}
        </p>
      </footer>
    </div>
  )
}
