'use client'
import { useRouter } from 'next/navigation'

export default function CompletePlaceholder() {
  const router = useRouter()
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base gap-4 px-5">
      <div className="text-5xl">🪔</div>
      <h1 className="font-serif text-xl font-bold text-saffron-dark text-center">
        Registration Complete — Coming Soon
      </h1>
      <button onClick={() => router.push('/')} className="text-saffron underline text-sm">
        Go to Home →
      </button>
    </div>
  )
}
