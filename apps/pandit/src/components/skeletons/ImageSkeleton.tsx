/**
 * Image Skeleton - For images, illustrations, profile pictures
 */
export function ImageSkeleton({
  className = '',
  variant = 'square',
}: {
  className?: string
  variant?: 'square' | 'circle' | 'wide' | 'portrait'
}) {
  const variantMap = {
    square: 'aspect-square',
    circle: 'aspect-square rounded-full',
    wide: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }

  return (
    <div
      className={`bg-surface-base animate-pulse ${variantMap[variant]} ${className}`}
    />
  )
}
