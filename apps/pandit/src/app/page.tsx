"use client";

// Root — the orchestrator at /onboarding owns ALL entry routing (resume
// rules, token checks, phase machine). This page only forwards.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);
  return null;
}
