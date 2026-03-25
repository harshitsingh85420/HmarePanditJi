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
    'flex items-center justify-center gap-2 rounded-btn font-bold text-xl',
    'transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
    'min-h-[72px] min-w-[72px]',  // ELDERLY ACCESSIBILITY: 72px minimum touch target
    fullWidth ? 'w-full' : 'px-8',
    height === 'tall' ? 'h-[72px]' : 'h-16',
  ]

  const variantClass: Record<string, string> = {
    'primary': 'bg-primary text-white shadow-cta',
    'primary-dk': 'bg-primary-dk text-white shadow-cta-dk',
    'secondary': 'bg-white text-primary border-2 border-primary',
    'ghost': 'bg-transparent text-vedic-gold text-base font-normal h-11',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={[...baseClass, variantClass[variant]].join(' ')}
      aria-label={label}
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
