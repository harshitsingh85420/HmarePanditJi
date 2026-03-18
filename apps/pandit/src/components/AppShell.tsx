"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "./SidebarLayout";

const MINIMAL_PATHS = ["/onboarding", "/auth", "/login", "/tutorial", "/intro", "/welcome", "/start"];

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("hpj_pandit_token") ||
    localStorage.getItem("hpj_pandit_access_token") ||
    localStorage.getItem("token")
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const isMinimal = MINIMAL_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(p + "/")
  );

  useEffect(() => {
    const token = getToken();
    if (!token && !isMinimal) {
      const onboardingDone = localStorage.getItem("hpj_pandit_onboarding_v1");
      let tutorialCompleted = false;
      try {
        const state = JSON.parse(onboardingDone || "{}");
        tutorialCompleted = state.tutorialCompleted === true;
      } catch (_e) { /* ignore parse errors */ }

      if (!tutorialCompleted) {
        window.location.href = "/onboarding";
      } else {
        window.location.href =
          "http://localhost:3000/login?redirect=pandit&next=" +
          encodeURIComponent(pathname || "/");
      }
      return;
    }
    setAuthChecked(true);
  }, [pathname, isMinimal, router]);

  if (isMinimal) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vedic-cream">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
