'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { useNetwork } from '@/hooks/useNetwork'
import { SessionTimeoutSheet } from '@/components/overlays/SessionTimeout'
import { NetworkBanner } from '@/components/overlays/NetworkBanner'
import { useSafeUIStore, useSafeRegistrationStore, useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import { useRegistrationStore } from '@/stores/registrationStore'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'
import { HelpButton } from '@/components/HelpButton'
import { SupportedLanguage, loadOnboardingState } from '@/lib/onboarding-store'
import { LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'
import { stopSpeaking } from '@/lib/voice-engine'
import { useHydration } from '@/hooks/useHydration'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

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
  const hydrated = useHydration()
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // SSR FIX: Use safe store hooks that don't throw during SSR
  const { showSessionTimeout } = useSafeUIStore()
  const { goBack } = useSafeNavigationStore()
  const { data } = useSafeRegistrationStore()

  // Fix hydration: Only render after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Browser back button handling for registration flow - only after hydration
  useEffect(() => {
    if (!hydrated) return

    const handlePopState = () => {
      console.log('[RegistrationLayout] Back button pressed')
      // Stop any active voice recognition
      stopSpeaking()

      // Use navigation store to handle back
      const previousPath = goBack()
      if (previousPath) {
        console.log('[RegistrationLayout] Navigating back to:', previousPath)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      stopSpeaking()
    }
  }, [goBack, hydrated])

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

  // BUG-005 FIX: Sync language from onboarding state to registration store
  // NOTE: Must be before any conditional returns to satisfy rules of hooks
  useEffect(() => {
    const onboardingState = loadOnboardingState()
    if (onboardingState.selectedLanguage) {
      const bcp47Code = LANGUAGE_TO_BCP47[onboardingState.selectedLanguage] || 'hi'
      // Convert BCP-47 code to registration store format (e.g., 'hi-IN' -> 'hi')
      const langCode = bcp47Code.split('-')[0]
      useRegistrationStore.getState().setLanguage(langCode)
    }
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

      {/* Main Content - Individual pages render their own headers with back buttons */}
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
