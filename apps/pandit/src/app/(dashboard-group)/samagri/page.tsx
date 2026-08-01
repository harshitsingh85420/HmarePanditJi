"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

// UI Components
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Toast } from "@/components/ui/Toast";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { SamagriPackageEditor } from "@/components/SamagriPackageEditor";
import { purgeUserData } from "@/lib/purgeUserData";

export default function SamagriPage() {
  const router = useRouter();

  // Screen states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedPuja, setSelectedPuja] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // Fetch profiles on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api("/auth/me");
      if (!res.success) {
        purgeUserData();
        router.push("/login");
        return;
      }
      setProfile(res.data.user);
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  if (loading && !selectedPuja) {
    return <DiyaLoader />;
  }

  /* F-J4-7 · RULED 2026-08-01 (Isj) — THE SUBSTITUTION IS GONE.
     This read:
         : ["SATYANARAYAN"]
     so when /auth/me answered TRUTHFULLY that this pandit has registered no
     specializations — on a fully successful 200 — the real empty answer was
     discarded and one invented puja was put in its place. The pandit was then
     shown a सामग्री editor for a पूजा HE NEVER REGISTERED, and anything he
     saved went to the server against that pujaType.

     Same mistake as PANDITS_FALLBACK, pointed at the pandit instead of the
     customer, and this one WRITES. An empty list is a fact worth showing, not
     a value worth replacing. */
  const specializations: string[] = Array.isArray(profile?.panditProfile?.specializations)
    ? profile.panditProfile.specializations
    : [];

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header
        title={t("samagri.title")}
        showBack
        onBack={() => {
          if (selectedPuja !== null) {
            setSelectedPuja(null);
          } else {
            router.push("/home");
          }
        }}
      />

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 flex flex-col gap-3 page-enter">
        {selectedPuja === null ? (
          /* SCREEN 1: PICK PUJA TYPE */
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-bold text-temple-600 font-hindi mb-2 text-center">
              {t("samagri.pickPuja")}
            </h2>

            {/* The honest empty, with the path OUT of it. A pandit who has
                registered no पूजा needs to be told that and handed the way to
                fix it — not handed an editor for a पूजा he never chose. */}
            {specializations.length === 0 && (
              <Card className="p-6 bg-white flex flex-col items-center text-center gap-3">
                <span className="text-[32px]">🪔</span>
                <p className="text-[18px] font-bold text-temple-700 font-hindi">
                  अभी आपने कोई पूजा नहीं जोड़ी है
                </p>
                <p className="text-[15px] text-ink/70 font-hindi">
                  सामग्री की सूची बनाने के लिए पहले अपनी पूजा जोड़िए।
                </p>
                <button
                  /* /my-poojas/add — NOT /poojas/add. The route lives at
                     (dashboard-group)/my-poojas/add and the route group does
                     not appear in the URL. Verified against the filesystem
                     before shipping; the first draft was a dead CTA. */
                  onClick={() => router.push("/my-poojas/add")}
                  className="mt-1 px-6 py-3 rounded-xl bg-saffron-500 text-white text-[17px] font-bold font-hindi min-h-[52px]"
                >
                  पूजा जोड़िए
                </button>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {specializations.map((spec: string) => (
                <motion.div
                  key={spec}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPuja(spec)}
                  className="cursor-pointer"
                >
                  <Card className="p-6 border-l-4 border-l-saffron-500 hover:shadow-md transition-all flex justify-between items-center bg-white min-h-[80px]">
                    <span className="text-[22px] font-bold text-temple-700 font-hindi">
                      {t(`onboarding.specializations.${spec}`)}
                    </span>
                    <span className="text-[24px]">🪔</span>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* SCREEN 2: EDIT SAMAGRI PACKAGES (shared builder) */
          <SamagriPackageEditor
            pujaType={selectedPuja}
            onSaved={() => {
              setToastMsg(t("samagri.saved"));
              setTimeout(() => {
                setSelectedPuja(null);
                setToastMsg("");
              }, 2000);
            }}
          />
        )}

        {/* Toast Notification */}
        {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg("")} />}
      </main>

      {/* शिष्य footer slot */}
      <footer className="shrink-0 px-4 py-2 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  );
}
