"use client";

import { hi } from "./strings";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
  };
}

export async function api<T = any>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<ApiResponse<T>> {
  const { timeoutMs, ...fetchOptions } = options;
  const token = typeof window !== "undefined" ? localStorage.getItem("pandit_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // D1: Render cold starts exceed 60s — auth calls pass timeoutMs: 75000
  // so the request outlives the wake-up instead of dying silently.
  const ctrl = timeoutMs ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      ...(ctrl ? { signal: ctrl.signal } : {}),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || { message: json.message || hi.common.error },
      };
    }

    return {
      success: true,
      data: json.data,
    };
  } catch (err: any) {
    const aborted = err?.name === "AbortError";
    return {
      success: false,
      error: {
        code: aborted ? "timeout" : "network",
        message: aborted ? hi.auth.slowServer : err.message || hi.common.error,
      },
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
