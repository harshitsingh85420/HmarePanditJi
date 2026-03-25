'use client'

import { useState } from 'react'
import { EmergencySOSFloating } from '@/components/widgets/EmergencySOSFloating'
import { LanguageChangeWidget } from '@/components/widgets/LanguageChangeWidget'
import type { SupportedLanguage } from '@/components/widgets/LanguageChangeWidget'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('Hindi')

  const handleLanguageChange = (language: SupportedLanguage) => {
    setCurrentLanguage(language)
    console.log('[DashboardLayout] Language changed to:', language)
  }

  return (
    <div className="min-h-dvh bg-surface-base relative">
      {children}
      {/* Global Language Change Widget - Floating button for easy language switching */}
      <LanguageChangeWidget
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
      {/* Emergency SOS Floating Button - Always accessible for safety */}
      <EmergencySOSFloating isVisible={true} />
    </div>
  )
}
