import { create } from 'zustand'

interface UIStore {
  // Network status
  isOnline: boolean
  showNetworkBanner: boolean
  
  // Session
  showSessionSaveNotice: boolean
  showSessionTimeout: boolean
  
  // Celebration
  showCelebration: boolean
  celebrationStepName: string
  
  // Help
  showHelpSheet: boolean
  
  // Setters
  setOnline: (online: boolean) => void
  setNetworkBanner: (show: boolean) => void
  setSessionSaveNotice: (show: boolean) => void
  setSessionTimeout: (show: boolean) => void
  triggerCelebration: (stepName: string) => void
  dismissCelebration: () => void
  setHelpSheet: (show: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  isOnline: true,
  showNetworkBanner: false,
  showSessionSaveNotice: false,
  showSessionTimeout: false,
  showCelebration: false,
  celebrationStepName: '',
  showHelpSheet: false,

  setOnline: (online) => {
    set({ isOnline: online })
    if (!online) set({ showNetworkBanner: true })
    else {
      // Show reconnected banner briefly then hide
      set({ showNetworkBanner: true })
      setTimeout(() => set({ showNetworkBanner: false }), 2000)
    }
  },

  setNetworkBanner: (show) => set({ showNetworkBanner: show }),
  setSessionSaveNotice: (show) => set({ showSessionSaveNotice: show }),
  setSessionTimeout: (show) => set({ showSessionTimeout: show }),

  triggerCelebration: (stepName) => {
    set({ showCelebration: true, celebrationStepName: stepName })
    // Auto-dismiss after 1400ms (spec requirement)
    setTimeout(() => set({ showCelebration: false, celebrationStepName: '' }), 1400)
  },

  dismissCelebration: () => set({ showCelebration: false }),
  setHelpSheet: (show) => set({ showHelpSheet: show }),
}))
