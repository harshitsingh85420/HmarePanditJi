"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "./SidebarLayout";

const MINIMAL_PATHS = ["/onboarding", "/auth", "/login"];

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
      const loginUrl = `http://localhost:3000/login?redirect=pandit&next=${encodeURIComponent(pathname || "/")}`;
      window.location.href = loginUrl;
      return;
    }
    setAuthChecked(true);
  }, [pathname, isMinimal, router]);

  // On minimal pages (onboarding/auth), render immediately without sidebar
  if (isMinimal) {
    return <>{children}</>;
  }

  // Show spinner while checking auth
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f7f6]">
        <span className="w-10 h-10 border-3 border-[#f09942] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
