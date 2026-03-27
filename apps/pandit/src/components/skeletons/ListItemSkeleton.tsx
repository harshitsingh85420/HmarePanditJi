/**
 * List Item Skeleton - For lists, bookings, services, etc.
 */
export function ListItemSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-surface-card rounded-xl animate-pulse">
          {/* Image/icon placeholder */}
          <div className="w-12 h-12 bg-surface-base rounded-full flex-shrink-0" />
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-surface-base rounded w-3/4" />
            <div className="h-4 bg-surface-base rounded w-1/2" />
          </div>
          
          {/* Action button placeholder */}
          <div className="w-10 h-10 bg-surface-base rounded-full" />
        </div>
      ))}
    </div>
  )
}
