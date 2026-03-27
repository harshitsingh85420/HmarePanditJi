/**
 * Card Skeleton - For tutorial cards, feature cards, etc.
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface-card rounded-2xl p-6 shadow-card animate-pulse ${className}`}>
      {/* Image placeholder */}
      <div className="w-full h-32 bg-surface-base rounded-xl mb-4" />
      
      {/* Title placeholder */}
      <div className="h-6 bg-surface-base rounded mb-2 w-3/4" />
      
      {/* Subtitle placeholder */}
      <div className="h-4 bg-surface-base rounded mb-2 w-1/2" />
      
      {/* Description lines */}
      <div className="space-y-2 mt-4">
        <div className="h-4 bg-surface-base rounded w-full" />
        <div className="h-4 bg-surface-base rounded w-5/6" />
        <div className="h-4 bg-surface-base rounded w-4/6" />
      </div>
      
      {/* CTA button placeholder */}
      <div className="h-14 bg-surface-base rounded-btn mt-6 w-full" />
    </div>
  )
}
