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
  setHelpSheet: (isOpen: boolean) => void
  setSessionTimeout: (isOpen: boolean) => void
  setSessionSaveNotice: (isVisible: boolean) => void
  triggerCelebration: (stepName: string) => void
  dismissCelebration: () => void
  setCelebrationStepName: (stepName: string) => void
}

export const useUIStore = create<UIStore>()((set) => ({
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
