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
  getNextTutorialPhase,
  getPrevTutorialPhase,
  getTutorialDotNumber,
} from '@/lib/onboarding-store'
import { stopSpeaking } from '@/lib/voice-engine'

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

  useEffect(() => {
    const saved = loadOnboardingState()

    // Allow direct deep-linking to a specific phase (used by Registration Back button).
    const phaseParam = searchParams?.get('phase') as OnboardingPhase | null
    if (phaseParam) {
      setState({ ...saved, phase: phaseParam })
    } else {
      setState(saved)
    }

    setIsLoaded(true)
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
      router.push('/onboarding/register')
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
    router.push('/onboarding/register')
  }, [updateState, router])

  const handleRegistrationNow = useCallback(() => {
    updateState({ tutorialCompleted: true })
    router.push('/onboarding/register')
  }, [updateState, router])

  const handleLater = useCallback(() => {
    // "Later" still sends them to registration — they've seen the full tutorial
    updateState({ tutorialCompleted: true })
    router.push('/onboarding/register')
  }, [updateState, router])

  const handleHelpBack = useCallback(() => {
    // Return to previous reasonable state
    goToPhase('LANGUAGE_CONFIRM')
  }, [goToPhase])

  // ─── LANGUAGE SHEET ───────────────────────────────────────

  const handleLanguageSheetOpen = useCallback(() => {
    stopSpeaking()
    setShowLanguageSheet(true)
  }, [])

  const handleLanguageSheetClose = useCallback(() => {
    setShowLanguageSheet(false)
  }, [])

  const handleLanguageSheetSelect = useCallback((language: SupportedLanguage) => {
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

  const renderScreen = () => {
    switch (state.phase) {
      case 'SPLASH':
        return <SplashScreen onComplete={() => goToPhase('LOCATION_PERMISSION')} />

      case 'LOCATION_PERMISSION':
        return (
          <LocationPermissionScreen
            {...commonProps}
            onGranted={handleLocationGranted}
            onDenied={handleLocationDenied}
          />
        )

      case 'MANUAL_CITY':
        return (
          <ManualCityScreen
            {...commonProps}
            onCitySelected={handleCitySelected}
            onBack={() => goToPhase('LOCATION_PERMISSION')}
          />
        )

      case 'LANGUAGE_CONFIRM':
        return (
          <LanguageConfirmScreen
            {...commonProps}
            detectedCity={state.detectedCity}
            onConfirm={handleLanguageConfirmed}
            onChange={handleLanguageChangeRequested}
          />
        )

      case 'LANGUAGE_LIST':
        return (
          <LanguageListScreen
            {...commonProps}
            onSelect={handleLanguageSelected}
            onBack={() => goToPhase('LANGUAGE_CONFIRM')}
          />
        )

      case 'LANGUAGE_CHOICE_CONFIRM':
        return (
          <LanguageChoiceConfirmScreen
            {...commonProps}
            pendingLanguage={state.pendingLanguage ?? 'Hindi'}
            onConfirm={handleLanguageChoiceConfirmed}
            onReject={handleLanguageChoiceRejected}
          />
        )

      case 'LANGUAGE_SET':
        return <LanguageSetScreen language={state.selectedLanguage} onComplete={handleLanguageSetComplete} />

      case 'HELP':
        return <HelpScreen {...commonProps} onBack={handleHelpBack} />

      case 'VOICE_TUTORIAL':
        return <VoiceTutorialScreen {...commonProps} onComplete={handleVoiceTutorialComplete} />

      case 'TUTORIAL_SWAGAT':
        return <TutorialSwagat {...tutorialProps} />
      case 'TUTORIAL_INCOME':
        return <TutorialIncome {...tutorialProps} />
      case 'TUTORIAL_DAKSHINA':
        return <TutorialDakshina {...tutorialProps} />
      case 'TUTORIAL_ONLINE_REVENUE':
        return <TutorialOnlineRevenue {...tutorialProps} />
      case 'TUTORIAL_BACKUP':
        return <TutorialBackup {...tutorialProps} />
      case 'TUTORIAL_PAYMENT':
        return <TutorialPayment {...tutorialProps} />
      case 'TUTORIAL_VOICE_NAV':
        return <TutorialVoiceNav {...tutorialProps} />
      case 'TUTORIAL_DUAL_MODE':
        return <TutorialDualMode {...tutorialProps} />
      case 'TUTORIAL_TRAVEL':
        return <TutorialTravel {...tutorialProps} />
      case 'TUTORIAL_VIDEO_VERIFY':
        return <TutorialVideoVerify {...tutorialProps} />
      case 'TUTORIAL_GUARANTEES':
        return <TutorialGuarantees {...tutorialProps} />
      case 'TUTORIAL_CTA':
        return (
          <TutorialCTA
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
      {/* Language bottom sheet — always available */}
      <LanguageBottomSheet
        isOpen={showLanguageSheet}
        currentLanguage={state.selectedLanguage}
        onSelect={handleLanguageSheetSelect}
        onClose={handleLanguageSheetClose}
      />
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
