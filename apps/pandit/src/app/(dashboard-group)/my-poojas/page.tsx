"use client";

// मेरी पूजाएँ (F29) — manage specializations + dakshina.
// Price edits affect NEW bookings only (server snapshots dakshinaAmount);
// removal is blocked with a 409 while active bookings exist; newly added
// poojas carry सत्यापन-बाकी until video-verify (P12) clears them.

import { Narrate } from "@/hooks/useScreenVoice";
import { DashboardVoiceNav } from "@/components/voice/DashboardVoiceNav";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { t } from "@/lib/i18n";
import { mutateOnce } from "@/lib/mutate";
import { api } from "@/lib/api";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { VoiceActionListener } from "@/components/voice/VoiceActionListener";
import { VoiceField } from "@/components/voice/VoiceField";
import { FirstUseTip } from "@/components/moments/FirstUseTip";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";

const ALL_POOJAS = Object.values(hi.onboarding.specializations);

interface RateMap {
  [pooja: string]: number;
}

export default function MyPoojasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [poojas, setPoojas] = useState<string[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [rates, setRates] = useState<RateMap>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addPooja, setAddPooja] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const addBtnRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    const res = await api("/auth/me");
    if (!res.success) {
      router.push("/login");
      return;
    }
    const prof = res.data.user?.panditProfile;
    setPoojas(prof?.specializations || []);
    setPending(prof?.pendingPoojaVerifications || []);
    const map: RateMap = {};
    (prof?.dakshinaRates || []).forEach((r: { pujaType: string; amount: number }) => {
      map[r.pujaType] = r.amount;
    });
    (prof?.pujaServices || []).forEach((svc: { pujaType: string; dakshinaAmount: number }) => {
      if (map[svc.pujaType] === undefined) map[svc.pujaType] = svc.dakshinaAmount;
    });
    setRates(map);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveRate = async (pooja: string, amount: number) => {
    const res = await mutateOnce(`dakshina:${pooja}`, "/pandit/dakshina-rates", {
      method: "POST",
      body: JSON.stringify({ pujaType: pooja, amount }),
    });
    if (res.success) {
      setRates((r) => ({ ...r, [pooja]: amount }));
      setEditing(null);
      setEditValue("");
    } else {
      setToastMsg(t("common.error"));
    }
  };

  const removePooja = async (pooja: string) => {
    const res = await mutateOnce(`remove-pooja:${pooja}`, `/pandit/specializations/${encodeURIComponent(pooja)}`, {
      method: "DELETE",
    });
    if (res.success) {
      setPoojas((p) => p.filter((x) => x !== pooja));
      setPending((p) => p.filter((x) => x !== pooja));
      setToastMsg(t("myPoojas.removed"));
    } else if (
      (typeof res.error === "string" && res.error === "active_bookings") ||
      res.error?.code === "active_bookings" ||
      res.error?.message === "active_bookings"
    ) {
      setToastMsg(t("myPoojas.removeBlocked"));
    } else {
      setToastMsg(t("common.error"));
    }
  };

  const confirmAdd = async () => {
    if (!addPooja) return;
    const amount = parseInt(addValue, 10);
    const next = [...poojas, addPooja];
    const res = await mutateOnce(`add-pooja:${addPooja}`, "/pandit/profile", {
      method: "PATCH",
      body: JSON.stringify({ specializations: next }),
    });
    if (!res.success) {
      setToastMsg(t("common.error"));
      return;
    }
    if (Number.isFinite(amount) && amount > 0) {
      await mutateOnce(`dakshina:${addPooja}`, "/pandit/dakshina-rates", {
        method: "POST",
        body: JSON.stringify({ pujaType: addPooja, amount }),
      });
      setRates((r) => ({ ...r, [addPooja]: amount }));
    }
    setPoojas(next);
    setPending((p) => [...p, addPooja]);
    setShowAdd(false);
    setAddPooja(null);
    setAddValue("");
    setToastMsg(t("myPoojas.added"));
  };

  if (loading) return <DiyaLoader />;

  const remaining = ALL_POOJAS.filter((p) => !poojas.includes(p));

  return (
    <Screen
      title={t("myPoojas.title")}
      showBack
      onBack={() => router.push("/settings")}
      footer={
        !showAdd ? (
          <div ref={addBtnRef}>
            <FirstUseTip tipId="myPoojasAdd" targetRef={addBtnRef} />
            <Button variant="primary" size="lg" fullWidth onClick={() => setShowAdd(true)}>
              {t("myPoojas.addBtn")}
            </Button>
          </div>
        ) : undefined
      }
    >
      <Narrate text={t("myPoojas.intro")} />
      <DashboardVoiceNav helpLine={t("help.myPoojas")} />
      <VoiceActionListener
        commands={[{ keywords: ["नई पूजा", "nayi pooja", "जोड़"], action: () => setShowAdd(true) }]}
        promptText={t("help.myPoojas")}
      />

      <div className="flex flex-col gap-3">
        {poojas.length === 0 && (
          <EmptyState emoji="🙏" title={t("myPoojas.title")} hint={t("myPoojas.intro")} />
        )}

        {poojas.map((pooja) => (
          <Card key={pooja} className="p-4 bg-white border border-saffron-100 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[22px] font-bold text-ink font-hindi line-clamp-2">{pooja}</span>
              <button
                onClick={() => void removePooja(pooja)}
                aria-label={`${pooja} हटाएं`}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-red-50 text-danger text-[18px] font-bold flex items-center justify-center active:scale-95 transition-transform shrink-0"
              >
                ✖
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              {editing === pooja ? (
                <div className="flex-1">
                  <VoiceField
                    label=""
                    promptText={t("myPoojas.editPrompt")}
                    value={editValue}
                    onChange={setEditValue}
                    mode="money"
                    onComplete={() => {
                      const n = parseInt(editValue, 10);
                      if (Number.isFinite(n) && n > 0) void saveRate(pooja, n);
                    }}
                    placeholder="₹"
                  />
                  <Button
                    variant="success"
                    size="md"
                    fullWidth
                    className="mt-2"
                    onClick={() => {
                      const n = parseInt(editValue, 10);
                      if (Number.isFinite(n) && n > 0) void saveRate(pooja, n);
                    }}
                  >
                    {t("myPoojas.saveBtn")}
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditing(pooja);
                    setEditValue(String(rates[pooja] ?? ""));
                  }}
                  className="t-money text-[22px] min-h-[56px] px-2 flex items-center active:scale-[0.97] transition-transform"
                >
                  ₹{(rates[pooja] ?? 0).toLocaleString("en-IN")}
                </button>
              )}

              <span
                className={`rounded-full px-3 py-1.5 text-[14px] font-bold font-hindi shrink-0 ${
                  pending.includes(pooja)
                    ? "bg-amber-100 text-amber-800"
                    : "bg-leaf-100 text-leaf-700"
                }`}
              >
                {pending.includes(pooja) ? t("myPoojas.pendingVerify") : t("myPoojas.verified")}
              </span>
            </div>
          </Card>
        ))}

        {/* Add sheet (inline, grammar-compliant: one scroller) */}
        {showAdd && (
          <Card className="p-4 bg-white border-2 border-saffron-500 flex flex-col gap-3">
            <span className="t-title font-bold text-temple-600 font-hindi">{t("myPoojas.pickPooja")}</span>
            <div className="flex flex-wrap gap-2">
              {remaining.map((p) => (
                <button
                  key={p}
                  onClick={() => setAddPooja(p)}
                  className={`px-4 py-3 min-h-[56px] rounded-btn text-[18px] font-semibold font-hindi border-2 active:scale-[0.97] transition-transform ${
                    addPooja === p
                      ? "bg-saffron-500 text-[#FFF3EA] border-saffron-500"
                      : "bg-white text-ink border-saffron-200"
                  }`}
                >
                  {p}
                </button>
              ))}
              {remaining.length === 0 && (
                <span className="t-hint text-softgrey font-hindi">—</span>
              )}
            </div>

            {addPooja && (
              <VoiceField
                label={t("myPoojas.dakshinaLabel")}
                promptText={t("myPoojas.dakshinaPrompt")}
                value={addValue}
                onChange={setAddValue}
                mode="money"
                placeholder="₹"
              />
            )}

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => void confirmAdd()}
                disabled={!addPooja}
              >
                {t("myPoojas.saveBtn")}
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() => {
                  setShowAdd(false);
                  setAddPooja(null);
                  setAddValue("");
                }}
              >
                {t("common.no")}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg("")} />}
    </Screen>
  );
}
