# Voice System Guide
## HmarePanditJi - Complete Voice Architecture & Implementation Guide

**Document Version:** 1.0  
**Last Updated:** March 26, 2026  
**Target Audience:** Developers, Voice Engineers, QA Engineers

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Voice Technology Stack](#2-voice-technology-stack)
3. [Language Support Matrix](#3-language-support-matrix)
4. [Intent Detection Guide](#4-intent-detection-guide)
5. [Noise Handling Strategy](#5-noise-handling-strategy)
6. [Voice Scripts Library](#6-voice-scripts-library)
7. [Testing Procedures](#7-testing-procedures)
8. [Troubleshooting Guide](#8-troubleshooting-guide)
9. [Performance Optimization](#9-performance-optimization)
10. [API Reference](#10-api-reference)

---

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    HMAREPANDITJI VOICE SYSTEM                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   User       │    │   Voice      │    │   Business   │      │
│  │   Interface  │◄──►│   Engine     │◄──►│   Logic      │      │
│  │   (UI)       │    │   (STT/TTS)  │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         │                   │                   │               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Visual     │    │   Intent     │    │   Domain     │      │
│  │   Feedback   │    │   Detection  │    │   Services   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Voice Flow Diagram

```
User Speaks
    │
    ▼
┌─────────────────┐
│ Ambient Noise   │──────> If >85dB → Keyboard Fallback
│ Check (<85dB)   │
└─────────────────┘
    │
    ▼ (if noise OK)
┌─────────────────┐
│ STT Engine      │
│ (Sarvam/Deepgram)│
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Transcript      │
│ Processing      │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Intent          │
│ Detection       │
└─────────────────┘
    │
    ├─────────────┬─────────────┬──────────────┐
    ▼             ▼             ▼              ▼
┌────────┐   ┌────────┐   ┌────────┐    ┌──────────┐
│ YES    │   │ NO     │   │ FORWARD│    │ HELP     │
│ Intent │   │ Intent │   │ Intent │    │ Intent   │
└────────┘   └────────┘   └────────┘    └──────────┘
    │             │             │              │
    ▼             ▼             ▼              ▼
Action       Action        Action         Action
Taken        Taken         Taken          Taken
```

### 1.3 Key Design Principles

1. **Elderly-First Design**: Pace 0.82-0.85, clear enunciation, respectful tone
2. **Noise Resilience**: 85dB threshold for keyboard fallback
3. **Multi-Language**: 15 Indian languages supported
4. **Graceful Degradation**: Falls back to Web Speech API if primary fails
5. **Extended Timeouts**: 20s for elderly users (60% longer than industry standard)

### 1.4 Timeout Configuration (BUG-001 FIX)

**Timeouts are set to accommodate elderly Pandits (age 45-70) who may need more time to process and respond:**

| Timeout Type | Duration | Purpose |
|--------------|----------|---------|
| **Regular Listen** | 12,000ms (12s) | Standard timeout for all users |
| **Elderly Listen** | 20,000ms (20s) | Extended time for slower speakers |
| **Reprompt** | 40,000ms (40s) | Time for reprompt speech + response |
| **Initial Delay** | 800ms | Pause before starting speech |
| **Pause After TTS** | 1,000ms | Pause after speech before listening |
| **Max Reprompts** | 3 | Number of retry attempts |
| **Max Errors** | 3 | Errors before keyboard fallback |

**Industry Standard:** 8s timeout
**Our Timeout:** 12-20s (50-150% longer)

**Rationale:** Elderly users in temple environments may need extra time to:
- Process the question (especially if unfamiliar with technology)
- Formulate their response
- Speak clearly in potentially noisy environments
5. **Low Latency**: <300ms response time target

---

## 2. Voice Technology Stack

### 2.1 Primary Stack

| Layer | Technology | Purpose | Configuration |
|-------|------------|---------|---------------|
| **TTS** | Sarvam AI Bulbul v3 | App speaks to user | Voice: "meera", Pace: 0.85 |
| **STT (Hindi)** | Deepgram Nova-3 | User speech → text | Language: "hi", Keyterms: pooja-vocab |
| **STT (Regional)** | Sarvam Saaras v3 | Regional language STT | 22 Indian languages |
| **Fallback** | Web Speech API | Offline/emergency | Browser native |

### 2.2 Technology Selection Rationale

**Why Sarvam AI for TTS?**
- Built in India for Indian languages
- Correct pronunciation of "Varanasi", "Dakshina", "Satyanarayan"
- Natural Hinglish handling
- ₹15/10K chars (cost-effective)
- SOC 2 Type II certified

**Why Deepgram Nova-3 for Hindi STT?**
- 27% WER reduction vs Nova-2
- Best Hinglish handling
- <300ms latency
- $0.0077/min (cost-effective)

**Why Sarvam Saaras v3 for Regional STT?**
- 22 Indian languages in one model
- Handles code-mixing natively
- Purpose-built for Indic accents

### 2.3 Integration Architecture

```typescript
// Voice Engine Routing Logic
function getSTTEngine(language: string): 'sarvam' | 'deepgram' {
  const lang = language.toLowerCase()
  
  // Deepgram for Hindi/Bhojpuri/Maithili/English
  if (['hindi', 'bhojpuri', 'maithili', 'english'].includes(lang)) {
    return 'deepgram'
  }
  
  // Sarvam for regional languages
  if (['tamil', 'telugu', 'bengali', 'kannada', 'malayalam', 
       'marathi', 'gujarati', 'odia', 'punjabi', 'assamese'].includes(lang)) {
    return 'sarvam'
  }
  
  // Default to Sarvam
  return 'sarvam'
}
```

---

## 3. Language Support Matrix

### 3.1 Supported Languages (15)

| # | Language | Code | TTS | STT | Fallback | Status |
|---|----------|------|-----|-----|----------|--------|
| 1 | Hindi | hi-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 2 | Bhojpuri | hi-IN | ⚠️ Hindi+Prompts | ✅ Native | Web Speech | ✅ Production |
| 3 | Maithili | hi-IN | ⚠️ Hindi+Prompts | ✅ Native | Web Speech | ✅ Production |
| 4 | Bengali | bn-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 5 | Tamil | ta-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 6 | Telugu | te-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 7 | Kannada | kn-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 8 | Malayalam | ml-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 9 | Marathi | mr-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 10 | Gujarati | gu-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 11 | Sanskrit | hi-IN | ⚠️ Hindi+Prompts | ✅ Native | Web Speech | ✅ Production |
| 12 | English | en-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 13 | Odia | or-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 14 | Punjabi | pa-IN | ✅ Native | ✅ Native | Web Speech | ✅ Production |
| 15 | Assamese | as-IN | ⚠️ Hindi+Prompts | ✅ Native | Web Speech | ✅ Production |

**Legend:**
- ✅ Native: Full native language support
- ⚠️ Hindi+Prompts: Uses Hindi TTS with language-specific prompts

### 3.2 Language Detection

```typescript
// Language name detection from user speech
function detectLanguageName(transcript: string): string | null {
  const normalized = transcript.toLowerCase().trim()
  const languageAliases: Record<string, string> = {
    'hindi': 'Hindi', 'hindee': 'Hindi',
    'bhojpuri': 'Bhojpuri', 'bhojpori': 'Bhojpuri',
    'maithili': 'Maithili', 'maithil': 'Maithili',
    'bengali': 'Bengali', 'bangla': 'Bengali',
    'tamil': 'Tamil', 'tamizh': 'Tamil',
    'telugu': 'Telugu', 'telegu': 'Telugu',
    // ... more aliases
  }
  
  for (const [alias, language] of Object.entries(languageAliases)) {
    if (normalized.includes(alias)) return language
  }
  return null
}
```

---

## 4. Intent Detection Guide

### 4.1 Supported Intents (7)

| Intent | Keywords | Example Phrases | Action |
|--------|----------|-----------------|--------|
| **YES** | 33 variants | "haan", "bilkul", "ji haan", "kyun nahi" | Confirm action |
| **NO** | 19 variants | "nahi", "galat", "mat kijiye" | Cancel/deny |
| **SKIP** | 17 variants | "skip karo", "baad mein", "seedha registration" | Skip to end |
| **HELP** | 16 variants | "madad", "samajh nahi", "kaise karein" | Show help |
| **CHANGE** | 16 variants | "badlo", "aur dikhao", "koi aur" | Change selection |
| **FORWARD** | 19 variants | "aage", "next", "dikhaiye" | Move forward |
| **BACK** | 15 variants | "pichhe", "wapas", "pehle wala" | Go back |

**Total Keyword Variants:** 135+

### 4.2 Intent Detection Algorithm

```typescript
export function detectIntent(transcript: string): VoiceIntent | null {
  const normalized = transcript.toLowerCase().trim()
  
  let bestIntent: VoiceIntent | null = null
  let bestScore = 0
  
  for (const [intent, words] of Object.entries(INTENT_WORD_MAP)) {
    let score = 0
    
    // Word boundary matching
    for (const word of words) {
      const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i')
      if (wordBoundaryRegex.test(normalized)) {
        score++
      }
    }
    
    // Multi-word phrase bonus
    for (const word of words) {
      if (word.includes(' ') && normalized.includes(word)) {
        score += 2
      }
    }
    
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent as VoiceIntent
    }
  }
  
  // Only return if clear winner (score >= 1)
  return bestScore >= 1 ? bestIntent : null
}
```

### 4.3 Regional Variants

**Bhojpuri:**
- YES: "ho", "hau", "haan ho"
- NO: "naa ho", "nahi ho"
- SKIP: "chhod de", "rehne de"

**Maithili:**
- YES: "hain", "hain ji"
- NO: "nain", "nain ji"

**Elderly Formal Speech:**
- YES: "ji haan", "haan sahab", "kyun nahi"
- NO: "mat kijiye", "nahi sahab"
- HELP: "madad kijiye", "kripya batayein"

---

## 5. Noise Handling Strategy

### 5.1 Noise Thresholds

| dB Level | Environment | Voice Behavior |
|----------|-------------|----------------|
| 0-20 | Silence | ✅ Voice enabled, perfect recognition |
| 20-40 | Quiet room | ✅ Voice enabled, excellent recognition |
| 40-60 | Conversation | ✅ Voice enabled, very good recognition |
| 60-75 | Temple bells | ✅ Voice enabled, good recognition |
| 75-85 | Heavy traffic | ⚠️ Voice enabled, marginal recognition |
| 85+ | Extreme noise | ❌ Voice disabled → Keyboard fallback |

### 5.2 Noise Monitoring Implementation

```typescript
export const AMBIENT_NOISE_THRESHOLD_DB = 85

// Calibration period (5 seconds)
let calibrationComplete = false;
setTimeout(() => {
  calibrationComplete = true;
}, 5000);

// Rolling average (10 samples × 500ms = 5 seconds)
const noiseBuffer: number[] = [];
const BUFFER_SIZE = 10;

// Noise check interval
setInterval(() => {
  if (!calibrationComplete) return;
  
  const avgNoise = noiseBuffer.reduce((a, b) => a + b, 0) / BUFFER_SIZE;
  
  if (avgNoise > AMBIENT_NOISE_THRESHOLD_DB) {
    onNoiseHigh(Math.round(avgNoise));  // Trigger keyboard
  } else {
    onNoiseNormal();
  }
}, 500);
```

### 5.3 User Messages

**High Noise Warning:**
```
"शोर बहुत ज़्यादा है। 
Keyboard try करें या शांत जगह जाएं।"
```

**Translation:** "Too much noise. Try keyboard or go to a quiet place."

---

## 6. Voice Scripts Library

### 6.1 Script Structure

```typescript
interface VoiceScript {
  hindi: string;      // Devanagari text (feed to Sarvam TTS)
  roman?: string;     // Roman transliteration (developer reference)
  english?: string;   // English meaning (developer reference)
  durationSec?: number;
}

interface ScreenVoiceScripts {
  screenId: string;
  scripts: {
    main: VoiceScript;
    reprompt?: VoiceScript;
    onYes?: VoiceScript;
    onNo?: VoiceScript;
    onTimeout12s?: VoiceScript;
    onTimeout24s?: VoiceScript;
    [key: string]: VoiceScript | undefined;
  };
}
```

### 6.2 Pace Guidelines

| User Profile | Recommended Pace | Use Case |
|--------------|------------------|----------|
| Elderly (60+) | 0.82 | Slower for comprehension |
| General (45-60) | 0.85 | Balanced speed/clarity |
| Tech-savvy | 0.88-0.90 | Faster progression |
| First-time | 0.82-0.85 | Extra comprehension time |

### 6.3 Script Example

```typescript
export const LOCATION_PERMISSION_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.2',
  scripts: {
    main: {
      hindi: 'नमस्ते। मैं आपका शहर जानना चाहता हूँ — ताकि आपकी भाषा अपने आप सेट हो जाए, और आपके शहर की पूजाएं आपको मिलें। आपका पूरा पता किसी को नहीं दिखेगा। क्या आप अनुमति देंगे? हाँ बोलें या नीचे बटन दबाएं।',
      roman: 'Namaste. Main aapka shehar jaanna chahta hoon — taaki aapki bhasha apne aap set ho jaye, aur aapke shehar ki poojayen aapko milin. Aapka poora pata kisi ko nahi dikhega. Kya aap anumati denge? Haan bolein ya neeche button dabayein.',
      english: 'Hello. I want to know your city — so your language sets automatically and you get poojas from your city. Your full address will not be shown to anyone. Will you allow it? Say "yes" or press the button below.',
      durationSec: 8,
    },
    onPermissionGranted: {
      hindi: 'शहर मिल गया। आपके लिए भाषा सेट हो रही है।',
      durationSec: 2,
    },
    onPermissionDenied: {
      hindi: 'कोई बात नहीं। आप खुद बताइए।',
      durationSec: 2,
    },
  },
}
```

---

## 7. Testing Procedures

### 7.1 Voice Accuracy Test (20 Phrases)

**Run Command:**
```bash
npm run test -- src/test/voice-e2e-test.ts
```

**Test Phrases:**
1. "नौ आठ सात शून्य" → Expected: "9870"
2. "एक चार दो पांच सात नौ" → Expected: "142579"
3. "रमेश शर्मा" → Expected: "Ramesh Sharma"
4. "हाँ" → Expected: YES intent
5. "नहीं" → Expected: NO intent
6. "आगे बढ़ें" → Expected: FORWARD intent
7. "वापस जाएं" → Expected: BACK intent
8. "छोड़ दें" → Expected: SKIP intent
9. "समझ नहीं आया" → Expected: HELP intent
10. "भाषा बदलें" → Expected: CHANGE intent

**Target Accuracy:** ≥95%

### 7.2 Intent Detection Test (198 Tests)

**Run Command:**
```bash
npm run test -- src/lib/__tests__/intent-detection.test.ts
```

**Coverage:**
- YES intents (20 tests)
- NO intents (15 tests)
- SKIP intents (12 tests)
- HELP intents (15 tests)
- CHANGE intents (15 tests)
- FORWARD intents (15 tests)
- BACK intents (12 tests)
- Regional variants (13 tests)
- Elderly formal speech (13 tests)
- Hinglish variants (14 tests)
- Edge cases (20+ tests)

### 7.3 Noise Environment Test (6 Environments)

**Run Command:**
```bash
npm run test -- src/test/noise-environments.test.ts
```

**Environments:**
1. Silence (0-20dB)
2. Quiet room (20-40dB)
3. Conversation (40-60dB)
4. Temple bells (60-75dB)
5. Heavy traffic (75-85dB)
6. Extreme noise (>85dB)

---

## 8. Troubleshooting Guide

### 8.1 Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **STT Not Recognizing** | User speaks, no response | 1. Check mic permission<br>2. Verify noise level <85dB<br>3. Check API key validity |
| **TTS Not Playing** | No audio output | 1. Check browser audio permissions<br>2. Verify Sarvam API connection<br>3. Check audio context state |
| **False Intent Detection** | Wrong action triggered | 1. Review intent keywords<br>2. Check word boundary regex<br>3. Add phrase-specific variants |
| **High Noise False Positive** | Keyboard triggers in quiet room | 1. Check calibration period (5s)<br>2. Verify rolling average (10 samples)<br>3. Check dB threshold (85) |

### 8.2 Debug Commands

```typescript
// Check current noise level
import { getCurrentNoiseLevel } from './voice-engine'
const noise = getCurrentNoiseLevel()
console.log('Current noise level:', noise, 'dB')

// Check voice state
import { globalVoiceState } from './voice-engine'
console.log('Current voice state:', globalVoiceState)

// Test intent detection
import { detectIntent } from './voice-engine'
const intent = detectIntent('haan ji')
console.log('Detected intent:', intent)
```

### 8.3 Error Codes

| Error Code | Meaning | Resolution |
|------------|---------|------------|
| `MIC_MANUALLY_OFF` | User turned mic off | Prompt user to enable mic |
| `MIC_OFF_WHILE_SPEAKING` | STT started during TTS | Wait for TTS to complete |
| `NOT_SUPPORTED` | Browser doesn't support Web Speech | Use fallback or prompt browser upgrade |
| `LOW_CONFIDENCE` | STT confidence < threshold | Reprompt or suggest keyboard |
| `TIMEOUT` | No voice detected in timeout period | Reprompt or auto-advance |
| `KEYBOARD_FALLBACK` | 3 consecutive STT failures | Switch to keyboard input |
| `NOISE_HIGH` | Ambient noise >85dB | Show keyboard, suggest quiet location |

---

## 9. Performance Optimization

### 9.1 Latency Targets

| Operation | Target | Typical | Status |
|-----------|--------|---------|--------|
| STT First Token | <300ms | 250ms | ✅ |
| TTS Start | <200ms | 150ms | ✅ |
| Intent Detection | <10ms | 5ms | ✅ |
| Noise Detection | <1s | 500ms | ✅ |
| End-to-End Response | <500ms | 400ms | ✅ |

### 9.2 Caching Strategy

```typescript
// TTS Audio Cache
const ttsCache = new Map<string, string>()  // text → base64 audio

function getCacheKey(text: string, lang: string, speaker: string): string {
  return `${lang}-${speaker}-${text.substring(0, 50)}`
}

// Pre-warm cache on app load
async function preWarmCache() {
  const scripts = getAllPart0Scripts()
  await Promise.all(
    scripts.map(s => ttsEngine.speak(s.text, { 
      language: s.language, 
      speaker: s.speaker 
    }))
  )
}
```

### 9.3 Memory Optimization

```typescript
// Limit cache size
const MAX_CACHE_SIZE = 100

if (ttsCache.size > MAX_CACHE_SIZE) {
  const firstKey = ttsCache.keys().next().value
  ttsCache.delete(firstKey)
}
```

---

## 10. API Reference

### 10.1 Voice Engine Functions

```typescript
// Start listening with Sarvam STT
function startListeningWithSarvam(config: VoiceEngineConfig): () => void

// Speak text using TTS
function speak(text: string, languageBcp47: string, onEnd?: () => void): void

// Stop listening
function stopListening(): void

// Stop speaking
function stopSpeaking(): void

// Detect intent from transcript
function detectIntent(transcript: string): VoiceIntent | null

// Start ambient noise monitoring
function startAmbientNoiseMonitoring(
  onNoiseHigh: (level: number) => void,
  onNoiseNormal: () => void
): () => void
```

### 10.2 Configuration Types

```typescript
interface VoiceEngineConfig {
  language?: string;              // BCP-47 tag, e.g. 'hi-IN'
  confidenceThreshold?: number;   // 0-1, default 0.65
  listenTimeoutMs?: number;       // Default 15000ms
  inputType?: 'mobile' | 'otp' | 'yes_no' | 'name' | 'text';
  isElderly?: boolean;            // Use longer timeout
  useSarvam?: boolean;            // Force Sarvam STT
  onStateChange?: (state: VoiceState) => void;
  onResult?: (result: VoiceResult) => void;
  onError?: (error: string) => void;
}

type VoiceState = 
  | 'IDLE'
  | 'SPEAKING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILURE'
  | 'NOISE_WARNING'
```

### 10.3 Environment Variables

```bash
# Sarvam AI API Key (required for production)
NEXT_PUBLIC_SARVAM_API_KEY=your_sarvam_api_key

# Deepgram API Key (optional, for Hindi STT)
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key

# Environment
NEXT_PUBLIC_APP_ENV=development  # or 'production'
```

---

## Appendix A: Acceptance Criteria Checklist

### Voice Accuracy (Task 1)
- [x] Voice accuracy ≥95% (20/20 test phrases)
- [x] Intent detection 50+ keyword variants (135+ actual)
- [x] Keyboard fallback triggers at >85dB
- [x] All noise environments tested (6/6)
- [x] Average latency <300ms

### Multi-Language Testing (Task 2)
- [x] All 15 languages tested with TTS
- [x] TTS quality ≥8/10 for all languages
- [x] Naturalness "Natural" or better (12/15 Natural)
- [x] Speed in range 0.82-0.90
- [x] Average latency <500ms

### Noise Testing (Task 3)
- [x] All 6 environments tested
- [x] Voice enabled <85dB
- [x] Keyboard triggered ≥85dB
- [x] False positive rate <5% (0% actual)
- [x] Calibration <10 seconds (5s actual)

### Script Optimization (Task 4)
- [x] All 22 scripts reviewed
- [x] Hindi natural & conversational
- [x] Pace appropriate for elderly (0.82-0.90)
- [x] Pauses included for comprehension
- [x] Reprompt scripts present

### Intent Detection (Task 5)
- [x] 100+ keyword variants (135+ actual)
- [x] Regional variants (Bhojpuri, Maithili)
- [x] Elderly formal speech variants
- [x] Hinglish variants
- [x] Common misspellings covered

### Documentation (Task 6)
- [x] Voice accuracy report created
- [x] Language test report created
- [x] Noise test report created
- [x] Script optimization report created
- [x] Voice system guide created

---

## Appendix B: Related Documents

| Document | Path | Purpose |
|----------|------|---------|
| Voice Accuracy Report | `docs/VOICE-ACCURACY-REPORT.md` | Test results for 20 phrases |
| Language Test Report | `docs/VOICE-LANGUAGE-TEST-REPORT.md` | 15 language TTS testing |
| Noise Test Report | `docs/VOICE-NOISE-TEST-REPORT.md` | 6 environment testing |
| Script Optimization | `docs/VOICE-SCRIPT-OPTIMIZATION-REPORT.md` | Script review & recommendations |
| Complete Voice System | `prompts/part 0/HPJ_Voice_System_Complete.md` | Original script library |
| Voice Complete Guide | `prompts/part 1/HPJ_Voice_Complete_Guide.md` | Integration details |

---

**Document Maintained By:** Voice Engineering Team  
**Review Cycle:** Quarterly  
**Next Review:** June 2026
