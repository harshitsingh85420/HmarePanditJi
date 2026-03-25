'use client'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
}

export default function TopBar({ showBack = false, onBack, onLanguageChange }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 h-[72px] bg-surface-base border-b border-outline-variant sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="min-w-[64px] min-h-[64px] flex items-center justify-center text-saffron rounded-full active:bg-saffron/10 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Go back"
          >
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[32px] text-saffron font-bold">ॐ</span>
          <span className="text-[20px] font-bold text-text-primary">HmarePanditJi</span>
        </div>
      </div>
      <button
        onClick={onLanguageChange}
        className="min-h-[64px] px-6 flex items-center gap-2 text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"
        aria-label="Language switcher"
      >
        <span>हिन्दी / English</span>
      </button>
    </header>
  )
}
