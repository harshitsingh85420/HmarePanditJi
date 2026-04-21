'use client'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

import { logger } from '@/utils/logger'

export type SupportedLanguage =
  | 'Hindi' | 'Bhojpuri' | 'Maithili' | 'Bengali' | 'Tamil'
  | 'Telugu' | 'Kannada' | 'Malayalam' | 'Marathi' | 'Gujarati'
  | 'Sanskrit' | 'English' | 'Odia' | 'Punjabi' | 'Assamese'

export type ScriptPreference = 'native' | 'latin'

export type OnboardingPhase =
  | 'SPLASH'
  | 'LOCATION_PERMISSION'
  | 'MANUAL_CITY'
  | 'LANGUAGE_CONFIRM'
  | 'LANGUAGE_LIST'
  | 'LANGUAGE_CHOICE_CONFIRM'
  | 'LANGUAGE_SET'
  | 'SCRIPT_CHOICE'
  | 'HELP'
  | 'VOICE_TUTORIAL'
  | 'TUTORIAL_SWAGAT'
  | 'TUTORIAL_INCOME'
  | 'TUTORIAL_DAKSHINA'
  | 'TUTORIAL_ONLINE_REVENUE'
  | 'TUTORIAL_BACKUP'
  | 'TUTORIAL_PAYMENT'
  | 'TUTORIAL_VOICE_NAV'
  | 'TUTORIAL_DUAL_MODE'
  | 'TUTORIAL_TRAVEL'
  | 'TUTORIAL_VIDEO_VERIFY'
  | 'TUTORIAL_GUARANTEES'
  | 'TUTORIAL_CTA'
  | 'REGISTRATION'

export interface OnboardingState {
  // Language selection state
  phase: OnboardingPhase
  selectedLanguage: SupportedLanguage
  detectedCity: string
  detectedState: string
  languageConfirmed: boolean
  pendingLanguage: SupportedLanguage | null // language picked in list, awaiting confirmation

  // Script preference
  scriptPreference: ScriptPreference | null // 'native' for native script, 'latin' for English letters

  // Tutorial state
  tutorialStarted: boolean
  tutorialCompleted: boolean
  currentTutorialScreen: number // 1-12

  // Voice tutorial
  voiceTutorialSeen: boolean

  // App meta
  firstEverOpen: boolean
  helpRequested: boolean
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'hpj_pandit_onboarding_v1'

export const DEFAULT_STATE: OnboardingState = {
  phase: 'SPLASH',
  selectedLanguage: 'Hindi',
  detectedCity: '',
  detectedState: '',
  languageConfirmed: false,
  pendingLanguage: null,
  scriptPreference: null,
  tutorialStarted: false,
  tutorialCompleted: false,
  currentTutorialScreen: 1,
  voiceTutorialSeen: false,
  firstEverOpen: true,
  helpRequested: false,
}

// Map from phase to tutorial screen number (for progress dots)
export const TUTORIAL_PHASE_TO_DOT: Record<string, number> = {
  TUTORIAL_SWAGAT: 1,
  TUTORIAL_INCOME: 2,
  TUTORIAL_DAKSHINA: 3,
  TUTORIAL_ONLINE_REVENUE: 4,
  TUTORIAL_BACKUP: 5,
  TUTORIAL_PAYMENT: 6,
  TUTORIAL_VOICE_NAV: 7,
  TUTORIAL_DUAL_MODE: 8,
  TUTORIAL_TRAVEL: 9,
  TUTORIAL_VIDEO_VERIFY: 10,
  TUTORIAL_GUARANTEES: 11,
  TUTORIAL_CTA: 12,
}

export const TUTORIAL_PHASE_ORDER: OnboardingPhase[] = [
  'TUTORIAL_SWAGAT',
  'TUTORIAL_INCOME',
  'TUTORIAL_DAKSHINA',
  'TUTORIAL_ONLINE_REVENUE',
  'TUTORIAL_BACKUP',
  'TUTORIAL_PAYMENT',
  'TUTORIAL_VOICE_NAV',
  'TUTORIAL_DUAL_MODE',
  'TUTORIAL_TRAVEL',
  'TUTORIAL_VIDEO_VERIFY',
  'TUTORIAL_GUARANTEES',
  'TUTORIAL_CTA',
]

// City → Language mapping
export const CITY_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  // UP/Bihar/Jharkhand → Hindi
  varanasi: 'Hindi', lucknow: 'Hindi', patna: 'Hindi', allahabad: 'Hindi',
  prayagraj: 'Hindi', agra: 'Hindi', mathura: 'Hindi', haridwar: 'Hindi',
  rishikesh: 'Hindi', dehradun: 'Hindi', kanpur: 'Hindi', gorakhpur: 'Hindi',
  // Delhi NCR → Hindi
  delhi: 'Hindi', 'new delhi': 'Hindi', noida: 'Hindi', gurgaon: 'Hindi',
  faridabad: 'Hindi', ghaziabad: 'Hindi', 'greater noida': 'Hindi',
  // Rajasthan → Hindi
  jaipur: 'Hindi', udaipur: 'Hindi', jodhpur: 'Hindi', ajmer: 'Hindi',
  // MP → Hindi
  bhopal: 'Hindi', indore: 'Hindi', ujjain: 'Hindi', gwalior: 'Hindi',
  // Bengal → Bengali
  kolkata: 'Bengali', siliguri: 'Bengali', durgapur: 'Bengali', howrah: 'Bengali',
  // Tamil Nadu → Tamil
  chennai: 'Tamil', madurai: 'Tamil', coimbatore: 'Tamil', trichy: 'Tamil',
  // Andhra/Telangana → Telugu
  hyderabad: 'Telugu', vijayawada: 'Telugu', visakhapatnam: 'Telugu', warangal: 'Telugu',
  // Maharashtra → Marathi
  mumbai: 'Marathi', pune: 'Marathi', nashik: 'Marathi', nagpur: 'Marathi',
  aurangabad: 'Marathi',
  // Gujarat → Gujarati
  ahmedabad: 'Gujarati', surat: 'Gujarati', vadodara: 'Gujarati', rajkot: 'Gujarati',
  // Karnataka → Kannada
  bengaluru: 'Kannada', bangalore: 'Kannada', mysuru: 'Kannada', mysore: 'Kannada',
  hubli: 'Kannada',
  // Kerala → Malayalam
  kochi: 'Malayalam', thiruvananthapuram: 'Malayalam', kozhikode: 'Malayalam',
  thrissur: 'Malayalam',
  // Odisha → Odia
  bhubaneswar: 'Odia', cuttack: 'Odia',
  // Punjab → Punjabi
  chandigarh: 'Punjabi', amritsar: 'Punjabi', ludhiana: 'Punjabi',
  // Assam → Assamese
  guwahati: 'Assamese',
}

export function detectLanguageFromCity(city: string): SupportedLanguage {
  const normalized = city.toLowerCase().trim()
  return CITY_LANGUAGE_MAP[normalized] ?? 'Hindi'
}

// ─────────────────────────────────────────────────────────────
// PERSISTENCE HELPERS
// ─────────────────────────────────────────────────────────────

// STATE-001 FIX: Valid phases for validation
const VALID_PHASES: OnboardingPhase[] = [
  'SPLASH', 'LOCATION_PERMISSION', 'MANUAL_CITY', 'LANGUAGE_CONFIRM',
  'LANGUAGE_LIST', 'LANGUAGE_CHOICE_CONFIRM', 'LANGUAGE_SET', 'SCRIPT_CHOICE', 'HELP',
  'VOICE_TUTORIAL', 'TUTORIAL_SWAGAT', 'TUTORIAL_INCOME', 'TUTORIAL_DAKSHINA',
  'TUTORIAL_ONLINE_REVENUE', 'TUTORIAL_BACKUP', 'TUTORIAL_PAYMENT',
  'TUTORIAL_VOICE_NAV', 'TUTORIAL_DUAL_MODE', 'TUTORIAL_TRAVEL',
  'TUTORIAL_VIDEO_VERIFY', 'TUTORIAL_GUARANTEES', 'TUTORIAL_CTA', 'REGISTRATION'
]

// STATE-001 FIX: Validate onboarding state to prevent crashes from corrupted data
function validateOnboardingState(parsed: Partial<OnboardingState>): Partial<OnboardingState> {
  const validated: Partial<OnboardingState> = {}

  // Validate phase
  if (parsed.phase && VALID_PHASES.includes(parsed.phase)) {
    validated.phase = parsed.phase
  } else {
    validated.phase = 'SPLASH'
  }

  // Validate selectedLanguage
  if (parsed.selectedLanguage && ALL_LANGUAGES.includes(parsed.selectedLanguage)) {
    validated.selectedLanguage = parsed.selectedLanguage
  } else {
    validated.selectedLanguage = 'Hindi'
  }

  // Validate boolean fields
  validated.languageConfirmed = typeof parsed.languageConfirmed === 'boolean' ? parsed.languageConfirmed : false
  validated.tutorialStarted = typeof parsed.tutorialStarted === 'boolean' ? parsed.tutorialStarted : false
  validated.tutorialCompleted = typeof parsed.tutorialCompleted === 'boolean' ? parsed.tutorialCompleted : false
  validated.voiceTutorialSeen = typeof parsed.voiceTutorialSeen === 'boolean' ? parsed.voiceTutorialSeen : false
  validated.firstEverOpen = typeof parsed.firstEverOpen === 'boolean' ? parsed.firstEverOpen : true
  validated.helpRequested = typeof parsed.helpRequested === 'boolean' ? parsed.helpRequested : false

  // Validate string fields
  validated.detectedCity = typeof parsed.detectedCity === 'string' ? parsed.detectedCity : ''
  validated.detectedState = typeof parsed.detectedState === 'string' ? parsed.detectedState : ''

  // Validate number fields
  if (typeof parsed.currentTutorialScreen === 'number' && parsed.currentTutorialScreen >= 1 && parsed.currentTutorialScreen <= 12) {
    validated.currentTutorialScreen = parsed.currentTutorialScreen
  } else {
    validated.currentTutorialScreen = 1
  }

  // Validate pendingLanguage
  if (parsed.pendingLanguage && ALL_LANGUAGES.includes(parsed.pendingLanguage)) {
    validated.pendingLanguage = parsed.pendingLanguage
  } else {
    validated.pendingLanguage = null
  }

  // Validate scriptPreference
  if (parsed.scriptPreference && (parsed.scriptPreference === 'native' || parsed.scriptPreference === 'latin')) {
    validated.scriptPreference = parsed.scriptPreference
  } else {
    validated.scriptPreference = null
  }

  return validated
}

export function loadOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE, firstEverOpen: true }

    // STATE-001 FIX: Validate parsed data before returning
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    const validated = validateOnboardingState(parsed)

    const state = { ...DEFAULT_STATE, ...validated, firstEverOpen: false }

    // BUG-002 FIX: Check for desktop language preference (overrides saved state)
    const desktopLang = localStorage.getItem('hpj_preferred_language')
    if (desktopLang && ALL_LANGUAGES.includes(desktopLang as SupportedLanguage)) {
      state.selectedLanguage = desktopLang as SupportedLanguage
    }

    return state
  } catch (error) {
    logger.warn('[onboarding-store] Load failed, using defaults:', error)
    return { ...DEFAULT_STATE, firstEverOpen: true }
  }
}

export function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage blocked (incognito, etc.) — ignore silently
  }
}

export function clearOnboardingState(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    // BUG-050 FIX: Log error instead of silently ignoring
    logger.error('[onboarding-store] Failed to clear onboarding state:', error);
    // Re-throw for caller to handle if needed
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// STATE TRANSITION HELPERS
// ─────────────────────────────────────────────────────────────

// Call this to advance to the next tutorial screen
export function getNextTutorialPhase(current: OnboardingPhase): OnboardingPhase {
  const idx = TUTORIAL_PHASE_ORDER.indexOf(current)
  if (idx === -1 || idx >= TUTORIAL_PHASE_ORDER.length - 1) return 'REGISTRATION'
  return TUTORIAL_PHASE_ORDER[idx + 1]
}

// Call this to go back to previous tutorial screen
export function getPrevTutorialPhase(current: OnboardingPhase): OnboardingPhase {
  const idx = TUTORIAL_PHASE_ORDER.indexOf(current)
  if (idx <= 0) return 'TUTORIAL_SWAGAT'
  return TUTORIAL_PHASE_ORDER[idx - 1]
}

// Get the dot number for current phase (1-12)
export function getTutorialDotNumber(phase: OnboardingPhase): number {
  return TUTORIAL_PHASE_TO_DOT[phase] ?? 1
}

// Check if current phase is in Part 0 (tutorial)
export function isPart0Phase(phase: OnboardingPhase): boolean {
  return phase.startsWith('TUTORIAL_') || phase === 'SPLASH' || phase.startsWith('LANGUAGE_') ||
    phase === 'LOCATION_PERMISSION' || phase === 'MANUAL_CITY' || phase === 'HELP' ||
    phase === 'VOICE_TUTORIAL' || phase === 'LANGUAGE_SET'
}

export function isPart1Phase(phase: OnboardingPhase): boolean {
  return phase === 'REGISTRATION'
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

// Brand name translations for different script preferences
export const BRAND_NAME_TRANSLATION: Record<SupportedLanguage, {
  native: string
  latin: string
}> = {
  'Hindi': {
    native: 'हमारेपंडितजी',
    latin: 'HmarePanditJi',
  },
  'Bhojpuri': {
    native: 'हमारेपंडितजी',
    latin: 'HmarePanditJi',
  },
  'Maithili': {
    native: 'हमरेपंडितजी',
    latin: 'HamrePanditJi',
  },
  'Bengali': {
    native: 'আমাদেরপণ্ডিতজী',
    latin: 'AmaderPanditJi',
  },
  'Tamil': {
    native: 'நமத்பண்டித்ஜீ',
    latin: 'NamathPanditJi',
  },
  'Telugu': {
    native: 'మనపండిత్‌జీ',
    latin: 'ManaPanditJi',
  },
  'Kannada': {
    native: 'ನಮಪಂಡಿತಜೀ',
    latin: 'NamaPanditJi',
  },
  'Malayalam': {
    native: 'നമത്പണ്ഡിതജീ',
    latin: 'NamathPanditJi',
  },
  'Marathi': {
    native: 'आमारेपंडितजी',
    latin: 'AamarePanditJi',
  },
  'Gujarati': {
    native: 'આપડાપંડિતજી',
    latin: 'AapdaPanditJi',
  },
  'Sanskrit': {
    native: 'अस्माकपण्डितजी',
    latin: 'AsmakaPanditJi',
  },
  'English': {
    native: 'OurPanditJi',
    latin: 'OurPanditJi',
  },
  'Odia': {
    native: 'ଆମପଣ୍ଡିତଜୀ',
    latin: 'AmaPanditJi',
  },
  'Punjabi': {
    native: 'ਸਾਡੇਪੰਡਿਤਜੀ',
    latin: 'SaadePanditJi',
  },
  'Assamese': {
    native: 'আমাৰপণ্ডিতজী',
    latin: 'AmarPanditJi',
  },
}

// Helper function to get brand name in the correct script
export function getBrandName(language: SupportedLanguage, scriptPreference: 'native' | 'latin' | null): string {
  const translation = BRAND_NAME_TRANSLATION[language]
  if (!translation) return 'HmarePanditJi' // Fallback

  // If native script is preferred, return native name
  if (scriptPreference === 'native') {
    return translation.native
  }

  // Otherwise return latin name
  return translation.latin
}

export const LANGUAGE_DISPLAY: Record<SupportedLanguage, {
  nativeName: string      // Full name in native script (for screen readers, accessibility)
  shortName: string       // Compact display (2-4 chars for UI buttons/cards)
  latinName: string       // English name (reference only)
  latinScriptName: string // Language name written in Latin/Romanized script
  scriptChar: string      // Single character representing the script
  emoji: string           // Flag/cultural emoji
}> = {
  Hindi: { nativeName: 'हिंदी', shortName: 'हि', latinName: 'Hindi', latinScriptName: 'Hindi', scriptChar: 'अ', emoji: '🇮🇳' },
  Bhojpuri: { nativeName: 'भोजपुरी', shortName: 'भो', latinName: 'Bhojpuri', latinScriptName: 'Bhojpuri', scriptChar: 'भ', emoji: '🌾' },
  Maithili: { nativeName: 'मैथिली', shortName: 'मै', latinName: 'Maithili', latinScriptName: 'Maithili', scriptChar: 'म', emoji: '🪔' },
  Bengali: { nativeName: 'বাংলা', shortName: 'বা', latinName: 'Bengali', latinScriptName: 'Bangla', scriptChar: 'ব', emoji: '🐟' },
  Tamil: { nativeName: 'தமிழ்', shortName: 'த', latinName: 'Tamil', latinScriptName: 'Tamil', scriptChar: 'த', emoji: '🌺' },
  Telugu: { nativeName: 'తెలుగు', shortName: 'తె', latinName: 'Telugu', latinScriptName: 'Telugu', scriptChar: 'తె', emoji: '🌴' },
  Kannada: { nativeName: 'ಕನ್ನಡ', shortName: 'ಕ', latinName: 'Kannada', latinScriptName: 'Kannada', scriptChar: 'ಕ', emoji: '🏔️' },
  Malayalam: { nativeName: 'മലയാളം', shortName: 'മ', latinName: 'Malayalam', latinScriptName: 'Malayalam', scriptChar: 'മ', emoji: '🌿' },
  Marathi: { nativeName: 'मराठी', shortName: 'म', latinName: 'Marathi', latinScriptName: 'Marathi', scriptChar: 'म', emoji: '🟠' },
  Gujarati: { nativeName: 'ગુજરાતી', shortName: 'ગુ', latinName: 'Gujarati', latinScriptName: 'Gujarati', scriptChar: 'ગ', emoji: '🦚' },
  Sanskrit: { nativeName: 'संस्कृत', shortName: 'सं', latinName: 'Sanskrit', latinScriptName: 'Sanskrit', scriptChar: 'ॐ', emoji: '📜' },
  English: { nativeName: 'English', shortName: 'En', latinName: 'English', latinScriptName: 'English', scriptChar: 'A', emoji: '🌐' },
  Odia: { nativeName: 'ଓଡ଼ିଆ', shortName: 'ଓ', latinName: 'Odia', latinScriptName: 'Odia', scriptChar: 'ଓ', emoji: '🌊' },
  Punjabi: { nativeName: 'ਪੰਜਾਬੀ', shortName: 'ਪੰ', latinName: 'Punjabi', latinScriptName: 'Punjabi', scriptChar: 'ਪ', emoji: '🌻' },
  Assamese: { nativeName: 'অসমীয়া', shortName: 'অ', latinName: 'Assamese', latinScriptName: 'Assamese', scriptChar: 'অ', emoji: '🦅' },
}

// All supported languages as an ordered array for the selection grid
export const ALL_LANGUAGES: SupportedLanguage[] = [
  'Hindi', 'Bhojpuri', 'Maithili', 'Bengali',
  'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Marathi', 'Gujarati', 'Sanskrit', 'English',
  'Odia', 'Punjabi', 'Assamese',
]
