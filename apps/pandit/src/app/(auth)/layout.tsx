'use client'

import { useState } from 'react'
import { LanguageChangeWidget } from '@/components/widgets/LanguageChangeWidget'
import { EmergencySOSFloating } from '@/components/widgets/EmergencySOSFloating'
import type { SupportedLanguage } from '@/components/widgets/LanguageChangeWidget'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('Hindi')

  const handleLanguageChange = (language: SupportedLanguage) => {
    setCurrentLanguage(language)
    console.log('[AuthLayout] Language changed to:', language)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative">
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
