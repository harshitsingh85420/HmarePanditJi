'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { LANGUAGE_LIST_SCREEN } from '@/lib/voice-scripts'
import { replaceScriptPlaceholders } from '@/lib/voice-scripts'

const LANGUAGES = [
  { code: 'Hindi', name: 'हिंदी', script: 'Devanagari' },
  { code: 'Bhojpuri', name: 'भोजपुरी', script: 'Devanagari' },
  { code: 'Maithili', name: 'मैथिली', script: 'Devanagari' },
  { code: 'Bengali', name: 'বাংলা', script: 'Bengali' },
  { code: 'Tamil', name: 'தமிழ்', script: 'Tamil' },
  { code: 'Telugu', name: 'తెలుగు', script: 'Telugu' },
  { code: 'Kannada', name: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'Malayalam', name: 'മലയാളം', script: 'Malayalam' },
  { code: 'Marathi', name: 'मराठी', script: 'Devanagari' },
  { code: 'Gujarati', name: 'ગુજરાતી', script: 'Gujarati' },
  { code: 'Punjabi', name: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  { code: 'Odia', name: 'ଓଡ଼ିଆ', script: 'Odia' },
  { code: 'Assamese', name: 'অসমীয়া', script: 'Assamese' },
  { code: 'Sanskrit', name: 'संस्कृत', script: 'Devanagari' },
  { code: 'English', name: 'English', script: 'Latin' },
]

export default function LanguageListScreen() {
  const router = useRouter()
  const { setPhase, setPendingLanguage } = useOnboardingStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const hasSpokenRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    // Voice prompt on screen load
    const timer = setTimeout(() => {
      if (isMountedRef.current && !hasSpokenRef.current) {
        hasSpokenRef.current = true
        void speakWithSarvam({
          text: LANGUAGE_LIST_SCREEN.scripts.main.hindi,
          languageCode: 'hi-IN',
        })
      }
    }, 600)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      stopCurrentSpeech()
    }
  }, [])

  const handleLanguageSelect = (langCode: string, langName: string) => {
    setSelectedLanguage(langCode)
    setPendingLanguage(langCode as any)

    // Speak confirmation
    const langDetectedScript = LANGUAGE_LIST_SCREEN.scripts.onLanguageDetected
    if (langDetectedScript) {
      const script = replaceScriptPlaceholders(
        langDetectedScript,
        { LANGUAGE: langName }
      )
      void speakWithSarvam({
        text: script.hindi,
        languageCode: 'hi-IN',
      })
    }

    // Auto-advance to confirmation after 1.5 seconds
    setTimeout(() => {
      setPhase('LANGUAGE_CHOICE_CONFIRM')
      router.push('/language-choice')
    }, 1500)
  }

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="relative mx-auto min-h-dvh w-full flex flex-col bg-surface-base">
      {/* TopBar */}
      <div className="h-[72px] px-4 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              stopCurrentSpeech()
              setPhase('LANGUAGE_CONFIRM')
              router.push('/language-confirm')
            }}
            className="w-[64px] h-[64px] flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Go back"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-[32px] text-saffron">ॐ</span>
          <h1 className="text-[20px] font-bold text-text-primary">HmarePanditJi</h1>
        </div>
        <button
          onClick={() => { }}
          className="min-h-[64px] px-6 flex items-center gap-2 text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"
          aria-label="Language switcher"
        >
          <span>हिन्दी / English</span>
        </button>
      </div>

      {/* Illustration Area */}
      <section className="mt-4 px-4 flex justify-center">
        <div className="w-[280px] h-[120px] relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="text-[64px]">🌐</span>
            <div className="mt-2 text-[18px] font-bold text-text-secondary font-devanagari">
              अपनी भाषा चुनें
            </div>
          </motion.div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-4 px-4 text-center">
        <h2 className="text-[26px] font-bold text-text-primary leading-tight font-devanagari">
          15 भाषाएं उपलब्ध
        </h2>
        <p className="text-[18px] text-text-secondary mt-2 font-devanagari">
          बोलें या नीचे से छूकर चुनें
        </p>
      </section>

      {/* Content Body */}
      <section className="px-4 flex-grow mt-6">
        {/* Search Input with Keyboard Toggle */}
        <div className="relative mb-6">
          <input
            type={showKeyboard ? 'text' : 'text'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="भाषा खोजें / Search language..."
            className="w-full min-h-[72px] px-6 py-4 bg-surface-card border-2 border-border-default rounded-2xl text-[20px] font-devanagari focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            aria-label="Search for language"
          />
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[28px] p-2 hover:bg-surface-dim rounded-full active:scale-95 transition-transform focus:ring-2 focus:ring-saffron focus:outline-none"
            aria-label={showKeyboard ? 'Hide keyboard' : 'Show keyboard'}
          >
            {showKeyboard ? '🔍' : '⌨️'}
          </button>
        </div>

        {/* Voice Input Hint */}
        <div className="mb-6 p-4 bg-saffron-lt rounded-xl flex items-center gap-3">
          <span className="text-[32px]">🎤</span>
          <p className="text-[18px] font-bold text-text-primary font-devanagari">
            उदाहरण: "हिंदी", "Tamil", "Bengali"
          </p>
        </div>

        {/* Keyboard Toggle Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="min-h-[56px] px-6 flex items-center gap-2 text-[18px] font-bold text-saffron active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none rounded-full"
            aria-label="Toggle keyboard input"
          >
            {showKeyboard ? (
              <>
                <span>🎤</span>
                <span>आवाज़ इनपुट</span>
              </>
            ) : (
              <>
                <span>⌨️</span>
                <span>कीबोर्ड इनपुट</span>
              </>
            )}
          </button>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredLanguages.map((lang, idx) => (
            <motion.button
              key={lang.code}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLanguageSelect(lang.code, lang.name)}
              className={`min-h-[100px] p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all focus:ring-2 focus:ring-saffron focus:outline-none ${selectedLanguage === lang.code
                ? 'bg-saffron text-white border-saffron'
                : 'bg-surface-card text-text-primary border-border-default hover:border-saffron/50'
                }`}
            >
              <span className="text-[28px] font-bold">{lang.name}</span>
              <span className="text-[14px] opacity-70">{lang.script}</span>
            </motion.button>
          ))}
        </div>

        {/* Selection Confirmation */}
        {selectedLanguage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6 p-6 bg-success-lt rounded-2xl flex items-center gap-4"
          >
            <span className="text-[32px]">✅</span>
            <div>
              <p className="text-[20px] font-bold text-success font-devanagari">
                {LANGUAGES.find((l) => l.code === selectedLanguage)?.name} चुना गया
              </p>
              <p className="text-[16px] text-text-secondary font-devanagari">
                आगे बढ़ रहे हैं...
              </p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <footer className="p-6 space-y-4 mb-6">
        {/* Loading State */}
        {selectedLanguage && (
          <div className="flex items-center justify-center gap-2 text-success">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[16px] font-bold font-devanagari">आगे बढ़ रहे हैं...</span>
          </div>
        )}
        <button
          onClick={() => {
            if (selectedLanguage) {
              setPhase('LANGUAGE_CHOICE_CONFIRM')
              router.push('/language-choice')
            }
          }}
          disabled={!selectedLanguage}
          className="w-full bg-saffron text-white py-4 min-h-[72px] rounded-2xl text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Continue to language confirmation"
        >
          आगे बढ़ें →
        </button>
      </footer>
    </main>
  )
}
