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

  const filtered = ALL_LANGUAGES.filter(lang => {
    const display = LANGUAGE_DISPLAY[lang]
    return (
      display.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      display.latinName.toLowerCase().includes(search.toLowerCase())
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-[20px] shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-vedic-border rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-vedic-brown">भाषा बदलें</h2>
            <p className="text-lg text-vedic-gold">Change Language</p>
          </div>
          <button onClick={onClose} className="w-14 h-14 flex items-center justify-center text-vedic-gold">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-14">
            <svg width="18" height="18" fill="none" stroke="#9B7B52" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent flex-1 text-base text-vedic-brown placeholder-vedic-gold outline-none"
            />
          </div>
        </div>
        <div className="px-4 pb-2">
          <div className="bg-primary-lt border border-primary rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{LANGUAGE_DISPLAY[currentLanguage].scriptChar}</span>
              <div>
                <p className="font-bold text-vedic-brown text-base">{LANGUAGE_DISPLAY[currentLanguage].nativeName}</p>
                <p className="text-lg text-vedic-gold">{LANGUAGE_DISPLAY[currentLanguage].latinName}</p>
              </div>
            </div>
            <span className="text-primary font-bold text-xl">✓</span>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(lang => {
              const display = LANGUAGE_DISPLAY[lang]
              const isActive = lang === currentLanguage
              return (
                <button
                  key={lang}
                  onClick={() => onSelect(lang)}
                  className={[
                    'flex items-center gap-2 p-3 rounded-xl border text-left transition-colors',
                    isActive
                      ? 'bg-primary-lt border-primary'
                      : 'bg-white border-vedic-border',
                  ].join(' ')}
                >
                  <span className="text-xl font-bold" style={{ color: isActive ? '#F09942' : '#2D1B00' }}>
                    {display.scriptChar}
                  </span>
                  <div>
                    <p className={`font-semibold text-lg ${isActive ? 'text-primary' : 'text-vedic-brown'}`}>
                      {display.nativeName}
                    </p>
                    <p className="text-lg text-vedic-gold">{display.latinName}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="px-4 py-4 border-t border-vedic-border">
          <button
            onClick={onClose}
            className="w-full h-14 border border-vedic-border rounded-btn text-vedic-brown-2 font-semibold text-lg"
          >
            बंद करें / Close
          </button>
        </div>
      </div>
    </div>
  )
}
