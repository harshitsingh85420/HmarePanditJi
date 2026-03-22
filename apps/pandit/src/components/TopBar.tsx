'use client'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
}

export default function TopBar({ showBack = false, onBack, onLanguageChange }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 h-14 bg-vedic-cream border-b border-vedic-border sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="w-10 h-14 flex items-center justify-center text-vedic-gold"
            aria-label="Go back"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xl text-primary font-bold">ॐ</span>
          <span className="text-lg font-semibold text-vedic-brown">HmarePanditJi</span>
        </div>
      </div>
      <button
        onClick={onLanguageChange}
        className="w-14 h-14 flex items-center justify-center text-vedic-gold"
        aria-label="Change language"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 000 20" />
          <path d="M2 12h20" />
        </svg>
      </button>
    </header>
  )
}
