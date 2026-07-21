"use client";

// ─────────────────────────────────────────────────────────────
// PARICHAY HARNESS — /design/harness/parichay (DEV ONLY; 404 in prod).
// Renders the real ParichayScreen (canon frame 4) with a no-op onDone for
// the canon-vs-built comparison. The mic-permission ladder runs live; the
// static top (शिष्य + greeting + mic card) paints on mount regardless.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { notFound } from "next/navigation";
import ParichayScreen from "../../../onboarding/screens/ParichayScreen";

export default function ParichayHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ParichayScreen onDone={() => { /* held for the screenshot */ }} />;
}
