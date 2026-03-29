'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadOnboardingState } from '@/lib/onboarding-store'

/**
 * Root Page - Part 0.0 Onboarding Flow
 *
 * Routing logic:
 * - First-time users → /onboarding (Part 0.0: Splash → Language Selection)
 * - Returning users (incomplete onboarding) → Resume from /onboarding
 * - Completed users → Dashboard /dashboard
 *
 * PART 0.0 FLOW (S-0.0.1 → S-0.0.8):
 * 1. Splash Screen (S-0.0.1)
 * 2. Location Permission (S-0.0.2)
 * 3. Manual City Entry (S-0.0.2B)
 * 4. Language Auto-Detect Confirm (S-0.0.3)
 * 5. Language Selection List (S-0.0.4)
 * 6. Language Choice Confirm (S-0.0.5)
 * 7. Language Set Celebration (S-0.0.6)
 * 8. Voice Micro-Tutorial (S-0.0.8)
 */
export default function RootPage() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    console.log('[RootPage] useEffect running')
    try {
      const state = loadOnboardingState()
      console.log('[RootPage] Loaded state:', state)

      // If user has completed onboarding, go to dashboard
      if (state.tutorialCompleted) {
        console.log('[RootPage] Tutorial completed, redirecting to /dashboard')
        router.push('/dashboard')
        setIsRedirecting(false)
        return
      }

      // ALL users start with Part 0.0 onboarding flow (Splash → Language Selection)
      console.log('[RootPage] Redirecting to /onboarding')
      router.push('/onboarding')
      setIsRedirecting(false)
    } catch (error) {
      console.error('[RootPage] Error:', error)
      // Fallback: always go to onboarding
      router.push('/onboarding')
      setIsRedirecting(false)
    }
  }, [router])

  if (isRedirecting) {
    return null
  }

  return null
}
