'use client'
import { useRouter } from 'next/navigation'

export default function LocationPermissionPlaceholder() {
  const router = useRouter()
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base gap-4 px-5">
      <div className="text-5xl">🪔</div>
      <h1 className="font-serif text-xl font-bold text-saffron-dark text-center">
        Location Permission — Coming Soon
      </h1>
      <button onClick={() => router.push('/permissions/notifications')} className="text-saffron underline text-sm">
        Skip to Notifications →
      </button>
    </div>
  )
}
