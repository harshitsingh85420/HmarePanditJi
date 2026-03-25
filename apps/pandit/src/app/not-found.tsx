'use client'

// FIX: Force client-side rendering for not-found page
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base px-6">
      <div className="text-center space-y-8 max-w-md w-full">
        <div className="text-[80px]">🙏</div>
        <h1 className="font-headline text-[36px] font-bold text-saffron font-devanagari">
          यह पेज नहीं मिला
        </h1>
        <p className="text-text-secondary text-[24px] font-devanagari leading-relaxed">
          जो पेज आप देखना चाहते हैं वह यहाँ नहीं है।
        </p>
        <a
          href="/"
          className="w-full min-h-[72px] bg-saffron text-white text-[28px] font-bold rounded-2xl flex items-center justify-center gap-3 shadow-btn-saffron active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[32px]">home</span>
          <span className="font-devanagari">वापस होम जाएं</span>
        </a>
      </div>
    </div>
  )
}
