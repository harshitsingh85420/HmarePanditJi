'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { SessionTimeoutSheet } from '@/components/overlays/SessionTimeout'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  useSession()
  const { showSessionTimeout, showSessionSaveNotice } = useUIStore()
  const { data } = useRegistrationStore()

  // Fix hydration: Only render LanguageBottomSheet after mount
  const [isMounted, setIsMounted] = useState(false)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLanguageChange = () => {
    setShowLanguageSheet(true)
  }

  const handleLanguageSelect = (language: SupportedLanguage) => {
    setShowLanguageSheet(false)
    // Language change will be handled by the store
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative">
      {/* Top Bar with Language Globe - Available on ALL registration screens */}
      <header className="sticky top-0 z-50 bg-surface-base border-b border-vedic-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-primary">ॐ</span>
            <span className="text-lg font-semibold text-vedic-brown">HmarePanditJi</span>
          </div>
          <button
            onClick={handleLanguageChange}
            className="w-10 h-10 flex items-center justify-center text-vedic-gold hover:bg-black/5 rounded-full transition-colors active:scale-95"
            aria-label="Change language"
          >
            🌐
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Session Timeout */}
      {showSessionTimeout && <SessionTimeoutSheet />}

      {/* Language Bottom Sheet - Only render after mount to prevent hydration errors */}
      {isMounted && (
        <LanguageBottomSheet
          isOpen={showLanguageSheet}
          currentLanguage={data.language as SupportedLanguage}
          onSelect={handleLanguageSelect}
          onClose={() => setShowLanguageSheet(false)}
        />
      )}
    </div>
  )
}
