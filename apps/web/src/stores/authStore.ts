import { create } from "zustand";
import { persist } from "zustand/middleware";
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

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  loginModalOpen: boolean;
  accessToken: string | null;

  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      loginModalOpen: false,
      accessToken: null,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      openLoginModal: () => set({ loginModalOpen: true }),
      closeLoginModal: () => set({ loginModalOpen: false }),

      login: (token, user) => {
        // Backend sets HttpOnly cookie automatically
        set({ accessToken: token, user });
      },

      logout: async () => {
        try {
          // Backend clears HttpOnly cookie
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          set({ user: null, accessToken: null, loginModalOpen: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        loginModalOpen: state.loginModalOpen,
      }),
    }
  )
);

// ── Bootstrap Hook ─────────────────────────────────────────────────────────────

/**
 * Call this once in root layout to bootstrap auth from HttpOnly cookie
 */
export async function bootstrapAuth() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const json = await res.json();
      const user = json.data?.user ?? null;
      if (user) {
        useAuthStore.getState().setUser(user);
      }
    }
  } catch (error) {
    logger.debug("Auth bootstrap failed:", error);
  } finally {
    useAuthStore.getState().setLoading(false);
  }
}
