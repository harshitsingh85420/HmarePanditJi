"use client";

import { useState } from "react";

export interface VoiceHelpButtonProps {
  label?: string;
}

export function useVoiceHelp() {
  const [open, setOpen] = useState(false);
  return {
    open,
    openHelp: () => setOpen(true),
    closeHelp: () => setOpen(false),
  };
}

export function VoiceHelpButton({ label = "Voice Help" }: VoiceHelpButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <span className="material-symbols-outlined text-base">mic</span>
      {label}
    </button>
  );
}
