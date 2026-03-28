'use client'

import { useState, useEffect } from 'react'
import { LanguageChangeWidget } from '@/components/widgets/LanguageChangeWidget'
import { EmergencySOSFloating } from '@/components/widgets/EmergencySOSFloating'
import { HelpButton } from '@/components/HelpButton'
import { useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import { stopSpeaking } from '@/lib/voice-engine'
import { useHydration } from '@/hooks/useHydration'
import type { SupportedLanguage } from '@/components/widgets/LanguageChangeWidget'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

/**
 * Error Boundary for Auth Layout
 * Catches errors in auth-related screens
 */
function AuthErrorBoundary({
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
          माफ़ कीजिए, लॉगिन प्रक्रिया में तकनीकी दिक्कत आई। कृपया पुनः प्रयास करें।
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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration()
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('Hindi')
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { goBack } = useSafeNavigationStore()

  const handleLanguageChange = (language: SupportedLanguage) => {
    setCurrentLanguage(language)
    console.log('[AuthLayout] Language changed to:', language)
  }

  const resetError = () => {
    setHasError(false)
    setError(null)
    window.location.reload()
  }

  // Browser back button handling - only after hydration
  useEffect(() => {
    if (!hydrated) return

    const handlePopState = () => {
      console.log('[AuthLayout] Back button pressed')
      stopSpeaking()
      goBack()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [goBack, hydrated])

  const handleHelpClick = () => {
    console.log('[AuthLayout] Help button clicked')
  }

  // Browser back button handling for auth flow
  useEffect(() => {
    if (!hydrated) return // SSR FIX: Skip until hydrated

    const handlePopState = () => {
      console.log('[AuthLayout] Back button pressed')
      // Stop any active voice recognition
      stopSpeaking()

      // Use navigation store to handle back
      const previousPath = goBack()
      if (previousPath) {
        console.log('[AuthLayout] Navigating back to:', previousPath)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      stopSpeaking()
    }
  }, [goBack, hydrated])

  // Error boundary using error event listener
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes('auth') || event.message.includes('login')) {
        setHasError(true)
        setError(new Error(event.message))
      }
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  if (hasError && error) {
    return <AuthErrorBoundary error={error} reset={resetError} />
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative">
      {children}
      {/* Global Language Change Widget - Floating button for easy language switching */}
      <LanguageChangeWidget
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
      {/* Emergency SOS Floating Button - Always accessible for safety */}
      <EmergencySOSFloating isVisible={true} />
      {/* Help Button - Prominent floating help for elderly users */}
      <HelpButton onClick={handleHelpClick} isVisible={true} />
    </div>
  )
}
