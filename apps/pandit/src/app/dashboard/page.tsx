'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRegistrationStore } from '@/stores/registrationStore'
import { speakWithSarvam } from '@/lib/sarvam-tts'

export default function DashboardPage() {
  const router = useRouter()
  const { data } = useRegistrationStore()

  // BUG-013 FIX: Check if registration is complete, redirect if not
  useEffect(() => {
    const isRegistrationComplete =
      data.mobile && data.mobile.length === 10 &&
      data.otp && data.otp.length === 6 &&
      data.name && data.name.trim().length >= 3

    if (!isRegistrationComplete) {
      void speakWithSarvam({
        text: 'आपका पंजीकरण अधूरा है। कृपया पंजीकरण पूरा करें।',
        languageCode: 'hi-IN',
      })
      router.push('/mobile')
    }
  }, [data.mobile, data.otp, data.name, router])

  // If registration is incomplete, show loading state while redirecting
  const isRegistrationComplete =
    data.mobile && data.mobile.length === 10 &&
    data.otp && data.otp.length === 6 &&
    data.name && data.name.trim().length >= 3

  if (!isRegistrationComplete) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="text-2xl font-bold text-text-saffron mb-4">
          पंजीकरण जांच रहे हैं...
        </h1>
        <p className="text-text-secondary">
          कृपया प्रतीक्षा करें
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">🏠</div>
      <h1 className="text-2xl font-bold text-text-saffron mb-2">
        स्वागत है, {data.name.split(' ')[0]} जी!
      </h1>
      <p className="text-text-secondary mb-8">
        आपका पंजीकरण सफलतापूर्वक पूरा हो गया है
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div className="bg-surface-card rounded-card p-6 shadow-card">
          <h2 className="text-lg font-bold text-text-saffron mb-4">
            आपकी प्रोफाइल
          </h2>
          <div className="space-y-2 text-lg text-text-secondary">
            <div className="flex justify-between">
              <span>नाम:</span>
              <span className="font-bold text-text-saffron">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span>मोबाइल:</span>
              <span className="font-bold text-text-saffron">{data.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span>शहर:</span>
              <span className="font-bold text-text-saffron">{data.city || 'Not set'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            void speakWithSarvam({
              text: 'जल्द ही नई सुविधाएं उपलब्ध होंगी।',
              languageCode: 'hi-IN',
            })
          }}
          className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97]"
        >
          जल्द आ रहा है 🚧
        </button>
      </div>
    </div>
  )
}
