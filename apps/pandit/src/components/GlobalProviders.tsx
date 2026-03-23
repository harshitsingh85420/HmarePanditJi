'use client'

import { useEffect } from 'react'
import { useNetwork } from '@/hooks/useNetwork'
import { NetworkBanner } from '@/components/overlays/NetworkBanner'
import { CelebrationOverlay } from '@/components/overlays/CelebrationOverlay'
import { SessionSaveNotice } from '@/components/overlays/SessionSaveNotice'
import { useUIStore } from '@/stores/uiStore'

function InnerProviders({ children }: { children: React.ReactNode }) {
  useNetwork()

  const { showCelebration, showNetworkBanner } = useUIStore()

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
