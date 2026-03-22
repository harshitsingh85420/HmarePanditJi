import { create } from 'zustand'

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

export const useNavigationStore = create<NavigationState>((set, get) => ({
  history: [],
  currentSection: 'homepage',
  canGoBack: false,
  canGoForward: false,
  forwardHistory: [],

  navigate: (path, section) => {
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
}))

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
