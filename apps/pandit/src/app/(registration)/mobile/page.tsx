'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useVoiceStore } from '@/stores/voiceStore'
import { useUIStore } from '@/stores/uiStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { ConfirmationSheet } from '@/components/voice/ConfirmationSheet'
import { ErrorOverlay } from '@/components/voice/ErrorOverlay'
import { VoiceOverlay } from '@/components/voice/VoiceOverlay'
import { useAmbientNoise } from '@/hooks/useAmbientNoise'
import LanguageChangeBottomSheet from '@/components/LanguageChangeBottomSheet'
import { getManualMicOff } from '@/lib/voice-engine'

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

// EDGE-002 FIX: Support for all Indian numeral systems
const NUMERAL_MAPS = {
  devanagari: {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  },
  bengali: {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  },
  tamil: {
    '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4',
    '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
  },
  gurmukhi: {
    '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4',
    '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
  },
}

// VOICE-003 FIX: Fallback method - extract ANY digits from transcript
function extractAnyDigits(text: string): string {
  return text.replace(/[^0-9]/g, '')
}

/**
 * Normalizes spoken mobile number from STT transcript.
 * Handles:
 * - Hindi words (ek, do, teen...) in Latin and Devanagari
 * - English numbers (one, two, three...) - common in code-mixing
 * - Devanagari numerals (०-९)
 * - ALL Indian numeral systems (Bengali, Tamil, Gurmukhi, etc.)
 * - Fast speech with joined words (nauaathsaat -> nau aath saat)
 * - Mixed language input
 * - VOICE-003 FIX: Multiple extraction methods with fallback
 */
function normalizeMobile(transcript: string): string {
  let text = transcript.toLowerCase().trim()

  // Remove preamble words
  for (const p of PREAMBLE) {
    text = text.replace(new RegExp(`\\b${p}\\s*`, 'gi'), '')
  }

  // EDGE-003 FIX: More robust country code removal
  text = text.replace(/^(\+91|91|0091|plus\s*91)[\s-]?/gi, '')
  text = text.replace(/^0+/g, '') // Remove leading zeros

  // VOICE-003 FIX: Try multiple extraction methods in order of preference
  const methods = [
    // Method 1: Extract from all Indian numeral scripts + Devanagari
    () => {
      let result = text
      // Convert all Indian numeral systems to Latin digits
      for (const [, map] of Object.entries(NUMERAL_MAPS)) {
        for (const [native, digit] of Object.entries(map)) {
          result = result.replace(new RegExp(native, 'g'), digit)
        }
      }
      // Also handle Devanagari separately
      const devanagariNumerals: Record<string, string> = {
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
        '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
      }
      for (const [native, digit] of Object.entries(devanagariNumerals)) {
        result = result.replace(new RegExp(native, 'g'), digit)
      }
      return result.replace(/\D/g, '')
    },
    // Method 2: Try word-based parsing for Hindi/English number words
    () => {
      const spaceSplitDigits = text.split(/\s+/).map(w => NUMBER_WORDS[w] ?? '').join('')
      return spaceSplitDigits.length >= 10 ? spaceSplitDigits : ''
    },
    // Method 3: Character-by-character parsing for run-together words
    () => {
      const charByCharText = text
        .replace(/nau/g, '9 ').replace(/aath/g, '8 ')
        .replace(/saat/g, '7 ').replace(/chhah/g, '6 ')
        .replace(/paanch/g, '5 ').replace(/char/g, '4 ')
        .replace(/teen/g, '3 ').replace(/do/g, '2 ')
        .replace(/ek/g, '1 ').replace(/zero/g, '0 ')
        .replace(/nine/g, '9 ').replace(/eight/g, '8 ')
        .replace(/seven/g, '7 ').replace(/six/g, '6 ')
        .replace(/five/g, '5 ').replace(/four/g, '4 ')
        .replace(/three/g, '3 ').replace(/two/g, '2 ')
        .replace(/one/g, '1 ')
      return charByCharText.replace(/[^0-9]/g, '')
    },
    // Method 4: VOICE-003 FIX: Ultimate fallback - extract ANY digits
    () => extractAnyDigits(text),
  ]

  // Try each method until we get 10 digits
  for (const method of methods) {
    const result = method()
    if (result.length === 10) return result
  }

  // VOICE-003 FIX: Return best effort (even if not 10 digits)
  // Let the UI handle validation
  return methods[methods.length - 1]()
}

export default function MobileNumberScreen() {
  const router = useRouter()
  const { setMobile, setCurrentStep, markStepComplete } = useRegistrationStore()
  const { setSessionSaveNotice } = useUIStore()
  const { navigate, setSection } = useNavigationStore()
  const { transcribedText, confidence, resetErrors, switchToKeyboard, errorCount, incrementError } = useVoiceStore()

  // BUG-001 CRITICAL FIX: Initialize from store DIRECTLY, not empty string
  // This prevents the race condition where component mounts with empty mobile
  // and user sees flash of empty field on back navigation
  const storedMobile = useRegistrationStore(state => state.data.mobile);
  const [mobile, setMobileLocal] = useState(storedMobile || '')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)
  const [isMicOff, setIsMicOff] = useState(false)

  // BUG-019 FIX: Ambient noise detection for intelligent error messages
  const { startNoiseDetection, stopNoiseDetection } = useAmbientNoise()

  // Sync mic state from global voice engine
  useEffect(() => {
    setIsMicOff(getManualMicOff())
    const interval = setInterval(() => {
      setIsMicOff(getManualMicOff())
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Sync UI state from store on mount and when data changes
  useEffect(() => {
    navigate('/mobile', 'part1-registration')
    setSection('part1-registration')

    // BUG-019 FIX: Start ambient noise detection
    void startNoiseDetection()

    // ISSUE 8 FIX: Show session save notice on first step
    setSessionSaveNotice(true)
    const noticeTimer = setTimeout(() => setSessionSaveNotice(false), 4000)

    // BUG-001 FIX: If mobile number exists, show confirmation sheet
    if (storedMobile && storedMobile.length === 10) {
      switchToKeyboard()
      setShowConfirm(true)
    }

    // ARCH-010 FIX: Stop any ongoing speech AND STT on unmount
    return () => {
      stopCurrentSpeech()
      stopNoiseDetection()
      clearTimeout(noticeTimer)
      // ARCH-010 FIX: Also cleanup registration store listeners to prevent memory leaks
      if (typeof window !== 'undefined') {
        // Cleanup is handled by the store's cleanup function
      }
    }
  }, [storedMobile, navigate, setSection, startNoiseDetection, stopNoiseDetection, switchToKeyboard, setSessionSaveNotice])

  // NAV-001 FIX: Handle browser back button (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      // P1 FIX: Removed console.log for production
      // Clean up voice state
      stopCurrentSpeech()
      stopNoiseDetection()

      // Persist data before navigation
      try {
        if (mobile && mobile.length > 0) {
          setMobile(mobile)
          const currentState = useRegistrationStore.getState().data
          const newData = { ...currentState, mobile, lastSavedAt: Date.now() }
          localStorage.setItem('hpj-registration', JSON.stringify({ data: newData }))
        }
      } catch (e) {
        console.warn('Failed to persist data on popstate:', e)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [mobile, setMobile, stopNoiseDetection]) // stopCurrentSpeech is outer scope, not a valid dep

  const handleBack = useCallback(() => {
    // CRITICAL FIX: Clean up voice state before navigation to prevent crashes
    stopCurrentSpeech()
    stopNoiseDetection()

    // Ensure data is persisted before navigation
    try {
      if (mobile && mobile.length > 0) {
        setMobile(mobile)
        const currentState = useRegistrationStore.getState().data
        const newData = { ...currentState, mobile, lastSavedAt: Date.now() }
        localStorage.setItem('hpj-registration', JSON.stringify({ data: newData }))
      }
    } catch (e) {
      console.warn('Failed to persist data on back navigation:', e)
    }

    // CRITICAL FIX: Use router.back() for proper history navigation
    // BUG-002 FIX: Ensure clean navigation without race conditions
    router.back()
  }, [mobile, setMobile, router, stopNoiseDetection])

  const handleVoiceIntent = (intentOrRaw: string) => {
    if (typeof intentOrRaw === 'string') {
      if (intentOrRaw.startsWith('RAW:')) {
        const raw = intentOrRaw.slice(4)
        const digits = normalizeMobile(raw)
        if (digits.length === 10) {
          setMobileLocal(digits)
          setShowConfirm(true)
          speakWithSarvam({
            text: `${digits.split('').join('... ')} — क्या यह नंबर सही है? 'हाँ' बोलें या 'नहीं' बोलें।`,
            languageCode: 'hi-IN',
          }).catch((err) => {
            console.warn('[MobilePage] TTS failed for number confirmation:', err)
            // Still show confirmation even if TTS fails
          })
        } else if (digits.length > 0) {
          incrementError()
          speakWithSarvam({
            text: `${digits.length} अंक मिले — 10 चाहिए। फिर से बोलें।`,
            languageCode: 'hi-IN',
          }).catch((err) => {
            console.warn('[MobilePage] TTS failed for error message:', err)
          })
        }
      } else if (showConfirm) {
        if (intentOrRaw === 'YES' || intentOrRaw === 'FORWARD') {
          handleConfirm()
        } else if (intentOrRaw === 'NO' || intentOrRaw === 'BACK') {
          setShowConfirm(false)
          setMobileLocal('')
          speakWithSarvam({
            text: 'कोई बात नहीं। फिर से मोबाइल नंबर बोलें।',
            languageCode: 'hi-IN',
          }).catch((err) => {
            console.warn('[MobilePage] TTS failed for retry message:', err)
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
    listenTimeoutMs: 8000, // BUG-015 FIX: Explicit timeout (was 18000 with +10000)
    repromptTimeoutMs: 8000, // BUG-015 FIX: Explicit timeout
    onIntent: handleVoiceIntent,
    disabled: isMicOff,  // BUG-011 FIX: Hybrid mode - disable voice when mic off, text still works
  })

  const handleConfirm = useCallback(async () => {
    // ISSUE 2 FIX: Validate 10-digit mobile number with Indian prefix
    const digits = mobile.replace(/[^0-9]/g, '')
    if (digits.length !== 10) {
      setError('मोबाइल नंबर 10 अंकों का होना चाहिए।')
      speakWithSarvam({
        text: 'मोबाइल नंबर 10 अंकों का होना चाहिए। कृपया फिर से बोलें या लिखें।',
        languageCode: 'hi-IN',
      }).catch((err) => {
        console.warn('[MobilePage] TTS failed for validation error:', err)
      })
      return
    }
    // Validate Indian mobile prefix (6-9)
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError('अमान्य नंबर। भारतीय मोबाइल 6, 7, 8, या 9 से शुरू होता है।')
      speakWithSarvam({
        text: 'अमान्य नंबर। भारतीय मोबाइल 6, 7, 8, या 9 से शुरू होता है।',
        languageCode: 'hi-IN',
      }).catch((err) => {
        console.warn('[MobilePage] TTS failed for prefix error:', err)
      })
      return
    }

    setIsSubmitting(true)
    setNetworkError(null)
    try {
      // BUG-001 FIX: Update store AND localStorage synchronously before navigation
      setMobile(digits)
      markStepComplete('mobile')
      setCurrentStep('mobile')

      // CRITICAL: Force immediate localStorage write before any async operations
      try {
        const currentState = useRegistrationStore.getState().data
        const newData = { ...currentState, mobile, lastSavedAt: Date.now() }
        localStorage.setItem('hpj-registration', JSON.stringify({ data: newData }))
      } catch (e) {
        console.warn('Failed to write to localStorage:', e)
      }

      // Small delay to ensure localStorage write completes
      await new Promise(resolve => setTimeout(resolve, 50))

      speakWithSarvam({
        text: 'बहुत अच्छा। अब हम OTP भेज रहे हैं।',
        languageCode: 'hi-IN',
      }).catch((err) => {
        console.warn('[MobilePage] TTS failed for OTP message:', err)
        // Still navigate even if TTS fails
      })

      // Navigate to OTP - CRITICAL: Use window.location for reliable navigation
      // Try router.push first
      router.push('/otp')
      // Fallback: force navigation after 500ms if router doesn't work
      setTimeout(() => {
        if (window.location.pathname !== '/otp') {
          window.location.href = '/otp'
        }
      }, 500)
    } catch (error) {
      console.error('[MobilePage] Error in handleConfirm:', error)
      setNetworkError('नेटवर्क धीमा है। कृपया पुनः प्रयास करें।')
      speakWithSarvam({
        text: 'नेटवर्क धीमा है। कृपया पुनः प्रयास करें।',
        languageCode: 'hi-IN',
      }).catch((err) => {
        console.warn('[MobilePage] TTS failed for network error message:', err)
      })
    } finally {
      setIsSubmitting(false)
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
    // BUG-022 FIX: Always call setMobile, even when digits is empty, so user can fully clear the field
    setMobile(digits)

    // BUG-001 FIX: Also write directly to localStorage for instant persistence
    // This ensures back navigation works even if Zustand persist is slow
    if (digits.length > 0) {
      try {
        const currentState = useRegistrationStore.getState().data
        const newData = { ...currentState, mobile: digits, lastSavedAt: Date.now() }
        localStorage.setItem('hpj-registration', JSON.stringify({ data: newData }))
      } catch (e) {
        console.warn('Failed to write mobile to localStorage:', e)
      }
    }

    if (digits.length === 10) {
      setShowConfirm(true)
    }
  }, [setMobile])

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      {/* Top Bar - Fixed at top - UI-012 FIX: Language button reachable */}
      <header className="flex items-center justify-between px-6 pt-4 pb-2 bg-surface-base sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {/* UX-008 FIX: Haptic feedback, ACC-008 FIX: Focus indicators */}
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              handleBack();
            }}
            className="w-[52px] h-[52px] flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Go back"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-saffron">ॐ</span>
            <span className="text-lg font-bold text-text-primary">HmarePanditJi</span>
          </div>
        </div>
        {/* UI-012 FIX: Large language button in reachable area, UX-008 FIX: Haptic feedback */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            setShowLanguageSheet(true);
          }}
          className="min-w-[64px] min-h-[64px] rounded-full bg-saffron-lt/30 border-2 border-saffron/40 active:bg-saffron/30 flex items-center justify-center focus:ring-2 focus:ring-primary focus:outline-none"
          aria-label="भाषा बदलें"
        >
          <span className="text-[32px]">🌐</span>
        </motion.button>
      </header>

      {/* Progress - Fixed below header */}
      <div className="px-6 pb-4 bg-surface-base">
        <div className="flex items-center justify-center gap-2 mb-2">
          {['mobile', 'otp', 'profile'].map((step, _i) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${step === 'mobile' ? 'w-6 bg-saffron' : 'w-2 bg-border-default'
                }`}
            />
          ))}
        </div>
        <p className="text-center text-lg text-text-secondary">
          चरण 1 / 3
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
          <span className="text-3xl">📱</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          मोबाइल नंबर
        </h1>
        <p className="text-text-secondary text-center mb-8">
          10-digit मोबाइल नंबर दर्ज करें
        </p>

        {/* Voice Status Indicator - UI-014 FIX: Real-time transcription */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            {/* Transcription display - UI-014 FIX */}
            <div className="bg-saffron-lt rounded-xl px-4 py-4 mb-3 border-2 border-saffron/30">
              <p className="text-[22px] text-text-secondary mb-2 font-medium">आपने बोला:</p>
              <p className="text-[26px] font-bold text-text-primary min-h-[64px]">
                {transcribedText || "बोल रहे हैं..."}
              </p>
              {confidence && confidence < 0.7 && (
                <p className="text-[22px] text-warning-amber mt-2 flex items-center gap-2 font-medium">
                  <span className="text-[28px]">⚠️</span> साफ़ नहीं सुनाई दिया
                </p>
              )}
            </div>

            {/* Listening indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-end gap-1 h-8">
                <div className="w-2 bg-saffron rounded-full animate-voice-bar" />
                <div className="w-2 bg-saffron rounded-full animate-voice-bar-2" />
                <div className="w-2 bg-saffron rounded-full animate-voice-bar-3" />
              </div>
              <span className="text-saffron text-[20px] font-semibold">सुन रहा हूँ...</span>
            </div>
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

        {/* Speaking indicator */}
        {isSpeaking && (
          <p className="text-center text-saffron text-[16px] font-semibold">बोल रहा हूँ...</p>
        )}
      </div>

      {/* Fixed Bottom CTA - UI-008 FIX: Prominent keyboard fallback */}
      <footer className="sticky bottom-0 z-30 px-6 py-4 bg-surface-base border-t border-border-default">
        {/* UX-008 FIX: Haptic feedback, ACC-008 FIX: Focus indicators */}
        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            handleConfirm();
          }}
          disabled={mobile.length !== 10 || isSubmitting}
          className="w-full min-h-[72px] h-auto px-4 py-3 bg-saffron text-white font-bold text-[20px] rounded-xl shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-center block break-words line-clamp-2">OTP भेज रहे हैं...</span>
            </>
          ) : (
            <span className="text-center block break-words line-clamp-2">आगे बढ़ें →</span>
          )}
        </button>

        {/* UI-008 FIX: Prominent keyboard fallback button with animation, UX-008: Haptic feedback */}
        {errorCount >= 1 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              handleUseKeyboard();
            }}
            className="w-full mt-3 min-h-[64px] h-auto px-4 py-3 bg-white border-2 border-saffron text-saffron font-bold text-[20px] rounded-xl flex items-center justify-center gap-2 active:bg-saffron/10 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              ⌨️
            </motion.span>
            <span className="text-center block break-words line-clamp-2">कीबोर्ड का उपयोग करें</span>
          </motion.button>
        )}

        <p className="pt-3 text-center text-[18px] text-text-placeholder">
          🎤 "नौ आठ सात..." बोलें या टाइप करें
        </p>
      </footer>

      {/* UI-012 FIX: Language Bottom Sheet for reachable language change */}
      <LanguageChangeBottomSheet
        isOpen={showLanguageSheet}
        currentLanguage="Hindi"
        onSelect={(_lang) => {
          // Handle language change here
          setShowLanguageSheet(false)
        }}
        onClose={() => setShowLanguageSheet(false)}
      />

      {/* CRITICAL FIX: Hide voice overlays when confirmation sheet is showing */}
      {/* This prevents overlays from stacking and blocking the confirm button */}
      {!showConfirm && (
        <VoiceOverlay question="अपना मोबाइल नंबर बोलें" interimText="" />
      )}

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

      {/* CRITICAL FIX: Only show ErrorOverlay when confirmation sheet is NOT showing */}
      {/* Prevents error overlay from blocking the confirm button */}
      <AnimatePresence>
        {!showConfirm && errorCount > 0 && (
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
