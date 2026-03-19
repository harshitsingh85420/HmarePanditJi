'use client'

interface SkipButtonProps {
  label?: string
  onClick: () => void
}

export default function SkipButton({ label = 'Skip करें', onClick }: SkipButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-[#9B7B52] text-[18px] font-medium hover:underline py-2 px-1 min-h-[44px] flex items-center gap-1"
    >
      {label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}
