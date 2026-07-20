'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n'
import { useSafeOnboardingStore } from '@/lib/stores/ssr-safe-stores'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useEffect } from 'react'
import { Header } from '@/components/ui/Header'
import { Button } from '@/components/ui/Button'
import { ShishyaOrb } from '@/components/ui/ShishyaOrb'

// CANON FRAME 31 (artboard 23 · मदद · Help) — every value below is a literal
// read out of design/canon/हमारे पंडित जी.dc.html, not an eyeball:
//   row      bg #FFFDF8 · 1.5px #F0DFC4 · radius 18px · padding 15px 16px · gap 14px
//   tile     52×52 · radius 14px · bg #FDEEE7 · icon 28px #B23A1A
//   title    18px / 800 / #341A13        sub 14px #8A6F5C  (see LAW note)
//   chevron  24px #C9BBA6  (#8FBFA1 on the leaf row)
//   leaf row bg #E4F3E9 · border #BFE3CC · tile #1E7A46 · title #155C34
//   list     gap 13px · padding 10px 16px 16px
// LAW > CANON: canon's row sub-labels are 14px. The 18sp body floor wins, so
// they ship at 18px here and the conflict is reported for arbitration.
// Base classes carry NO colour — each row supplies its own fill/border/tint so
// two competing utilities never race in the stylesheet.
const ROW =
  'w-full border-[1.5px] rounded-tile px-4 py-[15px] flex items-center gap-[14px] active:scale-[0.98] transition-transform motion-reduce:transition-none focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none'
const ROW_PLAIN = `${ROW} bg-card border-sand`
const ROW_LEAF = `${ROW} bg-leaf-100 border-leafpale`
const TILE =
  'w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 select-none text-[28px]'
const TILE_PEACH = `${TILE} bg-saffron-50 text-saffron-500`
const TILE_LEAF = `${TILE} bg-leaf-500 text-white`
const TITLE = 'block text-[18px] font-extrabold font-hindi'
const SUB = 'block text-[18px] text-softgrey font-hindi'
const CHEV = 'material-symbols-outlined text-[24px] shrink-0'

export default function HelpPage() {
  const router = useRouter()
  const { setPhase, setCurrentTutorialScreen } = useSafeOnboardingStore()

  useEffect(() => {
    void speakWithSarvam({ text: 'मैं यहीं हूँ, बेझिझक बताइए।', languageCode: 'hi-IN' })
  }, [])

  const handleGoBack = () => router.back()

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header festive title="🤝 मदद व सहायता" showBack onBack={handleGoBack} />

      <main className="flex-1 overflow-y-auto px-4 pt-[10px] pb-4 flex flex-col gap-[13px] page-enter">
        {/* Actions — canon frame 31 row grammar: icon tile + 18/800 title
            + sub + chevron; the call row wears the leaf tint */}
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
          className={ROW_PLAIN}
        >
          <span className={TILE_PEACH} aria-hidden="true">
            <span className="material-symbols-outlined text-[28px]">play_circle</span>
          </span>
          <span className="flex-1 text-left">
            {/* Canon's label is plain — the tile carries the glyph, so the
                🔁-prefixed strings.ts value is not used here. */}
            <span className={`${TITLE} text-temple-700`}>ट्यूटोरियल फिर देखें</span>
            <span className={SUB}>वही 6 आसान कदम</span>
          </span>
          <span className={`${CHEV} text-sand-400`} aria-hidden="true">chevron_right</span>
        </button>

        {/* Call the team — leaf-tinted row (real support number) */}
        <a
          href="tel:+918934095599"
          className={ROW_LEAF}
        >
          <span className={TILE_LEAF} aria-hidden="true">
            <span className="material-symbols-outlined material-symbols-filled text-[28px]">call</span>
          </span>
          <span className="flex-1">
            <span className={`${TITLE} text-leaf-700`}>सहायता को कॉल करें</span>
            <span className={SUB}>सुबह 8 – रात 10 · मुफ़्त</span>
          </span>
          <span className={`${CHEV} text-[#8FBFA1]`} aria-hidden="true">chevron_right</span>
        </a>

        {/* Canon frame 31: सामान्य सवाल — static FAQ, same answers शिष्य gives */}
        <button onClick={() => router.push('/help/faq')} className={ROW_PLAIN}>
          <span className={TILE_PEACH} aria-hidden="true">
            <span className="material-symbols-outlined text-[28px]">quiz</span>
          </span>
          <span className="flex-1 text-left">
            <span className={`${TITLE} text-temple-700`}>{t("faq.title")}</span>
            <span className={SUB}>{t("faq.subtitle")}</span>
          </span>
          <span className={`${CHEV} text-sand-400`} aria-hidden="true">chevron_right</span>
        </button>

        {/* WhatsApp — calm row (canon keeps this tile an emoji at 26px) */}
        <a
          href={`https://wa.me/918934095599?text=${encodeURIComponent("नमस्ते, मुझे मदद चाहिए")}`}
          className={ROW_PLAIN}
        >
          <span className={`${TILE_PEACH} text-[26px]`} aria-hidden="true">💬</span>
          <span className="flex-1">
            <span className={`${TITLE} text-temple-700`}>WhatsApp पर पूछें</span>
            <span className={SUB}>तुरंत जवाब</span>
          </span>
          <span className={`${CHEV} text-sand-400`} aria-hidden="true">chevron_right</span>
        </a>

        {/* Emergency — kit danger-outline Button. NOT in canon frame 31, kept
            because /emergency-sos is a real, reachable safety route. */}
        <Button variant="danger-outline" size="lg" fullWidth onClick={() => router.push('/emergency-sos')}>
          {t("helpScreen.emergency")}
        </Button>
      </main>

      {/* शिष्य footer slot */}
      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  )
}
