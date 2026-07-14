"use client";

// ─────────────────────────────────────────────────────────────
// Samagri package builder for ONE puja — extracted from the
// /samagri screen so the booking-readiness flow (R2) reuses the
// exact same editor. Default item list → edit qty / add / remove
// → Basic/Standard/Premium fixed prices (at least one tier).
// Talks to GET/POST /pandit/samagri-packages.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { mutateOnce } from "@/lib/mutate";
import { api } from "@/lib/api";
import { Narrate } from "@/hooks/useScreenVoice";
import { Button } from "@/components/ui/Button";
import { VoiceField } from "@/components/voice/VoiceField";
import { useVoice } from "@/hooks/useVoice";

interface SamagriItem {
  name: string;
  qty: string;
}

interface TierPackage {
  tier: "BASIC" | "STANDARD" | "PREMIUM";
  price: number | null;
  items: SamagriItem[];
}

export function SamagriPackageEditor({
  pujaType,
  onSaved,
  narrate = true,
}: {
  pujaType: string;
  onSaved?: () => void;
  narrate?: boolean;
}) {
  const { speak } = useVoice();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SamagriItem[]>([]);
  const [prices, setPrices] = useState({ BASIC: "", STANDARD: "", PREMIUM: "" });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      setErrorMsg("");
      const res = await api(`/pandit/samagri-packages?pujaType=${encodeURIComponent(pujaType)}`);
      setLoading(false);

      if (res.success && res.data) {
        const backendTiers: TierPackage[] = res.data.tiers;
        // Shared items list: use first tier items list or empty
        setItems(backendTiers[0]?.items || []);
        const priceMap = { BASIC: "", STANDARD: "", PREMIUM: "" };
        backendTiers.forEach((pkg) => {
          priceMap[pkg.tier] = pkg.price ? pkg.price.toString() : "";
        });
        setPrices(priceMap);
      } else {
        setErrorMsg(t("common.error"));
        speak(t("common.error"));
      }
    };
    void fetchPackage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pujaType]);

  const handleQtyChange = (index: number, newQty: string) => {
    const updated = [...items];
    updated[index].qty = newQty;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemQty.trim()) return;
    setItems([...items, { name: newItemName.trim(), qty: newItemQty.trim() }]);
    setNewItemName("");
    setNewItemQty("");
    setShowAddForm(false);
  };

  const handleSave = async () => {
    const bPrice = prices.BASIC ? Number(prices.BASIC) : 0;
    const sPrice = prices.STANDARD ? Number(prices.STANDARD) : 0;
    const pPrice = prices.PREMIUM ? Number(prices.PREMIUM) : 0;

    if (!bPrice && !sPrice && !pPrice) {
      setErrorMsg(t("samagri.priceError"));
      speak(t("samagri.priceError"));
      return;
    }

    setSaving(true);
    setErrorMsg("");

    const payloadTiers = [
      { tier: "BASIC", price: bPrice || null, items },
      { tier: "STANDARD", price: sPrice || null, items },
      { tier: "PREMIUM", price: pPrice || null, items },
    ];

    const res = await mutateOnce(`samagri-save:${pujaType}`, "/pandit/samagri-packages", {
      method: "POST",
      body: JSON.stringify({ pujaType, tiers: payloadTiers }),
    });

    setSaving(false);

    if (!res.success) {
      setErrorMsg(t("common.error"));
      speak(t("common.error"));
      return;
    }

    speak(t("samagri.saved"));
    onSaved?.();
  };

  return (
    <>
      {narrate && <Narrate text={t("onboarding.step5Voice")} />}

      <div className="bg-white rounded-card shadow-card p-5 border border-saffron-100 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-saffron-100 pb-3">
          <h2 className="text-[22px] font-bold text-temple-700 font-hindi">{pujaType}</h2>
          <span className="t-hint text-saffron-600 font-bold px-3 py-1 bg-saffron-50 rounded-full">
            {items.length} {t("samagri.itemsCount")}
          </span>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-500" />
          </div>
        ) : (
          <>
            {/* EDITABLE ITEMS LIST ROWS */}
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b border-slate-50 pb-2">
                  <div className="text-[18px] font-bold text-ink flex-grow font-hindi leading-snug">
                    {item.name}
                  </div>
                  <div className="w-[130px] flex-shrink-0">
                    <VoiceField
                      label=""
                      promptText={`${item.name} की मात्रा बोलें`}
                      value={item.qty}
                      onChange={(val) => handleQtyChange(idx, val)}
                      mode="number"
                      placeholder={t("samagri.qtyPlaceholder")}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="w-11 h-11 border-2 border-danger rounded-btn flex items-center justify-center text-danger hover:bg-red-50"
                    style={{ width: "44px", height: "44px" }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>

            {/* ADD NEW ITEM FORM */}
            {showAddForm ? (
              <div className="flex flex-col gap-3 p-4 bg-saffron-50/50 rounded-card border border-saffron-100 mt-2">
                <VoiceField
                  label={t("samagri.itemNamePlaceholder")}
                  promptText="सामग्री का नाम बोलें"
                  value={newItemName}
                  onChange={setNewItemName}
                  mode="text"
                  placeholder={t("samagri.itemNamePlaceholder")}
                />
                <VoiceField
                  label={t("samagri.qtyPlaceholder")}
                  promptText="सामग्री की मात्रा बोलें"
                  value={newItemQty}
                  onChange={setNewItemQty}
                  mode="number"
                  placeholder={t("samagri.qtyPlaceholder")}
                />
                <div className="flex gap-2">
                  <Button variant="primary" size="md" fullWidth onClick={handleAddItem}>
                    {t("common.save")}
                  </Button>
                  <Button variant="secondary" size="md" fullWidth onClick={() => setShowAddForm(false)}>
                    {t("common.back")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" size="md" onClick={() => setShowAddForm(true)}>
                {t("samagri.addItem")}
              </Button>
            )}

            {/* TIER PRICING */}
            <div className="flex flex-col gap-4 mt-4">
              <h3 className="text-[18px] font-bold text-temple-600 font-hindi border-t border-saffron-100 pt-3">
                {t("booking.samagri")}
              </h3>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <VoiceField
                    label="Basic"
                    promptText="बेसिक पैकेज की कीमत क्या है?"
                    value={prices.BASIC}
                    onChange={(val) => setPrices({ ...prices, BASIC: val })}
                    mode="money"
                    placeholder="₹ 0"
                  />
                </div>
                <div className="flex-1">
                  <VoiceField
                    label="Standard"
                    promptText="स्टैंडर्ड पैकेज की कीमत क्या है?"
                    value={prices.STANDARD}
                    onChange={(val) => setPrices({ ...prices, STANDARD: val })}
                    mode="money"
                    placeholder="₹ 0"
                  />
                </div>
                <div className="flex-1">
                  <VoiceField
                    label="Premium"
                    promptText="प्रीमियम पैकेज की कीमत क्या है?"
                    value={prices.PREMIUM}
                    onChange={(val) => setPrices({ ...prices, PREMIUM: val })}
                    mode="money"
                    placeholder="₹ 0"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={saving}
              style={{ minHeight: "56px", fontSize: "18px", marginTop: "1rem" }}
            >
              {t("common.save")}
            </Button>
          </>
        )}
      </div>

      {errorMsg && (
        <div className="px-4 py-2 bg-red-50 rounded-card border border-danger/20">
          <p className="text-danger text-[20px] font-semibold text-center leading-normal">{errorMsg}</p>
        </div>
      )}
    </>
  );
}

export default SamagriPackageEditor;
