'use client'

import { useState, useEffect } from 'react'
import VoiceIndicator from './VoiceIndicator'
import KeyboardToggle from './KeyboardToggle'
import { setManualMicOff, getManualMicOff } from '@/lib/voice-engine'

interface ScreenFooterProps {
  isListening?: boolean
  onKeyboardToggle?: () => void
  children: React.ReactNode  // The CTA button(s) go here
}

export default function ScreenFooter({
  isListening = false,
  onKeyboardToggle,
  children,
}: ScreenFooterProps) {
  const [isMicOff, setIsMicOff] = useState(false)

  useEffect(() => {
    // Sync with global mic state on mount
    setIsMicOff(getManualMicOff())

    // P1 FIX: Also sync when isListening changes (mic state sync issue)
    if (isListening && isMicOff) {
      setIsMicOff(false)
      setManualMicOff(false)
    }
  }, [isListening, isMicOff])

  const toggleMic = () => {
    const newState = !isMicOff
    setIsMicOff(newState)
    setManualMicOff(newState)
  }

  const showAssistiveRow = isListening || Boolean(onKeyboardToggle) || isMicOff

  return (
    <footer className="px-4 pb-8 pt-4 space-y-3">
      {showAssistiveRow && (
        <div className="flex items-center justify-between min-h-[44px]">
          <div className="flex items-center gap-3">
            {isListening && <VoiceIndicator isListening={isListening} />}
            {isMicOff && (
              <div className="flex items-center gap-1.5 text-error text-lg font-medium">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                  <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <span>Mic Off</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onKeyboardToggle && !isListening && (
              <KeyboardToggle onClick={onKeyboardToggle} />
            )}
            {/* Mic Off Toggle Button - Always accessible */}
            <button
              type="button"
              onClick={toggleMic}
              aria-label={isMicOff ? 'Turn microphone on' : 'Turn microphone off'}
              className={`flex items-center gap-1 text-lg py-3 px-2 min-h-[44px] rounded-lg transition-colors ${isMicOff
                ? 'bg-error/10 text-error'
                : 'bg-vedic-border/20 text-saffron'
                }`}
            >
              {isMicOff ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                  <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
      {/* CTA button(s) */}
      {children}
    </footer>
  )
}
