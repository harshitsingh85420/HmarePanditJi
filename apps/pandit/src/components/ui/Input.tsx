'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

export interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'tel' | 'password' | 'number' | 'email'
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  maxLength?: number
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'error' | 'success'
  icon?: 'left' | 'right'
  iconComponent?: React.ReactNode
  onIconClick?: () => void
  name?: string
  id?: string
  required?: boolean
  autoComplete?: string
}

/**
 * Input Component
 *
 * Features:
 * - Variants: default, error, success
 * - Sizes: sm (56px), md (64px), lg (72px) - Increased for elderly users
 * - Label with proper htmlFor association
 * - Error message display with aria-describedby
 * - Icon support (left/right)
 * - Voice button integration ready
 * - Full TypeScript types
 *
 * Accessibility:
 * - Label properly associated via htmlFor
 * - Error message linked via aria-describedby
 * - Focus indicators visible
 * - Keyboard navigation support
 * - Screen reader friendly
 *
 * @example
 * <Input
 *   value={mobile}
 *   onChange={setMobile}
 *   label="Mobile Number"
 *   type="tel"
 *   placeholder="98765 43210"
 *   size="lg"
 *   icon="right"
 *   iconComponent={<VoiceIcon />}
 * />
 */
export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
  error,
  disabled = false,
  className,
  maxLength,
  autoFocus,
  size = 'md',
  variant = 'default',
  icon,
  iconComponent,
  onIconClick,
  name,
  id,
  required,
  autoComplete,
}: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = `${inputId}-error`
  const labelId = `${inputId}-label`

  // Size variants - touch targets for elderly users (≥56px, preferably 72px)
  const sizeClasses = {
    sm: 'h-14 px-4 text-lg',  // 56px - minimum acceptable
    md: 'h-16 px-4 text-xl',    // 64px - recommended
    lg: 'h-18 px-6 text-2xl',    // 72px - ideal for elderly
  }

  // Variant styles
  const variantClasses = {
    default: cn(
      'border-vedic-border',
      'focus:border-primary focus:ring-2 focus:ring-primary/25',
    ),
    error: cn(
      'border-error',
      'focus:border-error focus:ring-2 focus:ring-error/25',
    ),
    success: cn(
      'border-success',
      'focus:border-success focus:ring-2 focus:ring-success/25',
    ),
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label with proper htmlFor association */}
      {label && (
        <label
          id={labelId}
          htmlFor={inputId}
          className={cn(
            'block mb-2 font-medium',
            'text-lg text-vedic-brown',
            error && 'text-error',
          )}
        >
          {label}
          {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Input container for icon positioning */}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-labelledby={label ? labelId : undefined}
          className={cn(
            // Base styles
            'w-full rounded-btn',
            'bg-white text-vedic-brown',
            'placeholder:text-[20px] placeholder:text-vedic-gold/60',
            'transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Size classes
            sizeClasses[size],
            // Variant classes
            variantClasses[variant],
            // Border width
            'border-2',
            // Icon padding
            icon === 'left' && 'pl-12',
            icon === 'right' && 'pr-12',
          )}
        />

        {/* Left Icon */}
        {icon === 'left' && iconComponent && (
          <div
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2',
              'flex items-center justify-center',
              size === 'sm' && 'w-11 h-11',
              size === 'md' && 'w-14 h-14',
              size === 'lg' && 'w-16 h-16',
              'pl-4',
              onIconClick && 'cursor-pointer hover:opacity-80',
            )}
            onClick={onIconClick}
            role={onIconClick ? 'button' : 'presentation'}
            tabIndex={onIconClick ? 0 : -1}
            onKeyDown={onIconClick ? (e) => e.key === 'Enter' && onIconClick() : undefined}
            aria-hidden={!onIconClick}
          >
            {iconComponent}
          </div>
        )}

        {/* Right Icon */}
        {icon === 'right' && iconComponent && (
          <div
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2',
              'flex items-center justify-center',
              size === 'sm' && 'w-11 h-11',
              size === 'md' && 'w-14 h-14',
              size === 'lg' && 'w-16 h-16',
              'pr-4',
              onIconClick && 'cursor-pointer hover:opacity-80',
            )}
            onClick={onIconClick}
            role={onIconClick ? 'button' : 'presentation'}
            tabIndex={onIconClick ? 0 : -1}
            onKeyDown={onIconClick ? (e) => e.key === 'Enter' && onIconClick() : undefined}
            aria-hidden={!onIconClick}
          >
            {iconComponent}
          </div>
        )}
      </div>

      {/* Error message with aria-describedby linkage */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            'mt-2 text-base font-medium',
            variant === 'error' ? 'text-error' : 'text-error',
          )}
        >
          {error}
        </p>
      )}
    </div>
  )
}
