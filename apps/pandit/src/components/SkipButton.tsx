'use client'

interface SkipButtonProps {
  label?: string
  onClick: () => void
}

export default function SkipButton({ label = 'Skip करें →', onClick }: SkipButtonProps) {
  return (
    <button
      onClick={onClick}
      // CRITICAL FIX: Increased from 44px to 64px for elderly accessibility
      className="text-vedic-gold text-base font-normal py-2 px-1 min-h-[64px] flex items-center focus:ring-2 focus:ring-primary focus:outline-none"
    >
      {label}
    </button>
  )
}
