'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { TopBar } from '@/components/ui/TopBar'
import { Button } from '@/components/ui/Button'
import { SahayataBar } from '@/components/ui/SahayataBar'

export default function MicDeniedScreen() {
  const router = useRouter()
  const [showGuide, setShowGuide] = useState(false)

  const handleTypeRegistration = () => {
    router.push('/permissions/location')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      <TopBar showLanguage={true} />

      <main className="flex-1 px-5 pt-6 pb-32 flex flex-col items-center">
        {/* Keyboard Hero */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-saffron/10 rounded-2xl blur-3xl scale-150" />
          <div className="relative bg-surface-card p-6 rounded-2xl shadow-card border border-border-default rotate-3">
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['क', 'ख', 'ग', 'घ', 'ङ', 'च'].map((letter, i) => (
                <div key={i} className="w-10 h-10 bg-surface-muted rounded-lg flex items-center justify-center
                                       font-devanagari font-bold text-saffron-dark text-lg">
                  {letter}
                </div>
              ))}
            </div>
            <span className="material-symbols-outlined text-saffron text-4xl block text-center">keyboard</span>
          </div>
        </motion.div>

        {/* Headline — NEVER say "denied" */}
        <h1 className="font-devanagari text-2xl font-bold text-saffron-dark text-center mb-4">
          कोई बात नहीं! 🙏
        </h1>

        {/* Body */}
        <p className="text-text-secondary text-base text-center font-devanagari leading-relaxed mb-2 max-w-xs">
          Kai baar mic allow karna thoda mushkil lagta hai.
        </p>
        <p className="text-text-secondary text-base text-center font-devanagari leading-relaxed mb-2 max-w-xs">
          Aap type karke bhi bilkul same tarah se registration poori kar sakte hain.
        </p>
        <p className="text-saffron font-devanagari font-semibold text-base text-center mb-8">
          Kai Pandits isi tarah karte hain.
        </p>

        {/* Equivalence Demo */}
        <div className="w-full bg-surface-card rounded-card p-4 border border-border-default mb-8">
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="flex flex-col items-center gap-2 p-3 bg-surface-muted rounded-card-sm opacity-60">
              <div className="w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-text-disabled">mic_off</span>
              </div>
              <span className="text-xs text-text-placeholder">Voice se</span>
            </div>
            
            <div className="flex items-center justify-center">
              <span className="text-border-default text-xl">=</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 p-3 bg-saffron-light rounded-card-sm border border-saffron-border">
              <div className="w-10 h-10 bg-saffron-light rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-saffron filled">keyboard</span>
              </div>
              <span className="text-xs text-saffron font-bold">Type karke</span>
            </div>
          </div>
          
          <p className="text-trust-green font-semibold text-sm text-center mt-3 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            Same result. Sirf tarika alag hai.
          </p>
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-3">
          <Button onClick={handleTypeRegistration} icon="arrow_forward">
            Type Karke Registration Shuru Karein
          </Button>
          
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between w-full p-4 bg-surface-muted rounded-card-sm"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-text-secondary">settings_voice</span>
              <span className="text-text-secondary font-label text-sm">Phone mein mic permission kaise dein</span>
            </div>
            <span className="material-symbols-outlined text-text-disabled">
              {showGuide ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-surface-card rounded-card-sm p-4 text-sm font-label text-text-secondary"
            >
              <ol className="list-decimal pl-4 space-y-2">
                <li>Phone ki Settings kholein</li>
                <li>"Apps" ya "Applications" dhundhein</li>
                <li>HmarePanditJi dhundhein</li>
                <li>"Permissions" mein jaayein</li>
                <li>"Microphone" ON karein</li>
                <li>Wapas app mein aayein</li>
              </ol>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <SahayataBar />
      </div>
    </div>
  )
}
