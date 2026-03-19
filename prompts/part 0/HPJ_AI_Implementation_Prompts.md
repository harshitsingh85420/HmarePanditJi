# HmarePanditJi — AI Model Implementation Prompts
## Part 0.0 + Part 0: Language Selection + Welcome Tutorial
### Complete Build-Ready Prompts for Low-Level AI Coding Models

---

> **HOW TO USE THESE PROMPTS**
>
> Each prompt is self-contained. Feed them to your AI model ONE AT A TIME.
> Wait for the model to complete and confirm before moving to the next prompt.
> Copy the FULL prompt including all context blocks — never abbreviate.
> The model will fail if any context is missing.
>
> **EXECUTION ORDER: NEVER SKIP. NEVER REORDER.**
> IMPL-00 → IMPL-01 → IMPL-02 → IMPL-03 → IMPL-04 → IMPL-05 →
> IMPL-06 → IMPL-07 → IMPL-08 → IMPL-09 → IMPL-10 → IMPL-11 → IMPL-12

---

# ════════════════════════════════════════════════════════════
# IMPL-00: PROJECT CONTEXT BLOCK
# (PASTE THIS AT THE START OF EVERY SESSION WITH YOUR AI MODEL)
# ════════════════════════════════════════════════════════════

```
YOU ARE IMPLEMENTING: HmarePanditJi — Pandit-Facing Mobile Web App
FRAMEWORK: Next.js 14 App Router (apps/pandit in a Turborepo monorepo)
PACKAGE MANAGER: npm with workspaces
STYLING: Tailwind CSS v3 (already installed, already configured)
LANGUAGE: TypeScript + TSX (strict mode)
TARGET: Mobile browser (390px wide) — feels like a native app
PORT: This app runs on port 3002

CRITICAL PROJECT RULES (NEVER VIOLATE THESE):
1. ALL files go inside apps/pandit/app/ or apps/pandit/components/ or apps/pandit/lib/
2. NEVER touch apps/web/, apps/admin/, services/api/, or prisma/
3. NEVER use "use client" on layout.tsx — only on specific components that need it
4. NEVER install new packages without being explicitly told to
5. Every TSX file needs proper TypeScript types — no "any" allowed
6. All Tailwind classes must match the project's tailwind.config.ts color tokens

CURRENT apps/pandit/tailwind.config.ts COLOR TOKENS:
  primary: '#f09942'        (warm saffron — use for CTAs, highlights)
  'primary-dk': '#dc6803'   (darker saffron — use for critical CTAs)
  'primary-lt': '#fef3c7'   (light saffron tint — card backgrounds)
  'vedic-cream': '#FFFBF5'  (ALL screen backgrounds — NEVER use bg-white on full screens)
  'vedic-brown': '#2D1B00'  (all primary text)
  'vedic-gold': '#9B7B52'   (secondary/tertiary text)
  'vedic-border': '#F0E6D3' (dividers, inactive borders)
  'success': '#15803D'      (money amounts, positive states)
  'success-lt': '#DCFCE7'   (success backgrounds)
  'error': '#DC2626'        (error states only)

FONT: Hind (Google Fonts) — loaded in layout.tsx
  Apply with: font-hind (configured in tailwind)

THE USER THIS APP SERVES:
  A Hindu priest (Pandit), male, age 45-70, low tech literacy.
  He may have never used voice input on an app before.
  Large thumbs. Often reading without glasses.
  Phone may be: Samsung Galaxy A12 (Android 11) or similar.
  Design every interaction assuming he might be confused or nervous.
  The app must never make him feel stupid.
```

---

# ════════════════════════════════════════════════════════════
# IMPL-01: PANDIT APP FOUNDATION + TAILWIND CONFIG + LAYOUT
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Set up the complete foundation for the apps/pandit onboarding flow.
You will create or update 4 files. Do NOT create any other files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 1: apps/pandit/tailwind.config.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create or REPLACE this file with exactly:

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#F09942',
        'primary-dk': '#DC6803',
        'primary-lt': '#FEF3C7',
        'vedic-cream': '#FFFBF5',
        'vedic-brown': '#2D1B00',
        'vedic-brown-2': '#6B4F2A',
        'vedic-gold': '#9B7B52',
        'vedic-border': '#F0E6D3',
        'success': '#15803D',
        'success-lt': '#DCFCE7',
        'error': '#DC2626',
        'error-lt': '#FEE2E2',
        'warning': '#B45309',
      },
      fontFamily: {
        hind: ['Hind', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.12)',
        'cta': '0 4px 12px rgba(240,153,66,0.35)',
        'cta-dk': '0 6px 20px rgba(220,104,3,0.45)',
      },
      keyframes: {
        'voice-bar': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-spring': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'draw-circle': {
          'to': { strokeDashoffset: '0' },
        },
        'draw-check': {
          'to': { strokeDashoffset: '0' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(200px) rotate(360deg)', opacity: '0' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: '70%' },
        },
        'pin-drop': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gentle-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
      },
      animation: {
        'voice-bar': 'voice-bar 1.2s ease-in-out infinite',
        'voice-bar-2': 'voice-bar 1.2s ease-in-out 0.2s infinite',
        'voice-bar-3': 'voice-bar 1.2s ease-in-out 0.4s infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.35s cubic-bezier(0,0,0.2,1) forwards',
        'slide-in-right': 'slide-in-right 0.25s cubic-bezier(0,0,0.2,1) forwards',
        'scale-spring': 'scale-spring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'draw-circle': 'draw-circle 0.8s ease-out forwards',
        'draw-check': 'draw-check 0.5s ease-out 0.8s forwards',
        'confetti-fall': 'confetti-fall linear infinite',
        'progress-fill': 'progress-fill 2.5s ease-out forwards',
        'pin-drop': 'pin-drop 0.6s ease-out forwards',
        'gentle-float': 'gentle-float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 2: apps/pandit/app/layout.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create or REPLACE with:

import type { Metadata, Viewport } from 'next'
import { Hind } from 'next/font/google'
import './globals.css'

const hind = Hind({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HmarePanditJi — Pandit App',
  description: 'App Pandit ke liye hai, Pandit App ke liye nahi.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HmarePanditJi',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F09942',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi" className={hind.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-hind bg-vedic-cream text-vedic-brown antialiased">
        <div className="relative mx-auto w-full max-w-[430px] min-h-screen overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 3: apps/pandit/app/globals.css
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create or REPLACE with:

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─────── Prevent iOS text size adjustment ─────── */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* ─────── Remove iOS tap highlight ─────── */
* {
  -webkit-tap-highlight-color: transparent;
}

/* ─────── Prevent scrollbar from causing layout shift ─────── */
body {
  overflow-x: hidden;
  background-color: #FFFBF5;
}

/* ─────── Custom scrollbar (subtle) ─────── */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #F0E6D3;
  border-radius: 2px;
}

/* ─────── Hide scrollbar for horizontal scroll chips ─────── */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* ─────── Screen timeout override for Part 0 screens ─────── */
/* Applied via JS wakeLock API — CSS placeholder only */
.screen-always-on { touch-action: manipulation; }

/* ─────── Voice bar animations ─────── */
.voice-bar {
  width: 6px;
  background-color: #F09942;
  border-radius: 3px;
  animation: voice-bar 1.2s ease-in-out infinite;
}
.voice-bar:nth-child(2) { animation-delay: 0.2s; }
.voice-bar:nth-child(3) { animation-delay: 0.4s; }

@keyframes voice-bar {
  0%, 100% { height: 8px; }
  50% { height: 24px; }
}

/* ─────── Saffron gradient splash ─────── */
.splash-gradient {
  background: linear-gradient(180deg, #F09942 0%, #F5C07A 50%, #FFFBF5 100%);
}

/* ─────── Shimmer text (for OM/Script icon) ─────── */
.shimmer-text {
  background: linear-gradient(90deg, #F09942 25%, #FFD7A8 50%, #F09942 75%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ─────── SVG animation helpers ─────── */
.draw-circle {
  stroke-dasharray: 252;
  stroke-dashoffset: 252;
  animation: draw-circle 0.8s ease-out forwards;
}
.draw-check {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: draw-check 0.5s ease-out 0.8s forwards;
}

@keyframes draw-circle { to { stroke-dashoffset: 0; } }
@keyframes draw-check { to { stroke-dashoffset: 0; } }

/* ─────── Accordion animation ─────── */
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}
.accordion-content.open {
  max-height: 200px;
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 4: apps/pandit/app/onboarding/layout.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create this file AND the directory apps/pandit/app/onboarding/:

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="screen-always-on min-h-screen bg-vedic-cream">
      {children}
    </div>
  )
}

VERIFICATION: After creating these 4 files, confirm:
- tailwind.config.ts has all animation keyframes defined
- layout.tsx imports Hind with devanagari subset
- globals.css has the voice-bar keyframe and splash-gradient class
- onboarding/layout.tsx exists and wraps children in bg-vedic-cream div
```

---

# ════════════════════════════════════════════════════════════
# IMPL-02: ONBOARDING STATE MANAGER (THE BRAIN)
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create the central state management system for the entire onboarding flow.
This is the most critical file — everything depends on it being correct.
Create ONE file only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/onboarding-store.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  // Language selection state
  phase: OnboardingPhase
  selectedLanguage: SupportedLanguage
  detectedCity: string
  detectedState: string
  languageConfirmed: boolean
  pendingLanguage: SupportedLanguage | null // language picked in list, awaiting confirmation

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
  } catch {}
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

// ─────────────────────────────────────────────────────────────
// LANGUAGE DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

export const LANGUAGE_DISPLAY: Record<SupportedLanguage, {
  nativeName: string
  latinName: string
  scriptChar: string  // Single character representing the script
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

// All supported languages as an ordered array for the selection grid
export const ALL_LANGUAGES: SupportedLanguage[] = [
  'Hindi', 'Bhojpuri', 'Maithili', 'Bengali',
  'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Marathi', 'Gujarati', 'Sanskrit', 'English',
  'Odia', 'Punjabi', 'Assamese',
]

VERIFICATION: After creating this file, confirm:
- SupportedLanguage type has 15 languages
- OnboardingPhase type has 22 phases (SPLASH through REGISTRATION)
- CITY_LANGUAGE_MAP has at least 40 cities
- LANGUAGE_DISPLAY has all 15 languages with scriptChar and nativeName
- ALL_LANGUAGES array has 15 entries
- loadOnboardingState and saveOnboardingState functions exist
```

---

# ════════════════════════════════════════════════════════════
# IMPL-03: VOICE ENGINE (WEB SPEECH API WRAPPER)
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create the voice engine that all screens will use.
This file handles: TTS (text-to-speech), STT (speech-to-text), ambient noise detection.
Create ONE file only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/voice-engine.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type VoiceState =
  | 'IDLE'
  | 'SPEAKING'       // TTS is playing
  | 'LISTENING'      // STT is active, waiting for user
  | 'PROCESSING'     // STT detected sound, processing
  | 'SUCCESS'        // STT recognized successfully
  | 'FAILURE'        // STT failed (below confidence)
  | 'NOISE_WARNING'  // Ambient noise too high

export type VoiceResult = {
  transcript: string
  confidence: number
  isFinal: boolean
}

export type VoiceEngineConfig = {
  language?: string         // BCP-47 language tag, e.g. 'hi-IN', 'en-IN'
  confidenceThreshold?: number  // 0-1, default 0.65
  listenTimeoutMs?: number     // How long to listen, default 12000ms
  onStateChange?: (state: VoiceState) => void
  onResult?: (result: VoiceResult) => void
  onError?: (error: string) => void
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE → BCP-47 MAP
// ─────────────────────────────────────────────────────────────

export const LANGUAGE_TO_BCP47: Record<string, string> = {
  'Hindi': 'hi-IN',
  'Bhojpuri': 'hi-IN',     // Bhojpuri falls back to hi-IN (no dedicated code)
  'Maithili': 'hi-IN',     // Same fallback
  'Bengali': 'bn-IN',
  'Tamil': 'ta-IN',
  'Telugu': 'te-IN',
  'Kannada': 'kn-IN',
  'Malayalam': 'ml-IN',
  'Marathi': 'mr-IN',
  'Gujarati': 'gu-IN',
  'Sanskrit': 'hi-IN',
  'English': 'en-IN',
  'Odia': 'or-IN',
  'Punjabi': 'pa-IN',
  'Assamese': 'as-IN',
}

// ─────────────────────────────────────────────────────────────
// INTENT → WORD MAP (Fuzzy matching for voice commands)
// ─────────────────────────────────────────────────────────────

type VoiceIntent = 'YES' | 'NO' | 'SKIP' | 'HELP' | 'CHANGE' | 'FORWARD' | 'BACK'

const INTENT_WORD_MAP: Record<VoiceIntent, string[]> = {
  YES: [
    'haan', 'ha', 'haanji', 'theek', 'sahi', 'bilkul', 'kar lo', 'de do',
    'ok', 'okay', 'yes', 'correct', 'accha', 'thik', 'haan ji', 'zaroor',
    'bilkul theek', 'haan haan', 'shi hai',
  ],
  NO: [
    'nahi', 'naa', 'na', 'mat', 'mat karo', 'no', 'galat', 'nahi chahiye',
    'nahi karna', 'nahi ji',
  ],
  SKIP: [
    'skip', 'skip karo', 'chodo', 'chhor do', 'aage jao', 'registration',
    'baad mein', 'baad me', 'later', 'abhi nahi', 'seedha chalo',
  ],
  HELP: [
    'sahayata', 'madad', 'help', 'samajh nahi', 'samajha nahi', 'dikkat',
    'problem', 'mushkil', 'nahi samajha', 'mujhe madad chahiye',
  ],
  CHANGE: [
    'badle', 'badlo', 'change', 'doosri', 'alag', 'koi aur', 'doosra',
    'change karo', 'nahi yeh', 'kuch aur',
  ],
  FORWARD: [
    'aage', 'agla', 'next', 'continue', 'samajh gaya', 'theek hai',
    'aage chalein', 'jaari rakhein', 'dekhein', 'show karo',
  ],
  BACK: [
    'pichhe', 'wapas', 'pehle wala', 'back', 'previous', 'wapas jao',
    'pichle screen',
  ],
}

export function detectIntent(transcript: string): VoiceIntent | null {
  const normalized = transcript.toLowerCase().trim()
  for (const [intent, words] of Object.entries(INTENT_WORD_MAP)) {
    for (const word of words) {
      if (normalized.includes(word)) {
        return intent as VoiceIntent
      }
    }
  }
  return null
}

// Detect language name from speech
export function detectLanguageName(transcript: string): string | null {
  const normalized = transcript.toLowerCase().trim()
  const languageAliases: Record<string, string> = {
    'hindi': 'Hindi', 'hindee': 'Hindi',
    'bhojpuri': 'Bhojpuri', 'bhojpori': 'Bhojpuri', 'bhojpuriya': 'Bhojpuri',
    'maithili': 'Maithili', 'maithil': 'Maithili',
    'bengali': 'Bengali', 'bangla': 'Bengali', 'bangali': 'Bengali',
    'tamil': 'Tamil', 'tamizh': 'Tamil', 'tameel': 'Tamil',
    'telugu': 'Telugu', 'telegu': 'Telugu',
    'kannada': 'Kannada', 'kannad': 'Kannada',
    'malayalam': 'Malayalam', 'malayali': 'Malayalam',
    'marathi': 'Marathi',
    'gujarati': 'Gujarati', 'gujrati': 'Gujarati', 'gujarathi': 'Gujarati',
    'sanskrit': 'Sanskrit', 'sanskrith': 'Sanskrit',
    'english': 'English', 'angrezi': 'English',
    'odia': 'Odia', 'oriya': 'Odia',
    'punjabi': 'Punjabi', 'panjabi': 'Punjabi',
    'assamese': 'Assamese',
  }
  for (const [alias, language] of Object.entries(languageAliases)) {
    if (normalized.includes(alias)) return language
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// TTS (TEXT TO SPEECH)
// ─────────────────────────────────────────────────────────────

let ttsUtterance: SpeechSynthesisUtterance | null = null

export function speak(
  text: string,
  languageBcp47: string = 'hi-IN',
  onEnd?: () => void
): void {
  if (typeof window === 'undefined') return
  if (!window.speechSynthesis) {
    console.warn('[VoiceEngine] SpeechSynthesis not supported')
    onEnd?.()
    return
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel()

  ttsUtterance = new SpeechSynthesisUtterance(text)
  ttsUtterance.lang = languageBcp47
  ttsUtterance.rate = 0.88     // Slightly slower than natural — elderly users
  ttsUtterance.pitch = 1.0
  ttsUtterance.volume = 1.0

  // Try to find a matching voice for the language
  const voices = window.speechSynthesis.getVoices()
  const matchedVoice = voices.find(v =>
    v.lang.startsWith(languageBcp47.split('-')[0]) && v.localService
  ) ?? voices.find(v => v.lang.startsWith(languageBcp47.split('-')[0]))
  if (matchedVoice) {
    ttsUtterance.voice = matchedVoice
  }

  ttsUtterance.onend = () => { onEnd?.() }
  ttsUtterance.onerror = () => {
    console.warn('[VoiceEngine] TTS error — calling onEnd anyway')
    onEnd?.()
  }

  // Chrome requires a tiny delay before speaking
  setTimeout(() => {
    if (ttsUtterance) window.speechSynthesis.speak(ttsUtterance)
  }, 100)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return
  window.speechSynthesis?.cancel()
  ttsUtterance = null
}

// ─────────────────────────────────────────────────────────────
// STT (SPEECH TO TEXT)
// ─────────────────────────────────────────────────────────────

let recognition: SpeechRecognition | null = null
let listenTimeout: ReturnType<typeof setTimeout> | null = null

export function startListening(config: VoiceEngineConfig): () => void {
  if (typeof window === 'undefined') return () => {}

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    console.warn('[VoiceEngine] SpeechRecognition not supported')
    config.onError?.('NOT_SUPPORTED')
    return () => {}
  }

  // Stop any existing recognition
  if (recognition) {
    try { recognition.stop() } catch {}
    recognition = null
  }

  const {
    language = 'hi-IN',
    confidenceThreshold = 0.65,
    listenTimeoutMs = 12000,
    onStateChange,
    onResult,
    onError,
  } = config

  recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = language
  recognition.maxAlternatives = 5

  onStateChange?.('LISTENING')

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    clearListenTimeout()
    onStateChange?.('PROCESSING')

    let bestTranscript = ''
    let bestConfidence = 0

    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i]
      for (let j = 0; j < result.length; j++) {
        if (result[j].confidence > bestConfidence) {
          bestConfidence = result[j].confidence
          bestTranscript = result[j].transcript
        }
      }
    }

    if (bestConfidence >= confidenceThreshold || bestConfidence === 0) {
      // confidence 0 often means the browser doesn't provide confidence — still use it
      onStateChange?.('SUCCESS')
      onResult?.({
        transcript: bestTranscript,
        confidence: bestConfidence,
        isFinal: true,
      })
    } else {
      onStateChange?.('FAILURE')
      onError?.('LOW_CONFIDENCE')
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    clearListenTimeout()
    console.warn('[VoiceEngine] STT error:', event.error)
    onStateChange?.('FAILURE')
    onError?.(event.error)
  }

  recognition.onend = () => {
    clearListenTimeout()
    // State is already set by onresult or onerror
  }

  try {
    recognition.start()
  } catch (e) {
    console.warn('[VoiceEngine] Failed to start recognition:', e)
    onError?.('START_FAILED')
  }

  // Auto-timeout if no speech detected
  listenTimeout = setTimeout(() => {
    if (recognition) {
      try { recognition.stop() } catch {}
      recognition = null
    }
    onStateChange?.('IDLE')
    onError?.('TIMEOUT')
  }, listenTimeoutMs)

  // Return cleanup function
  return () => {
    clearListenTimeout()
    if (recognition) {
      try { recognition.stop() } catch {}
      recognition = null
    }
  }
}

function clearListenTimeout(): void {
  if (listenTimeout) {
    clearTimeout(listenTimeout)
    listenTimeout = null
  }
}

export function stopListening(): void {
  clearListenTimeout()
  if (recognition) {
    try { recognition.stop() } catch {}
    recognition = null
  }
}

// ─────────────────────────────────────────────────────────────
// IS VOICE SUPPORTED
// ─────────────────────────────────────────────────────────────

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false
  const hasTTS = !!window.speechSynthesis
  const hasSTT = !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  )
  return hasTTS && hasSTT
}

VERIFICATION: After creating this file, confirm:
- speak() function exists and accepts text + languageBcp47 + onEnd
- startListening() returns a cleanup function
- detectIntent() returns one of the 7 VoiceIntent values or null
- detectLanguageName() maps spoken names to language strings
- LANGUAGE_TO_BCP47 has all 15 language mappings
- isVoiceSupported() exists and checks both TTS and STT
```

---

# ════════════════════════════════════════════════════════════
# IMPL-04: SHARED UI COMPONENTS
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create 8 shared UI components that every screen uses.
Create each file exactly as specified. No extra props, no extra logic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 1: apps/pandit/components/TopBar.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
}

export default function TopBar({ showBack = false, onBack, onLanguageChange }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 h-14 bg-vedic-cream border-b border-vedic-border sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="w-10 h-14 flex items-center justify-center text-vedic-gold"
            aria-label="Go back"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xl text-primary font-bold">ॐ</span>
          <span className="text-lg font-semibold text-vedic-brown">HmarePanditJi</span>
        </div>
      </div>
      <button
        onClick={onLanguageChange}
        className="w-14 h-14 flex items-center justify-center text-vedic-gold"
        aria-label="Change language"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 000 20" />
          <path d="M2 12h20" />
        </svg>
      </button>
    </header>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 2: apps/pandit/components/ProgressDots.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

interface ProgressDotsProps {
  total: number
  current: number  // 1-indexed
  onDotClick?: (index: number) => void
}

export default function ProgressDots({ total, current, onDotClick }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: total }, (_, i) => {
        const dotNum = i + 1
        const isCompleted = dotNum < current
        const isCurrent = dotNum === current
        return (
          <button
            key={i}
            onClick={() => isCompleted && onDotClick?.(dotNum)}
            className={[
              'rounded-full transition-all duration-300',
              isCurrent
                ? 'w-3 h-3 bg-primary ring-2 ring-primary/25 ring-offset-1'
                : isCompleted
                ? 'w-2.5 h-2.5 bg-primary cursor-pointer'
                : 'w-2.5 h-2.5 bg-vedic-border cursor-default',
            ].join(' ')}
            aria-label={`Step ${dotNum}`}
            disabled={!isCompleted}
          />
        )
      })}
    </div>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 3: apps/pandit/components/SkipButton.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

interface SkipButtonProps {
  label?: string
  onClick: () => void
}

export default function SkipButton({ label = 'Skip करें →', onClick }: SkipButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-vedic-gold text-base font-normal py-2 px-1 min-h-[44px] flex items-center"
    >
      {label}
    </button>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 4: apps/pandit/components/VoiceIndicator.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

interface VoiceIndicatorProps {
  isListening: boolean
  label?: string
}

export default function VoiceIndicator({
  isListening,
  label = 'सुन रहा हूँ...',
}: VoiceIndicatorProps) {
  if (!isListening) return null

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Animated bars */}
      <div className="flex items-end gap-1 h-6">
        <div className="voice-bar" />
        <div className="voice-bar" style={{ animationDelay: '0.2s' }} />
        <div className="voice-bar" style={{ animationDelay: '0.4s' }} />
      </div>
      <span className="text-vedic-gold text-sm">{label}</span>
    </div>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 5: apps/pandit/components/KeyboardToggle.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

interface KeyboardToggleProps {
  onClick: () => void
}

export default function KeyboardToggle({ onClick }: KeyboardToggleProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-vedic-gold text-sm py-2 px-2 min-h-[44px]"
      aria-label="Use keyboard instead"
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
      </svg>
      <span>Keyboard</span>
    </button>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 6: apps/pandit/components/CTAButton.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

interface CTAButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'primary-dk' | 'secondary' | 'ghost'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  height?: 'normal' | 'tall'
}

export default function CTAButton({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  height = 'normal',
}: CTAButtonProps) {
  const baseClass = [
    'flex items-center justify-center gap-2 rounded-btn font-bold text-xl',
    'transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : 'px-8',
    height === 'tall' ? 'h-[72px]' : 'h-16',
  ]

  const variantClass: Record<string, string> = {
    'primary': 'bg-primary text-white shadow-cta',
    'primary-dk': 'bg-primary-dk text-white shadow-cta-dk',
    'secondary': 'bg-white text-primary border-2 border-primary',
    'ghost': 'bg-transparent text-vedic-gold text-base font-normal h-11',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={[...baseClass, variantClass[variant]].join(' ')}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : label}
    </button>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 7: apps/pandit/components/ScreenFooter.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import VoiceIndicator from './VoiceIndicator'
import KeyboardToggle from './KeyboardToggle'

interface ScreenFooterProps {
  isListening?: boolean
  onKeyboardToggle?: () => void
  children: React.ReactNode  // The CTA button(s) go here
}

export default function ScreenFooter({
  isListening = false,
  onKeyboardToggle,
  children,
}: ScreenFooterProps) {
  return (
    <footer className="px-4 pb-8 pt-4 space-y-3">
      {/* Voice + Keyboard row */}
      <div className="flex items-center justify-between min-h-[44px]">
        <VoiceIndicator isListening={isListening} />
        {onKeyboardToggle && !isListening && (
          <KeyboardToggle onClick={onKeyboardToggle} />
        )}
      </div>
      {/* CTA button(s) */}
      {children}
    </footer>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 8: apps/pandit/components/LanguageBottomSheet.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useState } from 'react'
import { ALL_LANGUAGES, LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store'

interface LanguageBottomSheetProps {
  isOpen: boolean
  currentLanguage: SupportedLanguage
  onSelect: (language: SupportedLanguage) => void
  onClose: () => void
}

export default function LanguageBottomSheet({
  isOpen,
  currentLanguage,
  onSelect,
  onClose,
}: LanguageBottomSheetProps) {
  const [search, setSearch] = useState('')

  const filtered = ALL_LANGUAGES.filter(lang => {
    const display = LANGUAGE_DISPLAY[lang]
    return (
      display.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      display.latinName.toLowerCase().includes(search.toLowerCase())
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative bg-white rounded-t-[20px] shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-vedic-border rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-vedic-brown">भाषा बदलें</h2>
            <p className="text-sm text-vedic-gold">Change Language</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-vedic-gold">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-11">
            <svg width="18" height="18" fill="none" stroke="#9B7B52" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent flex-1 text-base text-vedic-brown placeholder-vedic-gold outline-none"
            />
          </div>
        </div>
        {/* Current language highlight */}
        <div className="px-4 pb-2">
          <div className="bg-primary-lt border border-primary rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{LANGUAGE_DISPLAY[currentLanguage].scriptChar}</span>
              <div>
                <p className="font-bold text-vedic-brown text-base">{LANGUAGE_DISPLAY[currentLanguage].nativeName}</p>
                <p className="text-sm text-vedic-gold">{LANGUAGE_DISPLAY[currentLanguage].latinName}</p>
              </div>
            </div>
            <span className="text-primary font-bold text-xl">✓</span>
          </div>
        </div>
        {/* Language grid */}
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(lang => {
              const display = LANGUAGE_DISPLAY[lang]
              const isActive = lang === currentLanguage
              return (
                <button
                  key={lang}
                  onClick={() => onSelect(lang)}
                  className={[
                    'flex items-center gap-2 p-3 rounded-xl border text-left transition-colors',
                    isActive
                      ? 'bg-primary-lt border-primary'
                      : 'bg-white border-vedic-border',
                  ].join(' ')}
                >
                  <span className="text-xl font-bold" style={{ color: isActive ? '#F09942' : '#2D1B00' }}>
                    {display.scriptChar}
                  </span>
                  <div>
                    <p className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-vedic-brown'}`}>
                      {display.nativeName}
                    </p>
                    <p className="text-xs text-vedic-gold">{display.latinName}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        {/* Close button */}
        <div className="px-4 py-4 border-t border-vedic-border">
          <button
            onClick={onClose}
            className="w-full h-14 border border-vedic-border rounded-btn text-vedic-brown-2 font-semibold text-lg"
          >
            बंद करें / Close
          </button>
        </div>
      </div>
    </div>
  )
}

VERIFICATION: After creating these 8 files, confirm:
- TopBar.tsx has the ॐ symbol and globe icon
- ProgressDots.tsx shows filled/current/empty dot states
- VoiceIndicator.tsx shows 3 animated bars when isListening=true
- CTAButton.tsx has 4 variants: primary, primary-dk, secondary, ghost
- LanguageBottomSheet.tsx has search input and 2-column grid
- All files have 'use client' at the top
- No file uses 'any' type
```

---

# ════════════════════════════════════════════════════════════
# IMPL-05: MAIN ONBOARDING ORCHESTRATOR PAGE
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create the main orchestrator page that manages phase transitions
and renders the correct screen based on current phase.
This is the router/state machine for the entire Part 0.0 + Part 0 flow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/app/onboarding/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import {
  OnboardingState,
  OnboardingPhase,
  DEFAULT_STATE,
  loadOnboardingState,
  saveOnboardingState,
  getNextTutorialPhase,
  getPrevTutorialPhase,
  getTutorialDotNumber,
  detectLanguageFromCity,
  SupportedLanguage,
} from '@/lib/onboarding-store'

import { stopSpeaking } from '@/lib/voice-engine'
import LanguageBottomSheet from '@/components/LanguageBottomSheet'

// Screen imports — each is a separate component
// We'll create these in subsequent prompts
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

export default function OnboardingPage() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = loadOnboardingState()

    // If tutorial is already complete, redirect to registration
    if (saved.tutorialCompleted) {
      router.replace('/onboarding/register')
      return
    }

    setState(saved)
    setIsLoaded(true)
  }, [router])

  // Persist state on every change (except initial load)
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

  const handleHelpRequested = useCallback(() => {
    updateState({ helpRequested: true, phase: 'HELP' })
  }, [updateState])

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
            onLater={() => router.push('/dashboard')}
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

VERIFICATION: After creating this file, confirm:
- File imports all 20+ screen components (they don't exist yet, that's OK — TypeScript will show errors until IMPL-06 through IMPL-12 are complete)
- updateState is a memoized useCallback
- goToPhase calls stopSpeaking() before every transition
- handleTutorialSkip routes to /onboarding/register
- The render switch has cases for all OnboardingPhase values
- No 'any' types anywhere
```

---

# ════════════════════════════════════════════════════════════
# IMPL-06: LANGUAGE SELECTION SCREENS (S-0.0.1 through S-0.0.8)
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create the directory apps/pandit/app/onboarding/screens/ and create
8 screen components for the language selection flow. Each component is a
self-contained screen. No shared state — props only.

Create this directory first: apps/pandit/app/onboarding/screens/

Then create each file:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 1: apps/pandit/app/onboarding/screens/SplashScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY EXACTLY from the Stitch HTML for S-0.0.1 (Splash Screen), adapted to React.
Key requirements:
- Full screen, no scrollbar, overflow hidden
- CSS class: splash-gradient (already in globals.css)
- OM symbol: large white text "ॐ" centered, 80px, animate-glow-pulse
- "HmarePanditJi" below OM, 28px, white, font-hind
- "हमारे पंडित जी" below that, 18px, white/80
- A progress bar at bottom: 120px wide, 3px height, white/25 background, white/90 fill, animate-progress-fill
- Auto-advance after 3000ms via useEffect + setTimeout → calls onComplete prop
- No buttons, no navigation
- Voice: SILENT (no TTS on this screen)

Props interface:
  interface SplashScreenProps {
    onComplete: () => void
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 2: apps/pandit/app/onboarding/screens/LocationPermissionScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key requirements:
- TopBar (showBack=false, onLanguageChange)
- Illustration: centered India map outline SVG (simplified, not realistic) with animated location pin
- Section title: "आपका शहर जानना क्यों ज़रूरी है?" (26px bold)
- 3 benefit rows each with saffron ✓ circle icon:
    Row 1: "आपकी भाषा खुद सेट हो जाएगी" + "टाइपिंग की ज़रूरत नहीं"
    Row 2: "आपके शहर की पूजाएं मिलेंगी" + "दूर-दराज़ की नहीं"
    Row 3: "ग्राहक आपको ढूंढ पाएंगे" + "नए ग्राहक, नई आमदनी"
- Privacy row: green pill with 🔒 + "आपका पूरा पता कभी नहीं दिखेगा किसी को भी"
- PRIMARY BUTTON: "✅ हाँ, मेरा शहर जानें" → triggers navigator.geolocation.getCurrentPosition
- GHOST LINK: "छोड़ें — हाथ से भरूँगा" → calls onDenied
- Geolocation success: use a reverse geocoding approximation:
    Use this URL: https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json
    Extract: address.city OR address.town OR address.village as city
    Extract: address.state as state
    If fetch fails: call onDenied()
- Geolocation denied by OS: call onDenied()
- Voice: play "Namaste Pandit Ji. Main aapka shehar jaanna chahta hoon..." at 500ms after mount
  Use speak() from voice-engine.ts with language BCP47

Props interface:
  interface LocationPermissionScreenProps {
    language: SupportedLanguage
    onLanguageChange: () => void
    onGranted: (city: string, state: string) => void
    onDenied: () => void
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 3: apps/pandit/app/onboarding/screens/ManualCityScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key requirements:
- TopBar (showBack=true)
- Reassurance: "कोई बात नहीं।" (22px, vedic-gold, center)
- Title: "अपना शहर बताइए" (32px bold, center)
- Voice input box (active/pulsing mic with 2 rings):
    Background: primary-lt, border: 2px primary, rounded-card
    🎤 icon (32px, primary) + "अपना शहर बोलें" + "जैसे: 'वाराणसी' या 'दिल्ली'"
    This box is ALWAYS listening when screen is mounted — use startListening()
    On recognition: match against city list, call onCitySelected
- Text search bar: 56px height, search icon, placeholder "अपना शहर लिखें..."
    On type: filter popular cities in chips below
- Popular city chips (2 rows, horizontal scroll, no-scrollbar class):
    Row 1: दिल्ली, वाराणसी, पटना, लखनऊ, मुंबई, जयपुर
    Row 2: कोलकाता, भोपाल, हरिद्वार, उज्जैन, चेन्नई, हैदराबाद
    Chip: 56px height, pill shape, primary border, primary text
    On tap: immediately call onCitySelected with city name in English (use mapping)
- City name mapping (Hindi display → English for code):
    दिल्ली→Delhi, वाराणसी→Varanasi, पटना→Patna, लखनऊ→Lucknow, मुंबई→Mumbai,
    जयपुर→Jaipur, कोलकाता→Kolkata, भोपाल→Bhopal, हरिद्वार→Haridwar,
    उज्जैन→Ujjain, चेन्नई→Chennai, हैदराबाद→Hyderabad
- ScreenFooter with isListening=true

Props interface:
  interface ManualCityScreenProps {
    language: SupportedLanguage
    onLanguageChange: () => void
    onCitySelected: (city: string) => void
    onBack: () => void
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 4: apps/pandit/app/onboarding/screens/LanguageConfirmScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key requirements:
- TopBar (showBack=true)
- Detected city chip: 📍 "{detectedCity}" (primary-lt bg, primary border, pill)
- HERO CARD (the centerpiece — must visually dominate):
    bg-white, rounded-[20px], shadow-card-hover, padding 32px 24px, animate-gentle-float
    Inside:
      Script character: LANGUAGE_DISPLAY[language].scriptChar at 64px, primary color, shimmer-text class
      Language name: LANGUAGE_DISPLAY[language].nativeName at 48px bold, vedic-brown
      Thin divider line 80px wide, vedic-border
      Question: "क्या इस भाषा में बात करना चाहेंगे?" (22px, center, vedic-brown-2)
- VoiceIndicator (isListening=true) + "'हाँ' या 'बदलें' बोलें" label
- PRIMARY BUTTON: "हाँ, यही भाषा सही है" → onConfirm
- SECONDARY BUTTON: "दूसरी भाषा चुनें" → onChange
- Voice on mount (500ms delay): speak "City ke hisaab se {language} set kar rahe hain. Haan ya Doosri bolein"
- startListening on mount — detect YES/NO intent, call appropriate handler
- Timeout at 12s: re-prompt. At 24s: auto-confirm with detected language.

Props interface:
  interface LanguageConfirmScreenProps {
    language: SupportedLanguage
    onLanguageChange: () => void
    detectedCity: string
    onConfirm: () => void
    onChange: () => void
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 5: apps/pandit/app/onboarding/screens/LanguageListScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key requirements:
- TopBar (showBack=true)
- Screen title: "अपनी भाषा चुनें" (28px bold, left-aligned)
- Voice search box (pulsing mic, primary-lt bg, primary border):
    Always listening. On detection: use detectLanguageName() from voice-engine.ts
    If match found: call onSelect with matched language
    If no match after 2 tries: show "नीचे से चुनें" toast
- Text search input (filters the grid as user types)
- Language grid (2 columns):
    Each cell: 64px height, bg-white, border-vedic-border, rounded-xl
    Content: native script (20px bold) + latin name (13px vedic-gold)
    Selected state: bg-primary-lt, border-2 border-primary, ✓ in top-right corner
    Import ALL_LANGUAGES and LANGUAGE_DISPLAY from onboarding-store
    On tap: call onSelect(language) immediately
- No bottom CTA button — selection triggers navigation

Props interface:
  interface LanguageListScreenProps {
    language: SupportedLanguage
    onLanguageChange: () => void
    onSelect: (language: SupportedLanguage) => void
    onBack: () => void
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 6: apps/pandit/app/onboarding/screens/LanguageChoiceConfirmScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key requirements:
- TopBar (showBack=true)
- CENTERED, vertically centered content (flex-1, flex, flex-col, items-center, justify-center)
- Pendng language name: LANGUAGE_DISPLAY[pendingLanguage].nativeName at 56px bold, primary color
- Latin name below: 24px, vedic-gold
- Short decorative divider (60px, 1px, vedic-border, centered)
- Question: "क्या यही भाषा सही है?" (26px, 600 weight, vedic-brown, center)
- VoiceIndicator
- PRIMARY BUTTON: "हाँ, यही भाषा चाहिए" → onConfirm
- SECONDARY BUTTON: "नहीं, फिर से चुनूँगा" → onReject
- Voice: "Aapne {language} kahi. Sahi hai? Haan ya Nahi bolein."
- startListening → YES → onConfirm, NO → onReject

Props interface:
  interface LanguageChoiceConfirmScreenProps {
    language: SupportedLanguage
    onLanguageChange: () => void
    pendingLanguage: SupportedLanguage
    onConfirm: () => void
    onReject: () => void
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 7: apps/pandit/app/onboarding/screens/LanguageSetScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key requirements:
- Full screen, vedic-cream background
- Soft radial glow: absolute div, bg-primary/8 radial gradient, full screen, pointer-events-none
- CENTERED content (everything centered both axes):
  1. Animated checkmark SVG (80px):
     Circle: stroke-dasharray=252, stroke-dashoffset=252, animate-draw-circle (CSS class from globals.css), stroke #15803D, strokeWidth=4
     Checkmark path: stroke-dasharray=100, stroke-dashoffset=100, animate-draw-check, stroke #15803D
  2. "बहुत अच्छा!" (40px bold, vedic-brown) — fade in at 1.2s
  3. "अब हम आपसे {LANGUAGE_DISPLAY[language].nativeName} में बात करेंगे।" (22px, vedic-brown-2) — fade in at 1.5s
- Confetti: Generate 20 small divs with random colors (#F09942, #FFD700, #FFFFFF, #15803D) at random positions around center, animate-confetti-fall
- NO buttons, NO navigation elements
- Voice: speak "Bahut achha! Ab hum aapse {language} mein baat karenge."
- Auto-advance: after 1800ms setTimeout → call onComplete

Props interface:
  interface LanguageSetScreenProps {
    language: SupportedLanguage
    onComplete: () => void
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 8: apps/pandit/app/onboarding/screens/HelpScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key requirements:
- TopBar (showBack=false, onLanguageChange from props)
- Illustration area (160px centered):
    A simple SVG or emoji-based illustration: Two figures facing each other
    Use emojis as placeholder: 🧑‍⚖️ and 📱 facing each other in a warm circle bg (primary-lt, 140px)
- "कोई बात नहीं।" (32px bold, vedic-brown, center)
- "हम मदद के लिए यहाँ हैं।" (20px, vedic-gold, center)
- Divider line
- Phone card (72px, primary bg, rounded-card, shadow-cta):
    📞 icon + "हमारी Team से बात करें" (20px bold white) + "1800-HPJ-HELP | बिल्कुल Free" (15px white/85)
    onClick: window.open('tel:1800000000') [placeholder number]
- WhatsApp card (64px, #25D366 bg, rounded-card):
    WhatsApp SVG icon (24px white) + "WhatsApp पर लिखें" + "Message भेजें, जवाब आएगा"
    onClick: window.open('https://wa.me/911800000000')
- Divider "─── या ───" (centered, vedic-gold)
- Text link: "वापस जाएं / खुद करें" → calls onBack
- Footer note: "सुबह 8 बजे – रात 10 बजे" (14px, center, vedic-gold)
- Voice: "Koi baat nahi. Humari team se baat karein. Bilkul free hai."

Props interface:
  interface HelpScreenProps {
    language: SupportedLanguage
    onLanguageChange: () => void
    onBack: () => void
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 9: apps/pandit/app/onboarding/screens/VoiceTutorialScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key requirements:
- TopBar: SkipButton in top-right ("छोड़ें") → calls onComplete
- Section label: "एक ज़रूरी बात" (22px, 600, vedic-gold, center)
- Illustration (180px centered circle, primary-lt bg):
    Person + phone + sound waves SVG or emoji: 🎤 in a large primary circle (80px)
    2 concentric rings around it: primary at 20% and 10% opacity, pulse animation
- Instruction: "जब यह दिखे:" + mini voice indicator pill (primary-lt bg, primary border)
- "तब बोलिए।" (28px bold, center)
- Divider
- INTERACTIVE DEMO BOX (104px height, primary-lt bg, 2px dashed primary border, rounded-[20px]):
    Large mic 🎤 (44px, primary) centered with 2 pulse rings
    "हाँ या नहीं बोलकर देखें" (18px, vedic-brown-2, below mic)
    This box starts listening when screen mounts (startListening)
    On ANY voice detection: show success pill "✅ शाबाश! बिल्कुल सही!" (green pill, animate-scale-spring)
    Success pill fades out after 2s
- Fallback note (below box): "अगर बोलने में दिक्कत हो:" + "⌨️ Keyboard हमेशा नीचे है"
- PRIMARY BUTTON: "समझ गया, आगे चलें →" → onComplete
- Voice: "Yeh app aapki aawaz se chalta hai. Abhi 'haan' ya 'nahi' boliye."

Props interface:
  interface VoiceTutorialScreenProps {
    language: SupportedLanguage
    onLanguageChange: () => void
    onComplete: () => void
  }

VERIFICATION: After creating all 9 files, confirm:
- All files are in apps/pandit/app/onboarding/screens/
- All files have 'use client' at top
- SplashScreen has no buttons and auto-advances after 3s
- LanguageSetScreen has the draw-circle CSS class on the SVG circle
- VoiceTutorialScreen has an interactive mic that responds to any voice
- All files import from '@/lib/onboarding-store' or '@/lib/voice-engine' as needed
- No file imports from 'next/link' (we use onClick handlers, not links, in this flow)
```

---

# ════════════════════════════════════════════════════════════
# IMPL-07: TUTORIAL SCREENS 1-6 (INCOME + EASE)
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create the tutorial directory and tutorial screens 1-6.
Directory: apps/pandit/app/onboarding/screens/tutorial/

ALL tutorial screen components share these props (create a shared type):

Create first: apps/pandit/app/onboarding/screens/tutorial/types.ts

export interface TutorialScreenProps {
  language: string
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

Now create each tutorial screen. Each screen MUST:
1. Use TopBar with showBack=true
2. Show ProgressDots with total=12, current=currentDot
3. Show SkipButton in the header area (right-aligned, same row as progress dots)
4. Have a ScreenFooter with the CTA
5. Auto-play voice on mount (500ms delay)
6. Use startListening and respond to FORWARD intent to call onNext
7. Main content area scrolls (overflow-y-auto flex-1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialSwagat.tsx (Screen 1 of 12 — S-0.1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content (adapt from the Stitch HTML for S-0.1 Welcome screen):

- Hero illustration area (240px):
    A seated Pandit figure. Use the SVG pattern: a saffron circle (200px, primary-lt bg)
    with a centered "🧘" emoji at 96px as placeholder (production will use custom SVG illustration)
    Add animate-gentle-float to the emoji wrapper
    Add a subtle radial glow behind: absolute div, bg-primary/12, 200px circle, blur-xl

- Greeting section:
    "नमस्ते" (40px, 700, vedic-brown, center)
    "पंडित जी।" (40px, 700, primary, center) ← saffron on their title is respectful
    "HmarePanditJi पर आपका स्वागत है।" (22px, vedic-brown-2, center)

- Thin divider (80px wide, center, vedic-border)

- Mool Mantra (italic, center, vedic-gold):
    "App पंडित के लिए है,"
    "पंडित App के लिए नहीं।"

- ScreenFooter with isListening:
    PRIMARY CTA: "जानें (सिर्फ 2 मिनट) →" → onNext
    GHOST text: "Registration पर सीधे जाएं" → onSkip

Voice script: "Namaste Pandit Ji. HmarePanditJi par aapka swagat hai. Ye platform aapke liye bana hai. Agle do minute mein hum dekhenge ki yeh app aapki aamdani mein kya badlav la sakta hai."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialIncome.tsx (Screen 2 of 12 — S-0.2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content (THE MOST IMPORTANT SCREEN — adapt from Stitch HTML S-0.2):

- Screen title: "आपकी कमाई कैसे बढ़ेगी?" (26px, 700, vedic-brown, left-aligned)

- TESTIMONIAL CARD (hero element):
    bg-white, rounded-card, shadow-card, border-l-[5px] border-primary, padding: 20px 20px 20px 24px
    Header row: avatar circle (48px, primary-lt bg, primary border) + name/city stack
      Name: "पंडित रामेश्वर शर्मा" (18px bold)
      City: "वाराणसी, UP" (15px vedic-gold)
    Income comparison (flex, two columns):
      Left: "पहले:" label + "₹18,000" in 24px with line-through styling (text-decoration: line-through), vedic-gold color
      Right: "अब:" label + "₹63,000" in 32px bold, success color — MAKE THIS VISUALLY DOMINANT
    Verified badge: success-lt bg, success border, pill, "✓ HmarePanditJi Verified" (14px, success)

- Subtitle: "3 नए तरीकों से यह हुआ:" (20px, 600, vedic-brown-2, left-aligned)

- 4-TILE GRID (2×2, gap-2.5):
    Each tile: (49%-ish) width, 80px height, bg-white, border-vedic-border, rounded-xl, padding 14px 16px
    Content per tile: emoji icon + title + subtitle text + optional "NEW" pill badge (top-right, primary bg, 10px white)
    Tile 1: 🏠 + "ऑफलाइन पूजाएं" + "(पहले से हैं आप)" — no NEW badge
    Tile 2: 📱 + "ऑनलाइन पूजाएं" + "(नया मौका)" — NEW badge in primary
    Tile 3: 🎓 + "सलाह सेवा" + "(प्रति मिनट)" — NEW badge
    Tile 4: 🤝 + "बैकअप पंडित" + "(बिना कुछ किए)" — NEW badge

- ScreenFooter: CTA "और देखें →" → onNext

Voice: "Varanasi ke Pandit Rameshwar Sharma Ji pehle aatharah hazaar kama rahe the. Aaj woh teesanth hazaar kama rahe hain. Main aapko bhi yahi tarike dikhaata hoon."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialDakshina.tsx (Screen 3 of 12 — S-0.3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content (adapt from S-0.3 Stitch HTML):

- Headline: "अब कोई मोलभाव नहीं।" (34px, 700, center)
- Illustration: horizontal flex centered: "💵🤝" + large "✕" emoji in red
- BEFORE CARD (error-lt bg, error border):
    "❌ पहले:" header
    Two chat bubbles:
      Customer: 😒 "1,500 में हो जाएगा?" (white bubble, rounded-tl-none)
      Pandit: 😔 "(चुप रह गए...)" (gray bubble, right-aligned, italic)
- Arrow connector between cards: "↓" (20px, vedic-gold, centered)
- AFTER CARD (success-lt bg, success border):
    "✅ अब:" header
    Nested white card:
      "सत्यनारायण पूजा" (18px bold)
      "आपकी दक्षिणा: ₹2,100" (24px bold, success) + "(पहले से तय)"
    "ग्राहक को Booking से पहले ही पता है।" below nested card
- Reassurance text: "आप दक्षिणा खुद तय करते हैं। Platform कभी नहीं बदलेगी।" (center)
- ScreenFooter: CTA "अगला फ़ायदा देखें →" → onNext

Voice: "Kitni baar hua hai ki aapne do ghante ki pooja ki, aur grahak ne keh diya — do hazaar le lo. Ab nahi hoga. Aap dakshina khud tayy karenge. Koi moalbhav nahi."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialOnlineRevenue.tsx (Screen 4 of 12 — S-0.4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content (adapt from S-0.4 Stitch HTML):

- Title: "घर बैठे भी कमाई" (30px bold)
- Subtitle: "(2 नए तरीके जो आप नहीं जानते)" (17px italic vedic-gold)

- CARD 1 — Ghar Baithe Pooja (primary-lt bg, primary border 2px, rounded-card):
    Header row: video camera emoji in white circle (48px) + "घर बैठे पूजा" (22px bold)
    Body: "Video call से पूजा कराएं। दुनिया भर के ग्राहक मिलेंगे — NRI भी।"
    Earnings chip (white bg, success border, pill): "₹2,000 – ₹5,000 प्रति पूजा" (18px bold success)

- CARD 2 — Pandit Se Baat (white bg, border-vedic-border, shadow-card):
    Header row: 🎓 emoji in primary-lt circle + "पंडित से बात" (22px bold)
    Body: "Phone / Video / Chat पर सलाह दें। आपका ज्ञान अब बिकेगा।"
    Rate chip: "₹20 – ₹50 प्रति मिनट" (success, pill)
    WORKED EXAMPLE (primary-lt bg, rounded-xl, padding 10px 14px):
      "उदाहरण: 20 मिनट = ₹800 आपको" (17px bold, primary) ← THIS IS THE KEY LINE
      Make this box stand out visually from the rest of the card

- Summary strip (primary-lt bg, dashed border, rounded-xl, centered):
    "दोनों मिलाकर ₹40,000+ अलग से हर महीने" (18px, 600)

- ScreenFooter: CTA → onNext

Voice: "Do bilkul naye tarike. Pehla — Ghar Baithe Pooja. Video call se do hazaar se paanch hazaar ek pooja. Doosra — Pandit Se Baat. Bees minute ki call mein aath sau rupe."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialBackup.tsx (Screen 5 of 12 — S-0.5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content (adapt from S-0.5 Stitch HTML):

- Headline block (center):
    "बिना कुछ किए" (28px bold, vedic-brown)
    "₹2,000?" (44px bold, success color) ← The HERO text of this screen
    "हाँ। यह सच है।" (18px, 600, vedic-brown-2)

- TIMELINE CARD (white bg, shadow-card, rounded-card, padding 20px):
    3 steps connected by dashed vertical lines:
    Step 1: 📅 in saffron circle + "कोई पूजा Book हुई" (18px bold) + "(Backup Protection के साथ)" (15px vedic-gold)
    Dashed connector line (2px dashed vedic-border, 20px height)
    Step 2: 📲 in saffron circle + "आपको Offer आया:" + "'क्या आप Backup Pandit बनेंगे?'" (italic quote)
    Dashed connector
    Step 3: ✅ in success green circle + "आपने हाँ कहा। उस दिन Free रहे।"

- OUTCOME TABLE CARD (white bg, shadow-card, rounded-card, overflow-hidden):
    Header row (primary-lt bg, padding 14px 16px):
      Left cell: "मुख्य Pandit ने पूजा की" (15px bold vedic-brown-2)
      Right cell: "मुख्य Pandit Cancel किया" (15px bold vedic-brown-2)
      Between cells: 1px vertical vedic-border line
    Data row (white bg, padding 20px 16px):
      Left: "₹2,000" (28px bold success) + "(बिना कुछ किए!)" (14px bold success, below)
      Right: "Full Amount" (20px bold success) + "+ ₹2,000 Bonus" (16px bold success, below)
      Between cells: 1px vertical vedic-border

- ACCORDION (collapsible, show as open in initial render):
    "▾ यह पैसा कहाँ से आता है?" header (16px bold, tap to toggle)
    Content: "ग्राहक ने Booking के समय Backup Protection की extra payment की थी। वही आपको मिलता है।" (16px)
    Implement with useState(true) for open by default

- ScreenFooter: CTA → onNext

Voice: "Yeh sun ke lagega 'yeh kaise ho sakta hai.' Jab koi booking hoti hai jisme backup protection hai, aapko offer aata hai. Aap haan kehte hain. Main Pandit ne pooja kar li — bhi aapko do hazaar. Main Pandit cancel kiya — poori booking plus do hazaar. Dono taraf faayda."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialPayment.tsx (Screen 6 of 12 — S-0.6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content (adapt from S-0.6 Stitch HTML):

- Headline:
    "पूजा ख़त्म।" (32px bold, vedic-brown, center)
    "पैसे 2 मिनट में।" (32px bold, primary, center) ← saffron on the promise

- TIMELINE CARD (white bg, shadow-card, rounded-card):
    3 rows with connector lines:
    Row 1: "3:30 PM" (15px vedic-gold) + filled green dot + "पूजा समाप्त हुई" (18px)
    Row 2: "3:31 PM" + orange dot with ring animation + "Payment शुरू हुआ" (18px)
    Row 3: "3:32 PM" + larger green filled dot + "✅ ₹2,325 आपके Bank में" (26px bold success)
    Connector: 2px dashed vedic-border between rows

- PAYMENT BREAKDOWN CARD (success-lt bg, border-l-4 border-success, rounded-xl, padding 16px 20px):
    "एक असली उदाहरण:" (14px vedic-gold italic) + thin success-light divider
    Row: "आपकी दक्षिणा:" left + "₹2,500" right (18px, vedic-brown)
    Row: "Platform (15%):" left (16px vedic-gold) + "−₹375" right (18px error color) ← SHOW COMMISSION OPENLY
    Row: "यात्रा भत्ता:" left + "+₹200" right (18px success)
    Divider: 1px success-light/50
    TOTAL ROW: "आपको मिला:" (18px bold success) + "₹2,325" (22px bold success)

- Reassurance: "हर रुपये का हिसाब।" + "कोई छुपाई नहीं।" (center, vedic-brown-2)

- ScreenFooter: CTA → onNext

Voice: "Pooja samapt hoti hai, do minute mein paisa bank mein. Platform ka share bhi screen par dikhega. Chhupa kuch nahi."

VERIFICATION: After creating all 6 tutorial files, confirm:
- All files are in apps/pandit/app/onboarding/screens/tutorial/
- types.ts has TutorialScreenProps interface
- TutorialIncome has the strikethrough ₹18,000 and bold green ₹63,000
- TutorialBackup has the outcome table with BOTH columns in success color
- TutorialPayment shows the commission deduction openly in error color
- All screens have 'use client' at top
- All screens import TutorialScreenProps from './types'
```

---

# ════════════════════════════════════════════════════════════
# IMPL-08: TUTORIAL SCREENS 7-12 (EASE + CTA)
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create tutorial screens 7-12. These focus on ease-of-use features
and culminate in the registration CTA. All go in:
apps/pandit/app/onboarding/screens/tutorial/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialVoiceNav.tsx (Screen 7 of 12 — S-0.7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL: This screen is INTERACTIVE. The mic is live and responds to any speech.

Content:
- Headline: "टाइपिंग की ज़रूरत नहीं।" (30px bold, center)
- Illustration (primary-lt circle 160px):
    🎤 emoji large (64px) + sound wave SVG arcs + "हाँ" text floating to the side
    Subtitle: "बोलो → लिखाई हो जाती है"

- Instruction: "जब यह दिखे:" + mini voice pill (primary-lt bg, primary border, shows 3 tiny bars + "सुन रहा हूँ...")
- "तब बोलिए।" (28px bold, center)

- INTERACTIVE DEMO BOX (CRITICAL SECTION):
    Background: primary-lt
    Border: 2px DASHED primary  ← dashed = "interactive, try me"
    Border-radius: 20px
    Height: 104px
    Content centered: 
      🎤 icon (44px, primary) with 2 concentric pulse rings (animate-pulse-ring)
      "हाँ या नहीं बोलकर देखें" (18px, vedic-brown-2, below icon)
    
    STATE MANAGEMENT (useState):
      type DemoState = 'ready' | 'listening' | 'success'
      Initially: 'ready'
      On mount: auto-start listening (startListening from voice-engine)
      On ANY voice detection (onResult fires): set to 'success'
    
    When demoState === 'success':
      Show success pill BELOW the box (animate-scale-spring):
        success-lt bg, success border, rounded-pill, padding 12px 24px
        "✅ शाबाश! बिल्कुल सही!" (20px bold success)
      After 2000ms: reset to 'ready' and restart listening
    
    The demo box ITSELF should also show a subtle green tint when success:
      Change border to success green when demoState === 'success'

- Fallback note: "अगर बोलने में दिक्कत हो:" + "⌨️ Keyboard हमेशा नीचे है"
- ScreenFooter: CTA "अगला फ़ायदा देखें →" → onNext

Voice: "Yeh app aapki aawaz se chalta hai. Abhi koshish kariye — 'haan' ya 'nahi' boliye. Mic abhi sun raha hai."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialDualMode.tsx (Screen 8 of 12 — S-0.8)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content:
- Headline:
    "कोई भी Phone," (28px bold)
    "Platform चलेगा।" (28px bold, primary)

- COMPARISON CARDS (side by side, gap-3):
    LEFT CARD (Smartphone — PRIMARY styling):
      primary border 2px, shadow-cta bg primary/10
      📱 emoji (36px, centered)
      "Smartphone" (17px bold, vedic-brown)
      Feature list (✓ in primary):
        ✓ Video Call
        ✓ Chat
        ✓ Voice Alerts
        ✓ Maps
    RIGHT CARD (Keypad — secondary styling):
      border-vedic-border, subtle shadow
      📟 emoji (36px, centered)
      "Keypad Phone" (17px bold, vedic-gold)
      Feature list (✓ in vedic-gold):
        ✓ Call आएगी
        ✓ 1 = हाँ
        ✓ 2 = ना
        ✓ बस!  ← italic, smaller

- FAMILY INCLUSION CARD (primary-lt bg, primary border dashed, rounded-card):
    THIS IS THE MOST IMPORTANT ELEMENT ON THIS SCREEN
    Left: 👨‍👩‍👦 emoji (36px)
    Right text:
      "बेटा या परिवार Registration में" (20px bold, vedic-brown)
      "मदद कर सकते हैं।" (20px bold, vedic-brown) — continuation
      "पूजा आपको मिलेगी, पैसे आपके खाते में।" (16px, vedic-brown-2)
    Make the card have equal visual weight to the two comparison cards combined

- ScreenFooter: CTA → onNext

Voice: "Chahe smartphone ho ya keypad phone — dono se kaam chalega. Aur agar registration mein beta ya parivar madad kare — bilkul theek hai."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialTravel.tsx (Screen 9 of 12 — S-0.9)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content:
- Headlines:
    "Travel की Tension नहीं।" (26px bold)
    "Double Booking नहीं।" (26px bold)

- TRAVEL CARD (primary-lt bg, primary border, rounded-[20px]):
    Header: 🚂 (28px) + "Booking Confirm हुई"
    Down arrow ↓ (primary)
    "Platform automatically बनाएगा:" (18px 600)
    Checklist:
      ✓ Train / Bus / Car का समय और टिकट
      ✓ ज़रूरत हो तो Hotel की Booking
      ✓ खाने का भत्ता (₹1,000/दिन)
      ✓ ग्राहक को GPS Updates
    Each ✓ in primary, 17px vedic-brown text

- CALENDAR CARD (white bg, dashed border-vedic-border, rounded-[20px]):
    Header: 📅 (28px) + "स्मार्ट कैलेंडर" + "Auto-Blocked" badge (error-lt bg, error text, pill)
    Mini calendar grid (5×7 grid of date cells):
      Use a CSS grid: 7 columns, auto rows
      Header row: M T W T F S S (13px vedic-gold)
      Date cells: 36px square, rounded-md
      Normal cells: bg-gray-50, text vedic-brown, 11px (show dates 12-18)
      BLOCKED cells (3 cells: 14, 15): bg-error-lt, red ✕ in center, 16px
    Below grid: "एक बार Set करो। Double Booking हो ही नहीं सकती।" (centered, italic)

- ScreenFooter: CTA → onNext

Voice: "Booking confirm hote hi, train, hotel, khaana — sab platform plan kar dega. Aur jo din free nahi, woh block ho jayega. Double booking ho hi nahi sakti."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialVideoVerify.tsx (Screen 10 of 12 — S-0.10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content:
- Headlines:
    "✅ Verified का मतलब" (26px bold, center)
    "ज़्यादा Bookings" (26px bold, primary, center)

- PROFILE PREVIEW CARD (white bg, shadow-card-hover, rounded-[20px], padding 20px):
    Simulated profile header:
      Profile circle (56px, primary-lt bg, primary border 2.5px) with 🧑 emoji placeholder
      Right: "[आपका नाम]" (20px bold) + "⭐ 4.9 | 234 Reviews" (15px vedic-gold)
      Far-right: "✓ VERIFIED" badge (success bg, white text, rounded-md, 10px bold)
    Divider
    "Verified पूजाएं:" label (16px 600 vedic-brown-2)
    Verified badges grid (flex-wrap, gap-2):
      Each badge: primary-lt bg, primary border, rounded-pill, padding 8px 14px, 36px height
      Content: 🟠 dot + "[Pooja Name] ✓" (16px vedic-brown + 14px primary)
      Show 4 badges: "सत्यनारायण कथा ✓", "विवाह संस्कार ✓", "गृह प्रवेश ✓", "श्राद्ध कर्म ✓"

- 3X STATS BANNER (primary bg, rounded-xl, padding 16px 20px, centered):
    "Verified Pandits को" (16px white/90)
    "3x" (48px bold white) ← THIS IS THE HERO NUMBER — make it HUGE
    "ज़्यादा Bookings मिलती हैं" (16px white/90)
    "Unverified से" (14px white/70)

- Reassurance (center):
    "सिर्फ 2 मिनट का Video — एक बार।" (18px, 600, vedic-brown)
    "Video सिर्फ Admin देखेगा। Public नहीं होगी।" (16px vedic-gold italic)
    ← BOTH lines must be VISIBLE TEXT (not just in voice) — they kill the privacy objection

- ScreenFooter: CTA "आगे देखें → (लगभग हो गया!)" → onNext

Voice: "Har pooja ke liye sirf do minute ka video — ek baar. Phir life mein us pooja ke liye Verified badge. Verified pandits ko teen guna zyada bookings milti hain. Video sirf admin dekhega."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialGuarantees.tsx (Screen 11 of 12 — S-0.11)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content:
- Headline:
    "HmarePanditJi की" (22px, vedic-gold)
    "4 गारंटी" (36px bold, vedic-brown)

- 4 GUARANTEE CARDS (stacked, gap-3, each animates-fade-up with stagger):
    Each card: white bg, border-l-[6px] border-primary-dk, rounded-r-xl (no left radius), shadow-sm
    Height: 80px, padding 0 16px 0 20px (extra left for the border)
    Content: horizontal flex, gap-4:
      Icon in primary-lt circle (40px):
        Card 1: 🏅 + "सम्मान" (18px bold) + "Verified Badge · Zero मोलभाव" (15px vedic-gold)
        Card 2: 🎧 + "सुविधा" + "Voice Navigation · Auto Travel"
        Card 3: 🔒 + "सुरक्षा" + "Fixed Income · Instant Payment"
        Card 4: 💰 + "समृद्धि" + "4 Income Streams · Backup Earnings"
    Animation delays: cards animate in with animation-delay 0ms, 200ms, 400ms, 600ms
    Use CSS animation-delay with animate-fade-up class

- SOCIAL PROOF STRIP (primary-lt/50 bg, primary/20 border, rounded-pill, padding 14px 20px):
    🤝 emoji (24px) + "3,00,000+ पंडित पहले से जुड़े हैं" (18px 600 vedic-brown)
    THIS STRIP APPEARS LAST (after all 4 cards) — intentional sequencing

- ScreenFooter: CTA "Registration शुरू करें →" (use variant='primary-dk') → onNext

Voice: "Yeh rahe chaar vaade. Samman, Suwidha, Suraksha, Samridhdhi. Teen lakh se zyada pandit pehle se jud chuke hain. Ab registration ki baari."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: tutorial/TutorialCTA.tsx (Screen 12 of 12 — S-0.12)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPECIAL PROPS (extends TutorialScreenProps):
Add onRegisterNow and onLater to props:

import { TutorialScreenProps } from './types'
interface TutorialCTAProps extends TutorialScreenProps {
  onRegisterNow: () => void
  onLater: () => void
}

Content:
- NO TopBar back arrow on this screen (it's the final screen)
- Progress dots: all 12 filled + "✓ Tutorial पूरा हुआ" text in success (14px)

- HERO ILLUSTRATION (200px height, centered):
    An emoji-based composition:
    Background: absolute div, primary-lt/30, 200px circle, center
    Temple silhouette suggestion: vedic-border arch shape (or just solid emoji)
    Main: 🧘 emoji at 96px, centered, with gentle float animation
    Subtle radial glow behind (primary/12, blur-xl)

- Headline block (center):
    "Registration शुरू करें?" (32px bold, vedic-brown)
    Gap
    "बिल्कुल मुफ़्त।" (22px 600, success) ← green = money-safe, cost-free signal
    "10 मिनट लगेंगे।" (20px, vedic-brown-2)
    ← BOTH lines answer unspoken objections: cost + time commitment

- Divider

- BUTTON STACK (NO ScreenFooter wrapper — use raw div with fixed bottom):
    CTA PRIMARY (onRegisterNow):
      "✅ हाँ, Registration शुरू करें →"
      height: 72px (4px taller than standard — this is the most important button)
      variant primary-dk (#DC6803 background)
      Shadow: shadow-cta-dk + extra ring: outline outline-2 outline-offset-2 outline-primary/30
    
    CTA SECONDARY (onLater):
      "बाद में करूँगा"
      height: 56px, white bg, vedic-border border, vedic-brown-2 text, rounded-btn
      ← NOT "Cancel" NOT "Skip" — "बाद में करूँगा" preserves the relationship

- HELPLINE ROW (below buttons):
    📞 + "कोई सवाल?" + "1800-HPJ-HELP" (bold, primary, tappable → tel link) + "(Toll Free)"
    Below: "सुबह 8 बजे – रात 10 बजे" (14px, vedic-gold)

- NO voice indicator. NO keyboard toggle.
  THIS IS A HUMAN MOMENT — the decision deserves silence.

Voice: "Bas itna tha parichay. Ab registration shuru kar sakte hain. Bilkul muft, das minute lagenge. 'Haan' bolein ya button dabayein."

VERIFICATION: After all 6 screens are created, confirm:
- TutorialVoiceNav has useState for demoState and actually calls startListening on mount
- TutorialVideoVerify has "Video सिर्फ Admin देखेगा" as VISIBLE text (not just voice)
- TutorialGuarantees has 4 cards with border-l-[6px] border-primary-dk
- TutorialCTA has onRegisterNow and onLater props (not just onNext/onBack)
- TutorialCTA uses the 72px height "tall" button for the primary CTA
- ALL screens import TutorialScreenProps from './types'
```

---

# ════════════════════════════════════════════════════════════
# IMPL-09: REGISTRATION PLACEHOLDER PAGE
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create the registration landing page that receives the Pandit after
the tutorial completes. This is a placeholder — the full registration is
implemented in later prompts. We just need this page to exist so
router.push('/onboarding/register') doesn't 404.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/app/onboarding/register/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useEffect } from 'react'
import { speak } from '@/lib/voice-engine'

export default function RegisterPage() {
  useEffect(() => {
    setTimeout(() => {
      speak(
        'Bahut achha Pandit Ji. Ab registration shuru karte hain. Pehle aapka mobile number chahiye.',
        'hi-IN'
      )
    }, 500)
  }, [])

  return (
    <div className="min-h-screen bg-vedic-cream flex flex-col">
      {/* Top bar */}
      <header className="flex items-center px-4 h-14 border-b border-vedic-border">
        <span className="text-xl text-primary font-bold">ॐ</span>
        <span className="ml-2 text-lg font-semibold text-vedic-brown">HmarePanditJi</span>
      </header>

      {/* Content placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6 animate-gentle-float">📋</div>
        <h1 className="text-2xl font-bold text-vedic-brown mb-3">
          Registration
        </h1>
        <p className="text-vedic-gold text-lg mb-8">
          पंजीकरण यहाँ होगा
        </p>
        <div className="bg-primary-lt border border-primary rounded-card p-4 text-left max-w-sm">
          <p className="text-sm text-vedic-brown-2 font-medium">
            ✅ Tutorial पूरा हो गया
          </p>
          <p className="text-sm text-vedic-gold mt-1">
            Full registration flow coming in next implementation prompt.
          </p>
        </div>
      </div>
    </div>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/app/dashboard/page.tsx (placeholder for "Baad Mein" flow)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-vedic-cream flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">🏠</div>
      <h1 className="text-2xl font-bold text-vedic-brown mb-4">
        आपकी Registration अधूरी है।
      </h1>
      <div className="w-full max-w-sm">
        <a
          href="/onboarding/register"
          className="flex items-center justify-center h-16 w-full bg-primary text-white text-xl font-bold rounded-btn shadow-cta"
        >
          Registration शुरू करें →
        </a>
      </div>
    </div>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/app/page.tsx (root redirect)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/onboarding')
}

VERIFICATION: After creating these 3 files, confirm:
- apps/pandit/app/page.tsx redirects to /onboarding
- apps/pandit/app/onboarding/register/page.tsx exists and has speak() call
- apps/pandit/app/dashboard/page.tsx exists and has "Registration शुरू करें" link
```

---

# ════════════════════════════════════════════════════════════
# IMPL-10: WAKE LOCK + SCREEN TIMEOUT SYSTEM
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Create two utility hooks for the onboarding flow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/hooks/useWakeLock.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useEffect, useRef } from 'react'

/**
 * Prevents the screen from sleeping during the onboarding flow.
 * Pandits read slowly — 30-second auto-lock would destroy the experience.
 * Uses the Screen Wake Lock API where available, silent no-op otherwise.
 */
export function useWakeLock(enabled: boolean = true) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (!('wakeLock' in navigator)) return

    let released = false

    const acquire = async () => {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null
        })
      } catch (err) {
        // Wake lock not granted — not critical
        console.debug('[WakeLock] Not acquired:', err)
      }
    }

    acquire()

    // Re-acquire when page becomes visible again (user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !released) {
        acquire()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [enabled])
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/hooks/useInactivityTimer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseInactivityTimerOptions {
  timeoutMs: number           // How long before onInactive fires
  onInactive: () => void      // What to do when inactive
  enabled?: boolean           // Toggle the timer on/off
  resetEvents?: string[]      // DOM events that reset the timer
}

/**
 * Fires onInactive callback after timeoutMs of user inactivity.
 * For Part 0 screens: 300,000ms (5 minutes) — because Pandits read slowly.
 * Default events that reset: touch, click, keypress, scroll.
 */
export function useInactivityTimer({
  timeoutMs,
  onInactive,
  enabled = true,
  resetEvents = ['touchstart', 'click', 'keypress', 'scroll'],
}: UseInactivityTimerOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onInactiveRef = useRef(onInactive)
  onInactiveRef.current = onInactive

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onInactiveRef.current()
    }, timeoutMs)
  }, [timeoutMs])

  useEffect(() => {
    if (!enabled) return

    resetTimer()

    resetEvents.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true })
    })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      resetEvents.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [enabled, resetTimer, resetEvents])

  return { resetTimer }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/hooks/useVoiceFlow.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  speak, startListening, stopListening, stopSpeaking,
  detectIntent, LANGUAGE_TO_BCP47, VoiceState,
} from '@/lib/voice-engine'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface UseVoiceFlowOptions {
  language: SupportedLanguage
  voiceScript: string             // The TTS text to speak on mount
  onIntent?: (intent: string) => void  // Called when intent is detected
  autoListen?: boolean            // Start listening after TTS ends (default: true)
  listenTimeoutMs?: number        // Default: 12000
  repromptAfterMs?: number        // Re-prompt if no input (default: 12000)
  repromptScript?: string         // Different text for the re-prompt
}

/**
 * Handles the full voice flow for a single screen:
 * 1. TTS plays voiceScript after 500ms delay
 * 2. STT starts after TTS ends (if autoListen=true)
 * 3. On detection: fires onIntent
 * 4. On timeout: re-prompts once, then fires onIntent with 'TIMEOUT'
 */
export function useVoiceFlow({
  language,
  voiceScript,
  onIntent,
  autoListen = true,
  listenTimeoutMs = 12000,
  repromptAfterMs = 12000,
  repromptScript,
}: UseVoiceFlowOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE')
  const [isListening, setIsListening] = useState(false)
  const [repromptCount, setRepromptCount] = useState(0)
  const cleanupRef = useRef<(() => void) | null>(null)
  const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'

  const startListeningSession = useCallback(() => {
    setIsListening(true)
    setVoiceState('LISTENING')

    const cleanup = startListening({
      language: bcp47,
      listenTimeoutMs,
      onStateChange: (state) => {
        setVoiceState(state)
        if (state !== 'LISTENING') setIsListening(false)
      },
      onResult: (result) => {
        const intent = detectIntent(result.transcript)
        if (intent && onIntent) {
          onIntent(intent)
        } else if (onIntent) {
          // Pass raw transcript for custom handling (e.g., city name, language name)
          onIntent(`RAW:${result.transcript}`)
        }
      },
      onError: (error) => {
        setIsListening(false)
        if (error === 'TIMEOUT' && repromptCount < 1) {
          setRepromptCount(c => c + 1)
          // Re-prompt
          const repromptText = repromptScript ?? voiceScript
          speak(repromptText, bcp47, () => {
            if (autoListen) startListeningSession()
          })
        }
      },
    })
    cleanupRef.current = cleanup
  }, [bcp47, listenTimeoutMs, onIntent, repromptCount, repromptScript, voiceScript, autoListen])

  useEffect(() => {
    // Start the voice flow after 500ms delay
    const ttsDelay = setTimeout(() => {
      speak(voiceScript, bcp47, () => {
        if (autoListen) startListeningSession()
      })
    }, 500)

    return () => {
      clearTimeout(ttsDelay)
      stopSpeaking()
      stopListening()
      cleanupRef.current?.()
    }
    // Run only once on mount — language/script changes don't restart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { voiceState, isListening }
}

VERIFICATION: After creating these 3 files, confirm:
- useWakeLock acquires and releases wake lock correctly
- useInactivityTimer fires onInactive after timeoutMs
- useVoiceFlow speaks TTS first, then starts STT after TTS ends
- All 3 files are in apps/pandit/lib/hooks/
- All have 'use client' at top
```

---

# ════════════════════════════════════════════════════════════
# IMPL-11: INTEGRATE HOOKS INTO KEY SCREENS
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Update the onboarding page and key screens to USE the hooks we created.
This prompt updates EXISTING files — do not create new files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE 1: apps/pandit/app/onboarding/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add these imports at the top of the file (after existing imports):

import { useWakeLock } from '@/lib/hooks/useWakeLock'
import { useInactivityTimer } from '@/lib/hooks/useInactivityTimer'

Add these two lines inside the OnboardingPage component, before the return statement:

// Keep screen on during onboarding
useWakeLock(true)

// Show "Continue where you left off?" after 5 minutes of inactivity
useInactivityTimer({
  timeoutMs: 300_000, // 5 minutes
  onInactive: () => {
    // Don't do anything dramatic — just log
    // In production: show a gentle "Still here?" bottom sheet
    console.log('[Onboarding] Inactivity detected after 5 minutes')
  },
})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE 2: apps/pandit/app/onboarding/screens/LanguageConfirmScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add this import at the top:
import { useVoiceFlow } from '@/lib/hooks/useVoiceFlow'

Replace the manual speak/startListening calls inside the component with:

const { isListening } = useVoiceFlow({
  language,
  voiceScript: `${detectedCity} ke hisaab se hum ${language} set kar rahe hain. Kya yeh theek hai? Haan bolein ya Doosri bolein.`,
  onIntent: (intent) => {
    if (intent === 'YES') onConfirm()
    else if (intent === 'NO' || intent === 'CHANGE') onChange()
  },
  repromptScript: "Kripya 'Haan' ya 'Doosri' bolein, ya neeche button dabayein.",
})

Then use isListening in the VoiceIndicator component:
<VoiceIndicator isListening={isListening} label="'हाँ' या 'बदलें' बोलें" />

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE 3: All Tutorial Screens (TutorialSwagat through TutorialGuarantees)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each tutorial screen from TutorialSwagat.tsx through TutorialGuarantees.tsx,
add this import and hook call (replacing any manual speak calls):

import { useVoiceFlow } from '@/lib/hooks/useVoiceFlow'

Inside the component:
const { isListening } = useVoiceFlow({
  language,
  voiceScript: '<SCREEN_SPECIFIC_VOICE_SCRIPT>', // Already defined in IMPL-07 and IMPL-08
  onIntent: (intent) => {
    if (intent === 'FORWARD' || intent === 'YES') onNext()
    else if (intent === 'BACK') onBack()
    else if (intent === 'SKIP') onSkip()
  },
})

Pass isListening to ScreenFooter:
<ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE 4: apps/pandit/app/onboarding/screens/tutorial/TutorialVoiceNav.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SPECIAL CASE: This screen has its OWN separate listening session (the demo mic).
It should NOT use useVoiceFlow for the demo. Instead:

1. Use useVoiceFlow for the screen-level voice script (plays TTS, doesn't listen after)
   Set autoListen={false}

2. Manually manage the demo mic with startListening from voice-engine.ts
   This is already handled in the screen implementation from IMPL-08.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE 5: apps/pandit/app/onboarding/screens/ManualCityScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add city name detection to the voice flow:

const { isListening } = useVoiceFlow({
  language,
  voiceScript: "Koi baat nahi. Apna shehar bataiye. Bol sakte hain ya neeche se chun sakte hain.",
  onIntent: (intent) => {
    if (intent.startsWith('RAW:')) {
      const transcript = intent.replace('RAW:', '')
      // Try to match the city name
      const cityMap: Record<string, string> = {
        'delhi': 'Delhi', 'dilli': 'Delhi',
        'varanasi': 'Varanasi', 'banaras': 'Varanasi', 'kashi': 'Varanasi',
        'patna': 'Patna', 'lucknow': 'Lucknow', 'mumbai': 'Mumbai', 'bombay': 'Mumbai',
        'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
        'chennai': 'Chennai', 'madras': 'Chennai',
        'hyderabad': 'Hyderabad', 'bengaluru': 'Bengaluru', 'bangalore': 'Bengaluru',
        'jaipur': 'Jaipur', 'bhopal': 'Bhopal', 'haridwar': 'Haridwar',
        'ujjain': 'Ujjain', 'mathura': 'Mathura', 'agra': 'Agra',
      }
      const lower = transcript.toLowerCase()
      for (const [key, city] of Object.entries(cityMap)) {
        if (lower.includes(key)) {
          onCitySelected(city)
          return
        }
      }
      // No match — continue listening (useVoiceFlow will handle re-prompt)
    }
  },
  repromptScript: "Kripya apna shehar ka naam boliye. Jaise 'Delhi', 'Varanasi', 'Mumbai'.",
})

VERIFICATION: After all updates, confirm:
- useWakeLock is called in OnboardingPage
- useVoiceFlow is used in LanguageConfirmScreen (not manual speak calls)
- All tutorial screens (1-11) use useVoiceFlow with appropriate voice scripts
- TutorialVoiceNav uses autoListen={false} for the screen-level flow
- ManualCityScreen has the city name mapping in onIntent
```

---

# ════════════════════════════════════════════════════════════
# IMPL-12: FINAL WIRING + BUILD VERIFICATION
# ════════════════════════════════════════════════════════════

```
[PASTE IMPL-00 CONTEXT BLOCK FIRST]

TASK: Final wiring, error fixes, and build verification.
This prompt fixes common issues that arise from the previous 11 prompts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: Verify directory structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run this command and verify the output matches:
find apps/pandit/app/onboarding -type f -name "*.tsx" | sort

Expected output should include ALL of these files:
apps/pandit/app/onboarding/layout.tsx
apps/pandit/app/onboarding/page.tsx
apps/pandit/app/onboarding/register/page.tsx
apps/pandit/app/onboarding/screens/HelpScreen.tsx
apps/pandit/app/onboarding/screens/LanguageChoiceConfirmScreen.tsx
apps/pandit/app/onboarding/screens/LanguageConfirmScreen.tsx
apps/pandit/app/onboarding/screens/LanguageListScreen.tsx
apps/pandit/app/onboarding/screens/LanguageSetScreen.tsx
apps/pandit/app/onboarding/screens/LocationPermissionScreen.tsx
apps/pandit/app/onboarding/screens/ManualCityScreen.tsx
apps/pandit/app/onboarding/screens/SplashScreen.tsx
apps/pandit/app/onboarding/screens/VoiceTutorialScreen.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialBackup.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialCTA.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialDakshina.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialDualMode.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialGuarantees.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialIncome.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialOnlineRevenue.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialPayment.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialSwagat.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialTravel.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialVideoVerify.tsx
apps/pandit/app/onboarding/screens/tutorial/TutorialVoiceNav.tsx
apps/pandit/app/onboarding/screens/tutorial/types.ts

If any files are missing: create them immediately with empty/placeholder components.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: Fix TypeScript path aliases
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open apps/pandit/tsconfig.json. Ensure it has these paths:

{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/lib/*": ["./lib/*"],
      "@/components/*": ["./components/*"],
      "@/app/*": ["./app/*"],
      "@hpj/types": ["../../packages/types/index.ts"],
      "@hpj/utils": ["../../packages/utils/index.ts"]
    }
  }
}

If paths are missing, add them. If tsconfig.json doesn't exist, create it with the full Next.js 14 TypeScript config + the paths above.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: Add next.config.js for the pandit app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create apps/pandit/next.config.js:

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Allow nominatim for reverse geocoding
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(*), geolocation=(*)',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: Run TypeScript check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run from the apps/pandit directory:
npx tsc --noEmit

Fix ALL TypeScript errors that appear. Common errors and fixes:

ERROR: "Cannot find module '@/lib/onboarding-store'"
FIX: Check tsconfig.json paths. The "@/*" should map to "./*"

ERROR: "Property 'SpeechRecognition' does not exist on type 'Window'"
FIX: This is expected — we use (window as any).SpeechRecognition — already handled in voice-engine.ts

ERROR: "Module has no exported member 'SupportedLanguage'"
FIX: Make sure onboarding-store.ts has 'export type SupportedLanguage = ...' (not just 'type')

ERROR: "JSX element implicitly has type 'any'"
FIX: Each screen component must have its props interface exported. Check that the import in page.tsx matches the export name.

ERROR: "'voiceTutorialSeen' does not exist on type 'OnboardingState'"
FIX: Verify DEFAULT_STATE in onboarding-store.ts has all fields including voiceTutorialSeen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5: Run the development server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From the monorepo root, run:
npm run dev

Then open: http://localhost:3002

Expected behavior:
1. Browser opens to http://localhost:3002/onboarding (redirected from /)
2. SPLASH SCREEN appears: saffron gradient, OM symbol, loading bar
3. After 3 seconds: LocationPermissionScreen appears
4. Browser shows geolocation permission prompt
5. If allowed: LanguageConfirmScreen appears showing detected city and language
6. Tapping "हाँ, यही भाषा सही है" → LanguageSetScreen (celebration)
7. LanguageSetScreen → VoiceTutorialScreen (first-ever open) or TutorialSwagat
8. Tutorial screens cycle from Swagat through CTA
9. Final CTA "✅ हाँ, Registration शुरू करें" → /onboarding/register page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6: Mobile browser testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open Chrome DevTools → Toggle device toolbar → Select "Samsung Galaxy A12" or similar.
Verify:
- Screens fill the viewport (no horizontal scroll)
- All text is readable at 20px+ minimum
- Buttons are at least 56px tall
- The OM symbol appears correctly in Hind font
- Devanagari text renders correctly (हिंदी, नमस्ते, etc.)
- The splash gradient goes from saffron to cream
- Voice indicator bars animate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7: Common runtime fixes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISSUE: "SpeechSynthesis is not supported" warning in console
FIX: Expected in server-side rendering. Already guarded with typeof window check.

ISSUE: Geolocation permission blocked in localhost
FIX: Chrome requires HTTPS for geolocation except on localhost.
     If still blocked: Use the "Geolocation" sensor override in Chrome DevTools.
     Set a test location: Latitude 25.317645, Longitude 83.005495 (Varanasi).
     This will make the Nominatim API return "Varanasi, Uttar Pradesh" → Hindi.

ISSUE: Hind font not loading Devanagari characters
FIX: Make sure layout.tsx has subsets: ['latin', 'devanagari'] in the Hind() call.

ISSUE: animation-delay not working in Tailwind
FIX: These use inline styles: style={{ animationDelay: '0.2s' }}
     This is already handled in VoiceIndicator.tsx and guarantee card stagger.

ISSUE: LanguageBottomSheet doesn't slide up
FIX: Ensure globals.css has the slide-up keyframe AND tailwind.config.ts has 'slide-up' in animation.

FINAL CHECKLIST — confirm all of these before marking IMPL-12 complete:
□ npm run dev starts without errors
□ http://localhost:3002 redirects to /onboarding
□ Splash screen appears with saffron gradient
□ Language confirmation shows "हिंदी" in the card
□ Tutorial screens 1-12 all load without errors
□ Progress dots show correct filled/empty state
□ Skip button is visible on every tutorial screen
□ Final CTA shows "✅ हाँ, Registration शुरू करें"
□ "बाद में करूँगा" navigates to /dashboard
□ localStorage saves progress (check via DevTools → Application → Local Storage)
□ Voice (TTS) plays on screens when mic permission is granted
```

---

# ════════════════════════════════════════════════════════════
# APPENDIX: DEBUGGING QUICK REFERENCE
# ════════════════════════════════════════════════════════════

```
WHEN YOUR AI MODEL GETS STUCK: Feed it this debug context.

COMMON IMPORT ERRORS:
  ❌ import { SupportedLanguage } from '../../../lib/onboarding-store'
  ✅ import { SupportedLanguage } from '@/lib/onboarding-store'
  
  ❌ import TopBar from '../../components/TopBar'
  ✅ import TopBar from '@/components/TopBar'

COMMON COMPONENT ERRORS:
  ❌ <button onClick={onNext}>Next</button>  ← missing 'use client'
  ✅ Add 'use client' at very top of any file that uses hooks or event handlers

COMMON TAILWIND ERRORS:
  ❌ className="bg-[#F09942]"  ← inline color bypasses design system
  ✅ className="bg-primary"   ← use design tokens

  ❌ className="text-white bg-primary"  ← putting bg-white on full screens
  ✅ Full screens use bg-vedic-cream, only cards use bg-white

COMMON VOICE ERRORS:
  ❌ If voice doesn't play: check if browser tab is in background (TTS blocked)
  ✅ Voice only works in foreground tab. This is browser security, not a bug.

  ❌ If STT fails with 'not-allowed': microphone permission not granted
  ✅ Ask user to allow microphone. In Chrome DevTools: Site Settings → Microphone → Allow.

COMMON ROUTING ERRORS:
  ❌ Using <Link href="/onboarding/register"> in tutorial screens
  ✅ Use router.push('/onboarding/register') from OnboardingPage.tsx only
     Tutorial screens call onNext() / onSkip() — they don't know about routes

THE GOLDEN RULE OF THIS IMPLEMENTATION:
  Every screen component is DUMB. It knows nothing about routing or other screens.
  It only knows its own content and its props (language, currentDot, onNext, onBack, onSkip).
  The OnboardingPage orchestrator (page.tsx) is the ONLY file that knows routes.
  If a screen needs to navigate, it calls its callback prop. Never router.push from a screen.
```
