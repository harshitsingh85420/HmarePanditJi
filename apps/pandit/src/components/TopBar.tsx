'use client'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
}

export default function TopBar({ showBack = false, onBack, onLanguageChange }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 h-16 bg-vedic-cream border-b border-vedic-border sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="min-w-[52px] min-h-[52px] flex items-center justify-center text-vedic-gold rounded-full active:bg-vedic-gold/10"
            aria-label="Go back"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
        className="min-w-[64px] min-h-[64px] rounded-full bg-primary-lt/20 border-2 border-primary/30 active:bg-primary/30 flex items-center justify-center"
        aria-label="भाषा बदलें"
      >
        <span className="text-[32px]">🌐</span>
      </button>
    </header>
  )
}
