"use client";

import React from "react";
import { hi } from "../../lib/strings";
import { SpeakOnMount, VoiceBar } from "../../components/VoiceBar";

export default function TestVoicePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="flex flex-col items-center gap-6 text-center max-w-xl">
        <h1 className="text-3xl font-bold text-orange-600">
          {hi.welcome.title}
        </h1>

        <p className="text-lg text-gray-800">
          {hi.welcome.voiceIntro}
        </p>

        {/* Speak on mount / replay button */}
        <SpeakOnMount text={hi.welcome.voiceIntro} />
      </div>

      {/* Voice mute/unmute floating button */}
      <VoiceBar />
    </main>
  );
}
