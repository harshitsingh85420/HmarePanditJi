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
import ScriptChoiceScreen from './screens/ScriptChoiceScreen'
import HelpScreen from './screens/HelpScreen'
import VoiceTutorialScreen from './screens/VoiceTutorialScreen'
import MicPermissionScreen from './screens/MicPermissionScreen'
import MicDeniedRecoveryScreen from './screens/MicDeniedRecoveryScreen'

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
import VoiceTutorialOverlay from '@/components/overlays/VoiceTutorialOverlay'

// Inner component that uses useSearchParams (wrapped in Suspense)
function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showMicPermission, setShowMicPermission] = useState(false)
  const [pendingScriptPreference, setPendingScriptPreference] = useState<'native' | 'latin' | null>(null)
  const [showMicDeniedRecovery, setShowMicDeniedRecovery] = useState(false)

  // Enable wake lock during onboarding to prevent screen sleep
  useWakeLock(true)

  useEffect(() => {
    // Check for reset parameter (for testing or restarting)
    const resetParam = searchParams?.get('reset')
    if (resetParam === 'true') {
      // Clear onboarding state and start fresh
      clearOnboardingState()
      setState({ ...DEFAULT_STATE, firstEverOpen: true })
      setIsLoaded(true)
      setIsMounted(true)
      return
    }

    // Allow direct deep-linking to a specific phase (used by Registration Back button).
    const phaseParam = searchParams?.get('phase') as OnboardingPhase | null
    if (phaseParam) {
      const saved = loadOnboardingState()
      setState({ ...saved, phase: phaseParam })
      setIsLoaded(true)
      setIsMounted(true)
      return
    }

    // BUG-CRITICAL-01 FIX: For fresh onboarding sessions, ALWAYS reset to SPLASH phase
    // A user landing on /onboarding should ALWAYS start from the beginning
    // Only restore state if user was in middle of TUTORIAL (not language selection or location)
    const saved = loadOnboardingState()

    // Check if user was in middle of tutorial screens (TUTORIAL_* phases)
    const isInTutorial = saved.phase.startsWith('TUTORIAL_')

    // FORCE SPLASH phase for all users except those in middle of tutorial
    if (isInTutorial && saved.tutorialStarted && saved.selectedLanguage) {
      // User was in middle of tutorial - restore their language choice
      setState(saved)
    } else {
      // Fresh user OR user stuck in location/language flow - RESET EVERYTHING to SPLASH
      // This prevents Tamil/Hindi leakage from previous incomplete sessions
      try {
        clearOnboardingState()
      } catch {
        // Ignore clear errors
      }
      // FORCE phase to SPLASH
      setState({ ...DEFAULT_STATE, firstEverOpen: true, phase: 'SPLASH' })
    }

    setIsLoaded(true)
    setIsMounted(true)
  }, [])

  // BUG-007 FIX: Handle navigation to registration when phase changes
  useEffect(() => {
    if (state.phase === 'REGISTRATION' && state.tutorialCompleted) {
      router.push('/mobile')
    }
  }, [state.phase, state.tutorialCompleted, router])

  // Navigate to Customer App login page
  const navigateToCustomerApp = useCallback(() => {
    const customerAppUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'
    window.location.href = `${customerAppUrl}/login`
  }, [])

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState(prev => {
      const next = { ...prev, ...updates }
      console.log('[Onboarding] updateState:', { prev, next })
      saveOnboardingState(next)
      return next
    })
  }, [])

  // ─── PHASE TRANSITION HANDLERS ───────────────────────────

  const goToPhase = useCallback((phase: OnboardingPhase) => {
    console.log('[Onboarding] goToPhase called with:', phase)
    stopSpeaking()
    updateState({ phase })
  }, [updateState])

  const handleTutorialNext = useCallback(() => {
    const next = getNextTutorialPhase(state.phase)
    if (next === 'REGISTRATION') {
      updateState({ tutorialCompleted: true, phase: 'REGISTRATION' })
    } else {
      updateState({ phase: next, currentTutorialScreen: getTutorialDotNumber(next) })
    }
  }, [state.phase, updateState])

  const handleTutorialBack = useCallback(() => {
    // Special case: First tutorial screen goes back to Script Choice
    if (state.phase === 'TUTORIAL_SWAGAT') {
      console.log('[Onboarding] Back from first tutorial, going to Script Choice');
      updateState({ phase: 'SCRIPT_CHOICE' });
      return;
    }
    const prev = getPrevTutorialPhase(state.phase)
    updateState({ phase: prev, currentTutorialScreen: getTutorialDotNumber(prev) })
  }, [state.phase, updateState]);

  // BUG-008 FIX: Skip directly to registration without double navigation
  const handleTutorialSkip = useCallback(() => {
    stopSpeaking()
    updateState({ tutorialCompleted: true, phase: 'REGISTRATION' })
    router.push('/mobile')
  }, [updateState, router]) // eslint-disable-line react-hooks/exhaustive-deps -- router is needed

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
    console.log('[Onboarding] handleSplashToLocation called')
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
    // Open the language bottom sheet instead of navigating to LANGUAGE_LIST
    stopSpeaking()
    if (typeof window !== 'undefined') {
      setShowLanguageSheet(true)
    }
  }, [])

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

  const handleLanguageSetToScriptChoice = useCallback(() => {
    updateState({ phase: 'SCRIPT_CHOICE' })
  }, [updateState])

  const handleScriptChoiceToVoiceTutorial = useCallback((scriptPref: 'native' | 'latin') => {
    // Set pending script preference IMMEDIATELY (not waiting for setState)
    setPendingScriptPreference(scriptPref);

    const isFirstTime = state.firstEverOpen && !state.voiceTutorialSeen;

    // For first-time users: DON'T change phase (stay on SCRIPT_CHOICE), just show mic overlay
    if (isFirstTime) {
      setShowMicPermission(true);
      return; // Don't update state.phase yet
    }

    // For returning users: just go to tutorial
    setState(prev => ({
      ...prev,
      scriptPreference: scriptPref,
      phase: 'TUTORIAL_SWAGAT' as OnboardingPhase,
    }));
  }, [state.firstEverOpen, state.voiceTutorialSeen]);

  const handleLanguageSetToVoiceTutorial = useCallback(() => {
    // Skip mic permission - already done or not first time
    // Go directly to tutorial
    updateState({ phase: 'TUTORIAL_SWAGAT' })
  }, [updateState])

  // ─── MIC PERMISSION HANDLERS ───────────────────────────

  const handleMicPermissionGranted = useCallback(() => {
    console.log('[Onboarding] Mic permission GRANTED, proceeding to tutorial');
    const scriptPref = pendingScriptPreference || state.scriptPreference;
    console.log('[Onboarding] Using scriptPreference:', scriptPref);
    setShowMicPermission(false);
    setPendingScriptPreference(null);
    // NOW update state with script preference and phase
    setState(prev => ({
      ...prev,
      scriptPreference: scriptPref,
      voiceTutorialSeen: true,
      phase: 'TUTORIAL_SWAGAT' as OnboardingPhase,
    }));
  }, [pendingScriptPreference, state.scriptPreference]);

  const handleMicPermissionDenied = useCallback(() => {
    console.log('[Onboarding] Mic permission DENIED, going to tutorial with keyboard mode');
    const scriptPref = pendingScriptPreference || state.scriptPreference;
    console.log('[Onboarding] Preserving scriptPreference:', scriptPref);
    setShowMicPermission(false);
    setPendingScriptPreference(null);
    // Preserve script preference and go directly to tutorial
    setState(prev => ({
      ...prev,
      scriptPreference: scriptPref,
      voiceTutorialSeen: true,
      phase: 'TUTORIAL_SWAGAT' as OnboardingPhase,
    }));
  }, [pendingScriptPreference, state.scriptPreference]);

  const handleContinueWithKeyboard = useCallback(() => {
    console.log('[Onboarding] Continue with keyboard clicked');
    const scriptPref = pendingScriptPreference || state.scriptPreference;
    console.log('[Onboarding] Using scriptPreference:', scriptPref);
    setShowMicDeniedRecovery(false);
    setPendingScriptPreference(null);
    // Update state with script preference and go to tutorial
    setState(prev => ({
      ...prev,
      scriptPreference: scriptPref,
      voiceTutorialSeen: true,
      phase: 'TUTORIAL_SWAGAT' as OnboardingPhase,
    }));
  }, [pendingScriptPreference, state.scriptPreference]);

  const handleRetryMicPermission = useCallback(() => {
    setShowMicDeniedRecovery(false)
    setShowMicPermission(true)
  }, [])

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
    // Show a minimal splash placeholder while loading
    return (
      <div className="min-h-screen bg-gradient-to-b from-saffron to-saffron-light flex items-center justify-center">
        <span className="text-white text-6xl animate-pulse">ॐ</span>
      </div>
    )
  }

  const commonProps = {
    language: state.selectedLanguage,
    onLanguageChange: handleLanguageSheetOpen,
  }

  const tutorialProps = {
    ...commonProps,
    scriptPreference: state.scriptPreference,
    currentDot: getTutorialDotNumber(state.phase),
    onNext: handleTutorialNext,
    onBack: handleTutorialBack,
    onSkip: handleTutorialSkip,
  }

  // Force re-render when phase, language, or script preference changes
  const screenKey = `${state.phase}-${state.selectedLanguage}-${state.scriptPreference ?? 'none'}`

  const renderScreen = () => {
    switch (state.phase) {
      case 'SPLASH':
        return <SplashScreen key={screenKey} onComplete={handleSplashToLocation} onExit={navigateToCustomerApp} />

      case 'LOCATION_PERMISSION':
        return (
          <LocationPermissionScreen
            key={screenKey}
            {...commonProps}
            onGranted={handleLocationToLanguageConfirm}
            onDenied={() => goToPhase('TUTORIAL_SWAGAT')}
            onBack={() => navigateToCustomerApp()}
          />
        )

      case 'MANUAL_CITY':
        return (
          <ManualCityScreen
            key={screenKey}
            {...commonProps}
            onCitySelected={handleManualToLanguageConfirm}
            onBack={() => goToPhase('LOCATION_PERMISSION')}
          />
        )

      case 'LANGUAGE_CONFIRM':
        return (
          <LanguageConfirmScreen
            key={screenKey}
            {...commonProps}
            detectedCity={state.detectedCity || ''}
            onConfirm={handleLanguageConfirmToSet}
            onChange={handleLanguageConfirmToList}
            onBack={() => goToPhase('LOCATION_PERMISSION')}
          />
        )

      case 'LANGUAGE_LIST':
        return (
          <LanguageListScreen
            key={screenKey}
            {...commonProps}
            scriptPreference={state.scriptPreference}
            onSelect={handleLanguageListToChoiceConfirm}
            onBack={() => goToPhase('LOCATION_PERMISSION')}
          />
        )

      case 'LANGUAGE_CHOICE_CONFIRM':
        return (
          <LanguageChoiceConfirmScreen
            key={screenKey}
            {...commonProps}
            scriptPreference={state.scriptPreference}
            pendingLanguage={state.pendingLanguage ?? 'Hindi'}
            onConfirm={handleLanguageChoiceConfirmToSet}
            onReject={handleLanguageChoiceRejectToList}
            onBack={() => goToPhase('LOCATION_PERMISSION')}
          />
        )

      case 'LANGUAGE_SET':
        return <LanguageSetScreen key={screenKey} language={state.selectedLanguage} onComplete={handleLanguageSetToScriptChoice} />

      case 'SCRIPT_CHOICE':
        return (
          <ScriptChoiceScreen
            key={screenKey}
            language={state.selectedLanguage}
            onChooseNative={() => handleScriptChoiceToVoiceTutorial('native')}
            onChooseLatin={() => handleScriptChoiceToVoiceTutorial('latin')}
            onChangeLanguage={() => {
              stopSpeaking()
              if (typeof window !== 'undefined') {
                setShowLanguageSheet(true)
              }
            }}
            onBack={() => goToPhase('LANGUAGE_CONFIRM')}
          />
        )

      case 'HELP':
        return <HelpScreen key={screenKey} />

      case 'VOICE_TUTORIAL':
        return <VoiceTutorialScreen key={screenKey} {...commonProps} scriptPreference={state.scriptPreference} onComplete={handleLanguageSetToVoiceTutorial} />

      case 'TUTORIAL_SWAGAT':
        return <TutorialSwagat key={`${screenKey}-swagat`} {...tutorialProps} />
      case 'TUTORIAL_INCOME':
        return <TutorialIncome key={`${screenKey}-income`} {...tutorialProps} />
      case 'TUTORIAL_DAKSHINA':
        return <TutorialDakshina key={`${screenKey}-dakshina`} {...tutorialProps} />
      case 'TUTORIAL_ONLINE_REVENUE':
        return <TutorialOnlineRevenue key={`${screenKey}-revenue`} {...tutorialProps} />
      case 'TUTORIAL_BACKUP':
        return <TutorialBackup key={`${screenKey}-backup`} {...tutorialProps} />
      case 'TUTORIAL_PAYMENT':
        return <TutorialPayment key={`${screenKey}-payment`} {...tutorialProps} />
      case 'TUTORIAL_VOICE_NAV':
        return <TutorialVoiceNav key={`${screenKey}-voicenav`} {...tutorialProps} />
      case 'TUTORIAL_DUAL_MODE':
        return <TutorialDualMode key={`${screenKey}-dualmode`} {...tutorialProps} />
      case 'TUTORIAL_TRAVEL':
        return <TutorialTravel key={`${screenKey}-travel`} {...tutorialProps} />
      case 'TUTORIAL_VIDEO_VERIFY':
        return <TutorialVideoVerify key={`${screenKey}-videoverify`} {...tutorialProps} />
      case 'TUTORIAL_GUARANTEES':
        return <TutorialGuarantees key={`${screenKey}-guarantees`} {...tutorialProps} />
      case 'TUTORIAL_CTA':
        return (
          <TutorialCTA
            key={`${screenKey}-cta`}
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
    <div className="min-h-screen bg-surface-base">
      {/* Mic Permission Flow - Show after Language Set if first ever open */}
      {showMicPermission && (
        <MicPermissionScreen
          language={state.selectedLanguage}
          scriptPreference={pendingScriptPreference ?? state.scriptPreference}
          onGranted={handleMicPermissionGranted}
          onDenied={handleMicPermissionDenied}
          onBack={() => {
            setShowMicPermission(false);
            setPendingScriptPreference(null);
            goToPhase('LANGUAGE_SET');
          }}
        />
      )}

      {/* Mic Denied Recovery Screen */}
      {showMicDeniedRecovery && (
        <MicDeniedRecoveryScreen
          language={state.selectedLanguage}
          onContinueWithKeyboard={handleContinueWithKeyboard}
          onRetryPermission={handleRetryMicPermission}
        />
      )}

      {/* Main Onboarding Flow - Only show if mic permission flow is not active */}
      {!showMicPermission && !showMicDeniedRecovery && renderScreen()}

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

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'
