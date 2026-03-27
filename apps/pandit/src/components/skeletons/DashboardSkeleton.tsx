/**
 * Dashboard Skeleton - For main dashboard/homepage
 */
export function DashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-dvh flex flex-col bg-surface-base ${className}`}>
      {/* Top bar placeholder */}
      <div className="sticky top-0 z-50 bg-surface-base border-b-2 border-saffron/30">
        <div className="flex items-center justify-between px-6 h-[72px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-surface-base rounded-full" />
            <div className="h-6 bg-surface-base rounded w-32" />
          </div>
          <div className="w-16 h-16 bg-surface-base rounded-full" />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Welcome section */}
        <div className="space-y-3">
          <div className="h-8 bg-surface-base rounded w-3/4" />
          <div className="h-5 bg-surface-base rounded w-1/2" />
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-surface-card rounded-2xl" />
          <div className="h-24 bg-surface-card rounded-2xl" />
        </div>
        
        {/* Quick actions */}
        <div className="space-y-3">
          <div className="h-5 bg-surface-base rounded w-1/3" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-surface-card rounded-xl" />
            <div className="h-20 bg-surface-card rounded-xl" />
            <div className="h-20 bg-surface-card rounded-xl" />
          </div>
        </div>
        
        {/* Recent activity list */}
        <div className="space-y-3">
          <div className="h-5 bg-surface-base rounded w-1/3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-surface-card rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom navigation placeholder */}
      <div className="sticky bottom-0 bg-surface-base border-t-2 border-saffron/30">
        <div className="flex justify-around px-6 h-[72px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-12 h-12 bg-surface-base rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
