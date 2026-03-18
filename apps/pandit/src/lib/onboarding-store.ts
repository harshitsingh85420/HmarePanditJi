'use client'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type SupportedLanguage =
  | 'Hindi' | 'Bhojpuri' | 'Maithili' | 'Bengali' | 'Tamil'
  | 'Telugu' | 'Kannada' | 'Malayalam' | 'Marathi' | 'Gujarati'
  | 'Sanskrit' | 'English' | 'Odia' | 'Punjabi' | 'Assamese'

export type OnboardingPhase =
  | 'SPLASH'
  | 'LOCATION_PERMISSION'
  | 'MANUAL_CITY'
  | 'LANGUAGE_CONFIRM'
  | 'LANGUAGE_LIST'
  | 'LANGUAGE_CHOICE_CONFIRM'
  | 'LANGUAGE_SET'
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
  phase: OnboardingPhase
  selectedLanguage: SupportedLanguage
  detectedCity: string
  detectedState: string
  languageConfirmed: boolean
  pendingLanguage: SupportedLanguage | null
  tutorialStarted: boolean
  tutorialCompleted: boolean
  currentTutorialScreen: number
  voiceTutorialSeen: boolean
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
  tutorialStarted: false,
  tutorialCompleted: false,
  currentTutorialScreen: 1,
  voiceTutorialSeen: false,
  firstEverOpen: true,
  helpRequested: false,
}

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

export const CITY_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  varanasi: 'Hindi', lucknow: 'Hindi', patna: 'Hindi', allahabad: 'Hindi',
  prayagraj: 'Hindi', agra: 'Hindi', mathura: 'Hindi', haridwar: 'Hindi',
  rishikesh: 'Hindi', dehradun: 'Hindi', kanpur: 'Hindi', gorakhpur: 'Hindi',
  delhi: 'Hindi', 'new delhi': 'Hindi', noida: 'Hindi', gurgaon: 'Hindi',
  faridabad: 'Hindi', ghaziabad: 'Hindi', 'greater noida': 'Hindi',
  jaipur: 'Hindi', udaipur: 'Hindi', jodhpur: 'Hindi', ajmer: 'Hindi',
  bhopal: 'Hindi', indore: 'Hindi', ujjain: 'Hindi', gwalior: 'Hindi',
  kolkata: 'Bengali', siliguri: 'Bengali', durgapur: 'Bengali', howrah: 'Bengali',
  chennai: 'Tamil', madurai: 'Tamil', coimbatore: 'Tamil', trichy: 'Tamil',
  hyderabad: 'Telugu', vijayawada: 'Telugu', visakhapatnam: 'Telugu', warangal: 'Telugu',
  mumbai: 'Marathi', pune: 'Marathi', nashik: 'Marathi', nagpur: 'Marathi',
  aurangabad: 'Marathi',
  ahmedabad: 'Gujarati', surat: 'Gujarati', vadodara: 'Gujarati', rajkot: 'Gujarati',
  bengaluru: 'Kannada', bangalore: 'Kannada', mysuru: 'Kannada', mysore: 'Kannada',
  hubli: 'Kannada',
  kochi: 'Malayalam', thiruvananthapuram: 'Malayalam', kozhikode: 'Malayalam',
  thrissur: 'Malayalam',
  bhubaneswar: 'Odia', cuttack: 'Odia',
  chandigarh: 'Punjabi', amritsar: 'Punjabi', ludhiana: 'Punjabi',
  guwahati: 'Assamese',
}

export function detectLanguageFromCity(city: string): SupportedLanguage {
  const normalized = city.toLowerCase().trim()
  return CITY_LANGUAGE_MAP[normalized] ?? 'Hindi'
}

// ─────────────────────────────────────────────────────────────
// PERSISTENCE HELPERS
// ─────────────────────────────────────────────────────────────

export function loadOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE, firstEverOpen: true }
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    return { ...DEFAULT_STATE, ...parsed, firstEverOpen: false }
  } catch {
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
  } catch (_e) {
    // localStorage blocked (incognito, etc.) — ignore silently
  }
}

// ─────────────────────────────────────────────────────────────
// STATE TRANSITION HELPERS
// ─────────────────────────────────────────────────────────────

export function getNextTutorialPhase(current: OnboardingPhase): OnboardingPhase {
  const idx = TUTORIAL_PHASE_ORDER.indexOf(current)
  if (idx === -1 || idx >= TUTORIAL_PHASE_ORDER.length - 1) return 'REGISTRATION'
  return TUTORIAL_PHASE_ORDER[idx + 1]
}

export function getPrevTutorialPhase(current: OnboardingPhase): OnboardingPhase {
  const idx = TUTORIAL_PHASE_ORDER.indexOf(current)
  if (idx <= 0) return 'TUTORIAL_SWAGAT'
  return TUTORIAL_PHASE_ORDER[idx - 1]
}

export function getTutorialDotNumber(phase: OnboardingPhase): number {
  return TUTORIAL_PHASE_TO_DOT[phase] ?? 1
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

export const LANGUAGE_DISPLAY: Record<SupportedLanguage, {
  nativeName: string
  latinName: string
  scriptChar: string
  emoji: string
}> = {
  Hindi:     { nativeName: 'हिंदी',     latinName: 'Hindi',     scriptChar: 'अ', emoji: '🇮🇳' },
  Bhojpuri:  { nativeName: 'भोजपुरी',   latinName: 'Bhojpuri',  scriptChar: 'भ', emoji: '🌾' },
  Maithili:  { nativeName: 'मैथिली',    latinName: 'Maithili',  scriptChar: 'म', emoji: '🪔' },
  Bengali:   { nativeName: 'বাংলা',     latinName: 'Bengali',   scriptChar: 'ব', emoji: '🐟' },
  Tamil:     { nativeName: 'தமிழ்',     latinName: 'Tamil',     scriptChar: 'த', emoji: '🌺' },
  Telugu:    { nativeName: 'తెలుగు',    latinName: 'Telugu',    scriptChar: 'తె', emoji: '🌴' },
  Kannada:   { nativeName: 'ಕನ್ನಡ',    latinName: 'Kannada',   scriptChar: 'ಕ', emoji: '🏔️' },
  Malayalam: { nativeName: 'മലയാളം',    latinName: 'Malayalam', scriptChar: 'മ', emoji: '🌿' },
  Marathi:   { nativeName: 'मराठी',     latinName: 'Marathi',   scriptChar: 'म', emoji: '🟠' },
  Gujarati:  { nativeName: 'ગુજરાતી',   latinName: 'Gujarati',  scriptChar: 'ગ', emoji: '🦚' },
  Sanskrit:  { nativeName: 'संस्कृत',   latinName: 'Sanskrit',  scriptChar: 'ॐ', emoji: '📜' },
  English:   { nativeName: 'English',   latinName: 'English',   scriptChar: 'A', emoji: '🌐' },
  Odia:      { nativeName: 'ଓଡ଼ିଆ',    latinName: 'Odia',      scriptChar: 'ଓ', emoji: '🌊' },
  Punjabi:   { nativeName: 'ਪੰਜਾਬੀ',   latinName: 'Punjabi',   scriptChar: 'ਪ', emoji: '🌻' },
  Assamese:  { nativeName: 'অসমীয়া',   latinName: 'Assamese',  scriptChar: 'অ', emoji: '🦅' },
}

export const ALL_LANGUAGES: SupportedLanguage[] = [
  'Hindi', 'Bhojpuri', 'Maithili', 'Bengali',
  'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Marathi', 'Gujarati', 'Sanskrit', 'English',
  'Odia', 'Punjabi', 'Assamese',
]
