'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import EmergencySOS from '@/components/emergency/EmergencySOS'

// /emergency is the route the floating SOS widget pushes to, and
// /emergency-sos is the same screen reached from the menu. Canon has ONE
// आपातकाल · SOS artboard (frame 33), so both routes render the one
// canon-exact component — a second, drifting copy of a SAFETY screen is
// exactly how a pandit ends up on the un-updated one in a real emergency.
export default function EmergencyPage() {
  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { setSection } = useSafeNavigationStore()

  useEffect(() => {
    setSection('emergency-sos')
  }, [setSection])

  return <EmergencySOS />
}
