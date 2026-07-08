'use client'

import { useState, useEffect } from 'react'
import { useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import { stopSpeaking } from '@/lib/voice-engine'
import { useHydration } from '@/hooks/useHydration'

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
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { goBack } = useSafeNavigationStore()

  const resetError = () => {
    setHasError(false)
    setError(null)
    window.location.reload()
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

  // शिष्य (footer orb) + the help screen own assistance now — no
  // floating widgets over the auth screens.
  return (
    <div className="min-h-dvh flex flex-col bg-cream relative">
      {children}
    </div>
  )
}
