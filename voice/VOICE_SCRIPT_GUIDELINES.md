# Voice Script Guidelines

**Author:** Dr. Priya Sharma, Voice Script Specialist  
**Version:** 1.0  
**Last Updated:** March 26, 2026  
**Project:** Hmare Pandit Ji - Part 0.0 Voice Scripts

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [TTS Settings Per Screen Type](#tts-settings-per-screen-type)
3. [Script Template](#script-template)
4. [Language Priority & Fallback](#language-priority--fallback)
5. [Writing Best Practices](#writing-best-practices)
6. [Emotional Tone Guidelines](#emotional-tone-guidelines)
7. [Dynamic Variables](#dynamic-variables)
8. [Quality Assurance Checklist](#quality-assurance-checklist)

---

## 🎯 Overview

This document provides comprehensive guidelines for writing voice scripts for the Hmare Pandit Ji application. All scripts must follow these standards to ensure consistency, clarity, and cultural appropriateness across 15 Indian languages.

### Key Principles

- **Respectful & Warm:** All scripts should convey respect for the user
- **Clear & Concise:** Maximum 8 seconds per script
- **Culturally Appropriate:** Use proper greetings and honorifics per language
- **Consistent Pacing:** Slower pace for elderly users (0.85-0.90)
- **Proper Pauses:** Allow time for user processing (800-1200ms)

---

## 🔊 TTS Settings Per Screen Type

### Screen Type Matrix

| Screen ID | Screen Name | Pace Range | Pause (ms) | Speaker | Max Duration |
|-----------|-------------|------------|------------|---------|--------------|
| S-0.0.2 | Location Permission | 0.85-0.90 | 1000 | priya | 8s |
| S-0.0.2B | Manual City Entry | 0.88-0.92 | 900 | priya | 7s |
| S-0.0.3 | City Selection | 0.88-0.92 | 1000 | priya | 8s |
| S-0.0.4 | Language Selection | 0.85-0.90 | 1100 | priya | 8s |
| S-0.0.5 | Permission Explanation | 0.82-0.88 | 1200 | priya | 8s |
| S-0.0.6 | Celebration/Success | 0.90-0.95 | 800 | priya | 6s |
| S-0.0.7 | Loading/Processing | 0.88-0.92 | 1000 | priya | 5s |
| S-0.0.8 | Error/Retry | 0.85-0.90 | 1100 | priya | 7s |

### TTS Engine Configuration (Sarvam TTS)

```yaml
engine: sarvam-v1
sample_rate: 22050
bit_rate: 128kbps
format: mp3
normalize_audio: true
remove_silence: false
```

### Speaker Profiles

| Speaker | Gender | Voice Quality | Best For |
|---------|--------|---------------|----------|
| priya | Female | Warm, Clear | Primary narrator, all screens |
| arjun | Male | Friendly, Energetic | Celebration screens (optional) |
| gayatri | Female | Traditional, Respectful | Religious/cultural content |

---

## 📝 Script Template

### TypeScript Interface

```typescript
interface VoiceScript {
  screenId: string;           // e.g., "S-0.0.2"
  variant?: number;           // 1-5, for A/B testing
  trigger: string;            // e.g., "on_screen_load", "on_button_click"
  text: string;               // Native language script
  romanTransliteration: string; // Romanized pronunciation
  englishMeaning: string;     // English translation
  language: string;           // IETF language tag (e.g., "hi-IN")
  speaker: string;            // Voice profile name
  pace: number;               // 0.80-1.0 (1.0 = normal speed)
  pauseAfterMs: number;       // Pause after script (800-1200ms)
  maxDurationS: number;       // Maximum duration in seconds
  emotionalTone: string;      // e.g., "warm_respectful"
  dynamicVariables?: {        // Optional dynamic values
    [key: string]: string;
  };
}
```

### Example Script

```typescript
{
  screenId: "S-0.0.2",
  variant: 1,
  trigger: "on_screen_load",
  text: "नमस्ते। मैं आपका शहर जानना चाहता हूँ।",
  romanTransliteration: "Namaste. Main aapka shehar jaanna chahta hoon.",
  englishMeaning: "Hello. I want to know your city.",
  language: "hi-IN",
  speaker: "priya",
  pace: 0.88,
  pauseAfterMs: 1000,
  maxDurationS: 8,
  emotionalTone: "warm_respectful",
}
```

---

## 🌍 Language Priority & Fallback

### Priority Order

| Priority | Language | Code | Variants | Status |
|----------|----------|------|----------|--------|
| 1 | Hindi | hi-IN | 3 | Base (do first) |
| 2 | Tamil | ta-IN | 3 | High |
| 3 | Telugu | te-IN | 3 | High |
| 4 | Bengali | bn-IN | 3 | High |
| 5 | Marathi | mr-IN | 3 | Medium |
| 6 | Gujarati | gu-IN | 2 | Medium |
| 7 | Kannada | kn-IN | 2 | Medium |
| 8 | Malayalam | ml-IN | 2 | Medium |
| 9 | Punjabi | pa-IN | 2 | Low |
| 10 | Odia | or-IN | 2 | Low |
| 11 | English | en-IN | 2 | Low |
| 12 | Bhojpuri | hi-IN | 1 | Fallback to Hindi |
| 13 | Maithili | hi-IN | 1 | Fallback to Hindi |
| 14 | Sanskrit | hi-IN | 1 | Fallback to Hindi |
| 15 | Assamese | hi-IN | 1 | Fallback to Hindi |

### Fallback Strategy

For languages 12-15 (Bhojpuri, Maithili, Sanskrit, Assamese):
- Use Hindi TTS with dialect-specific text where possible
- Mark scripts with `fallback: true` flag
- Provide native script text for future custom TTS integration

---

## ✍️ Writing Best Practices

### DO ✅

- Use formal "you" (आप/நீங்கள்/మీరు) for respect
- Start with appropriate greeting (नमस्ते/வணக்கம்/నమస్కారం)
- Keep sentences short (max 15-20 words)
- Use active voice
- Include pause markers for complex sentences
- Test with native speakers before finalizing

### DON'T ❌

- Use informal "you" (तू/நீ/నువ్వు)
- Write long, complex sentences
- Use technical jargon
- Include English words unless necessary
- Rush the pacing (elderly users need slower speech)
- Use region-specific slang

### Script Length Guidelines

| Screen Type | Ideal Words | Max Words | Reason |
|-------------|-------------|-----------|--------|
| Permission Request | 10-15 | 20 | User needs to understand quickly |
| Instructions | 15-20 | 25 | Clear guidance required |
| Celebration | 5-10 | 15 | Keep it brief and joyful |
| Error Messages | 10-15 | 20 | Reassuring, not alarming |

---

## 😊 Emotional Tone Guidelines

### Tone Categories

| Tone | Description | When to Use | Pace Modifier |
|------|-------------|-------------|---------------|
| `warm_respectful` | Friendly yet formal | Permission requests, greetings | -0.05 |
| `helpful_guide` | Supportive, instructional | Instructions, tutorials | 0.00 |
| `celebratory` | Joyful, energetic | Success screens | +0.05 |
| `reassuring` | Calm, comforting | Error messages, loading | -0.08 |
| `neutral_informative` | Clear, factual | Information screens | 0.00 |

### Tone Implementation

```typescript
// Example: Warm & Respectful
{
  emotionalTone: "warm_respectful",
  pace: 0.88,  // Slightly slower
  pauseAfterMs: 1000,  // Standard pause
}

// Example: Celebratory
{
  emotionalTone: "celebratory",
  pace: 0.93,  // Slightly faster
  pauseAfterMs: 800,  // Shorter pause
}
```

---

## 🔧 Dynamic Variables

### Supported Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `[CITY_NAME]` | User's city name | "Varanasi", "Chennai" |
| `[LANGUAGE_NAME]` | Selected language | "Hindi", "Tamil" |
| `[USER_NAME]` | User's name (if available) | "Ramesh ji" |
| `[DATE]` | Current date | "26 March" |
| `[TIME_OF_DAY]` | Greeting based on time | "Good morning", "शुभ सकाळ" |

### Variable Usage Example

```typescript
{
  screenId: "S-0.0.2B",
  text: "कृपया अपना शहर टाइप करें।",
  // For dynamic injection:
  dynamicVariables: {
    placeholder: "[CITY_NAME] टाइप करें",
  },
}
```

### Variable Localization

Ensure variables are properly localized:

| Language | [CITY_NAME] Format | [USER_NAME] Format |
|----------|-------------------|-------------------|
| Hindi | [शहर का नाम] | [उपयोगकर्ता नाम] |
| Tamil | [நகரம் பெயர்] | [பயனர் பெயர்] |
| Telugu | [నగరం పేరు] | [వినియోగదారు పేరు] |

---

## ✅ Quality Assurance Checklist

### Pre-Submission Checklist

- [ ] Script follows template format exactly
- [ ] Roman transliteration is accurate (IPA standard)
- [ ] English meaning is clear and accurate
- [ ] Language code is correct (IETF format)
- [ ] Pace is within acceptable range (0.80-1.0)
- [ ] Pause duration is appropriate (800-1200ms)
- [ ] Max duration is under 8 seconds
- [ ] Emotional tone matches screen purpose
- [ ] No spelling errors in native script
- [ ] Cultural appropriateness verified

### Testing Protocol

1. **TTS Audio Generation**
   - Generate audio via Sarvam TTS
   - Listen at 1.0x and 0.75x speed
   - Check for pronunciation errors

2. **Native Speaker Review**
   - Have native speaker listen to audio
   - Verify natural flow and intonation
   - Check for regional dialect issues

3. **Timing Verification**
   - Measure actual audio duration
   - Ensure under maxDurationS limit
   - Verify pause durations feel natural

4. **Accessibility Check**
   - Test with screen readers
   - Verify volume consistency
   - Check for audio clipping

### QA Report Template

See `VOICE_SCRIPT_QA_REPORT.md` for the complete QA report format.

---

## 📞 Contact & Support

- **Voice Script Lead:** Dr. Priya Sharma
- **Slack:** `@priya.voice`
- **GitHub:** `@dr-priya-sharma`
- **Email:** priya.sharma@hmarepanditji.org

### Review Process

1. Submit scripts via PR to `main` branch
2. Tag `@dr-priya-sharma` for review
3. Include QA checklist in PR description
4. Wait for approval before merging

---

## 📚 Appendix: Language Reference

### Greeting Examples by Language

| Language | Formal Greeting | Informal Greeting |
|----------|----------------|-------------------|
| Hindi | नमस्ते | हाय |
| Tamil | வணக்கம் (Vanakkam) | ஹாய் (Hi) |
| Telugu | నమస్కారం (Namaskaram) | హలో (Hello) |
| Bengali | নমস্কার (Nomoshkar) | হ্যালো (Hello) |
| Marathi | नमस्कार (Namaskar) | हाय (Hi) |
| Gujarati | નમસ્તે (Namaste) | હાય (Hi) |
| Kannada | ನಮಸ್ಕಾರ (Namaskara) | ಹಲೋ (Hello) |
| Malayalam | നമസ്കാരം (Namaskaram) | ഹലോ (Hello) |
| Punjabi | ਸਤ ਸ੍ਰੀ ਅਕਾਲ (Sat Sri Akal) | ਹਲੋ (Hello) |
| Odia | ନମସ୍କାର (Namaskara) | ହେଲୋ (Hello) |
| English | Hello/Good morning | Hi/Hey |

### Number Pronunciation Guide

For scripts involving numbers (dates, times, counts):

| Number | Hindi | Tamil | Telugu |
|--------|-------|-------|--------|
| 1 | एक (ek) | ஒன்று (ondru) | ఒకటి (okati) |
| 2 | दो (do) | இரண்டு (iraṇḍu) | రెండు (reṇḍu) |
| 3 | तीन (teen) | மூன்று (mūṇḍru) | మూడు (mūḍu) |

---

**End of Guidelines**

*For questions or clarifications, please reach out via Slack or create a GitHub issue.*
