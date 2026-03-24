'use client'

import { motion } from 'framer-motion'
import { ALL_LANGUAGES, LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store'

interface LanguageChangeBottomSheetProps {
  isOpen: boolean
  currentLanguage: SupportedLanguage
  onSelect: (language: SupportedLanguage) => void
  onClose: () => void
}

export default function LanguageChangeBottomSheet({
  isOpen,
  currentLanguage,
  onSelect,
  onClose,
}: LanguageChangeBottomSheetProps) {
  const filtered = ALL_LANGUAGES

  if (!isOpen) return null

  const currentDisplay = LANGUAGE_DISPLAY[currentLanguage] || LANGUAGE_DISPLAY['Hindi']

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-t-[24px] shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-vedic-border rounded-full" />
        </div>

        {/* Header - UI-012 FIX: Large, clear header */}
        <div className="px-6 py-4 border-b border-vedic-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[40px]">🌐</span>
            <div>
              <h2 className="text-[24px] font-bold text-vedic-brown">भाषा बदलें</h2>
              <p className="text-[16px] text-text-secondary">Change Language</p>
            </div>
          </div>

          {/* Current language display */}
          <div className="bg-primary-lt border-2 border-primary rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-[32px]">{currentDisplay.scriptChar}</span>
            <div>
              <p className="text-[16px] font-semibold text-text-secondary">वर्तमान भाषा</p>
              <p className="text-[18px] font-bold text-primary">{currentDisplay.nativeName}</p>
            </div>
          </div>
        </div>

        {/* Language grid - UI-012 FIX: Larger touch targets */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(lang => {
              const display = LANGUAGE_DISPLAY[lang]
              const isActive = lang === currentLanguage
              return (
                <motion.button
                  key={lang}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect(lang)}
                  className={[
                    'min-h-[72px] flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    isActive
                      ? 'bg-primary-lt border-primary shadow-sm'
                      : 'bg-white border-vedic-border hover:border-primary/50',
                  ].join(' ')}
                >
                  <span className="text-[32px] font-bold text-saffron">
                    {display.scriptChar}
                  </span>
                  <div className="flex-1">
                    <p className={`text-[16px] font-bold ${isActive ? 'text-primary' : 'text-vedic-brown'}`}>
                      {display.nativeName}
                    </p>
                    <p className="text-[14px] text-text-secondary">{display.latinName}</p>
                  </div>
                  {isActive && (
                    <span className="text-[24px] text-primary">✓</span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Close button - UI-012 FIX: 64px height for wet hands */}
        <div className="px-6 py-4 border-t border-vedic-border bg-vedic-cream">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full h-[64px] bg-primary text-white rounded-xl font-bold text-[18px] shadow-btn-saffron active:scale-95"
          >
            बंद करें / Close
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
