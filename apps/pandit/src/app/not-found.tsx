/**
 * Not Found page for App Router
 * Displayed when a route is not found (404)
 */
'use client'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🙏</div>
        <h1 className="font-headline text-2xl font-bold text-primary">Page Nahi Mila</h1>
        <p className="text-text-secondary font-devanagari">
          Maaf kijiye, aap dhund rahe page nahi mila.
        </p>
        <a
          href="/"
          className="w-full h-14 bg-primary-container text-white font-bold rounded-btn flex items-center justify-center gap-2 shadow-btn-saffron"
        >
          <span className="material-symbols-outlined">home</span>
          Home Par Jayein
        </a>
      </div>
    </div>
  )
}
