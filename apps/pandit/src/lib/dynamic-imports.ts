/**
 * Dynamic imports for heavy components
 * Use these for code splitting and lazy loading
 */

import { lazy } from 'react'

/**
 * Tutorial Components - Load tutorial screens lazily
 */
export const TutorialSwagat = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialSwagat'))
export const TutorialVoiceNav = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialVoiceNav'))
export const TutorialDakshina = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialDakshina'))
export const TutorialPayment = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialPayment'))
export const TutorialTravel = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialTravel'))
export const TutorialDualMode = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialDualMode'))
export const TutorialBackup = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialBackup'))
export const TutorialGuarantees = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialGuarantees'))
export const TutorialVideoVerify = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialVideoVerify'))
export const TutorialOnlineRevenue = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialOnlineRevenue'))
export const TutorialIncome = lazy(() => import('@/app/onboarding/screens/tutorial/TutorialIncome'))

/**
 * Emergency SOS - Load emergency features on demand
 */
export const EmergencySOS = lazy(() => import('@/components/emergency/EmergencySOS'))
export const EmergencySOSFloating = lazy(() => import('@/components/widgets/EmergencySOSFloating'))

/**
 * Language Widgets - Load language features lazily
 */
export const LanguageChangeWidget = lazy(() => import('@/components/widgets/LanguageChangeWidget'))
export const LanguageBottomSheet = lazy(() => import('@/components/LanguageBottomSheet'))

/**
 * Session & Network Components
 */
export const SessionTimeoutSheet = lazy(() => import('@/components/overlays/SessionTimeout').then(m => ({ default: m.SessionTimeoutSheet })))
export const NetworkBanner = lazy(() => import('@/components/overlays/NetworkBanner').then(m => ({ default: m.NetworkBanner })))

/**
 * Illustrations - Heavy SVG components
 * Load individual illustrations on demand
 */
export const loadIllustration = async (name: string) => {
  return await import(`@/components/illustrations/${name}.tsx`)
}

/**
 * Helper function to preload critical chunks
 * Call this during idle time or when user interaction is anticipated
 */
export const preloadCriticalChunks = () => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload illustrations
      loadIllustration('OmSymbol').catch(() => {})
      // Preload emergency SOS
      import('@/components/emergency/EmergencySOS').catch(() => {})
    })
  }
}

/**
 * Helper hook to load components with loading state
 */
import { useState, useEffect } from 'react'

export function useLazyComponent<T>(loader: () => Promise<{ default: T }>) {
  const [Component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    loader()
      .then((module) => {
        if (mounted) {
          setComponent(module.default)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err)
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [loader])

  return { Component, loading, error }
}
