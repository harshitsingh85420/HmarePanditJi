'use client'

interface KeyboardToggleProps {
  onClick: () => void
}

export default function KeyboardToggle({ onClick }: KeyboardToggleProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-saffron text-[20px] font-bold py-3 px-4 min-h-[56px] rounded-lg focus:ring-2 focus:ring-saffron focus:outline-none"
      aria-label="Use keyboard instead"
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
      </svg>
      <span>Keyboard</span>
    </button>
  )
}
