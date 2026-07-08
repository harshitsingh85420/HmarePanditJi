"use client";

// Root — the orchestrator at /onboarding owns ALL entry routing (resume
// rules, token checks, phase machine). This page forwards, but paints the
// splash on frame one while doing so (X1: never return null/blank; the
// orchestrator keeps rendering the same splash behind its resume check,
// so the handoff is seamless).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SunriseSplash } from "@/components/moments/SunriseSplash";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);
  return <SunriseSplash onDone={() => { /* forwarding to /onboarding */ }} />;
}
