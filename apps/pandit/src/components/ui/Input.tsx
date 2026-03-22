'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'tel' | 'password' | 'number'
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  maxLength?: number
  autoFocus?: boolean
}

export function Input({
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
}: InputProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className={cn(
          'w-full h-14 px-4',
          'text-lg text-text-primary',
          'bg-surface-card border-2 rounded-btn',
          'placeholder:text-text-placeholder',
          'focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron-light',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-error-red' : 'border-border-default',
        )}
      />
      {error && (
        <p className="mt-2 text-sm text-error-red">{error}</p>
      )}
    </div>
  )
}
