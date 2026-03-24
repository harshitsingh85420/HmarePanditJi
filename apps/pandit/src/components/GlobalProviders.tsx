'use client'

import { useEffect, useState } from 'react'
import { useNetwork } from '@/hooks/useNetwork'
import { NetworkBanner } from '@/components/overlays/NetworkBanner'
import { CelebrationOverlay } from '@/components/overlays/CelebrationOverlay'
import { SessionSaveNotice } from '@/components/overlays/SessionSaveNotice'
import { useUIStore } from '@/stores/uiStore'

function InnerProviders({ children }: { children: React.ReactNode }) {
  useNetwork()
  const [isMounted, setIsMounted] = useState(false)
  const { showCelebration, showNetworkBanner } = useUIStore()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only render overlays after mount to prevent hydration issues
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <>
      {showNetworkBanner && <NetworkBanner />}
      {showCelebration && <CelebrationOverlay />}
      <SessionSaveNotice />
      {children}
    </>
  )
}

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return <InnerProviders>{children}</InnerProviders>
}
