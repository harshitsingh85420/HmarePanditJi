import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppSection = 'homepage' | 'identity' | 'part0-tutorial' | 'part1-registration' | 'dashboard'

interface NavigationState {
  history: string[]
  currentSection: AppSection
  canGoBack: boolean
  canGoForward: boolean
  forwardHistory: string[]

  // Actions
  navigate: (path: string, section: AppSection) => void
  goBack: () => string | null
  goForward: () => string | null
  canNavigateBack: () => boolean
  canNavigateForward: () => boolean
  clearHistory: () => void
  setSection: (section: AppSection) => void
}

// ARCH-004 FIX: Add persist middleware to navigation store
// This ensures navigation state survives page reloads/browser restarts
export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      history: [],
      currentSection: 'homepage',
      canGoBack: false,
      canGoForward: false,
      forwardHistory: [],

      navigate: (path, section) => {
        const state = get()
        // BUG-051 FIX: Don't push duplicate if this path already exists in history
        const lastEntry = state.history[state.history.length - 1]
        if (lastEntry === path) {
          set({ currentSection: section })
          return
        }

        // Also check if path exists earlier in history - if so, remove entries after it
        // This prevents duplicate paths in history
        const existingIndex = state.history.indexOf(path)
        if (existingIndex !== -1) {
          // Remove entries after the existing path to prevent loops
          const newHistory = state.history.slice(0, existingIndex + 1)
          set({
            history: newHistory,
            currentSection: section,
            canGoBack: newHistory.length > 1,
            canGoForward: false,
            forwardHistory: [],
          })
          return
        }

        set((state) => ({
          history: [...state.history, path],
          currentSection: section,
          canGoBack: true,
          canGoForward: false,
          forwardHistory: [],
        }))
      },

      goBack: () => {
        const state = get()
        if (state.history.length < 2) return null

        const newHistory = [...state.history]
        const current = newHistory.pop()
        const previous = newHistory[newHistory.length - 1]

        set({
          history: newHistory,
          forwardHistory: current ? [...state.forwardHistory, current] : state.forwardHistory,
          canGoBack: newHistory.length > 1,
          canGoForward: true,
        })

        return previous ?? null
      },

      goForward: () => {
        const state = get()
        if (state.forwardHistory.length === 0) return null

        const newForward = [...state.forwardHistory]
        const next = newForward.pop()

        set({
          history: next ? [...state.history, next] : state.history,
          forwardHistory: newForward,
          canGoBack: true,
          canGoForward: newForward.length > 0,
        })

        return next ?? null
      },

      canNavigateBack: () => get().history.length > 1,
      canNavigateForward: () => get().forwardHistory.length > 0,
      clearHistory: () => set({ history: [], forwardHistory: [], canGoBack: false, canGoForward: false }),
      setSection: (section) => set({ currentSection: section }),
    }),
    {
      name: 'hpj-navigation',
      partialize: (state) => ({
        history: state.history,
        currentSection: state.currentSection,
        forwardHistory: state.forwardHistory,
      }),
    }
  )
)

// Helper to determine section from path
export function getSectionFromPath(pathname: string): AppSection {
  if (pathname.includes('/onboarding') && !pathname.includes('/register')) {
    return 'part0-tutorial'
  }
  if (pathname.includes('/onboarding/register') || pathname.includes('/(registration)')) {
    return 'part1-registration'
  }
  if (pathname.includes('/identity')) {
    return 'identity'
  }
  if (pathname.includes('/dashboard')) {
    return 'dashboard'
  }
  return 'homepage'
}
