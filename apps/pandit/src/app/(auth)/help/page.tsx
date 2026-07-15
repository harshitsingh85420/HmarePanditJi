'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n'
import { useSafeOnboardingStore } from '@/lib/stores/ssr-safe-stores'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useEffect } from 'react'
import { Header } from '@/components/ui/Header'
import { Button } from '@/components/ui/Button'
import { ShishyaOrb } from '@/components/ui/ShishyaOrb'
import { useReduced } from '@/lib/motion'

export default function HelpPage() {
  const router = useRouter()
  const { setPhase, setCurrentTutorialScreen } = useSafeOnboardingStore()
  const reduced = useReduced()

  useEffect(() => {
    void speakWithSarvam({ text: 'कैसे मदद करें? हमारी टीम तैयार है।', languageCode: 'hi-IN' })
  }, [])

  const handleGoBack = () => router.back()

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header festive title={t("helpScreen.title")} showBack onBack={handleGoBack} />

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col page-enter">
        {/* Illustration — the helping-hands hero */}
        <section className="flex justify-center">
          <div className="w-full max-w-[280px] h-[140px] flex items-center justify-center">
            <motion.span
              className="text-[80px] block leading-none select-none"
              aria-hidden="true"
              initial={reduced ? false : { scale: 0.85, opacity: 0 }}
              animate={reduced ? undefined : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              🤝
            </motion.span>
          </div>
        </section>

        {/* Title */}
        <section className="text-center mt-2">
          <h2 className="text-[28px] font-bold text-temple-600 leading-tight font-hindi">कैसे मदद करें?</h2>
          <p className="text-[20px] text-softgrey mt-2 font-hindi">हमारी टीम तैयार है</p>
        </section>

        {/* Actions */}
        <section className="flex flex-col gap-4 mt-6">
          {/* Re-watch tutorial — kit outline button (D2 review intent) */}
          <button
            onClick={() => {
              // D2 REVIEW INTENT — outranks resume rules; back returns here
              try {
                sessionStorage.setItem('hpj_review_return', '/help');
              } catch { /* noop */ }
              setPhase('TUTORIAL');
              setCurrentTutorialScreen(1);
              router.push('/onboarding?review=tutorial');
            }}
            className="w-full bg-white border-2 border-saffron-500 rounded-card px-5 min-h-[64px] flex items-center justify-center active:scale-[0.98] transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none text-[18px] font-bold text-saffron-700 font-hindi"
          >
            {t("helpScreen.rewatchTutorial")}
          </button>

          {/* Emergency — kit danger-outline Button (no haptic on this variant) */}
          <Button variant="danger-outline" size="lg" fullWidth onClick={() => router.push('/emergency-sos')}>
            {t("helpScreen.emergency")}
          </Button>

          {/* Call the team — sindoor CTA (real support number) */}
          <a
            href="tel:+918934095599"
            className="flex items-center gap-4 bg-saffron-500 rounded-card shadow-btn px-5 min-h-[72px] active:scale-[0.98] transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none"
          >
            <span className="text-[36px] shrink-0" aria-hidden="true">📞</span>
            <div>
              <p className="text-[20px] font-bold text-chandan font-hindi">हमारी टीम से बात करें</p>
              <p className="text-[16px] text-chandan/85 mt-0.5 font-hindi">बिल्कुल मुफ़्त</p>
            </div>
          </a>

          {/* WhatsApp — brand green kept intentionally */}
          <a
            href={`https://wa.me/918934095599?text=${encodeURIComponent("नमस्ते, मुझे मदद चाहिए")}`}
            className="flex items-center gap-4 rounded-card px-5 min-h-[64px] active:scale-[0.98] transition-transform bg-[#25D366] focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none"
          >
            <span className="text-[36px] shrink-0" aria-hidden="true">💬</span>
            <div>
              <p className="text-[18px] font-bold text-white font-hindi">व्हाट्सऐप पर लिखें</p>
              <p className="text-[16px] text-white/90 mt-0.5 font-hindi">संदेश भेजें, जवाब आएगा</p>
            </div>
          </a>

          <p className="text-[16px] text-saffron-700 mt-2 font-hindi">⏱️ जवाब का समय: सुबह 8 बजे – रात 10 बजे (सभी दिन)</p>
        </section>
      </main>

      {/* शिष्य footer slot */}
      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  )
}
