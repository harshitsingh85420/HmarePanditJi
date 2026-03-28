'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { useNetwork } from '@/hooks/useNetwork'
import { SessionTimeoutSheet } from '@/components/overlays/SessionTimeout'
import { NetworkBanner } from '@/components/overlays/NetworkBanner'
import { useSafeUIStore } from '@/lib/stores/ssr-safe-stores'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

/**
 * Error Boundary for Dashboard Layout
 * Catches errors in dashboard screens
 */
function DashboardErrorBoundary({
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

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  useSession()
  useNetwork()
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { showSessionTimeout } = useSafeUIStore()

  // Error boundary using error event listener
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true)
      setError(new Error(event.message))
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  // Browser back button handling for dashboard
  useEffect(() => {
    const handlePopState = () => {
      console.log('[DashboardLayout] Back button pressed')
      // Dispatch custom event for child components to handle
      window.dispatchEvent(new CustomEvent('dashboard-back-press'))
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
    return <DashboardErrorBoundary error={error} reset={resetError} />
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative">
      <NetworkBanner />
      {children}
      {showSessionTimeout && <SessionTimeoutSheet />}
    </div>
  )
}
