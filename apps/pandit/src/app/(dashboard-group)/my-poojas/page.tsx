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

// Mockup frame 21: every card opens with an emoji tile. Name-keyed DECORATION
// only (custom pujas fall back to 🪔) — never data, never state.
const POOJA_EMOJI: Array<[RegExp, string]> = [
  [/सत्यनारायण|कथा/, "🕉️"],
  [/गृह प्रवेश|वास्तु/, "🏠"],
  [/विवाह/, "💍"],
  [/मुंडन|नामकरण/, "👶"],
  [/हवन|यज्ञ/, "🔥"],
  [/रुद्राभिषेक|शिव/, "🔱"],
  [/श्राद्ध|पिंडदान/, "🪷"],
  [/नवग्रह|शांति/, "✨"],
];
const poojaEmoji = (name: string) => POOJA_EMOJI.find(([re]) => re.test(name))?.[1] ?? "🪔";

interface RateMap {
  [pooja: string]: number;
}

export default function MyPoojasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [poojas, setPoojas] = useState<string[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [verifications, setVerifications] = useState<Record<string, { status: string; rejectionReason: string | null }>>({});
  const [rates, setRates] = useState<RateMap>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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

    // 3-state verification from the per-puja rows (replaces the legacy 2-state
    // pendingPoojaVerifications array): APPROVED ✓ / REJECTED ✗ +reason / PENDING ⏳.
    const vres = await api("/pandit/pooja-verifications");
    if (vres.success && vres.data?.latest) {
      const vmap: Record<string, { status: string; rejectionReason: string | null }> = {};
      for (const r of vres.data.latest as Array<{ poojaType: string; status: string; rejectionReason: string | null }>) {
        vmap[r.poojaType] = { status: r.status, rejectionReason: r.rejectionReason ?? null };
      }
      setVerifications(vmap);
    }

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

  if (loading) return <DiyaLoader />;

  return (
    <Screen
      title={t("myPoojas.title")}
      showBack
      onBack={() => router.push("/settings")}
      footer={
        <div ref={addBtnRef}>
          <FirstUseTip tipId="myPoojasAdd" targetRef={addBtnRef} />
          {/* Mockup frame 21 CTA: saffron-TINTED (bg #FDEEE7, 2px #F4B096
              border), not a solid primary — the add is a calm side door */}
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            className="bg-saffron-50 border-2 border-saffron-200 text-saffron-500 font-extrabold"
            onClick={() => router.push("/my-poojas/add")}
          >
            <span className="text-[24px] leading-none" aria-hidden>＋</span>
            {t("myPoojas.addBtn")}
          </Button>
        </div>
      }
    >
      <Narrate text={t("myPoojas.intro")} />
      <DashboardVoiceNav helpLine={t("help.myPoojas")} />
      <VoiceActionListener
        commands={[{ keywords: ["नई पूजा", "nayi pooja", "जोड़"], action: () => router.push("/my-poojas/add") }]}
        promptText={t("help.myPoojas")}
      />

      <div className="flex flex-col gap-3">
        {poojas.length === 0 && (
          <EmptyState emoji="🙏" title={t("myPoojas.title")} hint={t("myPoojas.intro")} />
        )}

        {poojas.map((pooja) => {
          const v = verifications[pooja];
          // fall back to the legacy pending array until a verification row exists
          const status = v?.status ?? (pending.includes(pooja) ? "PENDING" : "APPROVED");
          // Mockup frame 21: the card BORDER carries the state tint and the
          // status is a plain colored text line under the name (no pill).
          const borderCls =
            status === "REJECTED" ? "border-[#E7B8AF]"
              : status === "PENDING" ? "border-[#EBCF86]"
                : "border-[#BFE3CC]";
          const statusCls =
            status === "REJECTED" ? "text-danger"
              : status === "PENDING" ? "text-brassdark"
                : "text-leaf-700";
          const statusLabel =
            status === "REJECTED" ? `✗ ${t("myPoojas.rejected")}`
              : status === "PENDING" ? `⏳ ${t("myPoojas.pendingVerify")}`
                : `✓ ${t("myPoojas.verified")}`;

          return (
          <Card key={pooja} className={`p-4 bg-card border ${borderCls} flex flex-col gap-2`}>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-[12px] bg-saffron-50 flex items-center justify-center text-[26px] shrink-0 select-none">
                {poojaEmoji(pooja)}
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-[18px] font-black text-ink font-hindi line-clamp-2 leading-snug">{pooja}</span>
                <span className={`text-[13px] font-extrabold font-hindi ${statusCls}`}>{statusLabel}</span>
              </div>
              <button
                onClick={() => void removePooja(pooja)}
                aria-label={`${pooja} हटाएं`}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-red-50 text-danger text-[18px] font-bold flex items-center justify-center active:scale-95 transition-transform shrink-0"
              >
                ✖
              </button>
            </div>

            {editing === pooja ? (
              <div>
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
                className="self-end t-money text-[19px] font-black text-leaf-700 min-h-[48px] px-2 flex items-center active:scale-[0.97] transition-transform"
              >
                ₹{(rates[pooja] ?? 0).toLocaleString("en-IN")}
              </button>
            )}

            {(() => {
              if (v?.status !== "REJECTED" || !v?.rejectionReason) return null;
              return (
                <p className="text-[14px] text-danger font-hindi leading-snug">
                  {t("myPoojas.rejectedReasonPrefix")} {v.rejectionReason}
                </p>
              );
            })()}
          </Card>
          );
        })}

      </div>

      {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg("")} />}
    </Screen>
  );
}
