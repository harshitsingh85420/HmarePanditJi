'use client'

import VoiceIndicator from './VoiceIndicator'

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
          <button
            onClick={onKeyboardToggle}
            className="flex items-center gap-1 text-[#9B7B52] text-sm py-2 px-2 min-h-[44px]"
            aria-label="Use keyboard instead"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
            </svg>
            <span>Keyboard</span>
          </button>
        )}
      </div>
      {children}
    </footer>
  )
}
