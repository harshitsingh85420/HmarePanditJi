'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'muted' | 'highlighted'
  padding?: 'default' | 'none' | 'large' | 'responsive'
  clickable?: boolean
  onClick?: () => void
  role?: string
  ariaLabel?: string
}

/**
 * Card Component
 * 
 * Features:
 * - Variants: default, elevated, outlined, muted, highlighted
 * - Padding: default, none, large, responsive (p-4 xs:p-6 sm:p-8)
 * - Clickable option with proper semantics
 * - Full TypeScript types
 * 
 * Accessibility:
 * - Semantic HTML (article or button when clickable)
 * - Proper ARIA roles and labels
 * - Keyboard navigation when clickable
 * - Focus indicators visible
 * 
 * @example
 * <Card variant="elevated" padding="responsive">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 * 
 * @example
 * <Card clickable onClick={handleClick} ariaLabel="Select this option">
 *   <p>Clickable card content</p>
 * </Card>
 */
export function Card({
  children,
  className,
  variant = 'default',
  padding = 'default',
  clickable = false,
  onClick,
  role,
  ariaLabel,
}: CardProps) {
  // Variant styles
  const variantClasses = {
    default: 'bg-white shadow-card',
    elevated: 'bg-white shadow-card-hover',
    outlined: 'bg-transparent border-2 border-vedic-border shadow-none',
    muted: 'bg-vedic-cream border-none shadow-none',
    highlighted: 'bg-white shadow-card-hover border-2 border-primary/30',
  }

  // Padding classes with responsive option
  const paddingClasses = {
    default: 'p-5',
    none: '',
    large: 'p-6',
    responsive: 'p-4 xs:p-6 sm:p-8',
  }

  // Clickable styles
  const clickableClasses = clickable
    ? 'cursor-pointer transition-all duration-150 active:scale-[0.98] hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
    : ''

  // Determine the element type based on clickable prop
  const Element = clickable ? 'button' : 'div'

  return (
    <Element
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      role={role || (clickable ? 'button' : 'article')}
      aria-label={ariaLabel}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={cn(
        // Base styles
        'rounded-card',
        'transition-shadow duration-200',
        // Variant
        variantClasses[variant],
        // Padding
        paddingClasses[padding],
        // Clickable
        clickableClasses,
        // Additional classes
        className
      )}
    >
      {children}
    </Element>
  )
}

/**
 * Card Header Component
 * For consistent card header styling
 */
export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-4',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Card Title Component
 * For consistent card title styling
 */
export function CardTitle({
  children,
  className,
  as: Component = 'h3',
}: {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}) {
  return (
    <Component
      className={cn(
        'text-xl font-bold text-vedic-brown',
        className
      )}
    >
      {children}
    </Component>
  )
}

/**
 * Card Description Component
 * For consistent card description styling
 */
export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'text-base text-text-secondary',
        className
      )}
    >
      {children}
    </p>
  )
}

/**
 * Card Content Component
 * For consistent card content styling
 */
export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Card Footer Component
 * For consistent card footer styling
 */
export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mt-4 pt-4 border-t border-vedic-border',
        className
      )}
    >
      {children}
    </div>
  )
}
