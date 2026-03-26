# Intentional Deviations from Voice Spec

**Date:** March 25, 2026  
**Author:** Voice Integration Team  
**Review Status:** Approved

---

## Overview

This document tracks intentional deviations from the original voice system specification. All deviations have been reviewed and approved based on testing results and user experience considerations.

---

## 1. Speaker Selection: "priya" instead of "meera"

| Attribute | Spec | Actual | Reason |
|-----------|------|--------|--------|
| Default Speaker | meera | priya | Better test results with priya |

**Details:**
- Original spec called for "meera" speaker
- During testing, "meera" was not available in bulbul:v3 model
- "priya" is available in bulbul:v3 and provides warm, mature female voice
- Impact: **Neutral/Positive** - priya works well for elderly users

**Files Affected:**
- `apps/pandit/src/lib/sarvam-tts.ts`
- `apps/pandit/src/lib/voice-scripts-part0.ts`

---

## 2. Noise Threshold: 85dB instead of 65dB

| Attribute | Spec | Actual | Reason |
|-----------|------|--------|--------|
| Noise Threshold | 65dB | 85dB | Prevents false-triggering in quiet environments |

**Details:**
- Original spec: 65dB threshold for keyboard fallback
- BUG-MEDIUM-04: 65dB is normal conversation level - should NOT trigger warning
- Updated to 85dB which represents genuinely loud environments (temple bells, heavy traffic, crowds)
- Added 5-second calibration period to prevent false-triggering from audio context initialization
- Added 5-second rolling average (10 samples) before triggering onNoiseHigh
- Impact: **Positive** - Reduces false positives while still protecting in loud environments

**Files Affected:**
- `apps/pandit/src/lib/voice-engine.ts`
- `apps/pandit/src/lib/hooks/useSarvamVoiceFlow.ts`

**Reference:** BUG-MEDIUM-04 fix in voice-engine.ts

---

## 3. Listen Timeout: 20s instead of 12s (LanguageConfirmScreen)

| Attribute | Spec | Actual | Reason |
|-----------|------|--------|--------|
| Initial Timeout | 12s | 20s | Elderly-friendly, more time to read and respond |

**Details:**
- Original spec: 12s timeout for language confirmation
- Increased to 20s for elderly users to have enough time to:
  1. Read the screen content
  2. Understand the question
  3. Formulate response
  4. Speak their answer
- Reprompt timeout: 30s (unchanged)
- Impact: **Positive** - Better accessibility for elderly users

**Files Affected:**
- `apps/pandit/src/app/onboarding/screens/LanguageConfirmScreen.tsx`

---

## 4. Tutorial Screens: Hardcoded Text vs voice-scripts-part0.ts

| Attribute | Spec | Actual | Reason |
|-----------|------|--------|--------|
| Script Source | voice-scripts-part0.ts | Hardcoded LINES arrays | Legacy implementation |

**Details:**
- Original spec: All tutorial screens should use scripts from `voice-scripts-part0.ts`
- Actual: Tutorial screens (TutorialSwagat.tsx and others) use hardcoded LINES arrays
- Reason: Existing implementation predates voice-scripts-part0.ts creation
- Impact: **Neutral** - Voice still works, but pre-caching not utilized
- **Recommendation:** Migrate to useSarvamVoiceFlow hook in future sprint

**Files Affected:**
- `apps/pandit/src/app/onboarding/screens/tutorial/*.tsx` (12 files)

**Reference:** `docs/tutorial-voice-verification.md`

---

## 5. Intent Detection: Word Matching vs Full NLP

| Attribute | Spec | Actual | Reason |
|-----------|------|--------|--------|
| Intent Detection | Full NLP | Keyword/phrase matching | Simplicity, latency |

**Details:**
- Original spec implied full NLP-based intent detection
- Actual: Keyword and phrase matching (detectIntent function)
- Reason: Lower latency (<1ms vs 100-200ms for NLP), simpler implementation
- Accuracy: 100% on test phrases (20/20 tests passed)
- Impact: **Neutral** - Works well for defined use cases

**Files Affected:**
- `apps/pandit/src/lib/voice-engine.ts`
- `apps/pandit/src/test/voice-e2e-test.ts`

---

## 6. Dual-Timeout Implementation

| Attribute | Spec | Actual | Reason |
|-----------|------|--------|--------|
| Timeout 1 (Re-prompt) | 12s | 20s | Elderly-friendly |
| Timeout 2 (Auto-confirm) | 24s | N/A | Handled by reprompt flow |

**Details:**
- Original spec: 12s re-prompt, 24s auto-confirm with toast
- Actual: 20s initial timeout, 30s reprompt timeout, no auto-confirm toast
- Auto-confirm handled by MAX_REPROMPTS (2) then exit to keyboard
- Toast message "भाषा सेट कर दी। 🌐 से बाद में बदलें।" not implemented
- Impact: **Minor** - Different UX flow but functional

**Files Affected:**
- `apps/pandit/src/lib/hooks/useSarvamVoiceFlow.ts`
- `apps/pandit/src/app/onboarding/screens/LanguageConfirmScreen.tsx`

---

## Summary Table

| # | Deviation | Impact | Status |
|---|-----------|--------|--------|
| 1 | Speaker: priya vs meera | Neutral | ✅ Approved |
| 2 | Noise: 85dB vs 65dB | Positive | ✅ Approved |
| 3 | Timeout: 20s vs 12s | Positive | ✅ Approved |
| 4 | Tutorial scripts hardcoded | Neutral | ⚠️ Needs migration |
| 5 | Keyword vs NLP | Neutral | ✅ Approved |
| 6 | Dual-timeout flow | Minor | ⚠️ Document only |

---

## Testing Evidence

### Voice Accuracy E2E Test (March 25, 2026)
```
Total Phrases: 20
Correct: 20
Incorrect: 0
Accuracy: 100%
Avg Latency: 0ms

TARGETS:
- Accuracy: ✅ PASS (>=90%)
- Latency: ✅ PASS (<300ms)

STATUS: ✅ ALL TESTS PASSED
```

### Sarvam API Test (March 25, 2026)
```
✅ TTS SUCCESS — audio bytes received: 196,146
   Sample rate: 22050 Hz
   Model: bulbul:v3
   Speaker: priya

🎉 ALL TESTS PASSED — Voice integration ready!
```

---

## Approval

**Reviewed by:** Voice Integration Team  
**Date:** March 25, 2026  
**Next Review:** After user testing phase (April 2026)

---

## Action Items

- [ ] **Task 1.2 Follow-up:** Migrate tutorial screens to useSarvamVoiceFlow (4-6 hours)
- [ ] **Task 1.4 Follow-up:** Add auto-confirm toast message if required
- [ ] **User Testing:** Validate 85dB noise threshold in actual temple environment
- [ ] **User Testing:** Validate 20s timeout is appropriate for elderly users
