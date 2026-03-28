import { create } from 'zustand'

interface UIStore {
  isOnline: boolean
  showNetworkBanner: boolean
  helpSheetOpen: boolean
  sessionTimeoutOpen: boolean
  sessionSaveNoticeVisible: boolean
  showCelebration: boolean
  celebrationStepName: string
  showSessionTimeout: boolean
  setOnline: (isOnline: boolean) => void
  setNetworkBanner: (show: boolean) => void
  dismissNetworkBanner: () => void
  setHelpSheet: (isOpen: boolean) => void
  setSessionTimeout: (isOpen: boolean) => void
  setSessionSaveNotice: (isVisible: boolean) => void
  triggerCelebration: (stepName: string) => void
  dismissCelebration: () => void
  setCelebrationStepName: (stepName: string) => void
}

// Default values for SSR
const defaultState: UIStore = {
  isOnline: true,
  showNetworkBanner: false,
  helpSheetOpen: false,
  sessionTimeoutOpen: false,
  sessionSaveNoticeVisible: false,
  showCelebration: false,
  celebrationStepName: '',
  showSessionTimeout: false,
  setOnline: () => { },
  setNetworkBanner: () => { },
  dismissNetworkBanner: () => { },
  setHelpSheet: () => { },
  setSessionTimeout: () => { },
  setSessionSaveNotice: () => { },
  triggerCelebration: () => { },
  dismissCelebration: () => { },
  setCelebrationStepName: () => { },
}

// Create store with SSR-safe initialization
export const useUIStore = create<UIStore>()((set) => ({
  ...defaultState,
  isOnline: true,
  showNetworkBanner: false,
  helpSheetOpen: false,
  sessionTimeoutOpen: false,
  sessionSaveNoticeVisible: false,
  showCelebration: false,
  celebrationStepName: '',
  showSessionTimeout: false,

  setOnline: (isOnline) => {
    set({ isOnline, showNetworkBanner: !isOnline })
    if (isOnline) {
      // BUG-016 FIX: Increased from 2000ms to 5000ms for elderly users to read
      setTimeout(() => set({ showNetworkBanner: false }), 5000)
    }
  },

  setNetworkBanner: (show) => set({ showNetworkBanner: show }),
  dismissNetworkBanner: () => set({ showNetworkBanner: false }),
  setHelpSheet: (helpSheetOpen) => set({ helpSheetOpen }),
  setSessionTimeout: (showSessionTimeout) => set({ showSessionTimeout }),
  setSessionSaveNotice: (sessionSaveNoticeVisible) => set({ sessionSaveNoticeVisible }),

  triggerCelebration: (stepName) => {
    set({ showCelebration: true, celebrationStepName: stepName })
    setTimeout(() => set({ showCelebration: false }), 1400)
  },

  dismissCelebration: () => set({ showCelebration: false }),
  setCelebrationStepName: (celebrationStepName) => set({ celebrationStepName }),
}))

// SSR-Safe getter - use this in server-side code or during hydration
export function getUIStoreState() {
  if (typeof window === 'undefined') {
    return {
      isOnline: true,
      showNetworkBanner: false,
      helpSheetOpen: false,
      sessionTimeoutOpen: false,
      sessionSaveNoticeVisible: false,
      showCelebration: false,
      celebrationStepName: '',
      showSessionTimeout: false,
    }
  }
  try {
    return useUIStore.getState()
  } catch {
    return {
      isOnline: true,
      showNetworkBanner: false,
      helpSheetOpen: false,
      sessionTimeoutOpen: false,
      sessionSaveNoticeVisible: false,
      showCelebration: false,
      celebrationStepName: '',
      showSessionTimeout: false,
    }
  }
}
