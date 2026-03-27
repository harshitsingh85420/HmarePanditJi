import { cn } from '@/lib/utils'

interface SkeletonProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function IllustrationSkeleton({ size = 'md', className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-saffron-lt animate-pulse rounded-full',
        size === 'lg' && 'w-48 h-48',
        size === 'md' && 'w-32 h-32',
        size === 'sm' && 'w-20 h-20',
        className
      )}
    />
  )
}

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-surface-dim animate-pulse rounded',
            i === lines - 1 ? 'h-3 w-3/4' : 'h-4'
          )}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface-card rounded-2xl p-6 shadow-card', className)}>
      <div className="flex items-start gap-4">
        <IllustrationSkeleton size="sm" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-dim animate-pulse rounded w-3/4" />
          <div className="h-3 bg-surface-dim animate-pulse rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
