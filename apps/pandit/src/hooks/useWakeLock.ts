'use client'

import { useEffect, useRef } from 'react'

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
        wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null
        })
      } catch (err) {
        console.debug('[WakeLock] Not acquired:', err)
      }
    }

    acquire()

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
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [enabled])
}
