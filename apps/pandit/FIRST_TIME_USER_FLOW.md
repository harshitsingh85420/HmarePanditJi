# Pandit App First-Time User Flow - Complete Implementation

## Overview
This document describes the complete first-time user onboarding flow for the HmarePanditJi Pandit app, including the Flash/Splash screen animation and script type selection.

## User Journey Flow

```
App Launch
    ↓
[1] SPLASH SCREEN (4 seconds)
    ↓
[2] LOCATION PERMISSION
    ↓
[3] LANGUAGE DETECTION & CONFIRMATION
    ↓
[4] LANGUAGE SET CELEBRATION
    ↓
[5] SCRIPT TYPE SELECTION (Native vs Transliterated)
    ↓
[6] VOICE TUTORIAL
    ↓
[7] TUTORIAL SCREENS (12 screens)
    ↓
[8] REGISTRATION
```

---

## 1. SPLASH SCREEN (Flash Animation)

**File:** `apps/pandit/src/app/onboarding/screens/SplashScreen.tsx`

### Animation Sequence (4 seconds total):

| Phase | Time | Description |
|-------|------|-------------|
| Initial | 0-0.5s | Fade in, divine light rays appear |
| Small OM | 0.5-1.5s | OM symbol appears small with subtle glow |
| Scaling | 1.5-2.3s | OM scales up dramatically, particles & pulse waves |
| Large + Text | 2.3-4s | Text reveal "HmarePanditJi" / "हमारे पंडित जी" |
| Complete | 4s | Navigate to Location Permission |

### Visual Effects:
- ✅ **Divine Light Rays**: Golden gradient from top (breathing animation)
- ✅ **Gradient Orbs**: Animated orange/amber orbs in background
- ✅ **Central Golden Glow**: Behind OM symbol, grows with each phase
- ✅ **OM Symbol**: Scales from 0.4 → 0.6 → 1.0 → 1.15 with golden glow
- ✅ **Pulse Waves**: 3-4 expanding rings from OM center
- ✅ **Particle Sparkles**: 12 random particles + 8 extra golden sparkles
- ✅ **Text Reveal**: Dramatic slide-down with scale animation
- ✅ **Shimmer Divider**: Animated golden line beneath text
- ✅ **Progress Bar**: Glowing tip effect with shimmer overlay

### User Experience:
```
User opens app → Sees divine OM animation → Feels sacred connection
→ App feels premium and spiritual → Builds trust
```

---

## 2. LOCATION PERMISSION

**File:** `apps/pandit/src/app/onboarding/screens/LocationPermissionScreen.tsx`

### Voice Script (S-0.0.2):
```
Hindi: "नमस्ते। मैं आपका शहर जानना चाहता हूँ — ताकि आपकी भाषा अपने आप सेट हो जाए..."
Roman: "Namaste. Main aapka shehar jaanna chahta hoon..."
```

### Flow:
1. Voice asks for location permission
2. User says "हाँ" (Yes) or taps button
3. Gets GPS coordinates → Reverse geocodes to city
4. If granted → Auto-detects language from city
5. If denied → Manual city selection

---

## 3. LANGUAGE DETECTION & CONFIRMATION

**Files:**
- `apps/pandit/src/app/onboarding/screens/LanguageConfirmScreen.tsx`
- `apps/pandit/src/lib/onboarding-store.ts` (City → Language mapping)

### Voice Script (S-0.0.3):
```
Hindi: "{CITY} के हिसाब से हम {LANGUAGE} सेट कर रहे हैं। क्या यह ठीक है?"
Roman: "{CITY} ke hisaab se hum {LANGUAGE} set kar rahe hain. Kya yeh theek hai?"
```

### Supported Languages (15):
| Language | Native | Latin Script Name |
|----------|--------|-------------------|
| Hindi | हिंदी | Hindi |
| Tamil | தமிழ் | Tamil |
| Bengali | বাংলা | Bangla |
| Telugu | తెలుగు | Telugu |
| Kannada | ಕನ್ನಡ | Kannada |
| Malayalam | മലയാളം | Malayalam |
| Marathi | मराठी | Marathi |
| Gujarati | ગુજરાતી | Gujarati |
| Punjabi | ਪੰਜਾਬੀ | Punjabi |
| Odia | ଓଡ଼ିଆ | Odia |
| Sanskrit | संस्कृत | Sanskrit |
| Bhojpuri | भोजपुरी | Bhojpuri |
| Maithili | मैथिली | Maithili |
| Assamese | অসমীয়া | Assamese |
| English | English | English |

### If user wants different language:
- Opens Language List (bottom sheet)
- Voice: "कृपया अपनी भाषा का नाम बोलिए..."
- User speaks or taps language
- Confirmation screen appears

---

## 4. LANGUAGE SET CELEBRATION

**File:** `apps/pandit/src/app/onboarding/screens/LanguageSetScreen.tsx`

### Voice Script (S-0.0.6):
```
Hindi: "बहुत अच्छा! अब हम आपसे हिंदी में बात करेंगे।"
Roman: "Bahut achha! Ab hum aapse Hindi mein baat karenge."
```

### Visual:
- Celebration animation with confetti
- Shows selected language prominently
- "Continue" button to proceed

---

## 5. SCRIPT TYPE SELECTION ⭐ KEY FEATURE

**File:** `apps/pandit/src/app/onboarding/screens/ScriptChoiceScreen.tsx`

### User Sees:
```
┌─────────────────────────────────────┐
│  आपने चुनी है                      │
│  🇮🇳  हिंदी                        │
│      Hindi                          │
│                                     │
│  आप कैसे पढ़ना चाहेंगे?           │
│  अपनी पसंदीदा स्क्रिप्ट शैली चुनें │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  अ  शुद्ध हिंदी            │   │
│  │     हिंदी (हिंदी लिपि)     │   │
│  │     सब कुछ हिंदी लिपि में  │→  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  अ  हिंदी + अंग्रेज़ी      │   │
│  │  a  हिंदी (अंग्रेज़ी अक्षरों│   │
│  │     में) हिंदी अंग्रेज़ी    │→  │
│  │     लिपि में लिखी हुई       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────── या ───────                 │
│                                     │
│  🌐 भाषा बदलें                     │
│                                     │
│  💡 आप सेटिंग्स में कभी भी यह      │
│     बदल सकते हैं                   │
└─────────────────────────────────────┘
```

### Option 1: Pure Native Script (शुद्ध)
- **Label:** "शुद्ध हिंदी" (for Hindi)
- **Description:** "सब कुछ हिंदी लिपि में"
- **Icon:** Native script character (अ) in saffron gradient box
- **Use Case:** Users comfortable reading native script

### Option 2: Transliterated Script (Hinglish/Tanglish etc.)
- **Label:** "हिंदी + अंग्रेज़ी" (for Hindi)
- **Description:** "हिंदी अंग्रेज़ी लिपि में लिखी हुई"
- **Icon:** Native script (अ) + Latin (a) in green gradient box
- **Use Case:** Users who speak the language but read English better

### Examples for Different Languages:
| Language | Pure Script | Transliterated |
|----------|------------|----------------|
| Hindi | हिंदी | Hindi (in Devanagari: हिंदी) |
| Tamil | தமிழ் | Tamil (in English letters) |
| Bengali | বাংলা | Bangla (in English letters) |
| Telugu | తెలుగు | Telugu (in English letters) |

### What This Affects:
- ✅ **UI Text Display:** All app text uses chosen script
- ✅ **Tutorial Screens:** Native or transliterated display
- ✅ **Buttons & Labels:** Match user's reading preference
- ❌ **Voice Output:** Voice ALWAYS speaks in native language (TTS)

### Stored in State:
```typescript
scriptPreference: 'native' | 'latin'
```

---

## 6. VOICE TUTORIAL

**File:** `apps/pandit/src/app/onboarding/screens/VoiceTutorialScreen.tsx`

### Purpose:
- Teaches user how to use voice commands
- Microphone permission check
- Interactive demo: "Speak 'हाँ'"

### Voice Script (S-0.0.8):
```
Hindi: "एक छोटी सी बात। यह app आपकी आवाज़ से चलता है।"
Roman: "Ek chhoti si baat. Yeh app aapki aawaz se chalta hai."
```

---

## 7. TUTORIAL SCREENS (12 Screens)

### Flow:
1. **Swagat** (Welcome) - "HmarePanditJi पर आपका स्वागत है"
2. **Income** - How pandits earn money
3. **Dakshina** - Fixed pricing system
4. **Online Revenue** - Digital earnings
5. **Backup** - Profile backup
6. **Payment** - Payment setup
7. **Voice Nav** - Voice navigation tutorial
8. **Dual Mode** - Voice + Touch modes
9. **Travel** - Working while traveling
10. **Video Verify** - Video verification
11. **Guarantees** - App guarantees
12. **CTA** - Call to action (Register Now / Later)

### Display:
- Text shown in user's chosen script (native or transliterated)
- Voice ALWAYS in native language
- Progress dots (1-12) at top

---

## 8. REGISTRATION

After tutorial completion:
```
TUTORIAL_CTA → "Register Now" → /mobile (phone number entry)
```

---

## Technical Implementation

### State Management
**File:** `apps/pandit/src/lib/onboarding-store.ts`

```typescript
interface OnboardingState {
  phase: OnboardingPhase
  selectedLanguage: SupportedLanguage
  detectedCity: string
  detectedState: string
  languageConfirmed: boolean
  pendingLanguage: SupportedLanguage | null
  scriptPreference: 'native' | 'latin' | null  // ⭐ KEY FIELD
  tutorialStarted: boolean
  tutorialCompleted: boolean
  currentTutorialScreen: number
  voiceTutorialSeen: boolean
  firstEverOpen: boolean
  helpRequested: boolean
}
```

### Phase Flow
```typescript
type OnboardingPhase =
  | 'SPLASH'
  | 'LOCATION_PERMISSION'
  | 'MANUAL_CITY'
  | 'LANGUAGE_CONFIRM'
  | 'LANGUAGE_LIST'
  | 'LANGUAGE_CHOICE_CONFIRM'
  | 'LANGUAGE_SET'
  | 'SCRIPT_CHOICE'          // ⭐ Script selection happens here
  | 'HELP'
  | 'VOICE_TUTORIAL'
  | 'TUTORIAL_SWAGAT'
  | 'TUTORIAL_INCOME'
  // ... (12 tutorial screens)
  | 'TUTORIAL_CTA'
  | 'REGISTRATION'
```

### Translations System
**File:** `apps/pandit/src/lib/onboarding-translations.ts`

```typescript
// Usage in components:
const translations = ONBOARDING_TRANSLATIONS[state.selectedLanguage]
const displayText = state.scriptPreference === 'native'
  ? translations.native[key]
  : translations.latin[key]
```

### Voice Engine
**File:** `apps/pandit/src/lib/voice-engine.ts`

- Voice ALWAYS speaks in native language (for TTS)
- Uses Sarvam TTS with language-specific codes
- Script preference does NOT affect voice output
- Example: Tamil user with transliterated preference
  - **UI Text:** "Tamil" in English letters
  - **Voice:** Speaks in Tamil language (தமிழ்)

---

## Testing Checklist

### First-Time User Flow:
- [ ] App opens → Splash screen plays (4 seconds)
- [ ] OM animation is smooth with all effects
- [ ] Splash transitions to Location Permission
- [ ] Location permission voice prompt works
- [ ] GPS detection works (or manual city entry)
- [ ] Language confirmation shows correct language
- [ ] Can change language via list
- [ ] Language set celebration screen shows
- [ ] Script choice screen appears
- [ ] "Pure" option shows native script
- [ ] "Transliterated" option shows Latin script
- [ ] Selection saves to state
- [ ] Voice tutorial appears after script choice
- [ ] Tutorial screens use correct script
- [ ] Voice speaks in native language
- [ ] Registration flow starts after tutorial

### Script Type Testing:
- [ ] **Hindi + Native:** UI shows हिंदी text
- [ ] **Hindi + Transliterated:** UI shows "Hindi" in English letters
- [ ] **Tamil + Native:** UI shows தமிழ் text
- [ ] **Tamil + Transliterated:** UI shows "Tamil" in English letters
- [ ] All 15 languages work with both script types

### Edge Cases:
- [ ] User denies location → Manual city entry
- [ ] User changes language after selection
- [ ] User changes script preference in settings
- [ ] App restart mid-onboarding (state persistence)
- [ ] Voice permission denied → Keyboard fallback

---

## Key Files Summary

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Root entry point, redirects to /onboarding |
| `src/app/onboarding/page.tsx` | Main onboarding state machine |
| `src/app/onboarding/screens/SplashScreen.tsx` | Flash animation (enhanced) |
| `src/app/onboarding/screens/LocationPermissionScreen.tsx` | GPS permission |
| `src/app/onboarding/screens/LanguageConfirmScreen.tsx` | Language confirmation |
| `src/app/onboarding/screens/LanguageListScreen.tsx` | Language selection grid |
| `src/app/onboarding/screens/LanguageSetScreen.tsx` | Celebration screen |
| `src/app/onboarding/screens/ScriptChoiceScreen.tsx` | ⭐ Native vs Transliterated |
| `src/app/onboarding/screens/VoiceTutorialScreen.tsx` | Voice tutorial |
| `src/lib/onboarding-store.ts` | State management |
| `src/lib/onboarding-translations.ts` | Native & Latin script translations |
| `src/lib/voice-scripts.ts` | Voice prompts (always native) |
| `src/lib/voice-engine.ts` | TTS/STT engine |
| `src/lib/voice-preloader.ts` | Pre-loads audio during splash |

---

## Next Steps

1. **Test on Device:** Run the app and verify splash animation plays
2. **Verify Script Choice:** Ensure both options work correctly
3. **Check Translations:** Test all 15 languages with both script types
4. **Voice Testing:** Confirm voice speaks native language regardless of script preference
5. **Performance:** Ensure splash screen preloads audio for zero-latency voice

---

## Notes

- **Voice is ALWAYS in native script** (for TTS quality)
- **Script preference only affects UI text** (buttons, labels, tutorials)
- **Splash screen duration:** 4 seconds (optimized for voice preloading)
- **State persistence:** Saves to localStorage with validation
- **Elderly-friendly:** Large touch targets, slow pacing, clear visuals
