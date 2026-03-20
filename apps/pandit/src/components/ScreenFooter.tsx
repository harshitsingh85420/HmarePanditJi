'use client'

import VoiceIndicator from './VoiceIndicator'
import KeyboardToggle from './KeyboardToggle'

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
  return (
    <footer className="px-4 pb-8 pt-4 space-y-3">
      {/* Voice + Keyboard row */}
      <div className="flex items-center justify-between min-h-[44px]">
        <VoiceIndicator isListening={isListening} />
        {onKeyboardToggle && !isListening && (
          <KeyboardToggle onClick={onKeyboardToggle} />
        )}
      </div>
      {/* CTA button(s) */}
      {children}
    </footer>
  )
}