'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'muted' | 'highlighted'
  padding?: 'default' | 'none' | 'large'
}

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'default',
}: CardProps) {
  const variantClasses = {
    default: 'bg-white shadow-card',
    muted: 'bg-vedic-cream',
    highlighted: 'bg-white shadow-card-hover',
  }

  const paddingClasses = {
    default: 'p-5',
    none: '',
    large: 'p-6',
  }

  return (
    <div className={cn(
      'rounded-card',
      variantClasses[variant],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}
