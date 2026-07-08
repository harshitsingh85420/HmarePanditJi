"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import React from "react";
import { t } from "../../lib/i18n";

export default function TestVoicePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="flex flex-col items-center gap-6 text-center max-w-xl">
        <h1 className="text-3xl font-bold text-orange-600">
          {t("welcome.title")}
        </h1>

        <p className="text-lg text-gray-800">
          {t("welcome.voiceIntro")}
        </p>

        <Narrate text={t("welcome.voiceIntro")} />

        {/* शिष्य specimen — the ONE voice control */}
        <ShishyaOrb />
      </div>
    </main>
  );
}
