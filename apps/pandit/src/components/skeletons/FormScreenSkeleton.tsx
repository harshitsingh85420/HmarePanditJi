/**
 * Form Screen Skeleton - For registration forms, profile screens, etc.
 */
export function FormScreenSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-dvh flex flex-col bg-surface-base p-6 ${className}`}>
      {/* Header placeholder */}
      <div className="mb-8">
        <div className="h-8 bg-surface-base rounded mb-2 w-2/3" />
        <div className="h-5 bg-surface-base rounded w-1/2" />
      </div>
      
      {/* Form fields */}
      <div className="flex-1 space-y-6">
        {/* Field 1 */}
        <div className="space-y-2">
          <div className="h-4 bg-surface-base rounded w-1/3" />
          <div className="h-14 bg-surface-base rounded-xl w-full" />
        </div>
        
        {/* Field 2 */}
        <div className="space-y-2">
          <div className="h-4 bg-surface-base rounded w-1/3" />
          <div className="h-14 bg-surface-base rounded-xl w-full" />
        </div>
        
        {/* Field 3 */}
        <div className="space-y-2">
          <div className="h-4 bg-surface-base rounded w-1/3" />
          <div className="h-14 bg-surface-base rounded-xl w-full" />
        </div>
      </div>
      
      {/* CTA button placeholder */}
      <div className="h-14 bg-surface-base rounded-btn mt-8 w-full" />
      
      {/* Helper text placeholder */}
      <div className="h-4 bg-surface-base rounded mt-4 w-3/4 self-center" />
    </div>
  )
}
