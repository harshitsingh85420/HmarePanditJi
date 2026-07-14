"use client";

// Legacy stub — the real dashboard lives at /home. Kept as a redirect so old
// links and persisted resume states land somewhere useful instead of a
// dead-end "coming soon" card.
import { useEffect } from "react";
import { getToken } from "@/lib/safeStorage";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getToken() ? "/home" : "/login");
  }, [router]);
  return null;
}
