"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { logger } from "@/utils/logger";
// NEXT_PUBLIC_API_URL is an ORIGIN on Vercel. Reading it raw and appending a
// route produced https://<api-host>/pandits -> 404. The 308 shim rescues only
// /auth/* /pandit/* /pandits/* /voice/* — not /bookings, /customers, /muhurat,
// /reviews, and not bare /pandits. resolveApiBase owns the prefix.
import { resolveApiBase, CUSTOMER_TOKEN_KEY } from "@hmarepanditji/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  phone: string;
  // `fullName` REMOVED (census 2026-07-28): it is a PanditProfile column,
  // never sent by getMe, which spreads a User row carrying `name`. While it
  // was declared here, user?.fullName ?? "Customer" never fired its ?? and
  // every Razorpay payer name was the literal string "Customer".
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

// NEXT_PUBLIC_API_URL is deployed WITHOUT the /api/v1 path on Vercel, and
// only /auth/* has a legacy 308 redirect into the prefix — every other bare
// call 404s (live P-PAY E2E: POST /bookings hit onrender.com/bookings → 404
// while login "worked" through the redirect). Normalize once here so every
// API_BASE consumer gets the real mount point, whatever the env var says.
const RAW_API_URL = (resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base).replace(/\/+$/, "");
export const API_BASE = RAW_API_URL.endsWith("/api/v1") ? RAW_API_URL : `${RAW_API_URL}/api/v1`;

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

      // ── THE SESSION MUST SURVIVE A RELOAD (Isj ruling, 2026-07-29) ──────
      //
      // This used to bootstrap on an HttpOnly cookie:
      //     fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      // and, when that succeeded, set the USER and never the TOKEN. Three
      // things were wrong with it, each fatal on its own:
      //
      //   1. `setAccessToken` was called ONLY inside login(), so on any reload,
      //      deep link or fresh navigation accessToken was null forever.
      //   2. There was no cookie to send. The app is on vercel.app and the API
      //      on onrender.com, so an API-set cookie is third-party and blocked.
      //      `document.cookie` on the web origin was empty. Verified live.
      //   3. The API does not read cookies anyway. Verified live:
      //        /auth/me + credentials:"include" → 401 "Missing or invalid
      //                                            Authorization header"
      //        /auth/me + Authorization: Bearer  → 200
      //      The comment described a mechanism the server never implemented.
      //
      // Every customer screen gates on `if (!accessToken) return;` — silent, no
      // retry — so the whole authenticated app rendered its EMPTY STATE. The
      // customer was told he had no bookings, in warm Hindi, while owning one.
      //
      // NOTHING ABOUT AUTH SEMANTICS CHANGES HERE. Same token the login already
      // stores, same header the server already requires, read on boot instead
      // of only inside login(). No new grant, no relaxed validation.
      //
      // CUSTOMER_TOKEN_KEY, not the literal "hpj_token": login/page.tsx:141
      // hardcodes the string, which is how a writer and a reader drift apart
      // without any guard noticing. One constant, imported by both.
      try {
        const stored = localStorage.getItem(CUSTOMER_TOKEN_KEY);
        if (!stored) {
          setLoading(false);
          return;
        }

        // Optimistic: the screens may render while /auth/me validates. A token
        // that turns out to be bad is cleared below, which is strictly better
        // than the previous behaviour of never having one at all.
        setAccessToken(stored);

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${stored}` },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const json = await res.json();
          const me = json.data?.user ?? null;
          if (me) {
            setUserState(me);
          }
        } else if (res.status === 401) {
          // EXPIRED OR REVOKED — drop it, so the app shows a signed-out state
          // rather than pretending to hold a session it cannot use.
          localStorage.removeItem(CUSTOMER_TOKEN_KEY);
          setAccessToken(null);
        }
        // Any other status (5xx, timeout) leaves the token in place: a server
        // wobble must not log the customer out.
      } catch (error) {
        // Network error — keep the token, the screens will retry on their own.
        logger.debug("Auth bootstrap failed:", error);
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = useCallback((_token: string, newUser: AuthUser) => {
    // PERSIST HERE, not only in the caller. The comment this replaces said
    // "Backend sets HttpOnly cookie automatically" — it does not, and the
    // consequence was that only login/page.tsx wrote the token, using a
    // hardcoded "hpj_token" string. One module now owns both the write and the
    // boot read, through one constant.
    try {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, _token);
    } catch {
      // private mode / storage disabled — the in-memory session still works
      // for this page-load, which is what the old code gave everyone always.
    }
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
      // Clear the STORED token too, or the next boot restores the session the
      // customer just ended — the exact mirror of the bug this file fixes.
      try {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      } catch {
        /* storage disabled — in-memory clear below is still authoritative */
      }
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
