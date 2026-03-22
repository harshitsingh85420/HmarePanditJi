'use client'

interface KeyboardToggleProps {
  onClick: () => void
}

export default function KeyboardToggle({ onClick }: KeyboardToggleProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-vedic-gold text-sm py-2 px-2 min-h-[44px]"
      aria-label="Use keyboard instead"
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
      </svg>
      <span>Keyboard</span>
    </button>
  )
}
