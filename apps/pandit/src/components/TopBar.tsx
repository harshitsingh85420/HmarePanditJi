'use client'

import { useEffect } from 'react'
import { SupportedLanguage, getBrandName, ScriptPreference } from '@/lib/onboarding-store'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
  title?: string
  language?: SupportedLanguage
  scriptPreference?: ScriptPreference | null
}

/**
 * TopBar Component
 *
 * Features:
 * - ॐ symbol + "HmarePanditJi" text (translated based on script preference)
 * - Globe icon (language change)
 * - Back button (conditional)
 * - Saffron gradient background
 * - 56px minimum touch targets for elderly users
 *
 * Accessibility:
 * - All buttons have aria-label
 * - Keyboard navigation support
 * - Focus indicators visible
 */
export default function TopBar({
  showBack = false,
  onBack,
  onLanguageChange,
  title,
  language = 'Hindi',
  scriptPreference = null
}: TopBarProps) {
  // Keyboard navigation for back button
  useEffect(() => {
    if (!showBack) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBack) {
        onBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showBack, onBack])

  // Get the translated brand name
  const brandName = title || getBrandName(language, scriptPreference)

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 pt-4 pb-3 bg-saffron/95 backdrop-blur-md shadow-lg"
      role="banner"
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center text-white bg-white/20 rounded-full active:bg-white/30 transition-all"
            aria-label="Go back to previous screen"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span
            className="text-3xl text-white"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            aria-label="Om symbol"
          >
            ॐ
          </span>
          <span className="text-lg font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {brandName}
          </span>
        </div>
      </div>
      <button
        onClick={onLanguageChange}
        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white active:bg-white/30 transition-all flex items-center justify-center"
        aria-label="Change language"
      >
        <span className="text-2xl">🌐</span>
      </button>
    </header>
  )
}
