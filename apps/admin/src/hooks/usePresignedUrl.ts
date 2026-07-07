"use client";

import { useCallback, useEffect, useState } from "react";
import { ADMIN_TOKEN_KEY } from "@hmarepanditji/utils";

/**
 * Resolve a stored storage key (e.g. "uploads/u1/aadhaar/x.jpg") to a
 * short-lived presigned URL via GET /files/presign (admin token).
 * Legacy values ("/uploads/..." or "http...") are used as-is.
 */
export function usePresignedUrl(keyOrUrl: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  const resolve = useCallback(async () => {
    if (!keyOrUrl) {
      setUrl(null);
      return;
    }
    if (keyOrUrl.startsWith("/uploads/") || keyOrUrl.startsWith("http") || keyOrUrl.startsWith("data:")) {
      setUrl(keyOrUrl);
      return;
    }
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/files/presign?key=${encodeURIComponent(keyOrUrl)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUrl(data.success ? data.data.url : null);
    } catch {
      setUrl(null);
    }
  }, [keyOrUrl]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return { url, refresh: resolve };
}
