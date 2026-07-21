"use client";

// ─────────────────────────────────────────────────────────────
// भाषा HARNESS — /design/harness/language (DEV ONLY; 404 in prod).
// Renders the real LanguageListScreen for the canon-frame-3 comparison.
// Never linked from the app.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { notFound } from "next/navigation";
import LanguageListScreen from "../../../onboarding/screens/LanguageListScreen";

export default function LanguageHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <LanguageListScreen
      language={null}
      onSelect={() => {}}
      onBack={() => {}}
      onLanguageChange={() => {}}
    />
  );
}
