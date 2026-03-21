'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'text' | 'danger-text'
  size?: 'default' | 'lg' | 'confirm'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  icon?: string
  iconPosition?: 'left' | 'right'
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  fullWidth = true,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className,
  icon,
  iconPosition = 'right',
}: ButtonProps) {
  const baseClasses = cn(
    'flex items-center justify-center gap-2',
    'font-body font-bold rounded-btn',
    'transition-all duration-150',
    'select-none cursor-pointer',
    'min-h-btn',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    fullWidth && 'w-full',
    size === 'default' && 'h-14 px-6 text-base',
    size === 'lg' && 'h-16 px-8 text-lg',
    size === 'confirm' && 'h-[60px] px-4 text-base',
  )

  const variantClasses = {
    primary: cn(
      'bg-primary-container text-white',
      'shadow-btn-saffron',
      !disabled && 'active:bg-primary active:scale-[0.97] active:shadow-btn-saffron-pressed',
    ),
    outline: cn(
      'bg-transparent border-2 border-primary-container text-primary-container',
      !disabled && 'active:bg-saffron-light active:scale-[0.97]',
    ),
    text: cn(
      'bg-transparent text-primary-container underline-offset-2',
      'min-h-touch h-auto px-0 font-normal text-sm',
      !disabled && 'active:opacity-70',
    ),
    'danger-text': cn(
      'bg-transparent text-text-secondary underline-offset-2',
      'min-h-touch h-auto px-0 font-normal text-sm',
      !disabled && 'active:opacity-70',
    ),
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-xl">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-xl">{icon}</span>
          )}
        </>
      )}
    </motion.button>
  )
}

interface ConfirmButtonsProps {
  onConfirm: () => void
  onRetry: () => void
  confirmLabel?: string
  retryLabel?: string
}

export function ConfirmButtons({
  onConfirm,
  onRetry,
  confirmLabel = 'हाँ, सही है',
  retryLabel = 'नहीं, बदलें',
}: ConfirmButtonsProps) {
  return (
    <div className="flex gap-3 w-full">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onConfirm}
        className={cn(
          'flex-1 h-[60px] rounded-btn',
          'bg-primary-container text-white font-bold',
          'flex items-center justify-center gap-2',
          'shadow-btn-saffron',
        )}
      >
        <span className="material-symbols-outlined text-lg filled">check_circle</span>
        <span>{confirmLabel}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className={cn(
          'flex-1 h-[60px] rounded-btn',
          'bg-surface-card border-2 border-border-default text-text-primary font-bold',
          'flex items-center justify-center gap-2',
        )}
      >
        <span className="material-symbols-outlined text-lg">restart_alt</span>
        <span>{retryLabel}</span>
      </motion.button>
    </div>
  )
}
