'use client'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-vedic-cream flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">🏠</div>
      <h1 className="text-2xl font-bold text-vedic-brown mb-4">
        आपकी Registration अधूरी है।
      </h1>
      <div className="w-full max-w-sm">
        <a
          href="/mobile"
          className="flex items-center justify-center h-16 w-full bg-primary text-white text-xl font-bold rounded-btn shadow-cta"
        >
          Registration शुरू करें →
        </a>
      </div>
    </div>
  )
}
