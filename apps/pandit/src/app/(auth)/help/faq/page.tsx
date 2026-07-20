'use client'

// Canon frame 23 → "सामान्य सवाल · बुकिंग · पैसे · सत्यापन".
// STATIC content (no CMS): every answer mirrors the API's shishyaFacts
// CURATED_HI, so the written FAQ and शिष्य's spoken answers never diverge.
// Accordion, not a wall of text — one question open at a time keeps the
// reading load low for a 62-year-old.

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { hi } from '@/lib/strings'
import { Header } from '@/components/ui/Header'
import { ShishyaOrb } from '@/components/ui/ShishyaOrb'

const GROUPS = [
  { key: 'booking', label: hi.faq.groupBooking, emoji: '📿' },
  { key: 'money', label: hi.faq.groupMoney, emoji: '💰' },
  { key: 'verify', label: hi.faq.groupVerify, emoji: '✅' },
] as const

export default function FaqPage() {
  const router = useRouter()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header festive title={hi.faq.title} showBack onBack={() => router.back()} />

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col gap-4 page-enter">
        <p className="text-[15px] font-semibold text-softgrey font-hindi text-center">
          {hi.faq.subtitle}
        </p>

        {GROUPS.map((g) => {
          const items = hi.faq.items.filter((i) => i.g === g.key)
          if (items.length === 0) return null
          return (
            <section key={g.key} className="flex flex-col gap-2">
              <h2 className="text-[15px] font-extrabold text-saffron-700 font-hindi flex items-center gap-1.5">
                <span aria-hidden="true">{g.emoji}</span> {g.label}
              </h2>

              {items.map((item) => {
                const id = `${g.key}:${item.q}`
                const isOpen = open === id
                return (
                  <div
                    key={id}
                    className="bg-card border border-sand rounded-[16px] shadow-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : id)}
                      aria-expanded={isOpen}
                      className="w-full px-4 min-h-[64px] py-3 flex items-center gap-3 text-left active:scale-[0.99] transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none"
                    >
                      <span className="flex-1 text-[17px] font-extrabold text-ink font-hindi leading-snug">
                        {item.q}
                      </span>
                      <span
                        className={`text-[#C9BBA6] text-[20px] shrink-0 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      >
                        ⌄
                      </span>
                    </button>

                    {isOpen && (
                      <p className="px-4 pb-4 -mt-1 text-[16px] text-softgrey font-hindi leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </section>
          )
        })}
      </main>

      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  )
}
