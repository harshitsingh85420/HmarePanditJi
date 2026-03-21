'use client'

import { useState, useEffect } from 'react'

// Hook to check if component is mounted (client-side)
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}

// Safe store accessor - only accesses store after mounting
export function useStoreSafe<T>(storeAccessor: () => T, fallback: T): T {
  const isMounted = useIsMounted()

  if (!isMounted) {
    return fallback
  }

  return storeAccessor()
}
