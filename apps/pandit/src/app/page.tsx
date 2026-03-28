'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadOnboardingState } from '@/lib/onboarding-store'

/**
 * Root Page - GAP-11, GAP-12 Fix
 * 
 * Routing logic:
 * - First-time users → Homepage (E-01) at /identity
 * - Returning users (incomplete onboarding) → Resume from last screen /onboarding
 * - Completed users → Dashboard /dashboard
 * 
 * This ensures fresh users see the Homepage first before choosing Pandit/Customer path.
 */
export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const state = loadOnboardingState()

    // If user has completed onboarding, go to dashboard
    if (state.tutorialCompleted) {
      router.push('/dashboard')
      return
    }

    // If first time user, show Homepage (E-01)
    if (state.firstEverOpen) {
      router.push('/identity')
      return
    }

    // Resume from last screen (onboarding flow)
    router.push('/onboarding')
  }, [router])

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-base">
      {/* Loading state with sacred Om symbol */}
      <div className="text-5xl animate-glow-pulse" aria-label="Loading">ॐ</div>
    </div>
  )
}
