/**
 * SSR-Safe Store Hooks
 * 
 * These hooks provide safe access to Zustand stores during SSR.
 * They defer store access until the component is mounted on the client.
 * 
 * Usage:
 *   import { useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
 *   
 *   function MyComponent() {
 *     const { setSection } = useSafeNavigationStore()
 *     // Safe to use even during SSR
 *   }
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import type { OnboardingPhase, SupportedLanguage } from '@/lib/onboarding-store'
import type { AppSection } from '@/stores/navigationStore'
import type { RegistrationData, RegistrationStep } from '@/stores/registrationStore'
import type { VoiceState } from '@/stores/voiceStore'

/**
 * Hook to check if component is mounted
 */
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return mounted
}

/**
 * SSR-safe navigation store hook
 */
export function useSafeNavigationStore() {
  const mounted = useMounted()
  const storeRef = useRef<any>(null)

  if (mounted && !storeRef.current) {
    const { useNavigationStore } = require('@/stores/navigationStore')
    storeRef.current = useNavigationStore
  }

  const [state, setState] = useState({
    history: [] as string[],
    currentSection: 'homepage' as AppSection,
    canGoBack: false,
    canGoForward: false,
    forwardHistory: [] as string[],
  })

  useEffect(() => {
    if (mounted && storeRef.current) {
      const store = storeRef.current
      const unsubscribe = store.subscribe((newState: any) => {
        setState({
          history: newState.history,
          currentSection: newState.currentSection,
          canGoBack: newState.canGoBack,
          canGoForward: newState.canGoForward,
          forwardHistory: newState.forwardHistory,
        })
      })
      setState(store.getState())
      return unsubscribe
    }
  }, [mounted])

  if (!mounted || !storeRef.current) {
    return {
      history: [],
      currentSection: 'homepage' as AppSection,
      canGoBack: false,
      canGoForward: false,
      forwardHistory: [],
      navigate: () => { },
      goBack: () => null as string | null,
      goForward: () => null as string | null,
      canNavigateBack: () => false,
      canNavigateForward: () => false,
      clearHistory: () => { },
      setSection: () => { },
    }
  }

  return storeRef.current()
}

/**
 * SSR-safe onboarding store hook
 */
export function useSafeOnboardingStore() {
  const mounted = useMounted()
  const storeRef = useRef<any>(null)

  if (mounted && !storeRef.current) {
    const { useOnboardingStore } = require('@/stores/onboardingStore')
    storeRef.current = useOnboardingStore
  }

  const [state, setState] = useState({
    phase: 'SPLASH' as OnboardingPhase,
    selectedLanguage: 'Hindi' as SupportedLanguage,
    detectedCity: '',
    detectedState: '',
    languageConfirmed: false,
    pendingLanguage: null as SupportedLanguage | null,
    tutorialStarted: false,
    tutorialCompleted: false,
    currentTutorialScreen: 1,
    voiceTutorialSeen: false,
    firstEverOpen: true,
    helpRequested: false,
  })

  useEffect(() => {
    if (mounted && storeRef.current) {
      const store = storeRef.current
      const unsubscribe = store.subscribe((newState: any) => {
        setState({
          phase: newState.phase,
          selectedLanguage: newState.selectedLanguage,
          detectedCity: newState.detectedCity,
          detectedState: newState.detectedState,
          languageConfirmed: newState.languageConfirmed,
          pendingLanguage: newState.pendingLanguage,
          tutorialStarted: newState.tutorialStarted,
          tutorialCompleted: newState.tutorialCompleted,
          currentTutorialScreen: newState.currentTutorialScreen,
          voiceTutorialSeen: newState.voiceTutorialSeen,
          firstEverOpen: newState.firstEverOpen,
          helpRequested: newState.helpRequested,
        })
      })
      setState(store.getState())
      return unsubscribe
    }
  }, [mounted])

  if (!mounted || !storeRef.current) {
    return {
      phase: 'SPLASH' as OnboardingPhase,
      selectedLanguage: 'Hindi' as SupportedLanguage,
      detectedCity: '',
      detectedState: '',
      languageConfirmed: false,
      pendingLanguage: null as SupportedLanguage | null,
      tutorialStarted: false,
      tutorialCompleted: false,
      currentTutorialScreen: 1,
      voiceTutorialSeen: false,
      firstEverOpen: true,
      helpRequested: false,
      setPhase: () => { },
      setSelectedLanguage: () => { },
      setDetectedCity: () => { },
      setLanguageConfirmed: () => { },
      setPendingLanguage: () => { },
      setTutorialStarted: () => { },
      setTutorialCompleted: () => { },
      setCurrentTutorialScreen: () => { },
      setVoiceTutorialSeen: () => { },
      setHelpRequested: () => { },
      setLanguage: () => { },
      reset: () => { },
    }
  }

  return storeRef.current()
}

/**
 * SSR-safe registration store hook
 */
export function useSafeRegistrationStore() {
  const mounted = useMounted()
  const storeRef = useRef<any>(null)

  if (mounted && !storeRef.current) {
    const { useRegistrationStore } = require('@/stores/registrationStore')
    storeRef.current = useRegistrationStore
  }

  const initialData: RegistrationData = {
    language: 'hi',
    mobile: '',
    otp: '',
    name: '',
    city: '',
    state: '',
    currentStep: 'language' as RegistrationStep,
    completedSteps: [],
    sessionId: `session_${Date.now()}`,
    startedAt: Date.now(),
    lastSavedAt: Date.now(),
  }

  const [state, setState] = useState({ data: initialData })

  useEffect(() => {
    if (mounted && storeRef.current) {
      const store = storeRef.current
      const unsubscribe = store.subscribe((newState: any) => {
        setState({ data: newState.data })
      })
      setState(store.getState())
      return unsubscribe
    }
  }, [mounted])

  if (!mounted || !storeRef.current) {
    return {
      data: initialData,
      setLanguage: () => { },
      setMobile: () => { },
      setOtp: () => { },
      setName: () => { },
      setCity: () => { },
      setCurrentStep: () => { },
      markStepComplete: () => { },
      setReferralCode: () => { },
      getStepNumber: () => 0,
      getTotalSteps: () => 0,
      getCompletionPercentage: () => 0,
      isStepComplete: () => false,
      reset: () => { },
      syncFromStorage: () => { },
    }
  }

  return storeRef.current()
}

/**
 * SSR-safe voice store hook
 */
export function useSafeVoiceStore() {
  const mounted = useMounted()
  const storeRef = useRef<any>(null)

  if (mounted && !storeRef.current) {
    const { useVoiceStore } = require('@/stores/voiceStore')
    storeRef.current = useVoiceStore
  }

  const [state, setState] = useState({
    state: 'idle' as VoiceState,
    transcribedText: '',
    confidence: 0,
    currentQuestion: '',
    errorCount: 0,
    ambientNoiseLevel: 0,
    isKeyboardMode: false,
  })

  useEffect(() => {
    if (mounted && storeRef.current) {
      const store = storeRef.current
      const unsubscribe = store.subscribe((newState: any) => {
        setState({
          state: newState.state,
          transcribedText: newState.transcribedText,
          confidence: newState.confidence,
          currentQuestion: newState.currentQuestion,
          errorCount: newState.errorCount,
          ambientNoiseLevel: newState.ambientNoiseLevel,
          isKeyboardMode: newState.isKeyboardMode,
        })
      })
      setState(store.getState())
      return unsubscribe
    }
  }, [mounted])

  if (!mounted || !storeRef.current) {
    return {
      state: 'idle' as VoiceState,
      transcribedText: '',
      confidence: 0,
      currentQuestion: '',
      errorCount: 0,
      ambientNoiseLevel: 0,
      isKeyboardMode: false,
      setState: () => { },
      setTranscribedText: () => { },
      setConfidence: () => { },
      setCurrentQuestion: () => { },
      incrementError: () => { },
      resetErrors: () => { },
      setAmbientNoise: () => { },
      switchToKeyboard: () => { },
      switchToVoice: () => { },
      reset: () => { },
    }
  }

  return storeRef.current()
}

/**
 * SSR-safe UI store hook
 */
export function useSafeUIStore() {
  const mounted = useMounted()
  const storeRef = useRef<any>(null)

  if (mounted && !storeRef.current) {
    const { useUIStore } = require('@/stores/uiStore')
    storeRef.current = useUIStore
  }

  const [state, setState] = useState({
    isOnline: true,
    showNetworkBanner: false,
    helpSheetOpen: false,
    sessionTimeoutOpen: false,
    sessionSaveNoticeVisible: false,
    showCelebration: false,
    celebrationStepName: '',
    showSessionTimeout: false,
  })

  useEffect(() => {
    if (mounted && storeRef.current) {
      const store = storeRef.current
      const unsubscribe = store.subscribe((newState: any) => {
        setState({
          isOnline: newState.isOnline,
          showNetworkBanner: newState.showNetworkBanner,
          helpSheetOpen: newState.helpSheetOpen,
          sessionTimeoutOpen: newState.sessionTimeoutOpen,
          sessionSaveNoticeVisible: newState.sessionSaveNoticeVisible,
          showCelebration: newState.showCelebration,
          celebrationStepName: newState.celebrationStepName,
          showSessionTimeout: newState.showSessionTimeout,
        })
      })
      setState(store.getState())
      return unsubscribe
    }
  }, [mounted])

  if (!mounted || !storeRef.current) {
    return {
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
  }

  return storeRef.current()
}

/**
 * SSR-safe language store hook
 */
export function useSafeLanguageStore() {
  const mounted = useMounted()
  const storeRef = useRef<any>(null)

  if (mounted && !storeRef.current) {
    const { useLanguageStore } = require('@/stores/languageStore')
    storeRef.current = useLanguageStore
  }

  const [state, setState] = useState({
    currentLanguage: 'Hindi' as SupportedLanguage,
  })

  useEffect(() => {
    if (mounted && storeRef.current) {
      const store = storeRef.current
      const unsubscribe = store.subscribe((newState: any) => {
        setState({ currentLanguage: newState.currentLanguage })
      })
      setState(store.getState())
      return unsubscribe
    }
  }, [mounted])

  if (!mounted || !storeRef.current) {
    return {
      currentLanguage: 'Hindi' as SupportedLanguage,
      setLanguage: () => { },
      resetLanguage: () => { },
    }
  }

  return storeRef.current()
}
