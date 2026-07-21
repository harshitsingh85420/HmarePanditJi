'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useSafeNavigationStore, useSafeVoiceStore } from '@/lib/stores/ssr-safe-stores'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { DiyaIllustration } from '@/components/illustrations/PremiumIcons'
import { useReduced, still, fadeInUp, stagger } from '@/lib/motion'

export default function IdentityConfirmationPage() {
  const router = useRouter()

  // SSR FIX: Use safe store hooks that don't throw during SSR
  const { setSection } = useSafeNavigationStore()
  const { transcribedText } = useSafeVoiceStore()
  const reduced = useReduced()

  useEffect(() => {
    setSection('identity-confirmation')
  }, [setSection])

  useEffect(() => {
    // Welcome voice intro on mount
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'नमस्ते पंडित जी। क्या आप एक पंडित हैं? यह app केवल पंडितों के लिए बना है।',
        languageCode: 'hi-IN',
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // L3 ONE-VOICE-OWNER: this screen no longer hand-rolls its own mic loop
  // (the old off-controller listen cascade had NO mic custody, wake lock,
  // track-health watchdog, or never-hear-itself lock — it went deaf on
  // backgrounding and could speak + listen at once). Listening belongs to
  // the controller alone.
  // The mic button now simply re-reads the question; the big CTA below is the
  // confirm, and a referral-only yes/no screen does not need a rogue loop.
  const handleVoiceInput = () => {
    void speakWithSarvam({
      text: 'क्या आप एक पंडित हैं? यदि हाँ, तो नीचे दिया बटन दबाएँ — "हाँ, मैं पंडित हूँ"।',
      languageCode: 'hi-IN',
    })
  }
  const isListening = false

  const handleManualConfirm = () => {
    void speakWithSarvam({
      text: 'धन्यवाद। आपकी पहचान की पुष्टि हो गई है।',
      languageCode: 'hi-IN',
    })
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }

  const container = reduced ? still(stagger(0.1)) : stagger(0.1)
  const item = reduced ? still(fadeInUp) : fadeInUp

  const features: Array<{ icon: string; title: string; desc: string }> = [
    { icon: '💰', title: 'तय दक्षिणा', desc: 'हर अनुष्ठान के लिए सही और स्पष्ट मूल्य' },
    { icon: '🎙️', title: 'सरल आवाज़ नियंत्रण', desc: 'बोलकर काम करें, लिखने की ज़रूरत नहीं' },
    { icon: '⚡', title: 'त्वरित भुगतान', desc: 'सीधे आपके बैंक खाते में तुरंत जमा' },
  ]

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header title="परिचय" showBack onBack={() => router.back()} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-6 flex flex-col">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col"
        >
          {/* Hero diya */}
          <motion.div variants={item} className="mt-4 mb-8 flex justify-center">
            <DiyaIllustration size="lg" animated={!reduced} />
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={item}
            className="text-[36px] font-bold text-temple-700 tracking-tight leading-tight text-center mb-3 font-display"
          >
            नमस्ते, पंडित जी! 🙏
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={item}
            className="text-softgrey text-[20px] font-medium leading-relaxed text-center mb-10 font-hindi"
          >
            HmarePanditJi आपके लिए है
          </motion.p>

          {/* Voice Input Card — the mic is DISPLAY-ONLY (re-reads the question) */}
          <motion.div variants={item} className="mb-6">
            <Card className="flex flex-col items-center gap-3 p-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceInput}
                disabled={isListening}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-saffron-500 shadow-btn active:scale-[0.97] transition-transform"
              >
                <span className="text-[32px] leading-none" aria-hidden="true">🎤</span>
              </motion.button>

              <p className="text-softgrey text-center font-hindi">
                उत्तर देने के लिए माइक दबाएँ
              </p>

              {/* Transcribed text (if any) */}
              {transcribedText && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-saffron-600 font-medium text-center font-hindi"
                >
                  आपने कहा: &quot;{transcribedText}&quot;
                </motion.p>
              )}
            </Card>
          </motion.div>

          {/* Feature Cards — kit accent rail */}
          <motion.div variants={item} className="w-full flex flex-col gap-3 mb-6">
            {features.map((f) => (
              <Card key={f.title} accent="saffron" className="flex items-center gap-4 p-5">
                <div className="w-14 h-14 bg-saffron-50 rounded-btn flex items-center justify-center text-[28px] shrink-0" aria-hidden="true">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-temple-700 font-hindi">{f.title}</h3>
                  <p className="text-softgrey leading-relaxed font-hindi">{f.desc}</p>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Free-to-join badge — tulsi-green pill */}
          <motion.div variants={item} className="flex items-center justify-center gap-2 bg-leaf-100 py-3 rounded-full border border-leaf-500/20 mb-4">
            <span className="text-[20px] leading-none" aria-hidden="true">✅</span>
            <span className="text-leaf-700 font-semibold tracking-wide font-hindi">पूर्णतः निःशुल्क</span>
          </motion.div>
        </motion.div>
      </main>

      {/* Primary CTA — fixed footer (retokened in place: no kit Button, so no
          added haptic on the pre-login confirm). */}
      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleManualConfirm}
          className="w-full min-h-[72px] h-auto px-4 py-3 bg-saffron-500 text-[#FFF3EA] text-[20px] font-bold rounded-btn shadow-btn active:scale-[0.97] transition-transform flex items-center justify-center gap-3 font-hindi"
        >
          <span className="text-center block break-words line-clamp-2">हाँ, मैं पंडित हूँ — पंजीकरण शुरू करें</span>
          <span className="text-[22px] shrink-0" aria-hidden="true">→</span>
        </motion.button>
      </footer>
    </div>
  )
}
