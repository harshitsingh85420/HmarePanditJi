'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'

const IDLE_TIMEOUT = 25 * 60 * 1000 // 25 minutes
const SESSION_TIMEOUT_WARNING = 5 * 60 * 1000 // 5 minutes warning - BUG-SESSION FIX: Proper two-stage timeout

export function useSession() {
  const { setSessionTimeout, setSessionSaveNotice } = useUIStore()
  const { data } = useRegistrationStore()

  // BUG-006 CRITICAL FIX: Use useRef for timers to prevent loss after re-render
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // BUG-SESSION FIX: Proper two-stage timeout with correct timer cleanup
  const resetTimer = useCallback(() => {
    // Clear existing timers using refs
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }

    // First wait for idle timeout, then show warning
    idleTimerRef.current = setTimeout(() => {
      warningTimerRef.current = setTimeout(() => {
        setSessionTimeout(true)
      }, SESSION_TIMEOUT_WARNING)
    }, IDLE_TIMEOUT)
  }, [setSessionTimeout])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => document.addEventListener(event, resetTimer, true))
    resetTimer()

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer, true))
      // Clear timers using refs
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
      }
    }
  }, [resetTimer])

  // Show session save notice on first registration step
  useEffect(() => {
    if (data.currentStep === 'mobile') {
      setSessionSaveNotice(true)
      setTimeout(() => setSessionSaveNotice(false), 4000)
    }
  }, [data.currentStep, setSessionSaveNotice])

  return { lastSaved: data.lastSavedAt }
}
