# Voice Scripts Quick Reference - Language Screens

## 🎯 Screen S-0.0.4: Language List

```typescript
import { LANGUAGE_LIST_SCREEN, replaceScriptPlaceholders } from '@/lib/voice-scripts'

// Main prompt
const script = LANGUAGE_LIST_SCREEN.scripts.main
// "कृपया अपनी भाषा का नाम बोलिए। जैसे — भोजपुरी, Tamil, Telugu, Bengali — या नीचे से चुनें।"

// On language detected
const detectedScript = LANGUAGE_LIST_SCREEN.scripts.onLanguageDetected
const withLanguage = replaceScriptPlaceholders(detectedScript, { LANGUAGE: 'Tamil' })
// "Tamil? सही है?"

// Timeout reprompt
const reprompt = LANGUAGE_LIST_SCREEN.scripts.reprompt
// "आवाज़ नहीं पहचान पाया। नीचे से भाषा छूकर चुनें।"
```

**Timing:**
- `initialDelayMs: 400`
- `pauseAfterMs: 300` (quick listen)
- `durationSec: 5` (main prompt)

---

## 🎯 Screen S-0.0.5: Language Confirmation

```typescript
import { LANGUAGE_CHOICE_CONFIRM_SCREEN } from '@/lib/voice-scripts'

// Main confirmation
const confirmScript = LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.main
const withLanguage = replaceScriptPlaceholders(confirmScript, { LANGUAGE: 'Tamil' })
// "आपने Tamil कही। सही है? हाँ बोलें या नहीं बोलें।"

// On yes
const yesScript = LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.onYesConfirmed
// "बहुत अच्छा।"

// On no
const noScript = LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.onNoSaid
// "ठीक है, फिर से चुनते हैं।"
```

**Timing:**
- `initialDelayMs: 300`
- `pauseAfterMs: 600`
- `durationSec: 3` (main prompt)

---

## 🎯 Screen S-0.0.6: Language Set Celebration

```typescript
import { LANGUAGE_SET_SCREEN, getCelebrationScript } from '@/lib/voice-scripts'

// Get celebration for confirmed language
const celebration = getCelebrationScript('Tamil')
// "Romba nalla! Tamil set aachu. Ab hum aapse Tamil mein baat karenge."

// All 15 languages supported:
// Hindi, Bhojpuri, Tamil, Telugu, Bengali, Kannada, Malayalam,
// Marathi, Gujarati, Punjabi, English, Maithili, Sanskrit, Odia, Assamese
```

**Timing:**
- `initialDelayMs: 200` (fast, rides animation)
- `durationSec: 3`
- **NO STT** (celebration only, auto-advance after 1.8s)

---

## 🎤 Complete Voice Flow Example

```typescript
async function handleLanguageSelection() {
  // S-0.0.4: Language List
  await speakWithSarvam({
    text: LANGUAGE_LIST_SCREEN.scripts.main.hindi,
    languageCode: 'hi-IN',
    pace: 0.88,
    onEnd: () => startListening(),
  })
  
  // User says "Tamil"
  const detectedLanguage = 'Tamil'
  
  // Navigate to S-0.0.5
  navigateTo('S-0.0.5')
  
  // S-0.0.5: Confirmation
  const confirmScript = replaceScriptPlaceholders(
    LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.main,
    { LANGUAGE: detectedLanguage }
  )
  
  await speakWithSarvam({
    text: confirmScript.hindi,
    languageCode: 'hi-IN',
    pace: 0.90,
    onEnd: () => startListening(),
  })
  
  // User says "Yes"
  navigateTo('S-0.0.6')
  
  // S-0.0.6: Celebration
  const celebration = getCelebrationScript(detectedLanguage)
  
  await speakWithSarvam({
    text: celebration.hindi,
    languageCode: LANGUAGE_TO_SARVAM_CODE[detectedLanguage], // 'ta-IN'
    pace: 0.92,
    onEnd: () => {
      // Auto-advance after celebration
      setTimeout(() => navigateTo('S-0.0.8'), 1800)
    },
  })
}
```

---

## 📊 Language Code Mapping

```typescript
import { LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts'

// Use this for TTS language code
LANGUAGE_TO_SARVAM_CODE['Tamil']    // 'ta-IN'
LANGUAGE_TO_SARVAM_CODE['Telugu']   // 'te-IN'
LANGUAGE_TO_SARVAM_CODE['Bengali']  // 'bn-IN'
LANGUAGE_TO_SARVAM_CODE['Hindi']    // 'hi-IN'
LANGUAGE_TO_SARVAM_CODE['English']  // 'en-IN'
// ... etc
```

---

## 🔧 Helper Functions

### `replaceScriptPlaceholders(script, replacements)`
```typescript
const script = replaceScriptPlaceholders(
  LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.main,
  { LANGUAGE: 'Tamil' }
)
// Returns: { hindi: "आपने Tamil कही। सही है?...", ... }
```

### `getCelebrationScript(language)`
```typescript
const celebration = getCelebrationScript('Tamil')
// Returns celebration script for Tamil
```

### `detectLanguageName(transcript)`
```typescript
const language = detectLanguageName('I want Tamil')
// Returns: 'Tamil'

const language = detectLanguageName('भोजपुरी')
// Returns: 'Bhojpuri'
```

### `detectTutorialIntent(transcript)`
```typescript
const intent = detectTutorialIntent('Skip')
// Returns: 'SKIP'

const intent = detectTutorialIntent('आगे')
// Returns: 'FORWARD'
```

---

## ⚠️ Important Notes

1. **Always use Devanagari `hindi` field for TTS** - Pass the `hindi` text to Sarvam TTS API, not `roman` or `english`

2. **Respect timing for elderly users** - Don't skip `initialDelayMs` or `pauseAfterMs` - these are critical for Pandit comprehension

3. **No STT on S-0.0.6** - Celebration screen is voice-only, no listening

4. **Fallback to Hindi** - For Maithili, Sanskrit, Odia, Assamese, the celebration uses Hindi script (limited TTS quality)

5. **Cache celebration scripts** - Pre-warm audio for all 15 languages on app load for instant playback

---

## 🧪 Test Commands

```bash
# Test language detection
node -e "const {detectLanguageName} = require('./voice-scripts'); console.log(detectLanguageName('Tamil'))"

# Test placeholder replacement
node -e "const {replaceScriptPlaceholders, LANGUAGE_CHOICE_CONFIRM_SCREEN} = require('./voice-scripts'); console.log(replaceScriptPlaceholders(LANGUAGE_CHOICE_CONFIRM_SCREEN.scripts.main, {LANGUAGE: 'Tamil'}))"

# Test celebration script
node -e "const {getCelebrationScript} = require('./voice-scripts'); console.log(getCelebrationScript('Tamil'))"
```

---

**Reference:** `VOICE_SCRIPT_INTEGRATION_COMPLETE.md` for full documentation
