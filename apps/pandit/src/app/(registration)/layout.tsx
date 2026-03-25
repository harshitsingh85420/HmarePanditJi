'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { useNetwork } from '@/hooks/useNetwork'
import { SessionTimeoutSheet } from '@/components/overlays/SessionTimeout'
import { NetworkBanner } from '@/components/overlays/NetworkBanner'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'
import { SupportedLanguage, loadOnboardingState } from '@/lib/onboarding-store'
import { LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  useSession()
  useNetwork() // ISSUE 9 FIX: Initialize network hook
  const [isMounted, setIsMounted] = useState(false)
  const { showSessionTimeout } = useUIStore()
  const { data } = useRegistrationStore()

  // Fix hydration: Only render after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // BUG-005 FIX: Sync language from onboarding state to registration store
  useEffect(() => {
    const onboardingState = loadOnboardingState()
    if (onboardingState.selectedLanguage) {
      const bcp47Code = LANGUAGE_TO_BCP47[onboardingState.selectedLanguage] || 'hi'
      // Convert BCP-47 code to registration store format (e.g., 'hi-IN' -> 'hi')
      const langCode = bcp47Code.split('-')[0]
      useRegistrationStore.getState().setLanguage(langCode)
    }
  }, [])

  const handleLanguageChange = () => {
    // Language change handler
  }

  const handleLanguageSelect = (_language: SupportedLanguage) => {
    // Language select handler
  }

  // Don't render layout until mounted to prevent hydration issues
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative">
      {/* ISSUE 9 FIX: Network Banner - shows when offline */}
      <NetworkBanner />

      {/* Top Bar with Language Toggle - Available on ALL registration screens */}
      <header className="sticky top-0 z-50 bg-surface-base border-b-2 border-saffron/30">
        <div className="flex items-center justify-between px-6 h-[72px]">
          {/* Large Prominent Om Symbol - Trust Signal for Vedic App */}
          <div className="flex items-center gap-3">
            <span className="text-[48px] font-bold text-saffron animate-gentle-float" aria-label="Sacred Om Symbol">ॐ</span>
            <span className="text-[24px] font-bold text-text-primary">HmarePanditJi</span>
          </div>
          {/* Language Switcher with Clear Text Labels - ACC-009 FIX: Larger touch target */}
          <button
            onClick={handleLanguageChange}
            className="min-h-[64px] min-w-[64px] px-6 flex items-center gap-3 bg-surface-card border-2 border-saffron/40 rounded-full hover:bg-saffron-light transition-colors active:scale-95 focus:ring-2 focus:ring-saffron focus:outline-none shadow-card"
            aria-label="Change language / भाषा बदलें"
          >
            <span className="text-[22px] font-bold text-saffron">हिन्दी</span>
            <span className="text-[20px] font-medium text-text-secondary">/</span>
            <span className="text-[20px] font-medium text-text-secondary">English</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Session Timeout */}
      {showSessionTimeout && <SessionTimeoutSheet />}

      {/* Language Bottom Sheet - Only render after mount to prevent hydration errors */}
      <LanguageBottomSheet
        isOpen={false}
        currentLanguage={data.language as SupportedLanguage}
        onSelect={handleLanguageSelect}
        onClose={() => { }}
      />
    </div>
  )
}
