# Voice/AI Engineer Test Suite Documentation

## Overview

This document describes the comprehensive voice testing strategy for the HmarePanditJi application, designed to ensure reliable voice recognition across diverse Indian languages, accents, and environmental conditions.

## Test Categories

### 1. Regional Number Recognition Tests

**Location:** `apps/pandit/src/lib/number-mapper.test.ts`

**Languages Covered:**
- Hindi (हिन्दी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Punjabi (ਪੰਜਾਬੀ)
- Odia (ଓଡ଼ିଆ)

**Test Cases:**

#### Hindi Tests
```typescript
// Mobile number recognition
extractMobileNumber('नौ आठ सात शून्य') // → '9870'
extractMobileNumber('एक दो तीन चार पांच छह सात आठ नौ शून्य') // → '1234567890'

// OTP recognition
extractOTP('एक चार दो पांच सात नौ') // → '142579'

// Code-mixed speech
extractMobileNumber('nine eight saat zero') // → '9870'
```

#### Tamil Tests
```typescript
// Mobile number in Tamil script
extractMobileNumber('ஒன்று இரண்டு மூன்று') // → '123'

// Transliterated Tamil
extractMobileNumber('onnu randu moonu naalu aindhu aaru yezhu ettu ombathu poojyam') // → '1234567890'

// Colloquial variants
extractMobileNumber('onnu rendu moonu naalu anju aaru elu ettu onbathu sujjiam') // → '1234567890'
```

#### Telugu Tests
```typescript
// Mobile number in Telugu script
extractMobileNumber('ఒకటి రెండు మూడు') // → '123'

// Transliterated Telugu
extractMobileNumber('okati rendu moodu naalugu aidu aaru eedu enimidi tommidi sunna') // → '1234567890'
```

#### Bengali Tests
```typescript
// Mobile number in Bengali script
extractMobileNumber('এক দুই তিন') // → '123'

// Transliterated Bengali
extractMobileNumber('ek dui tin char pach chho sat aath no shunno') // → '1234567890'
```

### 2. Intent Detection Tests

**Location:** `apps/pandit/src/lib/voice-engine.test.ts` (to be created)

**Test Categories:**

#### YES Intent
```typescript
// Hindi
detectIntent('haan') // → 'YES'
detectIntent('जी हाँ') // → 'YES'

// Tamil
detectIntent('aam') // → 'YES'
detectIntent('seri') // → 'YES'

// Telugu
detectIntent('avunu') // → 'YES'

// Bengali
detectIntent('haan') // → 'YES'

// Confidence scoring
detectIntentWithConfidence('haan bilkul') // → { intent: 'YES', confidence: 0.85, ... }
```

#### NO Intent
```typescript
// Hindi
detectIntent('nahi') // → 'NO'

// Tamil
detectIntent('illa') // → 'NO'
detectIntent('venam') // → 'NO'

// Telugu
detectIntent('ledu') // → 'NO'
```

### 3. Voice Recognition Accuracy Tests

**Test Scenarios:**

#### Accent Variations
- UP/Bihar accent (Hindi with Bhojpuri influence)
- Tamil accent (Hindi/Tamil code-mixing)
- Telugu accent (Hindi/Telugu code-mixing)
- Bengali accent (Hindi/Bengali code-mixing)
- South Indian accent (general)

#### Speech Speed
- Slow speech (elderly users): 2-3 words/second
- Normal speech: 4-5 words/second
- Fast speech: 6+ words/second

#### Volume Levels
- Quiet: 30-40 dB
- Normal: 50-60 dB
- Loud: 70-80 dB

#### Background Noise Conditions
- Silent room: 0-20 dB
- Normal room: 20-40 dB
- Moderate noise: 40-60 dB
- Temple environment: 60-85 dB
- Very loud (temple bells): 85+ dB

### 4. Code-Mixing Tests

**Hindi + English (Hinglish):**
```typescript
// Number recognition
extractMobileNumber('mera number hai 9870') // → '9870'
extractMobileNumber('nine eight saat zero') // → '9870'

// Intent detection
detectIntent('yes ji') // → 'YES'
detectIntent('correct hai') // → 'YES'
```

**Tamil + English:**
```typescript
extractMobileNumber('one two moonu naalu') // → '1234'
```

### 5. Edge Case Tests

```typescript
// Extra spaces
extractMobileNumber('ek    do    teen') // → '123'

// Commas
extractMobileNumber('ek, do, teen') // → '123'

// Mixed digits and words
extractMobileNumber('1 do 3 chaar') // → '1234'

// Country code stripping
extractMobileNumber('plus 91 nau ath saat') // → '987'
extractMobileNumber('91 nau ath saat shoonya') // → '9870'

// Preamble stripping
extractMobileNumber('mera number hai nau ath saat') // → '987'
extractOTP('otp hai ek do teen char paanch chhah') // → '123456'
```

## Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run number mapper tests
npm test -- number-mapper.test.ts

# Run voice engine tests
npm test -- voice-engine.test.ts

# Run with coverage
npm test -- --coverage
```

### Manual Voice Testing

#### Test Script for Each Language

**Hindi:**
1. Mobile: "मेरा नंबर है नौ आठ सात शून्य पांच तीन दो एक नौ शून्य"
2. OTP: "ओटीपी है एक चार दो पांच सात नौ"
3. Yes: "हाँ जी, बिल्कुल सही है"
4. No: "नहीं, यह गलत है"

**Tamil:**
1. Mobile: "என் நம்பர் ஒன்று இரண்டு மூன்று நான்கு ஐந்து ஆறு ஏழு எட்டு ஒன்பது பூஜ்யம்"
2. OTP: "ஒன்று நான்கு இரண்டு ஐந்து ஆறு ஒன்பது"
3. Yes: "ஆம், சரிதான்"
4. No: "இல்லை, தவறு"

**Telugu:**
1. Mobile: "నా నంబర్ ఒకటి రెండు మూడు నాలుగు ఐదు ఆరు ఏడు ఎనిమిది తొమ్మిది సున్నా"
2. OTP: "ఒకటి నాలుగు రెండు ఐదు ఆరు తొమ్మిది"
3. Yes: "అవును, సరైనది"
4. No: "కాదు, తప్పు"

**Bengali:**
1. Mobile: "আমার নম্বর এক দুই তিন চার পাঁচ ছয় সাত আট নয় শূন্য"
2. OTP: "এক চার দুই পাঁচ ছয় নয়"
3. Yes: "হ্যাঁ, ঠিক আছে"
4. No: "না, ভুল"

## Performance Benchmarks

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Voice Recognition Accuracy | ≥90% | Correct transcriptions / Total attempts |
| Intent Detection Accuracy | ≥95% | Correct intents / Total intents |
| Voice Latency | <500ms | Speech end → Transcription display |
| WebSocket Cleanup | 100% | No memory leaks on navigation |
| TTS Queue Management | 100% | No speech overlap on screen change |
| Language Support | 10+ | Number of languages with ≥80% accuracy |

### Latency Optimization Targets

```
┌─────────────────────────────────────────────────────────┐
│ Voice Latency Budget (<500ms total)                     │
├─────────────────────────────────────────────────────────┤
│ VAD Detection:        <100ms                            │
│ Audio Streaming:      <50ms                             │
│ STT Processing:       <200ms                            │
│ Response Rendering:   <100ms                            │
│ Haptic Feedback:      <50ms                             │
└─────────────────────────────────────────────────────────┘
```

## Test Reporting

### Weekly Voice Quality Report

Generate weekly reports with:
- Recognition accuracy by language
- Intent detection accuracy by intent type
- Average latency by language
- Error rate by error type
- User feedback summary

### A/B Testing

Test variations of:
- VAD threshold settings
- Confidence thresholds
- Timeout durations
- Prompt engineering for STT

## Accessibility Testing

### Screen Reader Compatibility
- Test with NVDA (Windows)
- Test with JAWS (Windows)
- Test with VoiceOver (macOS/iOS)
- Test with TalkBack (Android)

### Keyboard Navigation
- All voice controls accessible via keyboard
- Tab order logical
- Focus indicators visible
- Escape key dismisses overlays

## Device Testing Matrix

| Device Type | OS | Browser | Status |
|-------------|----|---------|--------|
| Desktop | Windows 10/11 | Chrome | ✅ Tested |
| Desktop | Windows 10/11 | Edge | ✅ Tested |
| Desktop | macOS | Safari | ✅ Tested |
| Desktop | Ubuntu | Chrome | ✅ Tested |
| Mobile | Android 10+ | Chrome | ✅ Tested |
| Mobile | Android 10+ | Firefox | ⚠️ Limited |
| Mobile | iOS 14+ | Safari | ✅ Tested |
| Tablet | Android | Chrome | ✅ Tested |
| Tablet | iPadOS | Safari | ✅ Tested |

## Continuous Integration

### Automated Tests in CI

```yaml
# .github/workflows/voice-tests.yml
name: Voice Tests

on: [push, pull_request]

jobs:
  voice-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run voice unit tests
        run: npm test -- --testPathPattern=voice
      
      - name: Run number mapper tests
        run: npm test -- --testPathPattern=number-mapper
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Issue Tracking

### Known Voice Recognition Issues

| Issue ID | Description | Severity | Status |
|----------|-------------|----------|--------|
| V-001 | Tamil consonant gemination not recognized | Medium | Open |
| V-002 | Telugu retroflex consonants confused | Low | Open |
| V-003 | Bengali nasal consonants misrecognized | Low | Open |

### Voice Bug Report Template

```markdown
**Voice Issue Report**

**Language:** [Hindi/Tamil/Telugu/etc.]
**Accent:** [Regional accent if applicable]
**Environment:** [Quiet/Noisy/Temple]

**Expected:**
[What should have been recognized]

**Actual:**
[What was actually recognized]

**Audio Sample:**
[Link to recording if available]

**Reproduction Steps:**
1. [Step 1]
2. [Step 2]
```

## Contact

For voice-related issues, contact:
- Voice/AI Engineer Lead
- Email: voice@hmarepanditji.org
- Slack: #voice-ai-channel
