'use client'

interface SkipButtonProps {
  label?: string
  onClick: () => void
}

export default function SkipButton({ label = 'Skip करें →', onClick }: SkipButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-vedic-gold text-base font-normal py-2 px-1 min-h-[44px] flex items-center"
    >
      {label}
    </button>
  )
}
