'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import type { SupportedLanguage } from '@/lib/onboarding-store'

export type { SupportedLanguage } from '@/lib/onboarding-store'

interface LanguageChangeWidgetProps {
  currentLanguage: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
}

const LANGUAGES: { name: SupportedLanguage; native: string; flag: string; initial?: string }[] = [
  { name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', initial: 'हि' },
  { name: 'Bhojpuri', native: 'भोजपुरी', flag: '🇮🇳', initial: 'भ' },
  { name: 'Maithili', native: 'मैथिली', flag: '🇮🇳', initial: 'मै' },
  { name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', initial: 'ব' },
  { name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', initial: 'த' },
  { name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', initial: 'తె' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', initial: 'ಕ' },
  { name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', initial: 'മ' },
  { name: 'Marathi', native: 'मराठी', flag: '🇮🇳', initial: 'म' },
  { name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', initial: 'ગ' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', initial: 'ਪ' },
  { name: 'English', native: 'English', flag: '🇬🇧', initial: 'A' },
]

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 }
  },
  exit: {
    y: '100%',
    transition: { duration: 0.2 }
  }
}

/**
 * Language Change Widget - Bottom Sheet Design
 * Matches language_change_widget_s_0.0.w HTML reference
 * Provides accessible language switching for Pandit Ji
 *
 * BUG-002 FIX: Persists language selection to localStorage
 * Storage key: 'hpj_preferred_language'
 * Fallback: Hindi if no preference saved
 */
export function LanguageChangeWidget({ currentLanguage, onLanguageChange }: LanguageChangeWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentLanguage)

  // BUG-002 FIX: Persist language selection to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedLanguage) {
      localStorage.setItem('hpj_preferred_language', selectedLanguage)
    }
  }, [selectedLanguage])

  // BUG-002 FIX: Load persisted language on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hpj_preferred_language')
      if (saved && selectedLanguage !== saved) {
        setSelectedLanguage(saved as SupportedLanguage)
      }
    }
  }, [selectedLanguage])

  const handleLanguageSelect = async (lang: SupportedLanguage) => {
    if (lang === currentLanguage) {
      setIsOpen(false)
      return
    }

    // BUG-002 FIX: Update local state for persistence
    setSelectedLanguage(lang)

    // Announce language change
    await speakWithSarvam({
      text: `भाषा बदली गई: ${lang}`,
      languageCode: lang === 'English' ? 'en-IN' : 'hi-IN',
      pace: 0.85,
    })

    onLanguageChange(lang)
    setIsOpen(false)
  }

  // Use selectedLanguage for current display (includes persisted value)
  const currentLang = LANGUAGES.find(l => l.name === (selectedLanguage || currentLanguage))

  return (
    <>
      {/* Language Toggle Button - Compact pill at top-right */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-30 min-h-[44px] bg-surface-card rounded-full shadow-card flex items-center gap-2 border border-saffron/30 px-4 py-2 focus:ring-2 focus:ring-saffron focus:outline-none"
        aria-label="भाषा बदलें / Change Language"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-base font-bold text-text-primary">
          {currentLang?.initial || 'हि'}
        </span>
        <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            {/* Bottom Sheet */}
            <motion.div
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card rounded-t-[24px] shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Drag Handle & Header */}
              <div className="pt-3 pb-2 flex flex-col items-center">
                <div className="w-16 h-2 bg-surface-dim rounded-full mb-4" data-purpose="drag-handle" />
                <div className="w-full px-6 flex justify-between items-center">
                  <h1 className="text-[22px] font-bold text-text-primary font-devanagari">
                    भाषा बदलें <span className="text-text-placeholder font-normal">/ Change Language</span>
                  </h1>
                  <button
                    className="min-h-[56px] min-w-[56px] p-2 text-text-placeholder hover:text-text-secondary transition-colors rounded-full hover:bg-surface-muted"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                  >
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Search Section */}
              <div className="px-6 py-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-placeholder">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-4 min-h-[56px] bg-surface-muted border-none rounded-xl text-[18px] focus:ring-2 focus:ring-saffron focus:bg-surface-card transition-all font-devanagari"
                    placeholder="भाषा खोजें / Search Language..."
                    type="text"
                  />
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-grow overflow-y-auto px-6 py-4">
                {/* Current Selection */}
                <div className="mb-6">
                  <h2 className="text-[18px] font-bold text-text-placeholder mb-3">
                    वर्तमान भाषा / Current
                  </h2>
                  <div className="flex items-center justify-between p-4 bg-saffron-light rounded-2xl border border-saffron/20">
                    <div className="flex items-center gap-3">
                      <span className="text-[28px]">{currentLang?.flag}</span>
                      <div>
                        <p className="font-bold text-text-primary leading-tight font-devanagari">
                          {currentLang?.native}
                        </p>
                        <p className="text-lg text-text-secondary">{currentLanguage}</p>
                      </div>
                    </div>
                    <div className="bg-saffron text-white rounded-full p-1">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Language Grid */}
                <div className="mb-8">
                  <h2 className="text-[18px] font-bold text-text-placeholder mb-3">
                    अन्य भाषाएं / Other Languages
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {LANGUAGES.filter(l => l.name !== currentLanguage).map((lang) => (
                      <motion.button
                        key={lang.name}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLanguageSelect(lang.name)}
                        className="flex items-center gap-3 p-4 min-h-[72px] border border-border-default rounded-xl hover:bg-saffron-light/50 text-left transition-colors"
                      >
                        <div className="min-h-[56px] min-w-[56px] rounded-full bg-saffron-light flex items-center justify-center text-[22px] font-bold text-saffron">
                          {lang.initial}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary text-[20px] font-devanagari">{lang.native}</p>
                          <p className="text-[18px] text-text-secondary">{lang.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="px-6 pt-4 pb-8 border-t border-border-default bg-surface-muted">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-saffron hover:bg-saffron-dark text-white rounded-2xl font-bold text-lg shadow-lg shadow-saffron/20 transition-all active:scale-[0.98] font-devanagari"
                >
                  बंद करें / Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default LanguageChangeWidget
