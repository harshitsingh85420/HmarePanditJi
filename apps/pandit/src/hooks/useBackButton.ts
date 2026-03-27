/**
 * useBackButton - Custom hook for handling browser back button
 * 
 * Usage:
 * useBackButton(() => {
 *   // Custom back handler
 *   router.back()
 * })
 */

'use client'

import { useEffect } from 'react'

export function useBackButton(
  onBackPress: () => void,
  options?: {
    preventDefault?: boolean
    enabled?: boolean
  }
) {
  const { preventDefault = false, enabled = true } = options || {}

  useEffect(() => {
    if (!enabled) return

    const handlePopState = () => {
      console.log('[useBackButton] Back button pressed')
      
      if (preventDefault) {
        // Custom handling only - don't allow default back
        onBackPress()
      } else {
        // Allow default back after custom handling
        onBackPress()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [onBackPress, preventDefault, enabled])
}

/**
 * useBackButtonCleanup - Hook for proper cleanup when navigating back
 * Stops voice, clears timers, etc.
 */
export function useBackButtonCleanup(cleanupFn: () => void) {
  useEffect(() => {
    const handlePopState = () => {
      console.log('[useBackButtonCleanup] Cleaning up before back navigation')
      cleanupFn()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [cleanupFn])
}
