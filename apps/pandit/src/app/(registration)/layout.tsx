'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { useNetwork } from '@/hooks/useNetwork'
import { SessionTimeoutSheet } from '@/components/overlays/SessionTimeout'
import { NetworkBanner } from '@/components/overlays/NetworkBanner'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useNavigationStore } from '@/stores/navigationStore'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'
import { HelpButton } from '@/components/HelpButton'
import { SupportedLanguage, loadOnboardingState } from '@/lib/onboarding-store'
import { LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'
import { stopSpeaking } from '@/lib/voice-engine'

/**
 * Error Boundary for Registration Layout
 * Catches errors in registration-related screens
 */
function RegistrationErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-surface-base">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🙏</div>
        <h1 className="font-headline text-2xl font-bold text-primary">
          कुछ गलत हो गया
        </h1>
        <p className="text-text-secondary font-devanagari">
          माफ़ कीजिए, पंजीकरण प्रक्रिया में तकनीकी दिक्कत आई। कृपया पुनः प्रयास करें।
        </p>
        <button
          onClick={reset}
          className="w-full min-h-[56px] bg-primary-container text-white font-bold rounded-btn flex items-center justify-center gap-2 shadow-btn-saffron"
        >
          <span className="material-symbols-outlined">refresh</span>
          पुनः प्रयास करें
        </button>
      </div>
    </div>
  )
}

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  useSession()
  useNetwork()
  const { goBack } = useNavigationStore()
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSessionTimeout } = useUIStore()
  const { data } = useRegistrationStore()

  // Fix hydration: Only render after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Browser back button handling for registration flow
  useEffect(() => {
    const handlePopState = () => {
      console.log('[RegistrationLayout] Back button pressed')
      // Stop any active voice recognition
      stopSpeaking()

      // Use navigation store to handle back
      const previousPath = goBack()
      if (previousPath) {
        console.log('[RegistrationLayout] Navigating back to:', previousPath)
      }
      // If no previous path, allow default browser back
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      stopSpeaking() // Cleanup on unmount
    }
  }, [goBack])

  // Simple error boundary using error event listener
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes('register') || event.message.includes('profile') || event.message.includes('otp')) {
        setHasError(true)
        setError(new Error(event.message))
      }
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  const resetError = () => {
    setHasError(false)
    setError(null)
    // Force reload of registration flow
    window.location.reload()
  }

  if (hasError && error) {
    return <RegistrationErrorBoundary error={error} reset={resetError} />
  }

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

  const handleHelpClick = () => {
    console.log('[RegistrationLayout] Help button clicked')
    // Could open a help modal or navigate to help page
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

      {/* Help Button - Prominent floating help for elderly users */}
      <HelpButton onClick={handleHelpClick} isVisible={true} />
    </div>
  )
}
