'use client'

import { useEffect, useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'

const IDLE_TIMEOUT = 25 * 60 * 1000 // 25 minutes
const SESSION_TIMEOUT_WARNING = 5 * 60 * 1000 // 5 minutes warning

export function useSession() {
  const { setSessionTimeout, setSessionSaveNotice } = useUIStore()
  const { data } = useRegistrationStore()

  let idleTimer: NodeJS.Timeout
  let warningTimer: NodeJS.Timeout

  const resetTimer = useCallback(() => {
    clearTimeout(idleTimer)
    clearTimeout(warningTimer)

    warningTimer = setTimeout(() => {
      setSessionTimeout(true)
    }, IDLE_TIMEOUT)
  }, [setSessionTimeout])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => document.addEventListener(event, resetTimer, true))
    resetTimer()

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer, true))
      clearTimeout(idleTimer)
      clearTimeout(warningTimer)
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
