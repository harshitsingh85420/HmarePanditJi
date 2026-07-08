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

  // Get specialized puja list, fallback to SATYANARAYAN if empty
  const specializations = profile?.panditProfile?.specializations?.length
    ? profile.panditProfile.specializations
    : ["SATYANARAYAN"];

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
