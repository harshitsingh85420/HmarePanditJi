export default function RootLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 animate-pulse">
      {/* Hero skeleton */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-20">
        <div className="lg:w-1/2 space-y-4">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="space-y-3">
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-10 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="flex gap-4 mt-4">
            <div className="h-12 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-12 w-36 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800"
          >
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 mb-5" />
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3 w-4/6 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
