"use client";

// ─────────────────────────────────────────────────────────────
// तैयारी HUB (canon frame 16 — "सत्यापन · तैयारी (दीये जलें)") — THE LIVE ENTRY.
//
// Canon draws readiness as a HUB: a DARK LIT-LAMP PANEL over five area
// rows, each row state-tinted, and one CTA pointing at the next
// unfinished area. The shipped app drew it as a LINEAR wizard (R1→R5).
//
// Isj's exact-UI ruling resolved the Wave 2 side-by-side in canon's
// favour, so every entry point (home, bookings, both voice commands) now
// lands HERE. The wizard is not gone and was not rewritten — it remains
// the engine, reached only by deep link at ?step=N when a pandit taps an
// area. Hub = navigation shape; wizard = the forms. Behaviour unchanged.
//
// Areas are the app's REAL five steps (not canon's literal five, which
// split ठहरना out of भोजन and omit सामग्री) — the underlying flow stays
// behaviour-frozen; only the navigation shape is under evaluation.
//
// EXACT-UI PASS (canon frame 16 literals, all read from the artboard):
//   panel   linear-gradient(150deg,#2A1B3D,#5E1C0A) · r22 · 18px 12px
//           · gap 10 · shadow 0 8px 20px rgba(42,27,61,.28)
//   counter #FFE9C4 · w800   (canon 16px → raised to the 18sp floor)
//   done    bg #E4F3E9 · 1.5px #BFE3CC · r16 · 13px 15px · gap 13
//           icon check_circle FILLED 26px #1E7A46 · label 18/800 #341A13
//           · status #155C34 w800
//   now     bg #FDEEE7 · 2px #B23A1A · r16 · shadow 0 5px 14px
//           rgba(178,58,26,.16) · label 18/900 #7A250E · status pill on
//           #fff, r999, 4px 11px, #B23A1A w800
//   later   bg #FBF7EF · 1.5px #EADFCE · opacity .8 · label 18/700
//           #8A6F5C · status #8A6F5C w700
// Rows are ONE horizontal line in canon (icon · label · status), not a
// stacked label/sub-label, and carry NO chevron and no icon chip.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Diya } from "@/components/ui/Diya";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Narrate } from "@/hooks/useScreenVoice";

const AREAS = [
  { step: 1, icon: "temple_hindu", label: "पूजाएँ व दक्षिणा" },
  { step: 2, icon: "inventory_2", label: "सामग्री" },
  { step: 3, icon: "directions_car", label: "यात्रा" },
  { step: 4, icon: "restaurant", label: "भोजन व ठहराव" },
  { step: 5, icon: "verified_user", label: "भुगतान व सत्यापन" },
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

  const statusOf = (step: number): "done" | "now" | "later" =>
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

      <main className="flex-1 overflow-y-auto px-[18px] pt-2 pb-4 flex flex-col gap-[14px] page-enter">
        {/* ── canon's LIT-LAMP PANEL: the one dark surface on the screen ── */}
        <div
          className="rounded-[22px] px-3 py-[18px] flex flex-col items-center gap-2.5"
          style={{
            background: "linear-gradient(150deg,#2A1B3D,#5E1C0A)",
            boxShadow: "0 8px 20px rgba(42,27,61,.28)",
          }}
        >
          <div className="flex items-end justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Diya key={n} size={40} lit={n <= done} />
            ))}
          </div>
          {/* canon 16px → 18sp floor (lawConflict); colour/weight are canon */}
          <span className="text-[18px] font-extrabold font-hindi text-[#FFE9C4]">
            {done} / 5 दीये जल गए
          </span>
        </div>

        {/* ── five area rows ── */}
        {AREAS.map((a) => {
          const st = statusOf(a.step);
          const tappable = a.step <= nextStep;

          // canon literals, per state — surface, hairline, elevation
          const shell =
            st === "done"
              ? "bg-leaf-100 border-[1.5px] border-leafpale"
              : st === "now"
                ? "bg-saffron-50 border-2 border-saffron"
                : "bg-parchment border-[1.5px] border-sand-100 opacity-80";

          return (
            <button
              key={a.step}
              disabled={!tappable}
              onClick={() => router.push(`/readiness?step=${a.step}`)}
              className={`${shell} rounded-[16px] px-[15px] py-[13px] min-h-[56px] w-full flex items-center gap-[13px] text-left transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none ${
                tappable ? "active:scale-[0.98]" : "cursor-not-allowed"
              }`}
              style={
                st === "now"
                  ? { boxShadow: "0 5px 14px rgba(178,58,26,.16)" }
                  : undefined
              }
            >
              {/* canon swaps the area glyph for a FILLED check once done */}
              <span
                className={`material-symbols-outlined text-[26px] leading-none shrink-0 ${
                  st === "done"
                    ? "material-symbols-filled text-leaf-500"
                    : st === "now"
                      ? "text-saffron"
                      : "text-softgrey"
                }`}
                aria-hidden="true"
              >
                {st === "done" ? "check_circle" : a.icon}
              </span>

              <span
                className={`flex-1 text-[18px] font-hindi ${
                  st === "done"
                    ? "font-extrabold text-temple-700"
                    : st === "now"
                      ? "font-black text-saffron-700"
                      : "font-bold text-softgrey"
                }`}
              >
                {a.label}
              </span>

              {/* canon 13px → 18sp floor (lawConflict); the "now" state is a
                  white pill, the other two are plain right-aligned labels */}
              {st === "now" ? (
                <span className="text-[18px] font-extrabold font-hindi text-saffron bg-white rounded-full px-[11px] py-1 shrink-0">
                  अभी करें
                </span>
              ) : (
                <span
                  className={`text-[18px] font-hindi shrink-0 ${
                    st === "done"
                      ? "font-extrabold text-leaf-700"
                      : "font-bold text-softgrey"
                  }`}
                >
                  {st === "done" ? "हो गया" : "बाकी"}
                </span>
              )}
            </button>
          );
        })}
      </main>

      <footer className="shrink-0 px-[18px] py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex items-end gap-3">
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
