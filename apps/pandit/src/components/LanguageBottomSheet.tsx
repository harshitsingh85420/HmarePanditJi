'use client'

import { useState } from 'react'
import { ALL_LANGUAGES, LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store'

interface LanguageBottomSheetProps {
  isOpen: boolean
  currentLanguage: SupportedLanguage
  onSelect: (language: SupportedLanguage) => void
  onClose: () => void
}

export default function LanguageBottomSheet({
  isOpen,
  currentLanguage,
  onSelect,
  onClose,
}: LanguageBottomSheetProps) {
  const [search, setSearch] = useState('')

  // Safety check: Default to 'Hindi' if currentLanguage is undefined
  const safeCurrentLanguage = currentLanguage || 'Hindi'

  const filtered = ALL_LANGUAGES.filter(lang => {
    const display = LANGUAGE_DISPLAY[lang]
    return (
      display.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      display.latinName.toLowerCase().includes(search.toLowerCase())
    )
  })

  if (!isOpen) return null

  // Get safe display data
  const currentDisplay = LANGUAGE_DISPLAY[safeCurrentLanguage] || LANGUAGE_DISPLAY['Hindi']

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative bg-surface-card rounded-t-[20px] shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-outline-variant rounded-full" />
        </div>
        {/* Header - ACC-010 FIX: Larger text and textual language labels */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-[20px] font-bold text-text-primary">भाषा बदलें</h2>
            <p className="text-[18px] text-saffron">Change Language</p>
          </div>
          <button onClick={onClose} className="min-w-[56px] min-h-[56px] flex items-center justify-center text-saffron focus:ring-2 focus:ring-primary focus:outline-none">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-surface-muted rounded-xl px-3 h-[56px]">
            <svg width="20" height="20" fill="none" stroke="#9B7B52" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent flex-1 text-[18px] text-text-primary placeholder-saffron outline-none"
            />
          </div>
        </div>
        {/* Current language highlight - ACC-010 FIX: Larger text */}
        <div className="px-4 pb-2">
          <div className="bg-saffron-lt border border-saffron rounded-xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[32px]">{currentDisplay.scriptChar}</span>
              <div>
                <p className="font-bold text-text-primary text-[18px]">{currentDisplay.nativeName}</p>
                <p className="text-[16px] text-saffron">{currentDisplay.latinName}</p>
              </div>
            </div>
            <span className="text-saffron font-bold text-[24px]">✓</span>
          </div>
        </div>
        {/* Language grid - ACC-010 FIX: Larger text */}
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(lang => {
              const display = LANGUAGE_DISPLAY[lang]
              const isActive = lang === safeCurrentLanguage
              return (
                <button
                  key={lang}
                  onClick={() => onSelect(lang)}
                  className={[
                    'flex items-center gap-2 p-4 rounded-xl border text-left transition-colors min-h-[72px]',
                    isActive
                      ? 'bg-saffron-lt border-saffron'
                      : 'bg-surface-card border-outline-variant',
                  ].join(' ')}
                >
                  <span className="text-[28px] font-bold" style={{ color: isActive ? '#F09942' : '#2D1B00' }}>
                    {display.scriptChar}
                  </span>
                  <div>
                    <p className={`font-semibold text-[18px] ${isActive ? 'text-saffron' : 'text-text-primary'}`}>
                      {display.nativeName}
                    </p>
                    <p className="text-[16px] text-text-secondary">{display.latinName}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        {/* Close button - ACC-009 FIX: Larger touch target */}
        <div className="px-4 py-4 border-t border-outline-variant">
          <button
            onClick={onClose}
            className="w-full min-h-[56px] border border-outline-variant rounded-btn text-text-secondary font-semibold text-[18px] focus:ring-2 focus:ring-primary focus:outline-none"
          >
            बंद करें / Close
          </button>
        </div>
      </div>
    </div>
  )
}
