"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Toast } from "@/components/ui/Toast";
import { SpeakOnMount } from "@/components/VoiceBar";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
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

export default function SamagriPage() {
  const router = useRouter();
  const { speak } = useVoice();

  // Screen states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedPuja, setSelectedPuja] = useState<string | null>(null);

  // Samagri editor states (for selected puja)
  const [items, setItems] = useState<SamagriItem[]>([]);
  const [prices, setPrices] = useState({
    BASIC: "",
    STANDARD: "",
    PREMIUM: "",
  });

  // Add Item form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");

  // Toast / Error states
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch profiles on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api("/auth/me");
      if (!res.success) {
        localStorage.removeItem("pandit_token");
        router.push("/login");
        return;
      }
      setProfile(res.data.user);
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  // Fetch package details when puja is selected
  useEffect(() => {
    if (!selectedPuja) return;

    const fetchPackage = async () => {
      setLoading(true);
      setErrorMsg("");
      const res = await api(`/pandit/samagri-packages?pujaType=${selectedPuja}`);
      setLoading(false);

      if (res.success && res.data) {
        const backendTiers: TierPackage[] = res.data.tiers;
        // Shared items list: use first tier items list or empty
        const sharedItems = backendTiers[0]?.items || [];
        setItems(sharedItems);

        // Set prices
        const priceMap = { BASIC: "", STANDARD: "", PREMIUM: "" };
        backendTiers.forEach((pkg) => {
          priceMap[pkg.tier] = pkg.price ? pkg.price.toString() : "";
        });
        setPrices(priceMap);
      } else {
        setErrorMsg(hi.common.error);
        speak(hi.common.error);
      }
    };

    fetchPackage();
  }, [selectedPuja]);

  if (loading && !selectedPuja) {
    return <DiyaLoader />;
  }

  // Get specialized puja list, fallback to SATYANARAYAN if empty
  const specializations = profile?.panditProfile?.specializations?.length
    ? profile.panditProfile.specializations
    : ["SATYANARAYAN"];

  const handleQtyChange = (index: number, newQty: string) => {
    const updated = [...items];
    updated[index].qty = newQty;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
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
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
      return;
    }

    setSaving(true);
    setErrorMsg("");

    const payloadTiers = [
      { tier: "BASIC", price: bPrice || null, items },
      { tier: "STANDARD", price: sPrice || null, items },
      { tier: "PREMIUM", price: pPrice || null, items },
    ];

    const res = await api("/pandit/samagri-packages", {
      method: "POST",
      body: JSON.stringify({
        pujaType: selectedPuja,
        tiers: payloadTiers,
      }),
    });

    setSaving(false);

    if (!res.success) {
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
      return;
    }

    setToastMsg(hi.samagri.saved);
    speak(hi.samagri.saved);

    // Redirect to home menu after a short delay
    setTimeout(() => {
      setSelectedPuja(null);
      setToastMsg("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-cream text-ink pb-20">
      <Header
        title={hi.samagri.title}
        showBack={selectedPuja !== null}
        onBack={() => {
          setSelectedPuja(null);
          setErrorMsg("");
        }}
      />

      <main className="max-w-[430px] mx-auto px-4 pt-4 flex flex-col gap-5">
        {selectedPuja === null ? (
          /* SCREEN 1: PICK PUJA TYPE */
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-bold text-temple-600 font-hindi mb-2 text-center">
              {hi.auth.phoneLabel.replace(/.*मोबाइल.*/, "पूजा का चयन करें")}
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
                      {spec}
                    </span>
                    <span className="text-[24px]">🪔</span>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* SCREEN 2: EDIT SAMAGRI PACKAGES */
          <>
            <SpeakOnMount text={hi.samagri.introVoice} />

            <div className="bg-white rounded-card shadow-card p-5 border border-saffron-100 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-saffron-100 pb-3">
                <h2 className="text-[22px] font-bold text-temple-700 font-hindi">
                  {selectedPuja}
                </h2>
                <span className="t-hint text-saffron-600 font-bold px-3 py-1 bg-saffron-50 rounded-full">
                  {items.length} {hi.samagri.itemQty}
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
                      <div
                        key={idx}
                        className="flex items-center gap-3 border-b border-slate-50 pb-2"
                      >
                        <div className="text-[18px] font-bold text-ink flex-grow font-hindi leading-snug">
                          {item.name}
                        </div>
                        <input
                          type="text"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          className="w-[110px] h-[56px] px-2 border-2 border-saffron-200 rounded-btn text-[18px] text-center font-bold text-ink bg-white focus:border-saffron-500 focus:outline-none"
                          style={{ minHeight: "56px", fontSize: "18px" }}
                        />
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
                      <input
                        type="text"
                        placeholder={hi.samagri.itemName}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-btn text-[18px] font-hindi text-ink bg-white focus:outline-none"
                        style={{ minHeight: "56px", fontSize: "18px" }}
                      />
                      <input
                        type="text"
                        placeholder={hi.samagri.itemQty}
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(e.target.value)}
                        className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-btn text-[18px] font-hindi text-ink bg-white focus:outline-none"
                        style={{ minHeight: "56px", fontSize: "18px" }}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="md"
                          fullWidth
                          onClick={handleAddItem}
                        >
                          {hi.samagri.addBtn}
                        </Button>
                        <Button
                          variant="secondary"
                          size="md"
                          fullWidth
                          onClick={() => setShowAddForm(false)}
                        >
                          {hi.common.back}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setShowAddForm(true)}
                    >
                      {hi.samagri.addItem}
                    </Button>
                  )}

                  {/* TIER PRICING */}
                  <div className="flex flex-col gap-4 mt-4">
                    <h3 className="text-[18px] font-bold text-temple-600 font-hindi border-t border-saffron-100 pt-3">
                      {hi.samagri.fixedPrice}
                    </h3>

                    <div className="flex flex-col md:flex-row gap-3">
                      {/* Basic Tier */}
                      <div className="flex-1 bg-white p-3 rounded-card border-2 border-saffron-200 flex flex-col gap-2">
                        <span className="text-[18px] font-bold text-temple-700 font-hindi text-center">
                          {hi.samagri.basic}
                        </span>
                        <div className="flex items-center bg-white border border-saffron-300 rounded-btn px-2">
                          <span className="text-[18px] font-bold pr-2">₹</span>
                          <input
                            type="tel"
                            pattern="[0-9]*"
                            value={prices.BASIC}
                            onChange={(e) =>
                              setPrices({ ...prices, BASIC: e.target.value.replace(/\D/g, "") })
                            }
                            className="w-full h-[56px] outline-none text-[18px] font-bold text-ink"
                            style={{ minHeight: "56px", fontSize: "18px" }}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Standard Tier */}
                      <div className="flex-1 bg-white p-3 rounded-card border-2 border-saffron-300 flex flex-col gap-2">
                        <span className="text-[18px] font-bold text-temple-700 font-hindi text-center">
                          {hi.samagri.standard}
                        </span>
                        <div className="flex items-center bg-white border border-saffron-300 rounded-btn px-2">
                          <span className="text-[18px] font-bold pr-2">₹</span>
                          <input
                            type="tel"
                            pattern="[0-9]*"
                            value={prices.STANDARD}
                            onChange={(e) =>
                              setPrices({ ...prices, STANDARD: e.target.value.replace(/\D/g, "") })
                            }
                            className="w-full h-[56px] outline-none text-[18px] font-bold text-ink"
                            style={{ minHeight: "56px", fontSize: "18px" }}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Premium Tier */}
                      <div className="flex-1 bg-white p-3 rounded-card border-2 border-saffron-200 flex flex-col gap-2">
                        <span className="text-[18px] font-bold text-temple-700 font-hindi text-center">
                          {hi.samagri.premium}
                        </span>
                        <div className="flex items-center bg-white border border-saffron-300 rounded-btn px-2">
                          <span className="text-[18px] font-bold pr-2">₹</span>
                          <input
                            type="tel"
                            pattern="[0-9]*"
                            value={prices.PREMIUM}
                            onChange={(e) =>
                              setPrices({ ...prices, PREMIUM: e.target.value.replace(/\D/g, "") })
                            }
                            className="w-full h-[56px] outline-none text-[18px] font-bold text-ink"
                            style={{ minHeight: "56px", fontSize: "18px" }}
                            placeholder="0"
                          />
                        </div>
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
                    {hi.samagri.saveBtn}
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* Global Error Display */}
        {errorMsg && (
          <div className="px-4 py-2 bg-red-50 rounded-card border border-danger/20">
            <p className="text-danger text-[20px] font-semibold text-center leading-normal">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Toast Notification */}
        {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg("")} />}
      </main>
    </div>
  );
}
