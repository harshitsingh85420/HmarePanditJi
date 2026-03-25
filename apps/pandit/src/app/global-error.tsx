/**
 * Custom error page for Next.js App Router
 * 
 * IMPORTANT: Do NOT use <html> or <body> tags here.
 * The root layout already provides these, and using them here
 * causes the "<Html> should not be imported outside of pages/_document" error.
 * 
 * This is a known Next.js 14 App Router bug with static export.
 */

'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Just render the error content without <html>/<body> wrappers
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
