'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'

const IDLE_TIMEOUT = 25 * 60 * 1000 // 25 minutes

export function useSession() {
  const { setSessionTimeout, setSessionSaveNotice } = useUIStore()
  const { data } = useRegistrationStore()

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }

    idleTimerRef.current = setTimeout(() => {
      setSessionTimeout(true)
    }, IDLE_TIMEOUT)
  }, [setSessionTimeout])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => document.addEventListener(event, resetTimer, true))
    resetTimer()

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer, true))
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
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
