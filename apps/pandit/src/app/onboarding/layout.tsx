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
      {/* Top Bar with Language Globe */}
      <header className="sticky top-0 z-50 bg-vedic-cream border-b border-vedic-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-primary">ॐ</span>
            <span className="text-lg font-semibold text-vedic-brown">HmarePanditJi</span>
          </div>
          <button
            onClick={handleLanguageChange}
            className="w-10 h-10 flex items-center justify-center text-vedic-gold hover:bg-black/5 rounded-full transition-colors active:scale-95"
            aria-label="Change language"
          >
            🌐
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
