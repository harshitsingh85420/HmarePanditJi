'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TopBar } from '@/components/ui/TopBar'
import { Button } from '@/components/ui/Button'
import { SahayataBar } from '@/components/ui/SahayataBar'

export default function MicPermissionScreen() {
  const router = useRouter()

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream immediately — we just needed permission
      stream.getTracks().forEach(t => t.stop())
      // Permission granted — proceed
      router.push('/permissions/location')
    } catch (error) {
      // Permission denied
      router.push('/permissions/mic-denied')
    }
  }

  const handleTypeInstead = () => {
    // Skip mic — go directly to keyboard mode
    router.push('/permissions/location')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      <TopBar showLanguage={true} />

      <main className="flex-1 px-5 pt-6 pb-32 flex flex-col items-center">
        {/* Mic Hero Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative w-48 h-48 flex items-center justify-center mb-8"
        >
          {/* Pulse rings */}
          {[1, 1.25, 1.5].map((scale, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 bg-saffron rounded-full"
              animate={{ scale, opacity: 0 }}
              initial={{ scale: 1, opacity: 0.15 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
            />
          ))}
          
          {/* Main circle */}
          <div className="relative z-10 w-32 h-32 bg-surface-card rounded-full flex items-center justify-center shadow-card-saffron border-4 border-saffron-light">
            <span className="material-symbols-outlined text-saffron filled" style={{ fontSize: 64 }}>mic</span>
          </div>
        </motion.div>

        {/* Sound wave bars */}
        <div className="flex items-end justify-center gap-2 h-8 mb-8">
          {[6, 20, 10].map((h, i) => (
            <motion.div
              key={i}
              className="waveform-bar"
              style={{ height: h }}
            />
          ))}
        </div>

        {/* Headline */}
        <h1 className="font-devanagari text-2xl font-bold text-saffron-dark text-center mb-4">
          यह App आपकी आवाज़ से चलेगा 🎙️
        </h1>

        {/* Body */}
        <p className="text-text-secondary text-base text-center font-devanagari leading-relaxed mb-8 max-w-xs">
          Is app mein aapko kuch bhi type karne ki zaroorat nahi.
          Aap bolenge — app sunaga — sab apne aap ho jaayega.
        </p>

        {/* Demo Strip */}
        <div className="w-full bg-surface-muted rounded-card-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            {[
              { icon: 'record_voice_over', label: 'Aap bolein' },
              { icon: 'chevron_right', label: '' },
              { icon: 'hearing', label: 'App sune' },
              { icon: 'chevron_right', label: '' },
              { icon: 'check_circle', label: 'Ho gaya!' },
            ].map((item, i) => (
              item.label === '' ? (
                <span key={i} className="text-text-disabled text-sm">→</span>
              ) : (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-surface-card rounded-full flex items-center justify-center shadow-sm">
                    <span className={`material-symbols-outlined text-xl ${item.icon === 'check_circle' ? 'text-trust-green filled' : 'text-saffron'}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary font-label">{item.label}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Privacy Card */}
        <div className="w-full bg-trust-green-bg border border-trust-green-border rounded-card-sm p-4 mb-6">
          {[
            '🔒 Aapki awaaz kabhi record nahi hoti',
            '✅ Sirf tab sunta hai jab aap bol rahe hain',
            '❌ Background mein koi kaam nahi hota',
          ].map((line, i) => (
            <p key={i} className={`text-trust-green text-sm font-devanagari ${i < 2 ? 'mb-2' : ''}`}>
              {line}
            </p>
          ))}
        </div>

        {/* Info note */}
        <p className="text-text-secondary text-xs font-label italic text-center mb-6">
          Agli screen par 'Allow' ya 'Anumati dein' dabayein
        </p>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-3">
          <Button onClick={requestMicPermission} icon="arrow_forward">
            ठीक है, Microphone खोलें
          </Button>
          
          <Button variant="text" onClick={handleTypeInstead}>
            Nahi chahiye — Main type karna chahta hoon
          </Button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <SahayataBar />
      </div>
    </div>
  )
}
