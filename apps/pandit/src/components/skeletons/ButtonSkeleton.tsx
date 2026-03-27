/**
 * Button Skeleton - For CTA buttons, action buttons
 */
export function ButtonSkeleton({
  className = '',
  size = 'default',
}: {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}) {
  const sizeMap = {
    sm: 'h-10',
    default: 'h-14',
    lg: 'h-16',
  }

  return (
    <div
      className={`bg-surface-base animate-pulse rounded-btn w-full ${sizeMap[size]} ${className}`}
    />
  )
}
