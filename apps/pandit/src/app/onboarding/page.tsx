'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  OnboardingState,
  OnboardingPhase,
  SupportedLanguage,
  DEFAULT_STATE,
  detectLanguageFromCity,
  loadOnboardingState,
  saveOnboardingState,
  clearOnboardingState,
  getNextTutorialPhase,
  getPrevTutorialPhase,
  getTutorialDotNumber,
} from '@/lib/onboarding-store'
import { stopSpeaking } from '@/lib/voice-engine'
import { useWakeLock } from '@/lib/hooks/useWakeLock'

import SplashScreen from './screens/SplashScreen'
import LocationPermissionScreen from './screens/LocationPermissionScreen'
import ManualCityScreen from './screens/ManualCityScreen'
import LanguageConfirmScreen from './screens/LanguageConfirmScreen'
import LanguageListScreen from './screens/LanguageListScreen'
import LanguageChoiceConfirmScreen from './screens/LanguageChoiceConfirmScreen'
import LanguageSetScreen from './screens/LanguageSetScreen'
import HelpScreen from './screens/HelpScreen'
import VoiceTutorialScreen from './screens/VoiceTutorialScreen'

import TutorialSwagat from './screens/tutorial/TutorialSwagat'
import TutorialIncome from './screens/tutorial/TutorialIncome'
import TutorialDakshina from './screens/tutorial/TutorialDakshina'
import TutorialOnlineRevenue from './screens/tutorial/TutorialOnlineRevenue'
import TutorialBackup from './screens/tutorial/TutorialBackup'
import TutorialPayment from './screens/tutorial/TutorialPayment'
import TutorialVoiceNav from './screens/tutorial/TutorialVoiceNav'
import TutorialDualMode from './screens/tutorial/TutorialDualMode'
import TutorialTravel from './screens/tutorial/TutorialTravel'
import TutorialVideoVerify from './screens/tutorial/TutorialVideoVerify'
import TutorialGuarantees from './screens/tutorial/TutorialGuarantees'
import TutorialCTA from './screens/tutorial/TutorialCTA'

import LanguageBottomSheet from '@/components/LanguageBottomSheet'

// Inner component that uses useSearchParams (wrapped in Suspense)
function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Enable wake lock during onboarding to prevent screen sleep
  useWakeLock(true)

  useEffect(() => {
    const saved = loadOnboardingState()

    // Check for reset parameter (for testing or restarting)
    const resetParam = searchParams?.get('reset')
    if (resetParam === 'true') {
      // Clear onboarding state and start fresh
      clearOnboardingState()
      setState({ ...DEFAULT_STATE, firstEverOpen: true })
    } else {
      // Allow direct deep-linking to a specific phase (used by Registration Back button).
      const phaseParam = searchParams?.get('phase') as OnboardingPhase | null
      if (phaseParam) {
        setState({ ...saved, phase: phaseParam })
      } else {
        setState(saved)
      }
    }

    setIsLoaded(true)
    setIsMounted(true)
  }, [searchParams])

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState(prev => {
      const next = { ...prev, ...updates }
      saveOnboardingState(next)
      return next
    })
  }, [])

  // ─── PHASE TRANSITION HANDLERS ───────────────────────────

  const goToPhase = useCallback((phase: OnboardingPhase) => {
    stopSpeaking()
    updateState({ phase })
  }, [updateState])

  const handleLocationGranted = useCallback((city: string, stateStr: string) => {
    const detectedLanguage = detectLanguageFromCity(city)
    updateState({
      detectedCity: city,
      detectedState: stateStr,
      selectedLanguage: detectedLanguage,
      phase: 'LANGUAGE_CONFIRM',
    })
  }, [updateState])

  const handleLocationDenied = useCallback(() => {
    goToPhase('MANUAL_CITY')
  }, [goToPhase])

  const handleCitySelected = useCallback((city: string) => {
    const detectedLanguage = detectLanguageFromCity(city)
    updateState({
      detectedCity: city,
      selectedLanguage: detectedLanguage,
      phase: 'LANGUAGE_CONFIRM',
    })
  }, [updateState])

  const handleLanguageConfirmed = useCallback(() => {
    updateState({
      languageConfirmed: true,
      phase: 'LANGUAGE_SET',
    })
  }, [updateState])

  const handleLanguageChangeRequested = useCallback(() => {
    goToPhase('LANGUAGE_LIST')
  }, [goToPhase])

  const handleLanguageSelected = useCallback((language: SupportedLanguage) => {
    updateState({
      pendingLanguage: language,
      phase: 'LANGUAGE_CHOICE_CONFIRM',
    })
  }, [updateState])

  const handleLanguageChoiceConfirmed = useCallback(() => {
    if (state.pendingLanguage) {
      updateState({
        selectedLanguage: state.pendingLanguage,
        pendingLanguage: null,
        languageConfirmed: true,
        phase: 'LANGUAGE_SET',
      })
    }
  }, [state.pendingLanguage, updateState])

  const handleLanguageChoiceRejected = useCallback(() => {
    updateState({ pendingLanguage: null, phase: 'LANGUAGE_LIST' })
  }, [updateState])

  const handleLanguageSetComplete = useCallback(() => {
    // After celebration screen
    if (state.firstEverOpen && !state.voiceTutorialSeen) {
      updateState({
        voiceTutorialSeen: true,
        phase: 'VOICE_TUTORIAL',
      })
    } else {
      updateState({ phase: 'TUTORIAL_SWAGAT' })
    }
  }, [state.firstEverOpen, state.voiceTutorialSeen, updateState])

  const handleVoiceTutorialComplete = useCallback(() => {
    updateState({ phase: 'TUTORIAL_SWAGAT', tutorialStarted: true })
  }, [updateState])

  const handleTutorialNext = useCallback(() => {
    const next = getNextTutorialPhase(state.phase)
    if (next === 'REGISTRATION') {
      updateState({ tutorialCompleted: true, phase: 'REGISTRATION' })
      router.push('/mobile')
    } else {
      updateState({ phase: next, currentTutorialScreen: getTutorialDotNumber(next) })
    }
  }, [state.phase, updateState, router])

  const handleTutorialBack = useCallback(() => {
    const prev = getPrevTutorialPhase(state.phase)
    updateState({ phase: prev, currentTutorialScreen: getTutorialDotNumber(prev) })
  }, [state.phase, updateState])

  const handleTutorialSkip = useCallback(() => {
    updateState({ tutorialCompleted: true })
    router.push('/mobile')
  }, [updateState, router])

  const handleRegistrationNow = useCallback(() => {
    updateState({ tutorialCompleted: true })
    router.push('/mobile')
  }, [updateState, router])

  const handleLater = useCallback(() => {
    // "Later" navigates to the dashboard, preserving incomplete registration status
    updateState({ tutorialCompleted: true })
    router.push('/dashboard')
  }, [updateState, router])

  const handleHelpBack = useCallback(() => {
    // Return to previous reasonable state
    goToPhase('LANGUAGE_CONFIRM')
  }, [goToPhase])

  // ─── PART 0.0 NAVIGATION HANDLERS ───────────────────────────

  const handleSplashToLocation = useCallback(() => {
    goToPhase('LOCATION_PERMISSION')
  }, [goToPhase])

  const handleLocationToManual = useCallback(() => {
    goToPhase('MANUAL_CITY')
  }, [goToPhase])

  const handleLocationToLanguageConfirm = useCallback((city: string, stateStr: string) => {
    const detectedLanguage = detectLanguageFromCity(city)
    updateState({
      detectedCity: city,
      detectedState: stateStr,
      selectedLanguage: detectedLanguage,
      phase: 'LANGUAGE_CONFIRM',
    })
  }, [updateState])

  const handleManualToLanguageConfirm = useCallback((city: string) => {
    const detectedLanguage = detectLanguageFromCity(city)
    updateState({
      detectedCity: city,
      selectedLanguage: detectedLanguage,
      phase: 'LANGUAGE_CONFIRM',
    })
  }, [updateState])

  const handleLanguageConfirmToSet = useCallback(() => {
    updateState({
      languageConfirmed: true,
      phase: 'LANGUAGE_SET',
    })
  }, [updateState])

  const handleLanguageConfirmToList = useCallback(() => {
    goToPhase('LANGUAGE_LIST')
  }, [goToPhase])

  const handleLanguageListToChoiceConfirm = useCallback((lang: SupportedLanguage) => {
    updateState({
      pendingLanguage: lang,
      phase: 'LANGUAGE_CHOICE_CONFIRM',
    })
  }, [updateState])

  const handleLanguageChoiceConfirmToSet = useCallback(() => {
    if (state.pendingLanguage) {
      updateState({
        selectedLanguage: state.pendingLanguage,
        pendingLanguage: null,
        languageConfirmed: true,
        phase: 'LANGUAGE_SET',
      })
    }
  }, [state.pendingLanguage, updateState])

  const handleLanguageChoiceRejectToList = useCallback(() => {
    updateState({ pendingLanguage: null, phase: 'LANGUAGE_LIST' })
  }, [updateState])

  const handleLanguageSetToVoiceTutorial = useCallback(() => {
    if (state.firstEverOpen && !state.voiceTutorialSeen) {
      updateState({
        voiceTutorialSeen: true,
        phase: 'VOICE_TUTORIAL',
      })
    } else {
      updateState({ phase: 'TUTORIAL_SWAGAT' })
    }
  }, [state.firstEverOpen, state.voiceTutorialSeen, updateState])

  // ─── LANGUAGE SHEET ───────────────────────────────────────

  const handleLanguageSheetOpen = useCallback(() => {
    stopSpeaking()
    // Fix hydration: Only update state after mount
    if (typeof window !== 'undefined') {
      setShowLanguageSheet(true)
    }
  }, [])

  const handleLanguageSheetClose = useCallback(() => {
    setShowLanguageSheet(false)
  }, [])

  const handleLanguageSheetSelect = useCallback((language: SupportedLanguage) => {
    // Fix hydration: Ensure we're on client side
    if (typeof window === 'undefined') return

    setShowLanguageSheet(false)
    updateState({ selectedLanguage: language, languageConfirmed: true })
    // Show a brief toast — the language changes immediately
  }, [updateState])

  // ─── RENDER ───────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <div className="min-h-screen splash-gradient flex items-center justify-center">
        <span className="text-white text-5xl animate-glow-pulse">ॐ</span>
      </div>
    )
  }

  const commonProps = {
    language: state.selectedLanguage,
    onLanguageChange: handleLanguageSheetOpen,
  }

  const tutorialProps = {
    ...commonProps,
    currentDot: getTutorialDotNumber(state.phase),
    onNext: handleTutorialNext,
    onBack: handleTutorialBack,
    onSkip: handleTutorialSkip,
  }

  // Force re-render when language changes
  const tutorialKey = `${state.phase}-${state.selectedLanguage}`

  const renderScreen = () => {
    switch (state.phase) {
      case 'SPLASH':
        return <SplashScreen onComplete={handleSplashToLocation} />

      case 'LOCATION_PERMISSION':
        return (
          <LocationPermissionScreen
            {...commonProps}
            onGranted={handleLocationToLanguageConfirm}
            onDenied={handleLocationToManual}
            onBack={() => goToPhase('SPLASH')}
          />
        )

      case 'MANUAL_CITY':
        return (
          <ManualCityScreen
            {...commonProps}
            onCitySelected={handleManualToLanguageConfirm}
            onBack={() => goToPhase('LOCATION_PERMISSION')}
          />
        )

      case 'LANGUAGE_CONFIRM':
        return (
          <LanguageConfirmScreen
            {...commonProps}
            detectedCity={state.detectedCity}
            onConfirm={handleLanguageConfirmToSet}
            onChange={handleLanguageConfirmToList}
            onBack={() => goToPhase('MANUAL_CITY')}
          />
        )

      case 'LANGUAGE_LIST':
        return (
          <LanguageListScreen
            {...commonProps}
            onSelect={handleLanguageListToChoiceConfirm}
            onBack={() => goToPhase('LANGUAGE_CONFIRM')}
          />
        )

      case 'LANGUAGE_CHOICE_CONFIRM':
        return (
          <LanguageChoiceConfirmScreen
            {...commonProps}
            pendingLanguage={state.pendingLanguage ?? 'Hindi'}
            onConfirm={handleLanguageChoiceConfirmToSet}
            onReject={handleLanguageChoiceRejectToList}
            onBack={() => goToPhase('LANGUAGE_LIST')}
          />
        )

      case 'LANGUAGE_SET':
        return <LanguageSetScreen language={state.selectedLanguage} onComplete={handleLanguageSetToVoiceTutorial} />

      case 'HELP':
        return <HelpScreen {...commonProps} onBack={handleHelpBack} />

      case 'VOICE_TUTORIAL':
        return <VoiceTutorialScreen {...commonProps} onComplete={handleLanguageSetToVoiceTutorial} />

      case 'TUTORIAL_SWAGAT':
        return <TutorialSwagat key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_INCOME':
        return <TutorialIncome key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_DAKSHINA':
        return <TutorialDakshina key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_ONLINE_REVENUE':
        return <TutorialOnlineRevenue key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_BACKUP':
        return <TutorialBackup key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_PAYMENT':
        return <TutorialPayment key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_VOICE_NAV':
        return <TutorialVoiceNav key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_DUAL_MODE':
        return <TutorialDualMode key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_TRAVEL':
        return <TutorialTravel key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_VIDEO_VERIFY':
        return <TutorialVideoVerify key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_GUARANTEES':
        return <TutorialGuarantees key={tutorialKey} {...tutorialProps} />
      case 'TUTORIAL_CTA':
        return (
          <TutorialCTA
            key={tutorialKey}
            {...tutorialProps}
            onRegisterNow={handleRegistrationNow}
            onLater={handleLater}
          />
        )

      default:
        return <SplashScreen onComplete={() => goToPhase('LOCATION_PERMISSION')} />
    }
  }

  return (
    <div className="min-h-screen bg-vedic-cream">
      {renderScreen()}
      {/* Language bottom sheet — always available (only render after mount to prevent hydration errors) */}
      {isMounted && (
        <LanguageBottomSheet
          isOpen={showLanguageSheet}
          currentLanguage={state.selectedLanguage}
          onSelect={handleLanguageSheetSelect}
          onClose={handleLanguageSheetClose}
        />
      )}
    </div>
  )
}

// Main export with Suspense boundary
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen splash-gradient flex items-center justify-center">
        <span className="text-white text-5xl animate-glow-pulse">ॐ</span>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
