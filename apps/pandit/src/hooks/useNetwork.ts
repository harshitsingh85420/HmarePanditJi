'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'

export function useNetwork() {
  const { setOnline } = useUIStore()

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    // Set initial state
    setOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])
}
