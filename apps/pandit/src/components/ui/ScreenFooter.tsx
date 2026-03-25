'use client'

import VoiceIndicator from './VoiceIndicator'
import KeyboardToggle from './KeyboardToggle'

interface ScreenFooterProps {
  isListening?: boolean
  onKeyboardToggle?: () => void
  children: React.ReactNode
}

export default function ScreenFooter({
  isListening = false,
  onKeyboardToggle,
  children,
}: ScreenFooterProps) {
  return (
    <footer className="px-4 pb-8 pt-4 space-y-3">
      <div className="flex items-center justify-between min-h-[44px]">
        <VoiceIndicator isListening={isListening} />
        {onKeyboardToggle && !isListening && (
          <KeyboardToggle onClick={onKeyboardToggle} />
        )}
      </div>
      {children}
    </footer>
  )
}
