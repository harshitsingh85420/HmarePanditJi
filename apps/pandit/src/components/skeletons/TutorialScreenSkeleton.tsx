/**
 * Tutorial Screen Skeleton - For onboarding tutorial screens
 */
export function TutorialScreenSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-dvh flex flex-col bg-vedic-cream ${className}`}>
      {/* Progress indicator placeholder */}
      <div className="flex justify-center gap-2 px-6 pt-8 pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-3 h-3 bg-surface-base rounded-full" />
        ))}
      </div>
      
      {/* Illustration placeholder */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-64 h-64 bg-surface-base rounded-full animate-pulse" />
      </div>
      
      {/* Content section */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-8 bg-surface-base rounded w-3/4 mx-auto" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-5 bg-surface-base rounded w-full" />
          <div className="h-5 bg-surface-base rounded w-5/6 mx-auto" />
          <div className="h-5 bg-surface-base rounded w-4/6 mx-auto" />
        </div>
        
        {/* CTA buttons */}
        <div className="space-y-3 pt-4">
          <div className="h-14 bg-surface-base rounded-btn w-full" />
          <div className="h-14 bg-surface-base rounded-btn w-full" />
        </div>
      </div>
    </div>
  )
}
