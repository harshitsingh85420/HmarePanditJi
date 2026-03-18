'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  OnboardingState, OnboardingPhase, SupportedLanguage,
  DEFAULT_STATE, loadOnboardingState, saveOnboardingState, clearOnboardingState,
  detectLanguageFromCity,
  getNextTutorialPhase, getPrevTutorialPhase, getTutorialDotNumber,
  TUTORIAL_PHASE_ORDER,
} from '@/lib/onboarding-store'
import { useWakeLock } from '@/hooks/useWakeLock'

// ─── screens ───────────────────────────────────────────────
import SplashScreen from '@/app/onboarding/screens/SplashScreen'
import LocationPermissionScreen from '@/app/onboarding/screens/LocationPermissionScreen'
import ManualCityScreen from '@/app/onboarding/screens/ManualCityScreen'
import LanguageConfirmScreen from '@/app/onboarding/screens/LanguageConfirmScreen'
import LanguageListScreen from '@/app/onboarding/screens/LanguageListScreen'
import LanguageChoiceConfirmScreen from '@/app/onboarding/screens/LanguageChoiceConfirmScreen'
import LanguageSetScreen from '@/app/onboarding/screens/LanguageSetScreen'
import HelpScreen from '@/app/onboarding/screens/HelpScreen'
import VoiceTutorialScreen from '@/app/onboarding/screens/VoiceTutorialScreen'
import TutorialSwagat from '@/app/onboarding/screens/tutorial/TutorialSwagat'
import TutorialIncome from '@/app/onboarding/screens/tutorial/TutorialIncome'
import TutorialDakshina from '@/app/onboarding/screens/tutorial/TutorialDakshina'
import TutorialOnlineRevenue from '@/app/onboarding/screens/tutorial/TutorialOnlineRevenue'
import TutorialBackup from '@/app/onboarding/screens/tutorial/TutorialBackup'
import TutorialPayment from '@/app/onboarding/screens/tutorial/TutorialPayment'
import TutorialVoiceNav from '@/app/onboarding/screens/tutorial/TutorialVoiceNav'
import TutorialDualMode from '@/app/onboarding/screens/tutorial/TutorialDualMode'
import TutorialTravel from '@/app/onboarding/screens/tutorial/TutorialTravel'
import TutorialVideoVerify from '@/app/onboarding/screens/tutorial/TutorialVideoVerify'
import TutorialGuarantees from '@/app/onboarding/screens/tutorial/TutorialGuarantees'
import TutorialCTA from '@/app/onboarding/screens/tutorial/TutorialCTA'
import LanguageBottomSheet from '@/components/part0/LanguageBottomSheet'

export default function WelcomePage() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useWakeLock(true)

  useEffect(() => {
    const saved = loadOnboardingState()
    setState(saved)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) saveOnboardingState(state)
  }, [state, isHydrated])

  const goto = useCallback((phase: OnboardingPhase) => {
    setState(prev => ({ ...prev, phase }))
    window.scrollTo(0, 0)
  }, [])

  const openLanguageSheet = useCallback(() => setShowLanguageSheet(true), [])
  const closeLanguageSheet = useCallback(() => setShowLanguageSheet(false), [])

  const handleLanguageSelect = useCallback((lang: SupportedLanguage) => {
    setState(prev => ({ ...prev, pendingLanguage: lang }))
    setShowLanguageSheet(false)
    goto('LANGUAGE_CHOICE_CONFIRM')
  }, [goto])

  const handleSplashDone = useCallback(() => goto('LOCATION_PERMISSION'), [goto])

  const handleLocationGranted = useCallback((city: string, stateName: string) => {
    const detected = detectLanguageFromCity(city)
    setState(prev => ({ ...prev, detectedCity: city, detectedState: stateName, selectedLanguage: detected }))
    goto('LANGUAGE_CONFIRM')
  }, [goto])

  const handleLocationDenied = useCallback(() => goto('MANUAL_CITY'), [goto])

  const handleCitySelected = useCallback((city: string) => {
    const detected = detectLanguageFromCity(city)
    setState(prev => ({ ...prev, detectedCity: city, selectedLanguage: detected }))
    goto('LANGUAGE_CONFIRM')
  }, [goto])

  const handleLanguageConfirmed = useCallback(() => {
    setState(prev => ({ ...prev, languageConfirmed: true }))
    goto('LANGUAGE_SET')
  }, [goto])

  const handleLanguageSetComplete = useCallback(() => {
    if (!state.voiceTutorialSeen) {
      goto('VOICE_TUTORIAL')
    } else {
      goto('TUTORIAL_SWAGAT')
    }
  }, [goto, state.voiceTutorialSeen])

  const handleVoiceTutorialDone = useCallback(() => {
    setState(prev => ({ ...prev, voiceTutorialSeen: true }))
    goto('TUTORIAL_SWAGAT')
  }, [goto])

  const handleTutorialNext = useCallback(() => {
    goto(getNextTutorialPhase(state.phase))
  }, [goto, state.phase])

  const handleTutorialBack = useCallback(() => {
    const idx = TUTORIAL_PHASE_ORDER.indexOf(state.phase)
    if (idx > 0) goto(getPrevTutorialPhase(state.phase))
  }, [goto, state.phase])

  const handleTutorialSkip = useCallback(() => goto('REGISTRATION'), [goto])

  const handleRegisterNow = useCallback(() => {
    setState(prev => ({ ...prev, tutorialCompleted: true }))
    clearOnboardingState()
    window.location.href = '/onboarding'
  }, [])

  const handleLater = useCallback(() => {
    setState(prev => ({ ...prev, tutorialCompleted: true }))
    window.location.href = '/onboarding'
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #F09942 0%, #FFFBF5 100%)' }}>
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { phase, selectedLanguage, detectedCity, pendingLanguage } = state
  const tutorialDot = getTutorialDotNumber(phase)

  const tutorialProps = {
    language: selectedLanguage,
    onLanguageChange: openLanguageSheet,
    currentDot: tutorialDot,
    onNext: handleTutorialNext,
    onBack: handleTutorialBack,
    onSkip: handleTutorialSkip,
  }

  let screen: React.ReactNode = null

  switch (phase) {
    case 'SPLASH':
      screen = <SplashScreen onComplete={handleSplashDone} />; break
    case 'LOCATION_PERMISSION':
      screen = <LocationPermissionScreen language={selectedLanguage} onLanguageChange={openLanguageSheet} onGranted={handleLocationGranted} onDenied={handleLocationDenied} />; break
    case 'MANUAL_CITY':
      screen = <ManualCityScreen language={selectedLanguage} onLanguageChange={openLanguageSheet} onCitySelected={handleCitySelected} onBack={() => goto('LOCATION_PERMISSION')} />; break
    case 'LANGUAGE_CONFIRM':
      screen = <LanguageConfirmScreen language={selectedLanguage} onLanguageChange={openLanguageSheet} detectedCity={detectedCity} onConfirm={handleLanguageConfirmed} onChange={() => goto('LANGUAGE_LIST')} />; break
    case 'LANGUAGE_LIST':
      screen = <LanguageListScreen language={selectedLanguage} onLanguageChange={openLanguageSheet} onSelect={(lang) => { setState(prev => ({ ...prev, pendingLanguage: lang })); goto('LANGUAGE_CHOICE_CONFIRM') }} onBack={() => goto('LANGUAGE_CONFIRM')} />; break
    case 'LANGUAGE_CHOICE_CONFIRM':
      screen = <LanguageChoiceConfirmScreen language={selectedLanguage} onLanguageChange={openLanguageSheet} pendingLanguage={pendingLanguage ?? selectedLanguage} onConfirm={() => { if (pendingLanguage) setState(prev => ({ ...prev, selectedLanguage: pendingLanguage, pendingLanguage: null })); handleLanguageConfirmed() }} onReject={() => goto('LANGUAGE_LIST')} />; break
    case 'LANGUAGE_SET':
      screen = <LanguageSetScreen language={selectedLanguage} onComplete={handleLanguageSetComplete} />; break
    case 'HELP':
      screen = <HelpScreen language={selectedLanguage} onLanguageChange={openLanguageSheet} onBack={() => goto('LOCATION_PERMISSION')} />; break
    case 'VOICE_TUTORIAL':
      screen = <VoiceTutorialScreen language={selectedLanguage} onLanguageChange={openLanguageSheet} onComplete={handleVoiceTutorialDone} />; break
    case 'TUTORIAL_SWAGAT':      screen = <TutorialSwagat {...tutorialProps} />; break
    case 'TUTORIAL_INCOME':      screen = <TutorialIncome {...tutorialProps} />; break
    case 'TUTORIAL_DAKSHINA':    screen = <TutorialDakshina {...tutorialProps} />; break
    case 'TUTORIAL_ONLINE_REVENUE': screen = <TutorialOnlineRevenue {...tutorialProps} />; break
    case 'TUTORIAL_BACKUP':      screen = <TutorialBackup {...tutorialProps} />; break
    case 'TUTORIAL_PAYMENT':     screen = <TutorialPayment {...tutorialProps} />; break
    case 'TUTORIAL_VOICE_NAV':   screen = <TutorialVoiceNav {...tutorialProps} />; break
    case 'TUTORIAL_DUAL_MODE':   screen = <TutorialDualMode {...tutorialProps} />; break
    case 'TUTORIAL_TRAVEL':      screen = <TutorialTravel {...tutorialProps} />; break
    case 'TUTORIAL_VIDEO_VERIFY': screen = <TutorialVideoVerify {...tutorialProps} />; break
    case 'TUTORIAL_GUARANTEES':  screen = <TutorialGuarantees {...tutorialProps} />; break
    case 'TUTORIAL_CTA':
      screen = <TutorialCTA {...tutorialProps} onRegisterNow={handleRegisterNow} onLater={handleLater} />; break
    case 'REGISTRATION': default:
      if (typeof window !== 'undefined') window.location.href = '/onboarding'
      screen = <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#F09942] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <>
      {screen}
      <LanguageBottomSheet isOpen={showLanguageSheet} currentLanguage={selectedLanguage} onSelect={handleLanguageSelect} onClose={closeLanguageSheet} />
    </>
  )
}
