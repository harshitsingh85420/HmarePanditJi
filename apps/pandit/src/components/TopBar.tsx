'use client'

import { useEffect } from 'react'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
  title?: string
}

/**
 * TopBar Component
 *
 * Features:
 * - ॐ symbol + "HmarePanditJi" text
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
export default function TopBar({ showBack = false, onBack, onLanguageChange, title = "HmarePanditJi" }: TopBarProps) {
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

  return (
    <header
      className="flex items-center justify-between px-4 h-[72px] bg-gradient-to-r from-saffron via-saffron-light to-saffron sticky top-0 z-50 shadow-md"
      role="banner"
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center text-white rounded-full active:bg-white/20 focus:ring-2 focus:ring-white focus:outline-none transition-colors"
            aria-label="Go back to previous screen"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span
            className="text-[32px] text-white font-bold shimmer-text"
            aria-label="Om symbol"
          >
            ॐ
          </span>
          <span className="text-[20px] font-bold text-white font-devanagari">
            {title}
          </span>
        </div>
      </div>
      <button
        onClick={onLanguageChange}
        className="min-h-[56px] px-4 flex items-center gap-2 text-[18px] font-bold text-white active:opacity-70 focus:ring-2 focus:ring-white focus:outline-none border-2 border-white/50 rounded-full bg-white/10 backdrop-blur-sm transition-colors"
        aria-label="Change language - Open language selector"
      >
        <span className="material-symbols-outlined text-[24px]" aria-hidden="true">language</span>
        <span className="font-devanagari">हिन्दी / English</span>
      </button>
    </header>
  )
}
