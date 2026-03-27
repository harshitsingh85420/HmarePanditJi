'use client'

import { useState, useEffect } from 'react'
import { LanguageChangeWidget } from '@/components/widgets/LanguageChangeWidget'
import { EmergencySOSFloating } from '@/components/widgets/EmergencySOSFloating'
import type { SupportedLanguage } from '@/components/widgets/LanguageChangeWidget'

/**
 * Error Boundary for Public Layout
 * Catches errors in public-facing screens (identity, help, splash)
 */
function PublicErrorBoundary({
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
          माफ़ कीजिए, तकनीकी दिक्कत आई। कृपया पुनः प्रयास करें।
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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('Hindi')
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleLanguageChange = (language: SupportedLanguage) => {
    setCurrentLanguage(language)
    console.log('[PublicLayout] Language changed to:', language)
  }

  const resetError = () => {
    setHasError(false)
    setError(null)
    window.location.reload()
  }

  // Error boundary using error event listener
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true)
      setError(new Error(event.message))
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  // Browser back button handling
  useEffect(() => {
    const handlePopState = () => {
      console.log('[PublicLayout] Back button pressed')
      // Allow default back behavior for public routes
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (hasError && error) {
    return <PublicErrorBoundary error={error} reset={resetError} />
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative">
      {children}
      <LanguageChangeWidget
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
      <EmergencySOSFloating isVisible={true} />
    </div>
  )
}
