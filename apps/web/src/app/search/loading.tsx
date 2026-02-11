export default function SearchLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 animate-pulse">
      {/* Search bar skeleton */}
      <div className="h-14 w-full max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl mb-10" />

      {/* Filter pills skeleton */}
      <div className="flex gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
        ))}
      </div>

      {/* Result cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
