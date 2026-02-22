"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  phone: string;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
  role: string;
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  profileCompleted: boolean;
  avatarUrl?: string | null;
  panditProfile?: {
    verificationStatus: string;
    completedSteps?: number;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginModalOpen: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  accessToken: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "hpj_token";
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Save token to localStorage + cookie */
export function saveTokens(token: string, _refresh?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, token);
  document.cookie = `hpj_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = "hpj_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  loginModalOpen: false,
  login: () => {},
  logout: () => {},
  setUser: () => {},
  accessToken: null,
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // ── Fetch /auth/me with token ──────────────────────────────────────────────

  const fetchMe = useCallback(async (token: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return (json.data?.user ?? null) as AuthUser | null;
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
      const token = localStorage.getItem(STORAGE_KEY);
      if (token) {
        const me = await fetchMe(token);
        if (me) {
          setUserState(me);
          setAccessToken(token);
        } else {
          clearTokens();
        }
      }
      setLoading(false);
    }
    boot();
  }, [fetchMe]);

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = useCallback((token: string, newUser: AuthUser) => {
    saveTokens(token);
    setAccessToken(token);
    setUserState(newUser);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    const token =
      accessToken ??
      (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearTokens();
    setAccessToken(null);
    setUserState(null);
  }, [accessToken]);

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const setUser = useCallback(
    (newUser: AuthUser | null) => setUserState(newUser),
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        openLoginModal,
        closeLoginModal,
        loginModalOpen,
        login,
        logout,
        setUser,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Hook that requires authentication.
 * If user is not logged in, opens the login modal or redirects.
 */
export function useRequireAuth(options?: { redirectTo?: string }) {
  const ctx = useContext(AuthContext);
  const { user, loading, openLoginModal } = ctx;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (options?.redirectTo && typeof window !== "undefined") {
        window.location.href = options.redirectTo;
      } else {
        openLoginModal();
      }
    }
  }, [user, loading, openLoginModal, options?.redirectTo]);

  return { ...ctx, isAuthenticated: !!user };
}
