import { create } from 'zustand'

interface UIStore {
  isOnline: boolean
  helpSheetOpen: boolean
  sessionTimeoutOpen: boolean
  sessionSaveNoticeVisible: boolean
  celebrationStepName: string
  setOnline: (isOnline: boolean) => void
  setHelpSheet: (isOpen: boolean) => void
  setSessionTimeout: (isOpen: boolean) => void
  setSessionSaveNotice: (isVisible: boolean) => void
  setCelebrationStepName: (stepName: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  isOnline: true,
  helpSheetOpen: false,
  sessionTimeoutOpen: false,
  sessionSaveNoticeVisible: false,
  celebrationStepName: 'Step',
  setOnline: (isOnline) => set({ isOnline }),
  setHelpSheet: (helpSheetOpen) => set({ helpSheetOpen }),
  setSessionTimeout: (sessionTimeoutOpen) => set({ sessionTimeoutOpen }),
  setSessionSaveNotice: (sessionSaveNoticeVisible) => set({ sessionSaveNoticeVisible }),
  setCelebrationStepName: (celebrationStepName) => set({ celebrationStepName }),
}))
