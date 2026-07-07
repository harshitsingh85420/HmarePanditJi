"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Resolve a stored storage key (e.g. "uploads/u1/aadhaar/x.jpg") to a
 * short-lived presigned URL via GET /files/presign.
 * Legacy values ("/uploads/..." or "http...") are used as-is.
 * Call refresh() if the URL expires (e.g. an <img> onError after 15 min).
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
    const res = await api(`/files/presign?key=${encodeURIComponent(keyOrUrl)}`);
    setUrl(res.success ? res.data.url : null);
  }, [keyOrUrl]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return { url, refresh: resolve };
}
