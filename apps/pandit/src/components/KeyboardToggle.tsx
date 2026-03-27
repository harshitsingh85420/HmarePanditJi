'use client'

interface KeyboardToggleProps {
  onClick: () => void
  className?: string
  label?: string
}

/**
 * KeyboardToggle Component
 * 
 * Features:
 * - Toggle between voice and keyboard input
 * - Large touch target (64px height) for elderly users
 * - Clear icon and text label
 * 
 * Accessibility:
 * - aria-label for screen readers
 * - Focus indicators visible
 * - Keyboard navigation support
 * - Icon marked as aria-hidden (decorative)
 * 
 * @example
 * <KeyboardToggle onClick={handleToggleKeyboard} />
 */
export default function KeyboardToggle({
  onClick,
  className,
  label = 'Keyboard',
}: KeyboardToggleProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Use keyboard instead of voice input"
      className={`
        flex items-center gap-2 
        text-saffron text-[20px] font-bold 
        py-3 px-4 
        min-h-[64px] min-w-[64px]
        rounded-lg 
        focus:ring-2 focus:ring-saffron focus:outline-none focus:ring-offset-2
        active:opacity-80
        transition-opacity
        ${className || ''}
      `}
    >
      {/* Icon marked as aria-hidden since it's decorative */}
      <svg 
        width="24" 
        height="24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
      </svg>
      <span>{label}</span>
    </button>
  )
}
