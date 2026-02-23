"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONFETTI_COLORS = ["#f09942", "#dc6803", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

function Confetti() {
  const [pieces, setPieces] = useState<
    { id: number; x: number; color: string; delay: number; duration: number; size: number }[]
  >([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        size: 6 + Math.random() * 10,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 opacity-80"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confettiFall ${p.duration}s ${p.delay}s linear forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function OnboardingCompletePage() {
  const [panditName, setPanditName] = useState("Pandit Ji");

  useEffect(() => {
    const info = localStorage.getItem("hpj_pandit_info");
    if (info) {
      try {
        const parsed = JSON.parse(info) as { name?: string };
        if (parsed.name) setPanditName(parsed.name);
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] to-[#f8f7f6] flex items-center justify-center px-4 py-8 relative">
      <Confetti />

      <div className="relative z-10 max-w-sm w-full text-center">
        {/* Big celebration icon */}
        <div className="w-24 h-24 rounded-full bg-[#f09942]/10 border-4 border-[#f09942]/30 flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-5xl text-[#f09942]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            celebration
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🙏 बधाई हो, {panditName.split(" ")[0]} Ji!
        </h1>
        <p className="text-gray-600 text-base mb-8">आपकी प्रोफाइल पूरी हो गई है।</p>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left">
          <p className="text-sm font-bold text-gray-700 mb-4">आगे क्या होगा:</p>
          <div className="space-y-3">
            {[
              { done: true, label: "✅ प्रोफाइल पूरी हो गई", icon: "check_circle" },
              { done: false, label: "हमारी team 24–48 घंटों में verify करेगी", icon: "pending" },
              { done: false, label: "Video KYC verify हो रही है", icon: "videocam" },
              { done: false, label: "Verification के बाद आपको SMS आएगा", icon: "sms" },
              { done: false, label: "उसके बाद बुकिंग लेना शुरू कर सकते हैं", icon: "event_available" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined text-xl mt-0.5 flex-shrink-0 ${item.done ? "text-green-500" : "text-gray-300"}`}
                  style={item.done ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <p className={`text-sm ${item.done ? "text-green-700 font-semibold" : "text-gray-500"}`}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="block w-full bg-[#f09942] hover:bg-[#dc6803] text-white font-bold py-4 rounded-xl text-base transition-colors"
        >
          डैशबोर्ड पर जाएं →
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          Verification के दौरान भी आप अपना dashboard देख सकते हैं
        </p>
      </div>
    </div>
  );
}
