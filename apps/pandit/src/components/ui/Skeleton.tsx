'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs))
}

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Skeleton Component
 * 
 * Loading placeholder for elderly-friendly UI.
 * Uses larger sizes and gentle animations.
 * 
 * Variants:
 * - text: For text content (lines)
 * - circular: For avatars/images
 * - rectangular: For cards/content blocks
 * - rounded: For rounded rectangles
 * 
 * @example
 * <Skeleton variant="text" width="100%" height={24} />
 * 
 * @example
 * <Skeleton variant="circular" width={64} height={64} />
 */
export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-btn',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const style: React.CSSProperties = {}
  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height
  }

  return (
    <div
      className={cn(
        'bg-surface-container-lowest',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  )
}

/**
 * Skeleton Text Component
 * 
 * Pre-configured skeleton for text content.
 * Automatically generates multiple lines for paragraphs.
 * 
 * @example
 * <SkeletonText lines={3} />
 */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 && lines > 1 ? '60%' : '100%'}
          height={24}
          className={index === lines - 1 && lines > 1 ? 'ml-auto' : ''}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton Card Component
 * 
 * Pre-configured skeleton for card content.
 * Includes image placeholder, title, and content lines.
 * 
 * @example
 * <SkeletonCard />
 */
export function SkeletonCard() {
  return (
    <div className="w-full p-4 bg-surface-card rounded-2xl space-y-4">
      <Skeleton variant="rounded" width="100%" height={160} />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width="80" height={40} />
        <Skeleton variant="rounded" width="80" height={40} />
      </div>
    </div>
  )
}

export default Skeleton
