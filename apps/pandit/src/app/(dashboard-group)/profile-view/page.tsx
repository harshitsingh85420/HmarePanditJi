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
  dakshinaRates?: Array<{ pujaType: string; amount: number }>;
  pujaServices?: Array<{ pujaType: string; dakshinaAmount: number }>;
}

export default function ProfileViewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await api("/auth/me");
      if (res.success) {
        setProfile(res.data.user?.panditProfile || null);
        setName(res.data.user?.name || "");
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

        {/* Photo + name + city */}
        <Card className="p-5 bg-white border border-saffron-100 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-saffron-50 border-2 border-gold/50 overflow-hidden flex items-center justify-center shrink-0">
            {photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[36px]" aria-hidden="true">🙏</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[22px] font-bold text-ink font-hindi">
              {profile?.fullName || profile?.displayName || name || "—"}
            </span>
            <span className="t-hint text-softgrey font-hindi">
              📍 {profile?.city || profile?.location || "—"}
            </span>
          </div>
        </Card>

        {/* Row: manage poojas */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => router.push("/my-poojas")}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">🛕 {t("myPoojas.title")}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        {/* पूजाएँ chips */}
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-3">
          <h3 className="text-[18px] font-bold text-temple-600 font-hindi">{t("profileView.pujas")}</h3>
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
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-3">
          <h3 className="text-[18px] font-bold text-temple-600 font-hindi">{t("profileView.dakshina")}</h3>
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
