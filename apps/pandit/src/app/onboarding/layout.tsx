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
    <div className="screen-always-on min-h-screen bg-vedic-cream relative">
      {/* Top Bar with Language Toggle */}
      <header className="sticky top-0 z-50 bg-vedic-cream border-b border-vedic-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-primary">ॐ</span>
            <span className="text-lg font-semibold text-vedic-brown">HmarePanditJi</span>
          </div>
          <button
            onClick={handleLanguageChange}
            className="min-h-[56px] px-4 flex items-center gap-2 bg-primary-lt border-2 border-primary rounded-full hover:bg-primary/20 transition-colors active:scale-95"
            aria-label="Change language / भाषा बदलें"
          >
            <span className="text-[16px] font-bold text-primary">हिन्दी</span>
            <span className="text-[14px] text-vedic-gold">/</span>
            <span className="text-[14px] font-medium text-vedic-gold">English</span>
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
