"use client";

// ─────────────────────────────────────────────────────────────
// LOADING HARNESS — /design/harness/loading (DEV ONLY; 404 in prod).
// Renders the real DiyaLoader (canon frame 28, प्रतीक्षा) full-screen for
// the canon-vs-built comparison. Never linked from the app.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { notFound } from "next/navigation";
import { DiyaLoader } from "../../../../components/moments/DiyaLoader";

export default function LoadingHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DiyaLoader />;
}
