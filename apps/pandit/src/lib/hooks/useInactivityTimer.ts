'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseInactivityTimerOptions {
  timeoutMs: number           // How long before onInactive fires
  onInactive: () => void      // What to do when inactive
  enabled?: boolean           // Toggle the timer on/off
  resetEvents?: string[]      // DOM events that reset the timer
}

/**
 * Fires onInactive callback after timeoutMs of user inactivity.
 * For Part 0 screens: 300,000ms (5 minutes) — because Pandits read slowly.
 * Default events that reset: touch, click, keypress, scroll.
 */
export function useInactivityTimer({
  timeoutMs,
  onInactive,
  enabled = true,
  resetEvents = ['touchstart', 'click', 'keypress', 'scroll'],
}: UseInactivityTimerOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onInactiveRef = useRef(onInactive)
  onInactiveRef.current = onInactive

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onInactiveRef.current()
    }, timeoutMs)
  }, [timeoutMs])

  useEffect(() => {
    if (!enabled) return

    resetTimer()

    resetEvents.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true })
    })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      resetEvents.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [enabled, resetTimer, resetEvents])

  return { resetTimer }
}
