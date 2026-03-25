'use client'

import { useState, useEffect } from 'react'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'
import { useOnboardingStore } from '@/stores/onboardingStore'
import type { SupportedLanguage } from '@/lib/onboarding-store'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fix hydration: Only render after mount
  const [isMounted, setIsMounted] = useState(false)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)
  const { data, setLanguage } = useOnboardingStore()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLanguageChange = () => {
    setShowLanguageSheet(true)
  }

  const handleLanguageSelect = (language: SupportedLanguage) => {
    setShowLanguageSheet(false)
    setLanguage(language)
  }

  return (
    <div className="screen-always-on min-h-screen bg-surface-base relative">
      {/* Top Bar with Large Prominent Om Symbol and Textual Language Toggle */}
      <header className="sticky top-0 z-50 bg-surface-base border-b border-border-default">
        <div className="flex flex-col items-center pt-4 pb-2 px-4">
          {/* Large Om Symbol - Primary Trust Signal for Vedic App */}
          <div className="mb-1">
            <span className="text-[56px] font-bold text-saffron animate-gentle-float" aria-label="Sacred Om Symbol">
              ॐ
            </span>
          </div>
          <div className="flex items-center gap-2 font-bold text-[22px] text-text-primary">
            <span className="text-[32px] text-saffron">ॐ</span>
            <span>HmarePanditJi</span>
          </div>
        </div>
        <div className="flex items-center justify-center pb-4">
          <button
            onClick={handleLanguageChange}
            className="min-h-[56px] px-6 flex items-center gap-3 bg-surface-muted border-2 border-saffron/30 rounded-full hover:bg-saffron-light transition-colors active:scale-95 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Change language / भाषा बदलें"
          >
            <span className="text-[20px] font-bold text-saffron">हिन्दी</span>
            <span className="text-[18px] text-text-secondary">/</span>
            <span className="text-[18px] font-medium text-text-secondary">English</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Language Bottom Sheet - Only render after mount */}
      {isMounted && (
        <LanguageBottomSheet
          isOpen={showLanguageSheet}
          currentLanguage={data.selectedLanguage}
          onSelect={handleLanguageSelect}
          onClose={() => setShowLanguageSheet(false)}
        />
      )}
    </div>
  )
}
