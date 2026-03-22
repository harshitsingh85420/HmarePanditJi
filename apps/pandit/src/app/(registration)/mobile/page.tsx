'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useVoiceStore } from '@/stores/voiceStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { ConfirmationSheet } from '@/components/voice/ConfirmationSheet'
import { ErrorOverlay } from '@/components/voice/ErrorOverlay'
import { VoiceOverlay } from '@/components/voice/VoiceOverlay'

const NUMBER_WORDS: Record<string, string> = {
  // Hindi (Latin script)
  'ek': '1', 'aik': '1', 'ik': '1',
  'do': '2', 'doo': '2',
  'teen': '3', 'tin': '3',
  'char': '4', 'chaar': '4',
  'paanch': '5', 'panch': '5',
  'chhah': '6', 'chhe': '6', 'che': '6',
  'saat': '7', 'sat': '7',
  'aath': '8', 'ath': '8',
  'nau': '9', 'no': '9',
  'shoonya': '0', 'zero': '0', 'sifar': '0', 'seefar': '0',
  // Hindi (Devanagari script)
  'एक': '1', 'ऐक': '1',
  'दो': '2',
  'तीन': '3', 'तिन': '3',
  'चार': '4', 'चर': '4',
  'पांच': '5', 'पाँच': '5',
  'छह': '6', 'छः': '6', 'छे': '6',
  'सात': '7',
  'आठ': '8',
  'नौ': '9',
  'शून्य': '0', 'ज़ीरो': '0', 'सीफर': '0',
  // English numbers (commonly used in Indian code-mixing)
  'one': '1', 'won': '1',
  'two': '2', 'too': '2', 'to': '2',
  'three': '3', 'thri': '3',
  'four': '4', 'for': '4',
  'five': '5', 'faiv': '5',
  'six': '6', 'siks': '6',
  'seven': '7', 'sevn': '7',
  'eight': '8', 'ait': '8',
  'nine': '9', 'nain': '9',
  'zee-ro': '0',
  // Devanagari numerals (०-९)
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
}

const PREAMBLE = ['mera', 'hamara', 'number', 'ye', 'is', 'meri', 'apna', 'mobile', 'hai', 'kya', 'ye', 'to', 'the', 'that', 'my']

/**
 * Normalizes spoken mobile number from STT transcript.
 * Handles:
 * - Hindi words (ek, do, teen...) in Latin and Devanagari
 * - English numbers (one, two, three...) - common in code-mixing
 * - Devanagari numerals (०-९)
 * - Fast speech with joined words (nauaathsaat -> nau aath saat)
 * - Mixed language input
 */
function normalizeMobile(transcript: string): string {
  let text = transcript.toLowerCase().trim()

  // Remove preamble words
  for (const p of PREAMBLE) {
    text = text.replace(new RegExp(`\\b${p}\\s*`, 'gi'), '')
  }

  // Remove country code patterns
  text = text.replace(/^(\+91|91|plus\s*91)\s*/gi, '')

  // Step 1: Extract Devanagari numerals directly (before any other processing)
  let digits = ''
  const devanagariNumerals: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  }
  for (const char of text) {
    if (devanagariNumerals[char]) {
      digits += devanagariNumerals[char]
    }
  }

  // Step 2: Try word-based parsing for Hindi/English number words
  // First, try splitting by spaces
  const spaceSplitDigits = text.split(/\s+/).map(w => NUMBER_WORDS[w] ?? '').join('')

  // Step 3: If space-split didn't find enough digits, try character-by-character parsing
  // This handles fast speech where words are joined (e.g., "nauaathsaat")
  if (spaceSplitDigits.length < 10) {
    // Try to find number words embedded in run-together text
    const runTogetherPatterns = [
      /nauaath/g, /nauath/g, /aathnau/g, /athnau/g,
      /aathsaat/g, /athsaat/g, /saataath/g, /saatath/g,
      /chhahpaanch/g, /chhapaanch/g, /paanchchhah/g,
      /charteen/g, /charteen/g, /teenchar/g,
      /doek/g, /ekdo/g,
      /ekdo/g, /doek/g, /teenchar/g, /charpaanch/g,
      /paanchchhe/g, /chhesaat/g, /saataath/g, /aathnau/g, /nauzero/g,
    ]
    let normalizedText = text
    for (const pattern of runTogetherPatterns) {
      normalizedText = normalizedText.replace(pattern, (match) => {
        // Insert space to help with word boundary detection
        return match.split('').join(' ')
      })
    }

    // Character-by-character fallback for remaining joined words
    const charByCharText = text
      .replace(/nau/g, '9 ').replace(/nau/g, '9 ')
      .replace(/aath/g, '8 ').replace(/ath/g, '8 ')
      .replace(/saat/g, '7 ').replace(/sat/g, '7 ')
      .replace(/chhah/g, '6 ').replace(/chhe/g, '6 ').replace(/che/g, '6 ')
      .replace(/paanch/g, '5 ').replace(/panch/g, '5 ')
      .replace(/char/g, '4 ').replace(/chaar/g, '4 ')
      .replace(/teen/g, '3 ').replace(/tin/g, '3 ')
      .replace(/do/g, '2 ')
      .replace(/ek/g, '1 ').replace(/aik/g, '1 ')
      .replace(/zero/g, '0 ').replace(/shoonya/g, '0 ').replace(/sifar/g, '0 ')
      .replace(/nine/g, '9 ').replace(/nain/g, '9 ')
      .replace(/eight/g, '8 ').replace(/ait/g, '8 ')
      .replace(/seven/g, '7 ').replace(/sevn/g, '7 ')
      .replace(/six/g, '6 ').replace(/siks/g, '6 ')
      .replace(/five/g, '5 ').replace(/faiv/g, '5 ')
      .replace(/four/g, '4 ').replace(/for/g, '4 ')
      .replace(/three/g, '3 ').replace(/thri/g, '3 ')
      .replace(/two/g, '2 ').replace(/too/g, '2 ')
      .replace(/one/g, '1 ').replace(/won/g, '1 ')

    const charByCharDigits = charByCharText.replace(/[^0-9]/g, '')

    // Use the method that extracted more digits
    if (charByCharDigits.length > spaceSplitDigits.length) {
      digits += charByCharDigits
    } else {
      digits += spaceSplitDigits
    }
  } else {
    digits += spaceSplitDigits
  }

  // Remove any non-digit characters and take first 10 digits
  return digits.replace(/\D/g, '').slice(0, 10)
}

export default function MobileNumberScreen() {
  const router = useRouter()
  const { data, setMobile, setCurrentStep, markStepComplete } = useRegistrationStore()
  const { navigate, setSection } = useNavigationStore()
  const { state: voiceState, transcribedText, confidence, resetErrors, switchToKeyboard, errorCount, incrementError } = useVoiceStore()

  // BUG-006 FIX: Initialize mobile directly from persisted Zustand store.
  // This means on back-navigation the number is immediately available.
  const [mobile, setMobileLocal] = useState(() => data.mobile || '')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // BUG-006 FIX: If a mobile number is already stored (back-navigation scenario),
  // eagerly start in keyboard mode so the input is visible immediately without
  // waiting for a useEffect (which runs after paint and caused blank UI flash).
  const [isKeyboardForced, setIsKeyboardForced] = useState(() => !!(data.mobile && data.mobile.length === 10))

  useEffect(() => {
    navigate('/mobile', 'part1-registration')
    setSection('part1-registration')
    // BUG-006 FIX: If returning from OTP (number already stored), sync voice store to
    // keyboard mode and auto-show the confirmation sheet so user re-confirms with 1 tap.
    if (data.mobile && data.mobile.length === 10) {
      switchToKeyboard()
      setShowConfirm(true)  // Pre-show confirmation sheet with stored number
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBack = () => {
    // Navigate back to Tutorial CTA (Part 0)
    router.push('/onboarding?phase=TUTORIAL_CTA')
  }

  const handleVoiceIntent = (intentOrRaw: string) => {
    if (typeof intentOrRaw === 'string') {
      if (intentOrRaw.startsWith('RAW:')) {
        const raw = intentOrRaw.slice(4)
        const digits = normalizeMobile(raw)
        if (digits.length === 10) {
          setMobileLocal(digits)
          setShowConfirm(true)
          void speakWithSarvam({
            text: `${digits.split('').join('... ')} — क्या यह नंबर सही है? 'हाँ' बोलें या 'नहीं' बोलें।`,
            languageCode: 'hi-IN',
          })
        } else if (digits.length > 0) {
          incrementError()
          void speakWithSarvam({
            text: `${digits.length} अंक मिले — 10 चाहिए। फिर से बोलें।`,
            languageCode: 'hi-IN',
          })
        }
      } else if (showConfirm) {
        if (intentOrRaw === 'YES' || intentOrRaw === 'FORWARD') {
          handleConfirm()
        } else if (intentOrRaw === 'NO' || intentOrRaw === 'BACK') {
          setShowConfirm(false)
          setMobileLocal('')
          void speakWithSarvam({
            text: 'कोई बात नहीं। फिर से मोबाइल नंबर बोलें।',
            languageCode: 'hi-IN',
          })
        }
      } else if (intentOrRaw === 'BACK') {
        handleBack()
      }
    }
  }

  const { isListening, isSpeaking } = useSarvamVoiceFlow({
    language: 'Hindi',
    script: 'बहुत अच्छा। अब मुझे आपका मोबाइल नंबर चाहिए — ताकि हम आपका खाता बना सकें। अपना 10 अंकों का नंबर बोलें — या नीचे टाइप करें।',
    repromptScript: '10 अंकों का नंबर बोलें, या नीचे टाइप करें।',
    initialDelayMs: 600,
    pauseAfterMs: 500,
    onIntent: handleVoiceIntent,
  })

  const handleConfirm = useCallback(async () => {
    if (mobile.length === 10) {
      setIsSubmitting(true)
      setNetworkError(null)
      try {
        setMobile(mobile)
        markStepComplete('mobile')
        setCurrentStep('mobile')

        // Simulate API call to send OTP - add error handling
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

        void speakWithSarvam({
          text: 'बहुत अच्छा। अब हम OTP भेज रहे हैं।',
          languageCode: 'hi-IN',
        })
        setTimeout(() => {
          router.push('/otp')
        }, 1500)
      } catch (error) {
        setNetworkError('नेटवर्क धीमा है। कृपया पुनः प्रयास करें।')
        void speakWithSarvam({
          text: 'नेटवर्क धीमा है। कृपया पुनः प्रयास करें।',
          languageCode: 'hi-IN',
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [mobile, setMobile, markStepComplete, setCurrentStep, router])

  const handleRetry = useCallback(() => {
    setShowConfirm(false)
    setMobileLocal('')
    resetErrors()
  }, [resetErrors])

  const handleUseKeyboard = useCallback(() => {
    switchToKeyboard()
    inputRef.current?.focus()
  }, [switchToKeyboard])

  const handleInputChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    setMobileLocal(digits)
    // CRITICAL: Save to store immediately for back navigation persistence
    if (digits.length > 0) {
      setMobile(digits)
    }
    if (digits.length === 10) {
      setShowConfirm(true)
    }
  }, [setMobile])

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
              className={`h-2 rounded-full transition-all ${step === 'mobile' ? 'w-6 bg-saffron' : 'w-2 bg-border-default'
                }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-text-secondary">
          Step 1 of 3
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
          <span className="text-4xl">📱</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          Mobile Number
        </h1>
        <p className="text-text-secondary text-center mb-8">
          10-digit मोबाइल नंबर दर्ज करें
        </p>

        {/* Voice Status Indicator */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="flex items-end gap-1 h-6">
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-2" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-3" />
            </div>
            <span className="text-saffron text-sm font-medium">सुन रहा हूँ...</span>
          </motion.div>
        )}

        {/* Input */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="tel"
            value={mobile}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="98765 43210"
            maxLength={10}
            className="w-full h-16 px-4 text-2xl text-center border-2 border-border-default rounded-btn focus:border-saffron focus:outline-none bg-surface-card"
          />
        </div>

        {/* Voice status */}
        <div className="mb-6">
          {isListening && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-end gap-1 h-6">
                <div className="w-1.5 bg-saffron rounded-full animate-voice-bar" />
                <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-2" />
                <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-3" />
              </div>
              <span className="text-saffron text-sm">सुन रहा हूँ...</span>
            </div>
          )}
          {isSpeaking && (
            <p className="text-center text-saffron text-sm">बोल रहा हूँ...</p>
          )}
        </div>
      </div>

      {/* Fixed Bottom CTA - One-handed reachable */}
      <footer className="sticky bottom-0 z-30 px-6 py-4 bg-surface-base border-t border-border-default">
        <button
          onClick={handleConfirm}
          disabled={mobile.length !== 10 || isSubmitting}
          className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>OTP भेज रहे हैं...</span>
            </>
          ) : (
            <span>आगे बढ़ें →</span>
          )}
        </button>
        <p className="pt-3 text-center text-sm text-text-placeholder">
          🎤 "नौ आठ सात..." बोलें या टाइप करें
        </p>
      </footer>

      {/* Overlays — BUG-006 FIX: hide VoiceOverlay when keyboard mode is forced (back-navigation) */}
      {!isKeyboardForced && <VoiceOverlay question="अपना मोबाइल नंबर बोलें" interimText="" />}

      <AnimatePresence>
        {showConfirm && (
          <ConfirmationSheet
            transcribedText={mobile}
            confidence={confidence}
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
                  onClick={() => {
                    setNetworkError(null)
                    handleConfirm()
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
