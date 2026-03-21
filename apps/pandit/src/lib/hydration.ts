'use client'

import { useState, useEffect } from 'react'

// Hydration check hook - returns true only after component is mounted on client
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}
