'use client'

import { useState } from 'react'
import TopBar from '@/components/part0/TopBar'
import { ALL_LANGUAGES, LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { detectLanguageName } from '@/lib/voice-engine'

interface LanguageListScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  onSelect: (language: SupportedLanguage) => void
  onBack: () => void
}

export default function LanguageListScreen({
  language,
  onLanguageChange,
  onSelect,
  onBack,
}: LanguageListScreenProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SupportedLanguage | null>(null)

  useVoiceFlow({
    language,
    voiceScript: 'Apni bhasha chuniye. Boliye ya neeche tap karein.',
    onIntent: (intent) => {
      if (intent.startsWith('RAW:')) {
        const transcript = intent.replace('RAW:', '')
        const detected = detectLanguageName(transcript)
        if (detected) {
          onSelect(detected as SupportedLanguage)
        }
      }
    },
  })

  const filtered = ALL_LANGUAGES.filter(lang => {
    const d = LANGUAGE_DISPLAY[lang]
    return (
      d.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      d.latinName.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />

      <div className="px-6 pt-4 flex flex-col flex-1 gap-4">
        <h1 className="text-[28px] font-bold text-[#2D1B00]">अपनी भाषा चुनें</h1>

        {/* Voice input box */}
        <div className="bg-[#FEF3C7] border-2 border-[#F09942] rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-white p-2 rounded-full animate-pulse shadow-sm">
            <svg className="h-6 w-6 text-[#F09942]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[#2D1B00] font-bold text-base">भाषा का नाम बोलें</span>
            <span className="text-[#9B7B52] text-xs">जैसे: &apos;Hindi&apos;, &apos;Tamil&apos;, &apos;Bengali&apos;</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-[#F0E6D3] rounded-xl py-3 pl-10 pr-4 text-[#2D1B00] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F09942]"
            placeholder="भाषा खोजें..."
            type="text"
          />
        </div>

        {/* Language grid */}
        <div className="grid grid-cols-2 gap-3 pb-10 overflow-y-auto flex-1">
          {filtered.map(lang => {
            const d = LANGUAGE_DISPLAY[lang]
            const isActive = selected === lang || lang === language
            return (
              <button
                key={lang}
                onClick={() => {
                  setSelected(lang)
                  setTimeout(() => onSelect(lang), 200)
                }}
                className={[
                  'relative flex items-center h-16 rounded-xl border px-3 gap-3 text-left transition-all',
                  isActive
                    ? 'bg-[#FEF3C7] border-2 border-[#F09942]'
                    : 'bg-white border-[#F0E6D3] hover:border-[#F09942]',
                ].join(' ')}
              >
                {isActive && (
                  <div className="absolute top-1 right-1">
                    <svg className="h-5 w-5 text-[#F09942]" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className={`text-xl font-bold ${isActive ? 'text-[#F09942]' : 'text-[#2D1B00]'}`}>{d.scriptChar}</span>
                <div>
                  <p className={`font-semibold text-sm ${isActive ? 'text-[#F09942]' : 'text-[#2D1B00]'}`}>{d.nativeName}</p>
                  <p className="text-xs text-[#9B7B52]">{d.latinName}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
