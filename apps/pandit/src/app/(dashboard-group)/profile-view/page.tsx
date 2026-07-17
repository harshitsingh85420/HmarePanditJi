"use client";

// Read-only profile view — the pandit sees what customers see.
// Edits go through support (spoken + written note at the bottom).

import { Narrate } from "@/hooks/useScreenVoice";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
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

// TRUTHFUL-NULL: every mockup-24 stat renders only when its value exists —
// no fake 0★, no 0-booking brag cards.
interface ProfileStats {
  rating: number | null;
  completionPct: number | null;
  completedBookings: number;
}

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

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header title={t("profileView.title")} showBack onBack={() => router.push("/settings")} />
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 flex flex-col gap-3 page-enter">
        <Narrate text={t("profileView.title")} />

        {/* Photo + name + city — mockup frame 24: initial-letter avatar in
            a 4px gold ring, name 25/900 */}
        <Card className="p-5 rounded-[18px] border-sand flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-temple-700 border-4 border-gold overflow-hidden flex items-center justify-center shrink-0">
            {photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[34px] font-black text-chandan font-hindi select-none" aria-hidden="true">
                {(profile?.fullName || profile?.displayName || name || "🙏").trim().charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[25px] font-black text-ink font-hindi leading-tight">
              {profile?.fullName || profile?.displayName || name || "—"}
            </span>
            <span className="text-[16px] font-semibold text-softgrey font-hindi">
              📍 {profile?.city || profile?.location || "—"}
            </span>
            {/* Mockup frame 24 pills — each a TRUTH claim, data-gated */}
            {(profile?.verificationStatus === "VERIFIED" || (stats !== null && stats.rating !== null)) && (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {profile?.verificationStatus === "VERIFIED" && (
                  <span className="rounded-full bg-leaf-100 text-leaf-700 text-[13px] font-extrabold font-hindi px-3 py-1">
                    ✓ प्रमाणित
                  </span>
                )}
                {stats !== null && stats.rating !== null && (
                  <span className="rounded-full bg-[#FBF0D8] text-brassdark text-[13px] font-extrabold font-hindi px-3 py-1">
                    ⭐ {stats.rating} रेटिंग
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Mockup frame 24: 3-stat cards — each card only with real data */}
        {((profile?.specializations?.length || 0) > 0 ||
          (stats !== null && stats.completedBookings > 0) ||
          (profile?.experienceYears || 0) > 0) && (
          <div className="grid grid-cols-3 gap-2">
            {(profile?.specializations?.length || 0) > 0 && (
              <Card className="p-3 rounded-[16px] border-sand flex flex-col items-center text-center gap-0.5">
                <span className="text-[24px] font-black text-saffron-700">{profile?.specializations.length}</span>
                <span className="text-[13px] font-bold text-softgrey font-hindi">पूजाएँ</span>
              </Card>
            )}
            {stats !== null && stats.completedBookings > 0 && (
              <Card className="p-3 rounded-[16px] border-sand flex flex-col items-center text-center gap-0.5">
                <span className="text-[24px] font-black text-saffron-700">{stats.completedBookings}</span>
                <span className="text-[13px] font-bold text-softgrey font-hindi">बुकिंग</span>
              </Card>
            )}
            {(profile?.experienceYears || 0) > 0 && (
              <Card className="p-3 rounded-[16px] border-sand flex flex-col items-center text-center gap-0.5">
                <span className="text-[24px] font-black text-saffron-700">{profile?.experienceYears}</span>
                <span className="text-[13px] font-bold text-softgrey font-hindi">साल अनुभव</span>
              </Card>
            )}
          </div>
        )}

        {/* Row: manage poojas */}
        <Card
          className="px-4 rounded-[16px] border-sand min-h-[64px] flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => router.push("/my-poojas")}
        >
          <span className="w-11 h-11 rounded-[13px] bg-saffron-50 flex items-center justify-center text-[22px] shrink-0 select-none" aria-hidden="true">🛕</span>
          <span className="flex-1 text-[18px] font-extrabold text-ink font-hindi">{t("myPoojas.title")}</span>
          <span className="text-[#C9BBA6] text-[22px]" aria-hidden="true">›</span>
        </Card>

        {/* पूजाएँ chips */}
        <Card className="p-5 rounded-[18px] border-sand flex flex-col gap-3">
          <h3 className="text-[15px] font-extrabold text-softgrey font-hindi">{t("profileView.pujas")}</h3>
          <div className="flex flex-wrap gap-2">
            {(profile?.specializations || []).map((sp) => (
              <span key={sp} className="bg-saffron-50 border border-saffron-100 text-saffron-700 rounded-full px-4 py-2 text-[16px] font-semibold font-hindi">
                {sp}
              </span>
            ))}
            {(!profile?.specializations || profile.specializations.length === 0) && (
              <span className="t-hint text-softgrey font-hindi">—</span>
            )}
          </div>
        </Card>

        {/* दक्षिणा table */}
        <Card className="p-5 rounded-[18px] border-sand flex flex-col gap-3">
          <h3 className="text-[15px] font-extrabold text-softgrey font-hindi">{t("profileView.dakshina")}</h3>
          {dakshina.length === 0 ? (
            <span className="t-hint text-softgrey font-hindi">—</span>
          ) : (
            <div className="flex flex-col">
              {dakshina.map((d) => (
                <div key={d.puja} className="flex items-center justify-between min-h-[52px] border-b border-saffron-100 last:border-0">
                  <span className="t-body font-semibold text-ink font-hindi">{d.puja}</span>
                  <span className="text-[18px] font-bold text-leaf-700 font-mono">₹{d.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <a
          href={`tel:${t("support.phone")}`}
          className="text-center t-hint text-softgrey font-hindi underline underline-offset-4 min-h-[56px] flex items-center justify-center"
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
