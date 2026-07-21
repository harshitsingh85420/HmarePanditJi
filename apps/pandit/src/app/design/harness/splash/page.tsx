"use client";

// ─────────────────────────────────────────────────────────────
// SPLASH HARNESS — /design/harness/splash (DEV ONLY; 404 in prod).
// Renders the real SunriseSplash with a no-op onDone so it stays on
// screen for the canon-vs-built comparison. Never linked from the app.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { notFound } from "next/navigation";
import { SunriseSplash } from "../../../../components/moments/SunriseSplash";

export default function SplashHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <SunriseSplash onDone={() => { /* held for the screenshot */ }} />;
}
