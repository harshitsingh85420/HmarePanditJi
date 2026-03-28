# Voice Script Integration - Day 5-7 Implementation Complete

**Date:** March 28, 2026  
**Task:** 1.5 - Voice Scripts for All Language Screens  
**Priority:** 🔴 CRITICAL  
**Status:** ✅ COMPLETE

---

## 📋 Summary

Successfully implemented complete voice scripts for all language selection screens (S-0.0.4, S-0.0.5, S-0.0.6) as specified in `prompts/part 0/HPJ_Voice_System_Complete.md`.

---

## ✅ Completed Deliverables

### 1. **S-0.0.4 Language List Screen** (`LANGUAGE_LIST_SCREEN`)

**Location:** `apps/pandit/src/lib/voice-scripts.ts` (Lines 129-159)

**Scripts Implemented:**
- ✅ **Main Prompt:** "कृपया अपनी भाषा का नाम बोलिए। जैसे — भोजपुरी, Tamil, Telugu, Bengali — या नीचे से चुनें।"
- ✅ **On Language Detected:** "{LANGUAGE}? सही है?"
- ✅ **Reprompt (Timeout):** "आवाज़ नहीं पहचान पाया। नीचे से भाषा छूकर चुनें।"
- ✅ **Unsupported Language:** "अभी यह भाषा उपलब्ध नहीं है। सबसे नज़दीकी भाषा — हिंदी या English — चल सकती है।"

**Timing Configuration:**
- Initial Delay: 400ms
- Pause After TTS: 300ms (quick listen start for active voice search)

---

### 2. **S-0.0.5 Language Confirmation Screen** (`LANGUAGE_CHOICE_CONFIRM_SCREEN`)

**Location:** `apps/pandit/src/lib/voice-scripts.ts` (Lines 161-195)

**Scripts Implemented:**
- ✅ **Main Confirmation:** "आपने {LANGUAGE} कही। सही है? हाँ बोलें या नहीं बोलें।"
- ✅ **On Yes Confirmed:** "बहुत अच्छा।"
- ✅ **On No Said:** "ठीक है, फिर से चुनते हैं।"
- ✅ **Reprompt (12s timeout):** "{LANGUAGE} — सही है? बटन दबाइए।"

**Timing Configuration:**
- Initial Delay: 300ms
- Pause After TTS: 600ms (gives time to process confirmation)

---

### 3. **S-0.0.6 Language Set Celebration Screen** (`LANGUAGE_SET_SCREEN`)

**Location:** `apps/pandit/src/lib/voice-scripts.ts` (Lines 199-275)

**Scripts Implemented:**
- ✅ **Generic Template:** "बहुत अच्छा! अब हम आपसे {LANGUAGE} में बात करेंगे।"
- ✅ **15 Language-Specific Celebrations:**
  - Hindi: "बहुत अच्छा! अब हम आपसे हिंदी में बात करेंगे।"
  - Bhojpuri: "बहुत अच्छा! भोजपुरी सेट हो गई। हम आपसे इसी भाषा में बात करेंगे।"
  - Tamil: "Romba nalla! Tamil set aachu. Ab hum aapse Tamil mein baat karenge."
  - Telugu: "Chala manchidi! Telugu set aindi. Ab hum aapse Telugu mein baat karenge."
  - Bengali: "Khub bhalo! Bengali set hoyeche. Ab hum aapse Bengali mein baat karenge."
  - Kannada: "Tumba chennagide! Kannada set aagide. Eega nimma halige Kannadadalli maatanadteevi."
  - Malayalam: "Ethra nallathu! Malayalam set aayi. Innu nammal Malayalamil samsarikum."
  - Marathi: "Khup changal! Marathi set zali. Aata aapan Marathit bolu."
  - Gujarati: "Panu saru! Gujarati set thai gayu. Have tame Gujarati ma vaat karishu."
  - Punjabi: "Bahut changa! Punjabi set ho gayi. Hun asin tusi Punjabi vich gall karange."
  - English: "Very good! English is set. Now we will speak to you in English."
  - + 4 more (Maithili, Sanskrit, Odia, Assamese → fallback to Hindi)

**Timing Configuration:**
- Initial Delay: 200ms (fast — rides animation energy)

---

## 🔧 New Helper Functions

### `getCelebrationScript(language: SupportedLanguage): VoiceScript`

**Location:** `apps/pandit/src/lib/voice-scripts.ts` (Lines 720-750)

**Purpose:** Returns the appropriate celebration script for the confirmed language.

**Usage Example:**
```typescript
import { getCelebrationScript } from '@/lib/voice-scripts'

// After user confirms Tamil
const celebrationScript = getCelebrationScript('Tamil')
// Returns: { hindi: 'Romba nalla! Tamil set aachu...', ... }

// Speak it
await speakWithSarvam({
  text: celebrationScript.hindi,
  languageCode: LANGUAGE_TO_SARVAM_CODE['Tamil'], // 'ta-IN'
  onEnd: () => navigateToNextScreen()
})
```

**Language Mapping:**
| Language | Script Key | Fallback |
|----------|-----------|----------|
| Hindi | `celebrationHindi` | - |
| Bhojpuri | `celebrationBhojpuri` | - |
| Tamil | `celebrationTamil` | - |
| Telugu | `celebrationTelugu` | - |
| Bengali | `celebrationBengali` | - |
| Kannada | `celebrationKannada` | - |
| Malayalam | `celebrationMalayalam` | - |
| Marathi | `celebrationMarathi` | - |
| Gujarati | `celebrationGujarati` | - |
| Punjabi | `celebrationPunjabi` | - |
| English | `celebrationEnglish` | - |
| Maithili | `celebrationHindi` | Limited TTS quality |
| Sanskrit | `celebrationHindi` | Limited TTS quality |
| Odia | `celebrationHindi` | Limited TTS quality |
| Assamese | `celebrationHindi` | Limited TTS quality |

---

## 📊 Voice Script Structure

All scripts follow the `VoiceScript` interface:

```typescript
export interface VoiceScript {
  hindi: string      // Devanagari text (feed to Sarvam TTS)
  roman?: string     // Roman transliteration (developer reference)
  english?: string   // English meaning (developer reference)
  durationSec?: number
  initialDelayMs?: number   // Delay before starting speech (elderly-friendly)
  pauseAfterMs?: number     // Pause after speech before listening
}
```

---

## 🎯 Integration Guide

### Step 1: Import Required Functions

```typescript
import {
  LANGUAGE_LIST_SCREEN,
  LANGUAGE_CHOICE_CONFIRM_SCREEN,
  LANGUAGE_SET_SCREEN,
  getCelebrationScript,
  replaceScriptPlaceholders,
} from '@/lib/voice-scripts'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts'
```

### Step 2: Use in Language List Screen (S-0.0.4)

```typescript
// On screen load
const script = LANGUAGE_LIST_SCREEN.scripts.main
await speakWithSarvam({
  text: script.hindi,
  languageCode: 'hi-IN',
  pace: 0.88,
  onStart: () => setVoiceState('speaking'),
  onEnd: () => {
    setVoiceState('listening')
    startSTT() // Start speech-to-text
  },
})
```

### Step 3: Use in Language Confirmation Screen (S-0.0.5)

```typescript
// Dynamic placeholder replacement
const pendingLanguage = 'Tamil' // From user's selection
const script = replaceScriptPlaceholders(
  LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.main,
  { LANGUAGE: pendingLanguage }
)

await speakWithSarvam({
  text: script.hindi,
  languageCode: 'hi-IN',
  pace: 0.90,
})
```

### Step 4: Use in Language Set Celebration (S-0.0.6)

```typescript
// Get language-specific celebration
const confirmedLanguage = 'Tamil'
const celebrationScript = getCelebrationScript(confirmedLanguage)

await speakWithSarvam({
  text: celebrationScript.hindi,
  languageCode: LANGUAGE_TO_SARVAM_CODE[confirmedLanguage], // 'ta-IN'
  pace: 0.92, // Slightly warmer, more upbeat
})

// Auto-advance after 1.8s
setTimeout(() => navigateToNextScreen(), 1800)
```

---

## 🎤 Voice Flow Timing

### S-0.0.4 (Language List)
```
Screen Load → 400ms delay → TTS plays (5s) → 300ms pause → STT starts listening
                                                        ↓
                                            Timeout (12s) → Reprompt (3s)
                                                        ↓
                                            Timeout (24s) → Auto-fallback to grid
```

### S-0.0.5 (Language Confirm)
```
Screen Load → 300ms delay → TTS plays (3s) → 600ms pause → STT starts listening
                                                        ↓
                                            User says "Yes" → "बहुत अच्छा" (1s) → S-0.0.6
                                            User says "No" → "ठीक है..." (2s) → S-0.0.4
                                            Timeout (12s) → Reprompt → Button press
```

### S-0.0.6 (Celebration)
```
Screen Load → 200ms delay → TTS plays (3s) → NO STT (celebration only)
                                                        ↓
                                            Auto-advance after 1.8s → S-0.0.8 or S-0.1
```

---

## 📁 Files Modified

| File | Lines Changed | Description |
|------|--------------|-------------|
| `apps/pandit/src/lib/voice-scripts.ts` | +120 | Added complete scripts for S-0.0.4, S-0.0.5, S-0.0.6 + helper function |

---

## 🧪 Testing Checklist

### Unit Tests Needed:
- [ ] `getCelebrationScript()` returns correct script for each language
- [ ] `replaceScriptPlaceholders()` correctly replaces {LANGUAGE} tokens
- [ ] Voice timing matches specification (initialDelay, pauseAfter)

### Integration Tests Needed:
- [ ] Language list screen speaks prompt on mount
- [ ] Language confirmation uses dynamic language name
- [ ] Celebration screen uses native language audio
- [ ] Auto-advance timing works correctly

### Manual Testing:
- [ ] Test with all 15 supported languages
- [ ] Test voice recognition for language names
- [ ] Test timeout scenarios
- [ ] Test fallback to grid selection

---

## 💰 Cost Estimate (Per Sarvam AI Pricing)

**TTS (Bulbul v3):**
- S-0.0.4 Main: ~5 seconds = ₹0.004 per user
- S-0.0.5 Main: ~3 seconds = ₹0.002 per user
- S-0.0.6 Celebration: ~3 seconds = ₹0.002 per user
- **Total per user:** ₹0.008 (~$0.0001)
- **For 10,000 Pandits:** ₹80 (~$1)

**STT (Saaras v3 or Deepgram):**
- Average 2-3 attempts per screen = ₹0.02-0.03 per user
- **For 10,000 Pandits:** ₹200-300 (~$2.40-3.60)

**Total Voice Integration Cost:** ~₹3-4 per Pandit onboarding

---

## 🚀 Next Steps

1. **Backend Developer:**
   - [ ] Ensure Sarvam TTS API route (`/api/tts`) handles all language codes
   - [ ] Test WebSocket streaming for low-latency playback
   - [ ] Implement audio caching for celebration scripts

2. **Voice Script Specialist:**
   - [ ] Review native language scripts for Tamil, Telugu, Bengali, etc.
   - [ ] Verify correct pronunciation in Sarvam Bulbul v3
   - [ ] Adjust pace settings for elderly comprehension

3. **Frontend Developer:**
   - [ ] Integrate voice scripts into language selection components
   - [ ] Add visual indicators during voice playback
   - [ ] Implement timeout handling and reprompt logic

4. **QA:**
   - [ ] Test with real Pandit users (age 60+)
   - [ ] Validate timing in noisy environments (temples)
   - [ ] Test offline fallback to Web Speech API

---

## 📞 Support

For questions about voice script implementation:
- Refer to: `prompts/part 0/HPJ_Voice_System_Complete.md` (Lines 1-652)
- Voice System Architecture: See Part 1 of complete document
- Full Script Library: See Part 2 of complete document

---

**Implementation Status:** ✅ COMPLETE  
**Ready for:** Backend Integration + Voice Testing  
**Budget Spent:** ₹0 (Development only, API costs will accrue on deployment)
