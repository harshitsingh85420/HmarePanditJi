'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { SessionTimeoutSheet } from '@/components/overlays/SessionTimeout'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'
import { SupportedLanguage, loadOnboardingState } from '@/lib/onboarding-store'
import { LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  useSession()
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
      {/* Top Bar with Language Toggle - Available on ALL registration screens */}
      <header className="sticky top-0 z-50 bg-surface-base border-b border-vedic-border">
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
