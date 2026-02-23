export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

const TOKEN_KEYS = ["hpj_pandit_token", "hpj_pandit_access_token", "token", "panditToken"] as const;

export function getPanditToken(): string | null {
  if (typeof window === "undefined") return null;
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

export function setPanditToken(token: string) {
  if (typeof window === "undefined") return;
  for (const key of TOKEN_KEYS) {
    localStorage.setItem(key, token);
  }
}

export function clearPanditToken() {
  if (typeof window === "undefined") return;
  for (const key of TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
}

export function withAuthHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  const token = getPanditToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
