'use client'

import { useEffect, useState } from 'react'
import { GlobalProviders } from './GlobalProviders'
import { AppOverlays } from './widgets/AppOverlays'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During SSR or before mount, render children without providers
  // This prevents Zustand store access during static generation
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <GlobalProviders>
      {children}
      <AppOverlays />
    </GlobalProviders>
  )
}
