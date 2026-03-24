'use client'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
}

export default function TopBar({ showBack = false, onBack, onLanguageChange }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 h-16 bg-surface-base border-b border-outline-variant sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center text-saffron rounded-full active:bg-saffron/10 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Go back"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xl text-saffron font-bold">ॐ</span>
          <span className="text-lg font-semibold text-text-primary">HmarePanditJi</span>
        </div>
      </div>
      <button
        onClick={onLanguageChange}
        className="min-w-[56px] min-h-[56px] rounded-full bg-saffron-lt/20 border-2 border-saffron/30 active:bg-saffron/30 flex items-center justify-center focus:ring-2 focus:ring-primary focus:outline-none"
        aria-label="भाषा बदलें"
      >
        <span className="text-[32px]">🌐</span>
      </button>
    </header>
  )
}
