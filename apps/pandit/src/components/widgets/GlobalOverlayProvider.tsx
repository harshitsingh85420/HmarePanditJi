'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { EmergencySOSFloating } from './EmergencySOSFloating'
import { LanguageChangeWidget, type SupportedLanguage } from './LanguageChangeWidget'
import { useLanguageStore } from '@/stores/languageStore'

interface GlobalOverlayProviderProps {
  children?: React.ReactNode
}

/**
 * Global Overlay Provider
 * Wraps the entire app and provides:
 * - Emergency SOS floating button (available on all screens)
 * - Language change widget (available on all screens)
 * - Global state management for language
 *
 * @description UI-017: Emergency SOS Feature - Critical for elderly user safety
 * @description UI-018: Language Change Widget S-0.0.W - Multilingual support for Pandit Ji
 */
export function GlobalOverlayProvider({ children }: GlobalOverlayProviderProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('Hindi')

  // Initialize store on client side only
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
    // Persist to localStorage
    try {
      localStorage.setItem('language-preference', JSON.stringify({
        state: { currentLanguage: language }
      }))
    } catch {
      // Ignore storage errors
    }
  }

  // Hide overlays on certain routes (login, emergency screen itself, etc.)
  const shouldHideOverlays = [
    '/login',
    '/emergency',
    '/onboarding',
  ].some(route => pathname?.startsWith(route))

  // Only show on authenticated pages
  const shouldShowOverlays = !shouldHideOverlays && pathname !== '/'

  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language)
    // Language change is handled by the store and propagates to all components
  }

  // During SSR or before mount, just render children
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Global Overlays - Only show on authenticated pages */}
      {shouldShowOverlays && (
        <>
          {/* Emergency SOS - Always available for safety */}
          <EmergencySOSFloating isVisible={true} />

          {/* Language Change Widget - For multilingual support */}
          <LanguageChangeWidget
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </>
      )}

      {children}
    </>
  )
}

export default GlobalOverlayProvider
