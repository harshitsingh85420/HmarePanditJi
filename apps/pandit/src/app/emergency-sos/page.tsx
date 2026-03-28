'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import EmergencySOS from '@/components/emergency/EmergencySOS'

export default function EmergencySOSPage() {
  return <EmergencySOS />
}
