"use client";

// ─────────────────────────────────────────────────────────────
// WAVE 2 CANDIDATE — तैयारी HUB (canon frame 12).
//
// Canon draws readiness as a HUB: "आपकी तैयारी | N/5 दीये जल गए" over five
// area rows, each with its own status, and one CTA pointing at the next
// unfinished area. The shipped app draws it as a LINEAR wizard (R1→R5).
//
// THIS ROUTE DOES NOT REPLACE THE WIZARD. It is an alternative entry that
// reads the SAME server snapshot and deep-links INTO the wizard at
// ?step=N, so Isj can compare hub vs linear on a real device before any
// flow is chosen. /readiness is untouched and remains the live path.
//
// Areas are the app's REAL five steps (not canon's literal five, which
// split ठहरना out of भोजन and omit सामग्री) — the underlying flow stays
// behaviour-frozen; only the navigation shape is under evaluation.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Narrate } from "@/hooks/useScreenVoice";

const AREAS = [
  { step: 1, emoji: "🛕", label: "पूजाएँ व दक्षिणा" },
  { step: 2, emoji: "🧺", label: "सामग्री" },
  { step: 3, emoji: "🛵", label: "यात्रा" },
  { step: 4, emoji: "🍽️", label: "भोजन व ठहराव" },
  { step: 5, emoji: "🔒", label: "भुगतान व सत्यापन" },
] as const;

export default function ReadinessHubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(0); // completed steps (server truth)

  useEffect(() => {
    const run = async () => {
      const res = await api("/pandit/readiness");
      if (!res.success || !res.data) {
        router.replace("/home");
        return;
      }
      setDone(Number(res.data.readinessStep) || 0);
      setLoading(false);
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <DiyaLoader />;

  // The wizard never lets a pandit jump past earned+1, so the hub must not
  // offer it either — a row beyond that is shown as बाकी and is not tappable.
  const nextStep = Math.min(done + 1, 5);
  const allDone = done >= 5;

  const statusOf = (step: number) =>
    step <= done ? "done" : step === nextStep ? "now" : "later";

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header title="आपकी तैयारी" showBack onBack={() => router.push("/home")} />
      <Narrate
        text={
          allDone
            ? "आपकी तैयारी पूरी हो गई है, पंडित जी।"
            : `आपकी तैयारी ${done} बटा 5 पूरी है। अगला कदम — ${AREAS[nextStep - 1].label}।`
        }
      />

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col gap-4 page-enter">
        {/* canon frame 12 header: five diyas + "N/5 दीये जल गए" */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`text-[26px] leading-none select-none ${
                  n <= done
                    ? "opacity-100"
                    : n === nextStep
                      ? "opacity-100 pa-diya-halo rounded-full"
                      : "opacity-30 grayscale"
                }`}
                aria-hidden="true"
              >
                🪔
              </span>
            ))}
          </div>
          <span className="text-[13px] font-bold text-softgrey font-hindi">
            {done}/5 दीये जल गए
          </span>
        </div>

        {/* five area rows */}
        <div className="flex flex-col gap-2.5">
          {AREAS.map((a) => {
            const st = statusOf(a.step);
            const tappable = a.step <= nextStep;
            const border =
              st === "done" ? "border-[#BFE3CC]" : st === "now" ? "border-saffron-200" : "border-sand";
            return (
              <button
                key={a.step}
                disabled={!tappable}
                onClick={() => router.push(`/readiness?step=${a.step}`)}
                className={`bg-card border ${border} rounded-[16px] px-4 min-h-[72px] flex items-center gap-3 shadow-card text-left transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none ${
                  tappable ? "active:scale-[0.98]" : "opacity-60 cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-12 h-12 rounded-[13px] flex items-center justify-center text-[24px] shrink-0 select-none ${
                    st === "done" ? "bg-leaf-100" : "bg-saffron-50"
                  }`}
                  aria-hidden="true"
                >
                  {a.emoji}
                </span>
                <span className="flex-1">
                  <span className="block text-[18px] font-extrabold text-ink font-hindi">{a.label}</span>
                  <span
                    className={`block text-[14px] font-bold font-hindi ${
                      st === "done" ? "text-leaf-700" : st === "now" ? "text-saffron-700" : "text-softgrey"
                    }`}
                  >
                    {st === "done" ? "✓ हो गया" : st === "now" ? "अभी करें" : "बाकी"}
                  </span>
                </span>
                {tappable && (
                  <span className="text-[#C9BBA6] text-[22px]" aria-hidden="true">›</span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex items-end gap-3">
        <div className="flex-1">
          {allDone ? (
            <Button variant="success" size="lg" fullWidth onClick={() => router.push("/home")}>
              तैयारी पूरी — होम चलें
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => router.push(`/readiness?step=${nextStep}`)}
            >
              {AREAS[nextStep - 1].label} भरें
            </Button>
          )}
        </div>
        <ShishyaOrb />
      </footer>
    </div>
  );
}
