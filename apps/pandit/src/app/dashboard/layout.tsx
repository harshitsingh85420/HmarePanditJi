'use client'

import { EmergencySOSFloating } from '@/components/widgets/EmergencySOSFloating'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-surface-base relative">
      {children}
      {/* No floating language switcher (founder law): language changes from
          Settings → भाषा only. Guarded by noFloatingLanguage.test.ts. */}
      {/* Emergency SOS Floating Button - Always accessible for safety */}
      <EmergencySOSFloating isVisible={true} />
    </div>
  )
}
