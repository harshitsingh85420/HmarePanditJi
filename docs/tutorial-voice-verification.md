# Tutorial Voice Verification Report

**Date:** March 25, 2026  
**Tester:** Voice Integration System  
**Scope:** Tutorial screens S-0.1 through S-0.12  

---

## 🔴 CRITICAL GAP IDENTIFIED

### Issue: Tutorial Screens Not Using voice-scripts-part0.ts

**Expected:** Tutorial screens should use pre-defined scripts from `voice-scripts-part0.ts` for consistency and pre-caching.

**Actual:** Tutorial screens have hardcoded text and use basic `speak()` function instead of `useSarvamVoiceFlow` hook.

---

## SCREEN-BY-SCREEN VERIFICATION

### S-0.1: TutorialSwagat (Welcome)
**File:** `apps/pandit/src/app/onboarding/screens/tutorial/TutorialSwagat.tsx`

| Check | Status | Notes |
|-------|--------|-------|
| Uses voice-scripts-part0.ts | ❌ FAIL | Hardcoded LINES array |
| Uses useSarvamVoiceFlow | ❌ FAIL | Uses basic speak()/startListening() |
| Pre-cached audio | ❌ FAIL | Not configured for caching |
| Intent detection | ✅ PASS | detectIntent() used |
| Voice plays on load | ✅ PASS | useEffect triggers |

**Script Used (HARDCODED):**
```typescript
const LINES = [
  'नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है।',
  'यह platform आपके लिए ही बना है।',
  'अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है।',
  'हमारा Mool Mantra याद रखिए — App पंडित के लिए है, पंडित App के लिए नहीं।',
  'अगर सीधे Registration करना हो तो Skip बोलें। नहीं तो जानें बोलें।',
]
```

**Expected Script (from voice-scripts-part0.ts):**
```typescript
{
  screenId: 'S-0.1',
  text: 'नमस्ते! मैं आपका डिजिटल सहायक हूँ।',
  speaker: 'priya',
  pace: 0.82,
}
```

---

### S-0.2 through S-0.12: Other Tutorial Screens

**Status:** ❌ SAME GAP - All screens use hardcoded text

| Screen | File | Uses voice-scripts-part0.ts | Uses useSarvamVoiceFlow |
|--------|------|----------------------------|-------------------------|
| S-0.2 | TutorialIncome.tsx | ❌ | ❌ |
| S-0.3 | TutorialDualMode.tsx | ❌ | ❌ |
| S-0.4 | TutorialBackup.tsx | ❌ | ❌ |
| S-0.5 | TutorialDakshina.tsx | ❌ | ❌ |
| S-0.6 | TutorialTravel.tsx | ❌ | ❌ |
| S-0.7 | TutorialPayment.tsx | ❌ | ❌ |
| S-0.8 | TutorialOnlineRevenue.tsx | ❌ | ❌ |
| S-0.9 | TutorialGuarantees.tsx | ❌ | ❌ |
| S-0.10 | TutorialCTA.tsx | ❌ | ❌ |
| S-0.11 | TutorialVideoVerify.tsx | ❌ | ❌ |
| S-0.12 | TutorialVoiceNav.tsx | ❌ | ❌ |

---

## ✅ WHAT IS WORKING

1. **LanguageConfirmScreen.tsx** - ✅ CORRECTLY IMPLEMENTED
   - Uses `useSarvamVoiceFlow` hook
   - Has dual-timeout logic (20s + 30s)
   - Proper intent detection
   - Voice scripts from `voice-scripts.ts`

2. **useSarvamVoiceFlow Hook** - ✅ AVAILABLE
   - Located: `apps/pandit/src/lib/hooks/useSarvamVoiceFlow.ts`
   - Features: Auto-reprompt, error cascade, noise detection
   - Ready for integration

3. **voice-scripts-part0.ts** - ✅ CREATED
   - Located: `apps/pandit/src/lib/voice-scripts-part0.ts`
   - Contains 28 scripts for Part 0
   - Pre-warm cache ready

---

## 🔧 REQUIRED FIXES

### Priority: HIGH

**Task:** Migrate all 12 tutorial screens to use `useSarvamVoiceFlow` + `voice-scripts-part0.ts`

**Steps:**
1. Import `PART_0_SCRIPTS` from `voice-scripts-part0.ts`
2. Replace hardcoded LINES with script from PART_0_SCRIPTS
3. Replace `speak()` + `startListening()` with `useSarvamVoiceFlow` hook
4. Test each screen for voice playback and intent detection

**Example Fix for TutorialSwagat.tsx:**
```typescript
// BEFORE:
const LINES = ['नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है।', ...]

// AFTER:
import { PART_0_SCRIPTS } from '@/lib/voice-scripts-part0'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'

const script = PART_0_SCRIPTS.find(s => s.screenId === 'S-0.1')
const { isListening } = useSarvamVoiceFlow({
  language,
  script: script.text,
  onIntent: (intent) => {
    if (intent === 'SKIP' || intent === 'FORWARD') onNext()
  }
})
```

---

## 📊 SUMMARY

| Metric | Status |
|--------|--------|
| Total Tutorial Screens | 12 |
| Using voice-scripts-part0.ts | 0/12 (0%) |
| Using useSarvamVoiceFlow | 0/12 (0%) |
| Pre-cached audio ready | 0/12 (0%) |
| Intent detection working | 1/12 (8%) |
| Voice plays on load | 1/12 (8%) |

**Overall Status:** 🔴 **NEEDS MIGRATION**

---

## ✅ RECOMMENDATION

**Option A (Quick):** Keep current hardcoded approach, but add pre-caching call in TutorialSwagat mount:
```typescript
useEffect(() => {
  preWarmCache(PART_0_SCRIPTS)
}, [])
```

**Option B (Complete):** Migrate all screens to use `useSarvamVoiceFlow` + `voice-scripts-part0.ts`
- Time estimate: 4-6 hours
- Benefit: Consistent voice handling, pre-caching, better error handling

---

**Next Steps:**
1. [ ] Decide on migration approach (Option A vs B)
2. [ ] If Option B: Create migration task for Developer 2
3. [ ] Test voice accuracy end-to-end (Task 1.3)
4. [ ] Verify dual-timeout logic (Task 1.4)
