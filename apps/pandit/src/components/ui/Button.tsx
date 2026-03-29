'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'text' | 'danger-text'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
  className?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  iconComponent?: React.ReactNode
}

/**
 * Button Component
 *
 * Features:
 * - Variants: primary, secondary, ghost, danger, outline, text, danger-text
 * - Sizes: sm (48px), md (56px), lg (72px) - Increased for elderly users
 * - Responsive: w-full on mobile, auto on desktop (via fullWidth prop)
 * - Disabled state with proper opacity
 * - Loading state with spinner
 * - Full TypeScript types
 * - Text overflow protection with line-clamp
 *
 * Accessibility:
 * - Disabled state properly handled
 * - Focus indicators visible
 * - Keyboard navigation support
 * - Screen reader friendly
 * - Loading state announced
 *
 * @example
 * <Button variant="primary" size="lg" isLoading={loading}>
 *   Continue
 * </Button>
 *
 * @example
 * <Button variant="secondary" icon="arrow_forward" iconPosition="right">
 *   Next Step
 * </Button>
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = true,
  disabled = false,
  className,
  icon,
  iconPosition = 'right',
  iconComponent,
  ...props
}: ButtonProps) {
  // Size variants - touch targets for elderly users (≥56px, preferably 72px)
  const sizeClasses = {
    sm: 'min-h-[56px] px-6 text-lg',    // 56px - minimum acceptable
    md: 'min-h-[64px] px-8 text-xl',    // 64px - recommended
    lg: 'min-h-[72px] px-10 text-[20px]',     // 72px - ideal for elderly
  }

  // Variant styles
  const variantClasses = {
    primary: cn(
      'bg-saffron text-white',
      'shadow-btn-saffron',
      !disabled && 'active:bg-saffron-dark active:scale-[0.97] active:shadow-btn-saffron-pressed',
    ),
    secondary: cn(
      'bg-surface-card border-2 border-saffron text-saffron',
      'shadow-none',
      !disabled && 'active:bg-saffron-light active:scale-[0.97]',
    ),
    ghost: cn(
      'bg-transparent text-saffron',
      'shadow-none',
      !disabled && 'active:bg-saffron-light active:scale-[0.97]',
    ),
    outline: cn(
      'bg-transparent border-2 border-saffron text-saffron',
      'shadow-none',
      !disabled && 'active:bg-saffron-light active:scale-[0.97]',
    ),
    danger: cn(
      'bg-error-red text-white',
      'shadow-btn-saffron',
      !disabled && 'active:bg-error-red-dark active:scale-[0.97]',
    ),
    text: cn(
      'bg-transparent text-saffron underline-offset-2',
      'min-h-touch h-auto px-0 font-normal text-lg shadow-none',
      !disabled && 'active:opacity-70',
    ),
    'danger-text': cn(
      'bg-transparent text-text-secondary underline-offset-2',
      'min-h-touch h-auto px-0 font-normal text-lg shadow-none',
      !disabled && 'active:opacity-70',
    ),
  }

  const isDisabled = disabled || isLoading

  return (
    <motion.button
      type={props.type || 'button'}
      onClick={props.onClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.97 } as const : undefined}
      className={cn(
        // Base styles
        'flex items-center justify-center gap-2',
        'font-body font-bold rounded-btn',
        'transition-all duration-150',
        'select-none cursor-pointer',
        // Size classes
        sizeClasses[size],
        // Width
        fullWidth && 'w-full',
        // Disabled state
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // Focus styles
        !isDisabled && 'focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2',
        // Variant styles
        variantClasses[variant],
        // Additional classes
        className
      )}
      {...(props['aria-label'] && { 'aria-label': props['aria-label'] })}
      {...(props['aria-labelledby'] && { 'aria-labelledby': props['aria-labelledby'] })}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-lg flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          {iconComponent && iconPosition === 'left' && (
            <span aria-hidden="true" className="flex-shrink-0">{iconComponent}</span>
          )}
          <span className="text-center block break-words line-clamp-2 flex-1">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-lg flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          {iconComponent && iconPosition === 'right' && (
            <span aria-hidden="true" className="flex-shrink-0">{iconComponent}</span>
          )}
        </>
      )}
    </motion.button>
  )
}

function LoadingSpinner() {
  return (
    <div
      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"
      role="status"
      aria-label="Loading"
    />
  )
}

/**
 * Confirm Buttons Component
 * 
 * Paired buttons for confirmation dialogs (Yes/No, Confirm/Retry)
 * Features equal width buttons with proper spacing
 * 
 * @example
 * <ConfirmButtons
 *   onConfirm={handleConfirm}
 *   onRetry={handleRetry}
 *   confirmLabel="हाँ, सही है"
 *   retryLabel="नहीं, बदलें"
 * />
 */
export function ConfirmButtons({
  onConfirm,
  onRetry,
  confirmLabel = 'हाँ, सही है',
  retryLabel = 'नहीं, बदलें',
  confirmIcon = 'check_circle',
  retryIcon = 'refresh',
}: {
  onConfirm: () => void
  onRetry: () => void
  confirmLabel?: string
  retryLabel?: string
  confirmIcon?: string
  retryIcon?: string
}) {
  return (
    <div className="flex gap-3 w-full">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onConfirm}
        className={cn(
          'flex-1 min-h-[60px] rounded-btn',
          'bg-saffron text-white font-bold',
          'flex items-center justify-center gap-2',
          'shadow-btn-saffron',
          'focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2',
        )}
        aria-label={confirmLabel}
      >
        <span className="material-symbols-outlined text-lg filled" aria-hidden="true">
          {confirmIcon}
        </span>
        <span className="text-center break-words line-clamp-2 flex-1">{confirmLabel}</span>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className={cn(
          'flex-1 min-h-[60px] rounded-btn',
          'bg-surface-card border-2 border-saffron text-saffron font-bold',
          'flex items-center justify-center gap-2',
          'focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2',
        )}
        aria-label={retryLabel}
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          {retryIcon}
        </span>
        <span className="text-center break-words line-clamp-2 flex-1">{retryLabel}</span>
      </motion.button>
    </div>
  )
}
