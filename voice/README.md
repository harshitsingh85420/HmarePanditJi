# Voice Scripts

**Project:** Hmare Pandit Ji - Part 0.0  
**Author:** Dr. Priya Sharma, Voice Script Specialist  
**Total Scripts:** 405  
**Languages:** 15 Indian Languages  
**Status:** ✅ Complete

---

## 📂 Directory Structure

```
voice/
├── scripts/
│   ├── 01_S-0.0.2_Location_Permission.ts    (75 scripts)
│   ├── 02_S-0.0.2B_Manual_City.ts           (30 scripts)
│   ├── 03_S-0.0.3_City_Selection.ts         (60 scripts)
│   ├── 04_S-0.0.4_Language_Selection.ts     (60 scripts)
│   ├── 05_S-0.0.5_Permission_Explanation.ts (60 scripts)
│   ├── 06_S-0.0.6_Celebration.ts            (75 scripts)
│   ├── 07_S-0.0.7_Loading.ts                (15 scripts)
│   ├── 08_S-0.0.8_Error_Retry.ts            (45 scripts)
│   └── index.ts                              (Exports all scripts)
├── VOICE_SCRIPT_GUIDELINES.md
└── VOICE_SCRIPT_QA_REPORT.md
```

---

## 📊 Script Summary

| Screen | Name | Scripts | Languages | Variants |
|--------|------|---------|-----------|----------|
| S-0.0.2 | Location Permission | 75 | 5 | 3 |
| S-0.0.2B | Manual City Entry | 30 | 15 | 2 |
| S-0.0.3 | City Selection | 60 | 15 | 4 |
| S-0.0.4 | Language Selection | 60 | 15 | 4 |
| S-0.0.5 | Permission Explanation | 60 | 15 | 4 |
| S-0.0.6 | Celebration | 75 | 15 | 5 |
| S-0.0.7 | Loading | 15 | 15 | 1 |
| S-0.0.8 | Error/Retry | 45 | 15 | 3 |
| **TOTAL** | **9 screens** | **405** | **15** | **1-5** |

---

## 🌍 Languages Covered

### Priority 1-5 (Full Coverage - All Screens)
1. **Hindi** (hi-IN) - Base language
2. **Tamil** (ta-IN)
3. **Telugu** (te-IN)
4. **Bengali** (bn-IN)
5. **Marathi** (mr-IN)

### Priority 6-8 (Medium Priority)
6. **Gujarati** (gu-IN)
7. **Kannada** (kn-IN)
8. **Malayalam** (ml-IN)

### Priority 9-11 (Low Priority)
9. **Punjabi** (pa-IN)
10. **Odia** (or-IN)
11. **English** (en-IN)

### Priority 12-15 (Fallback to Hindi TTS)
12. **Bhojpuri** (hi-IN fallback)
13. **Maithili** (hi-IN fallback)
14. **Sanskrit** (hi-IN fallback)
15. **Assamese** (hi-IN fallback)

---

## 🚀 Usage

### Import All Scripts
```typescript
import { ALL_VOICE_SCRIPTS } from './voice/scripts';

// Access all 405 scripts
console.log(ALL_VOICE_SCRIPTS.length); // 405
```

### Import Specific Screen
```typescript
import { S0_0_2_LOCATION_PERMISSION } from './voice/scripts/01_S-0.0.2_Location_Permission';
import { S0_0_6_CELEBRATION } from './voice/scripts/06_S-0.0.6_Celebration';
```

### Import with Metadata
```typescript
import { 
  ALL_VOICE_SCRIPTS, 
  SCRIPT_COUNTS, 
  SUPPORTED_LANGUAGES,
  SCREEN_METADATA 
} from './voice/scripts';

// Get script count by screen
console.log(SCRIPT_COUNTS.S_0_0_2); // 75
console.log(SCRIPT_COUNTS.TOTAL);   // 405

// Get supported languages
console.log(SUPPORTED_LANGUAGES); // Array of 15 languages

// Get screen metadata
console.log(SCREEN_METADATA['S-0.0.6']); // Celebration screen info
```

### Filter by Language
```typescript
import { ALL_VOICE_SCRIPTS } from './voice/scripts';

// Get all Hindi scripts
const hindiScripts = ALL_VOICE_SCRIPTS.filter(
  script => script.language === 'hi-IN'
);

// Get all Tamil scripts
const tamilScripts = ALL_VOICE_SCRIPTS.filter(
  script => script.language === 'ta-IN'
);
```

### Filter by Screen
```typescript
import { ALL_VOICE_SCRIPTS } from './voice/scripts';

// Get all celebration scripts
const celebrationScripts = ALL_VOICE_SCRIPTS.filter(
  script => script.screenId === 'S-0.0.6'
);
```

---

## 📝 Script Format

Each script follows this TypeScript interface:

```typescript
interface VoiceScript {
  screenId: string;           // e.g., "S-0.0.2"
  variant?: number;           // 1-5, for A/B testing
  trigger: string;            // e.g., "on_screen_load"
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
  fallback?: boolean;         // true for fallback languages
}
```

---

## 🔊 TTS Settings

### Sarvam TTS Configuration
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
| priya | Female | Warm, Clear | Primary narrator |
| arjun | Male | Friendly, Energetic | Celebration (optional) |
| gayatri | Female | Traditional, Respectful | Religious content |

### Pace Guidelines
| Screen Type | Pace Range | Reason |
|-------------|------------|--------|
| Permission Request | 0.85-0.90 | Clear, respectful |
| Instructions | 0.88-0.92 | Standard pace |
| Celebration | 0.90-0.95 | Energetic, joyful |
| Error Messages | 0.85-0.90 | Reassuring, calm |
| Loading | 0.88-0.92 | Neutral, patient |

---

## ✅ Quality Assurance

All 405 scripts have been:
- [x] Generated via Sarvam TTS
- [x] Verified for pronunciation (5 major languages)
- [x] Checked for pause durations
- [x] Reviewed by native speakers (5 languages)
- [x] Tested for max duration limits
- [x] Validated for cultural appropriateness

See [`VOICE_SCRIPT_QA_REPORT.md`](./VOICE_SCRIPT_QA_REPORT.md) for complete QA details.

---

## 📚 Documentation

- **[VOICE_SCRIPT_GUIDELINES.md](./VOICE_SCRIPT_GUIDELINES.md)** - Complete guidelines for writing voice scripts
- **[VOICE_SCRIPT_QA_REPORT.md](./VOICE_SCRIPT_QA_REPORT.md)** - QA testing results and verification

---

## 📞 Contact

- **Voice Script Lead:** Dr. Priya Sharma
- **Slack:** `@priya.voice`
- **GitHub:** `@dr-priya-sharma`
- **Email:** priya.sharma@hmarepanditji.org

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 26, 2026 | Initial release - 405 scripts complete |

---

**Status:** ✅ READY FOR DEPLOYMENT
