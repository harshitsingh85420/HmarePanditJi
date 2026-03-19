'use client'

interface CTAButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'primary-dk' | 'secondary' | 'ghost'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  height?: 'normal' | 'tall'
}

export default function CTAButton({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  height = 'normal',
}: CTAButtonProps) {
  const baseClass = [
    'flex items-center justify-center gap-2 rounded-xl font-bold text-[18px]',
    'transition-all active:scale-[0.98] active:ring-4 active:ring-[#F09942]/20 disabled:opacity-60 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : 'px-8',
    height === 'tall' ? 'h-[72px]' : 'h-16',
  ]

  const variantClass: Record<string, string> = {
    'primary': 'bg-[#F09942] text-white shadow-[0_4px_12px_rgba(240,153,66,0.35)] hover:opacity-90',
    'primary-dk': 'bg-[#DC6803] text-white shadow-[0_6px_20px_rgba(220,104,3,0.45)] hover:opacity-90',
    'secondary': 'bg-white text-[#F09942] border-2 border-[#F09942] hover:bg-[#F09942]/5 transition-colors',
    'ghost': 'bg-transparent text-[#9B7B52] text-base font-normal h-11',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={[...baseClass, variantClass[variant]].join(' ')}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : label}
    </button>
  )
}
