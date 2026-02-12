"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function PanditAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Auth page doesn't need a guard
    if (pathname === "/auth") {
      setChecked(true);
      return;
    }

    const token = localStorage.getItem("hpj_pandit_access_token");
    if (!token) {
      router.replace("/auth");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  // On the auth page always render immediately
  if (pathname === "/auth") return <>{children}</>;

  // Show nothing while checking to prevent flash of protected content
  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
