"use client";

import { useEffect, useState } from "react";
import { hi } from "@/lib/strings";

/** Live online/offline state for gating network actions. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}

// Slim global bar under the header; mounted once from the root layout.
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="sticky top-0 z-40 w-full bg-temple-600 text-white text-center text-[16px] font-semibold font-hindi px-4 py-2">
      {hi.offline.banner}
    </div>
  );
}

export default OfflineBanner;
