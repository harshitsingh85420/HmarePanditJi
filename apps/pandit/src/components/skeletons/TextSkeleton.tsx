/**
 * Text Skeleton - For paragraphs, headings, etc.
 */
export function TextSkeleton({
  lines = 3,
  className = '',
  variant = 'body',
}: {
  lines?: number
  className?: string
  variant?: 'title' | 'subtitle' | 'body' | 'caption'
}) {
  const heightMap = {
    title: 'h-8',
    subtitle: 'h-6',
    body: 'h-5',
    caption: 'h-4',
  }

  const widthMap = {
    title: 'w-3/4',
    subtitle: 'w-1/2',
    body: 'w-full',
    caption: 'w-2/3',
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-surface-base rounded animate-pulse ${heightMap[variant]} ${
            i === lines - 1 ? widthMap[variant] : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}
