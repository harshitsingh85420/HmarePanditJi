"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { logger } from "@/utils/logger";

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

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  openLoginModal: () => { console.warn('useAuth called outside AuthProvider'); },
  closeLoginModal: () => { console.warn('useAuth called outside AuthProvider'); },
  loginModalOpen: false,
  login: () => { console.warn('useAuth called outside AuthProvider'); },
  logout: () => { console.warn('useAuth called outside AuthProvider'); },
  setUser: () => { console.warn('useAuth called outside AuthProvider'); },
  accessToken: null,
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // ── Bootstrap: fetch /auth/me (browser sends HttpOnly cookie automatically) ──

  useEffect(() => {
    async function boot() {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      try {
        // Browser automatically sends hpj_token HttpOnly cookie
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include", // CRITICAL: sends cookies
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const json = await res.json();
          const me = json.data?.user ?? null;
          if (me) {
            setUserState(me);
          }
        }
      } catch (error) {
        // User not logged in or network error
        logger.debug("Auth bootstrap failed:", error);
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = useCallback((_token: string, newUser: AuthUser) => {
    // Backend sets HttpOnly cookie automatically
    setAccessToken(_token);
    setUserState(newUser);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      // Backend clears HttpOnly cookie
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include", // CRITICAL: sends/removes cookies
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAccessToken(null);
      setUserState(null);
    }
  }, []);

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
