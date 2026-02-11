export default function PanditProfileLoading() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left — profile */}
        <div>
          {/* Header card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-6 space-y-3">
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            ))}
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — booking card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 h-fit">
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ))}
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
