'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { EmergencySOSFloating } from './EmergencySOSFloating'
import { LanguageChangeWidget } from './LanguageChangeWidget'
import { useLanguageStore } from '@/stores/languageStore'
import type { SupportedLanguage } from '@/lib/onboarding-store'

/**
 * App Overlays Component
 * Client-side only component that provides global overlays:
 * - Emergency SOS floating button
 * - Language change widget
 * 
 * This component is designed to be used in the root layout
 * and only renders on the client side to avoid hydration issues.
 */
export function AppOverlays() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('Hindi')

  // Initialize on client side only
  useEffect(() => {
    setMounted(true)
    // Get language from localStorage or store
    const stored = localStorage.getItem('language-preference')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.state?.currentLanguage) {
          setCurrentLanguage(parsed.state.currentLanguage)
          useLanguageStore.getState().setLanguage(parsed.state.currentLanguage)
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const setLanguage = (language: SupportedLanguage) => {
    useLanguageStore.getState().setLanguage(language)
    try {
      localStorage.setItem('language-preference', JSON.stringify({
        state: { currentLanguage: language }
      }))
    } catch {
      // Ignore storage errors
    }
  }

  // Hide overlays on certain routes
  const shouldHideOverlays = [
    '/login',
    '/emergency',
    '/onboarding',
  ].some(route => pathname?.startsWith(route))

  const shouldShowOverlays = !shouldHideOverlays && pathname !== '/'

  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language)
  }

  // Don't render anything during SSR or before mount
  if (!mounted || !shouldShowOverlays) {
    return null
  }

  return (
    <>
      {/* Emergency SOS - Always available for safety */}
      <EmergencySOSFloating isVisible={true} />

      {/* Language Change Widget - For multilingual support */}
      <LanguageChangeWidget
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
    </>
  )
}

export default AppOverlays
