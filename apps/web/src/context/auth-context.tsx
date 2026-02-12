"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  phone: string;
  fullName?: string | null;
  email?: string | null;
  role: string;
  isPhoneVerified: boolean;
  profileCompleted: boolean;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginModalOpen: boolean;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  accessToken: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY_ACCESS = "hpj_access_token";
const STORAGE_KEY_REFRESH = "hpj_refresh_token";
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  loginModalOpen: false,
  logout: () => {},
  setUser: () => {},
  accessToken: null,
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Token helpers ──────────────────────────────────────────────────────────

  const clearTokens = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY_ACCESS);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    setAccessToken(null);
  }, []);

  // ── Refresh access token silently ─────────────────────────────────────────

  const silentRefresh = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;
    const refresh = localStorage.getItem(STORAGE_KEY_REFRESH);
    if (!refresh) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      const newAccess: string = json.data?.accessToken;
      if (!newAccess) return null;
      localStorage.setItem(STORAGE_KEY_ACCESS, newAccess);
      setAccessToken(newAccess);
      return newAccess;
    } catch {
      return null;
    }
  }, []);

  // ── Fetch /auth/me with token ─────────────────────────────────────────────

  const fetchMe = useCallback(async (token: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data?.user as AuthUser ?? null;
    } catch {
      return null;
    }
  }, []);

  // ── Bootstrap: check localStorage on mount ────────────────────────────────

  useEffect(() => {
    async function boot() {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      let token = localStorage.getItem(STORAGE_KEY_ACCESS);

      // If we have a token, try to use it
      if (token) {
        const me = await fetchMe(token);
        if (me) {
          setUser(me);
          setAccessToken(token);
          setLoading(false);
          return;
        }

        // Access token may have expired — try refresh
        token = await silentRefresh();
        if (token) {
          const me2 = await fetchMe(token);
          if (me2) {
            setUser(me2);
            setLoading(false);
            return;
          }
        }

        // Both failed — clear tokens
        clearTokens();
      }

      setLoading(false);
    }

    boot();
  }, [fetchMe, silentRefresh, clearTokens]);

  // ── Schedule silent refresh 1 min before token expiry (7d default) ────────

  useEffect(() => {
    if (!accessToken) return;
    // Refresh 10 minutes before 7d expiry = after ~6d 23h 50m
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const TEN_MIN_MS = 10 * 60 * 1000;
    const delay = SEVEN_DAYS_MS - TEN_MIN_MS;

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(silentRefresh, delay);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [accessToken, silentRefresh]);

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    // Fire-and-forget logout API call
    const token = accessToken ?? localStorage.getItem(STORAGE_KEY_ACCESS);
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearTokens();
    setUser(null);
  }, [accessToken, clearTokens]);

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const handleSetUser = useCallback(
    (newUser: AuthUser | null) => setUser(newUser),
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        openLoginModal,
        closeLoginModal,
        loginModalOpen,
        logout,
        setUser: handleSetUser,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}

// ── Token helpers exported for auth modal ─────────────────────────────────────

export function saveTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ACCESS, access);
  localStorage.setItem(STORAGE_KEY_REFRESH, refresh);
}
