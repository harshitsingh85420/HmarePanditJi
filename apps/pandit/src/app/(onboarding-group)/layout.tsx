'use client'

import { useEffect, useState } from 'react'
import { useWakeLock } from '@/lib/hooks/useWakeLock'

/**
 * Error Boundary for Onboarding Layout
 * Catches errors in onboarding-related screens
 */
function OnboardingErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-vedic-cream">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🙏</div>
        <h1 className="font-headline text-2xl font-bold text-primary">
          कुछ गलत हो गया
        </h1>
        <p className="text-text-secondary font-devanagari">
          माफ़ कीजिए, ऑनबोर्डिंग प्रक्रिया में तकनीकी दिक्कत आई। कृपया पुनः प्रयास करें।
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

export default function OnboardingGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Keep screen on during onboarding (Pandit Ji may be in temple with wet hands)
  useWakeLock(true)

  // Error boundary using error event listener
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true)
      setError(new Error(event.message))
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  // Browser back button handling for onboarding flow
  useEffect(() => {
    const handlePopState = () => {
      console.log('[OnboardingLayout] Back button pressed')
      // Dispatch custom event for child components to handle
      window.dispatchEvent(new CustomEvent('onboarding-back-press'))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const resetError = () => {
    setHasError(false)
    setError(null)
    window.location.reload()
  }

  if (hasError && error) {
    return <OnboardingErrorBoundary error={error} reset={resetError} />
  }

  return (
    <div className="screen-always-on min-h-screen bg-vedic-cream">
      {children}
    </div>
  )
}
