'use client'

import { useEffect, useRef } from 'react'
import { logger } from '@/utils/logger'

/**
 * Prevents the screen from sleeping during the onboarding flow.
 * Pandits read slowly — 30-second auto-lock would destroy the experience.
 * Uses the Screen Wake Lock API where available, silent no-op otherwise.
 */
export function useWakeLock(enabled: boolean = true) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (!('wakeLock' in navigator)) return

    let released = false

    const acquire = async () => {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        if (wakeLockRef.current) {
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null
          })
        }
      } catch (err) {
        // Wake lock not granted — not critical
        logger.debug('[WakeLock] Not acquired:', err)
      }
    }

    acquire()

    // Re-acquire when page becomes visible again (user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !released) {
        acquire()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch((err) => {
          logger.debug('[WakeLock] Failed to release:', err)
        })
        wakeLockRef.current = null
      }
    }
  }, [enabled])
}
