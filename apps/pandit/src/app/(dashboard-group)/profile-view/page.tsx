"use client";

// Read-only profile view — the pandit sees what customers see.
// Edits go through support (spoken + written note at the bottom).
//
// CANON: design/canon/हमारे पंडित जी.dc.html frame 32 ("प्रोफ़ाइल · Profile").
// Every literal below is lifted from that artboard:
//   identity block  centred column, gap 8px, NO card behind it
//   avatar          92px circle, linear-gradient(150deg,#D95F38,#B23A1A),
//                   4px solid #E7B54A, 38/900 #FFF6E9,
//                   box-shadow 0 8px 20px rgba(178,58,26,.3)
//   verified badge  32px circle #1E7A46, 3px solid #FFF9EE, white `verified` 19px
//   name / city     25/900 #341A13 · 16/600 #8A6F5C with `location_on` 18px
//   pills           13/800, 6px 13px, 999px — #155C34/#E4F3E9 and #B8860B/#FBF0D8
//   stat tiles      flat #FFFDF8, 1.5px #F0DFC4, r16, 14px 8px, 24/900 #7A250E
//   list card       flat #FFFDF8, 1.5px #F0DFC4, r18, 16px, gap 12px;
//                   rows = filled `check_circle` 20px #1E7A46 + 17/700 #341A13
// LAW OVERRIDE: canon's 13/15/16/17px label sizes are below the 18sp floor;
// they are raised to 18px here (see lawConflicts). Nothing else deviates.

import { Narrate } from "@/hooks/useScreenVoice";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";

interface ProfileData {
  fullName: string;
  displayName: string | null;
  city: string;
  location: string;
  profilePhotoUrl: string | null;
  photoUrl: string | null;
  specializations: string[];
  verificationStatus?: string;
  experienceYears?: number;
  dakshinaRates?: Array<{ pujaType: string; amount: number }>;
  pujaServices?: Array<{ pujaType: string; dakshinaAmount: number }>;
}

// TRUTHFUL-NULL: every canon-32 stat renders only when its value exists —
// no fake 0★, no 0-booking brag cards.
interface ProfileStats {
  rating: number | null;
  completionPct: number | null;
  completedBookings: number;
}

// Canon frame 32's flat tile/card surface. The shared <Card> carries canon's
// LIT surface (gradient + 6/16 shadow, frame 12); frame 32's profile tiles are
// the un-lit variant, so the flat fill is re-declared here rather than in the
// shared component. `!` keeps the override deterministic against twMerge.
const FLAT_TILE = "bg-none bg-card border-[1.5px] border-sand !shadow-none";

// NO-ROMAN/REGISTER: specializations and dakshina rows arrive as raw enum
// ids (SATYANARAYAN…) — canon frame 24 prints Hindi puja names. Map known
// ids through the readiness specLabel idiom; a custom puja is already stored
// under its Hindi name, so anything unmapped passes through unchanged
// (t() would echo the key path for a miss, hence the guard).
const pujaLabel = (id: string): string =>
  (hi.onboarding.specializations as Record<string, string>)[id]
    ? t(`onboarding.specializations.${id}`)
    : id;

export default function ProfileViewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const load = async () => {
      const [res, statsRes] = await Promise.all([api("/auth/me"), api("/pandit/stats")]);
      if (res.success) {
        setProfile(res.data.user?.panditProfile || null);
        setName(res.data.user?.name || "");
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      setLoading(false);
    };
    void load();
  }, []);

  const { url: photo } = usePresignedUrl(profile?.profilePhotoUrl || profile?.photoUrl || null);

  if (loading) return <DiyaLoader />;

  const dakshina =
    profile?.dakshinaRates?.length
      ? profile.dakshinaRates.map((d) => ({ puja: d.pujaType, amount: d.amount }))
      : (profile?.pujaServices || []).map((s) => ({ puja: s.pujaType, amount: s.dakshinaAmount }));

  const pandit = profile?.fullName || profile?.displayName || name || "";
  const specializations = profile?.specializations || [];

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* canon frame 24: the garland is the ONLY chrome (no title bar). Canon
          omits the back; kept as a canon back-circle row under the garland
          (no-dead-ends law) — flagged deviation. */}
      <Header variant="garland" />
      <div className="shrink-0 px-3 pt-1.5">
        <button
          onClick={() => router.push("/settings")}
          aria-label={t("common.back")}
          className="w-[52px] h-[52px] min-h-[52px] min-w-[52px] rounded-full bg-card shadow-card flex items-center justify-center active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
        >
          <span className="material-symbols-outlined text-[24px] leading-none text-saffron-700" aria-hidden="true">
            arrow_back
          </span>
        </button>
      </div>
      <main className="flex-1 overflow-y-auto px-4 pt-1.5 pb-24 flex flex-col gap-[15px] page-enter">
        <Narrate text={t("profileView.title")} />

        {/* ── Identity: centred column, no card (canon 32) ── */}
        <div className="flex flex-col items-center gap-2 mt-1">
          <div className="relative">
            <div className="w-[92px] h-[92px] rounded-full border-4 border-gold overflow-hidden flex items-center justify-center shrink-0 bg-[linear-gradient(150deg,#D95F38,#B23A1A)] shadow-[0_8px_20px_rgba(178,58,26,0.3)]">
              {photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[38px] font-black text-chandan font-hindi leading-none select-none" aria-hidden="true">
                  {(pandit || "🙏").trim().charAt(0)}
                </span>
              )}
            </div>
            {/* TRUTH: the verified seal only on a VERIFIED profile */}
            {profile?.verificationStatus === "VERIFIED" && (
              <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-leaf-500 border-[3px] border-[#FFF9EE] flex items-center justify-center">
                <span className="material-symbols-outlined material-symbols-filled text-[19px] text-white" aria-hidden="true">
                  verified
                </span>
              </span>
            )}
          </div>

          <div className="text-center flex flex-col items-center gap-1">
            <span className="text-[25px] font-black text-temple-700 font-hindi leading-tight">
              {pandit || "—"}
            </span>
            <span className="text-[18px] font-semibold text-softgrey font-hindi flex items-center justify-center gap-[5px]">
              {/* canon location_on 18px (glyph — floors do not apply) */}
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">location_on</span>
              {profile?.city || profile?.location || "—"}
            </span>
          </div>

          {/* Canon pills — each one a TRUTH claim, data-gated */}
          {(profile?.verificationStatus === "VERIFIED" || (stats !== null && stats.rating !== null)) && (
            <div className="flex flex-wrap justify-center gap-[9px] mt-0.5">
              {profile?.verificationStatus === "VERIFIED" && (
                <span className="rounded-chip bg-leaf-100 text-leaf-700 text-[18px] font-extrabold font-hindi px-[13px] py-1.5">
                  ✓ प्रमाणित
                </span>
              )}
              {stats !== null && stats.rating !== null && (
                <span className="rounded-chip bg-goldpale text-brassdark text-[18px] font-extrabold font-hindi px-[13px] py-1.5">
                  ⭐ {stats.rating} रेटिंग
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Three stat tiles (canon 32), each gated on real data ── */}
        {((specializations.length > 0) ||
          (stats !== null && stats.completedBookings > 0) ||
          (profile?.experienceYears || 0) > 0) && (
          <div className="grid grid-cols-3 gap-[10px]">
            {specializations.length > 0 && (
              <Card className={`${FLAT_TILE} !rounded-[16px] px-2 py-[14px] flex flex-col items-center text-center gap-0.5`}>
                <span className="text-[24px] font-black text-saffron-700 leading-none">{specializations.length}</span>
                <span className="text-[18px] font-bold text-softgrey font-hindi leading-tight">पूजाएँ</span>
              </Card>
            )}
            {stats !== null && stats.completedBookings > 0 && (
              <Card className={`${FLAT_TILE} !rounded-[16px] px-2 py-[14px] flex flex-col items-center text-center gap-0.5`}>
                <span className="text-[24px] font-black text-saffron-700 leading-none">{stats.completedBookings}</span>
                <span className="text-[18px] font-bold text-softgrey font-hindi leading-tight">बुकिंग</span>
              </Card>
            )}
            {(profile?.experienceYears || 0) > 0 && (
              <Card className={`${FLAT_TILE} !rounded-[16px] px-2 py-[14px] flex flex-col items-center text-center gap-0.5`}>
                <span className="text-[24px] font-black text-saffron-700 leading-none">{profile?.experienceYears}</span>
                <span className="text-[18px] font-bold text-softgrey font-hindi leading-tight">साल अनुभव</span>
              </Card>
            )}
          </div>
        )}

        {/* ── पूजाएँ: canon's filled check_circle rows (not chips) ── */}
        <Card className={`${FLAT_TILE} !rounded-[18px] p-4 flex flex-col gap-3`}>
          {/* TRUTHFUL-STATE gates canon's heading: 'प्रमाणित पूजाएँ' is a
              claim — it renders only on a VERIFIED profile. */}
          <span className="text-[18px] font-extrabold text-softgrey font-hindi">
            {profile?.verificationStatus === "VERIFIED" ? "प्रमाणित पूजाएँ" : t("profileView.pujas")}
          </span>
          {specializations.length === 0 ? (
            <span className="text-[18px] text-softgrey font-hindi">—</span>
          ) : (
            specializations.map((sp) => (
              <div key={sp} className="flex items-center gap-[10px] text-[18px] font-bold text-temple-700 font-hindi">
                <span className="material-symbols-outlined material-symbols-filled text-[20px] text-leaf-500 shrink-0" aria-hidden="true">
                  check_circle
                </span>
                {pujaLabel(sp)}
              </div>
            ))
          )}
        </Card>

        {/* ── दक्षिणा (app-only surface, canon-32 idiom) ── */}
        <Card className={`${FLAT_TILE} !rounded-[18px] p-4 flex flex-col gap-3`}>
          <span className="text-[18px] font-extrabold text-softgrey font-hindi">{t("profileView.dakshina")}</span>
          {dakshina.length === 0 ? (
            <span className="text-[18px] text-softgrey font-hindi">—</span>
          ) : (
            <div className="flex flex-col">
              {dakshina.map((d) => (
                <div key={d.puja} className="flex items-center justify-between gap-3 min-h-[52px] border-b border-sand last:border-0">
                  <span className="text-[18px] font-bold text-temple-700 font-hindi">{pujaLabel(d.puja)}</span>
                  <span className="text-[18px] font-extrabold text-leaf-500 shrink-0">₹{d.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Manage poojas (app-only row, canon-32 idiom) ── */}
        <Card
          className={`${FLAT_TILE} !rounded-[16px] px-4 py-0 min-h-[64px] flex items-center gap-3`}
          onClick={() => router.push("/my-poojas")}
        >
          <span className="w-[46px] h-[46px] rounded-xl bg-saffron-50 flex items-center justify-center shrink-0" aria-hidden="true">
            <span className="material-symbols-outlined text-[24px] text-saffron-500">temple_hindu</span>
          </span>
          <span className="flex-1 text-[18px] font-extrabold text-temple-700 font-hindi">{t("myPoojas.title")}</span>
          <span className="material-symbols-outlined text-[24px] text-sand-400" aria-hidden="true">chevron_right</span>
        </Card>

        <a
          href={`tel:${t("support.phone")}`}
          className="text-center text-[18px] text-softgrey font-hindi underline underline-offset-4 min-h-[56px] flex items-center justify-center"
        >
          {t("profileView.editNote")}
        </a>
      </main>

      <BottomNav activeTab={0} onChange={(idx) => {
        if (idx === 0) router.push("/home");
        else if (idx === 1) router.push("/bookings");
        else if (idx === 2) router.push("/earnings");
        else if (idx === 3) router.push("/calendar");
      }} />
    </div>
  );
}
