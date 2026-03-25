'use client'

// FIX: Force client-side rendering for error page
export const dynamic = 'force-dynamic'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🙏</div>
        <h1 className="font-headline text-2xl font-bold text-primary">Kuch Gadbad Ho Gayi</h1>
        <p className="text-text-secondary font-devanagari">
          Maaf kijiye, kuch technical dikkat aa gayi. Kripya page refresh karein.
        </p>
        <button
          onClick={reset}
          className="w-full h-14 bg-primary-container text-white font-bold rounded-btn flex items-center justify-center gap-2 shadow-btn-saffron"
        >
          <span className="material-symbols-outlined">refresh</span>
          Refresh Page
        </button>
      </div>
    </div>
  )
}
