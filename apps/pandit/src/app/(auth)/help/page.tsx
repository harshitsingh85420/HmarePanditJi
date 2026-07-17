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

        {/* Actions — mockup frame 23 row grammar: icon tile + 18/800 title
            + 14 sub + chevron; the call row wears the leaf tint */}
        <section className="flex flex-col gap-3 mt-6">
          {/* Re-watch tutorial (D2 review intent) */}
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
            className="w-full bg-card border border-sand rounded-[18px] px-4 min-h-[72px] flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none"
          >
            <span className="w-12 h-12 rounded-[14px] bg-saffron-50 flex items-center justify-center text-[26px] shrink-0 select-none" aria-hidden="true">▶️</span>
            <span className="flex-1 text-left">
              <span className="block text-[18px] font-extrabold text-ink font-hindi">{t("helpScreen.rewatchTutorial")}</span>
              <span className="block text-[14px] text-softgrey font-hindi">वही 6 आसान कदम</span>
            </span>
            <span className="text-[#C9BBA6] text-[22px]" aria-hidden="true">›</span>
          </button>

          {/* Call the team — leaf-tinted row (real support number) */}
          <a
            href="tel:+918934095599"
            className="flex items-center gap-3 bg-leaf-100 border border-[#BFE3CC] rounded-[18px] px-4 min-h-[72px] shadow-card active:scale-[0.98] transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none"
          >
            <span className="w-12 h-12 rounded-[14px] bg-leaf-500 flex items-center justify-center text-[26px] shrink-0 select-none" aria-hidden="true">📞</span>
            <span className="flex-1">
              <span className="block text-[18px] font-extrabold text-leaf-700 font-hindi">सहायता को कॉल करें</span>
              <span className="block text-[14px] text-softgrey font-hindi">सुबह 8 – रात 10 · मुफ़्त</span>
            </span>
            <span className="text-[#8FBFA1] text-[22px]" aria-hidden="true">›</span>
          </a>

          {/* WhatsApp — calm row (mockup), brand banner retired */}
          <a
            href={`https://wa.me/918934095599?text=${encodeURIComponent("नमस्ते, मुझे मदद चाहिए")}`}
            className="flex items-center gap-3 bg-card border border-sand rounded-[18px] px-4 min-h-[72px] shadow-card active:scale-[0.98] transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none"
          >
            <span className="w-12 h-12 rounded-[14px] bg-saffron-50 flex items-center justify-center text-[26px] shrink-0 select-none" aria-hidden="true">💬</span>
            <span className="flex-1">
              <span className="block text-[18px] font-extrabold text-ink font-hindi">WhatsApp पर पूछें</span>
              <span className="block text-[14px] text-softgrey font-hindi">तुरंत जवाब</span>
            </span>
            <span className="text-[#C9BBA6] text-[22px]" aria-hidden="true">›</span>
          </a>

          {/* Emergency — kit danger-outline Button (no haptic on this variant) */}
          <Button variant="danger-outline" size="lg" fullWidth onClick={() => router.push('/emergency-sos')}>
            {t("helpScreen.emergency")}
          </Button>
        </section>
      </main>

      {/* शिष्य footer slot */}
      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  )
}
