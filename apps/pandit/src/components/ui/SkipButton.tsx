'use client'

interface SkipButtonProps {
  label?: string
  onClick: () => void
  className?: string
}

/**
 * SkipButton Component
 * 
 * Features:
 * - Minimal skip button for onboarding/tutorial flows
 * - Large touch target (64px height) for elderly users
 * - Subtle design to not distract from main CTA
 * 
 * Accessibility:
 * - aria-label for screen readers
 * - Focus indicators visible
 * - Keyboard navigation support
 * 
 * @example
 * <SkipButton onClick={handleSkip} />
 * 
 * @example
 * <SkipButton label="बाद में करें" onClick={handleSkipLater} />
 */
export default function SkipButton({
  label = 'Skip करें →',
  onClick,
  className,
}: SkipButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Skip this step and continue"
      className={`
        text-saffron text-base font-normal 
        py-2 px-1 min-h-[64px] min-w-[64px]
        flex items-center justify-center
        focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2
        active:opacity-70
        transition-opacity
        ${className || ''}
      `}
    >
      {label}
    </button>
  )
}
