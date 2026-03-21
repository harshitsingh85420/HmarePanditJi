'use client'

import { useEffect } from 'react'
import { useNetwork } from '@/hooks/useNetwork'
import { NetworkBanner } from '@/components/overlays/NetworkBanner'
import { CelebrationOverlay } from '@/components/overlays/CelebrationOverlay'
import { useUIStore } from '@/stores/uiStore'
import { saveRegistrationToStorage, useRegistrationStore } from '@/stores/registrationStore'
import { saveVoicePreferencesToStorage, useVoiceStore } from '@/stores/voiceStore'

function InnerProviders({ children }: { children: React.ReactNode }) {
  useNetwork()

  const { showCelebration, showNetworkBanner, isOnline, celebrationStepName } = useUIStore()

  // Auto-save to localStorage when state changes
  useEffect(() => {
    const unsubscribeRegistration = useRegistrationStore.subscribe(() => {
      saveRegistrationToStorage()
    })
    const unsubscribeVoice = useVoiceStore.subscribe(() => {
      saveVoicePreferencesToStorage()
    })

    return () => {
      unsubscribeRegistration()
      unsubscribeVoice()
    }
  }, [])

  return (
    <>
      {/* Network Banner — always at top, non-blocking */}
      {showNetworkBanner && <NetworkBanner isOnline={isOnline} />}

      {/* Celebration Overlay — appears over any screen */}
      {showCelebration && <CelebrationOverlay stepName={celebrationStepName} />}

      {/* Main content */}
      {children}
    </>
  )
}

export default function GlobalProviders({ children }: { children: React.ReactNode }) {
  return <InnerProviders>{children}</InnerProviders>
}
