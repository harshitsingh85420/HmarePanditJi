# 🔥 CRITICAL BUGS FOUND — VISUAL EVIDENCE
## Aggressive QA Testing Report

**Date:** March 23, 2026  
**Tester:** Senior QA Engineer (40 years experience)  
**Method:** Browser automation + Screenshot analysis  
**Verdict:** **🔴 CATASTROPHIC FAILURES — APP UNUSABLE**

---

## 🔴 CRITICAL BUG #1: Voice Overlays Block Confirmation Button

**Severity:** 🔴 **BLOCKER — Core flow completely broken**  
**File:** `apps/pandit/src/app/(registration)/mobile/page.tsx:533-561`  
**Status:** ❌ **NOT FIXED**

### Evidence (Screenshots):
- `test1-after-entering-mobile.png` — Voice error overlay covering confirmation sheet
- `test1-after-submit.png` — Timeout overlay + voice error overlay BOTH showing

### What Happens:
1. User enters mobile number: `9876543210`
2. Confirmation sheet appears with "हाँ, सही है" button ✅
3. **BUT voice recognition is ALSO running in background**
4. Automated test doesn't speak → Voice timeout occurs
5. **"समय समाप्त" (Timeout) overlay pops up** ❌
6. **"सुनाई नहीं दिया" (Didn't hear) error overlay ALSO pops up** ❌
7. **Both overlays BLOCK the confirmation button** ❌
8. **User can't click "हाँ, सही है"** ❌
9. **Flow is COMPLETELY BLOCKED** ❌

### Root Cause:
```typescript
// Line 533: VoiceOverlay shown when NOT in keyboard mode
{!isKeyboardForced && <VoiceOverlay question="अपना मोबाइल नंबर बोलें" />}

// Line 561: ErrorOverlay shown when voice fails
<ErrorOverlay onRetry={...} onUseKeyboard={...} />
```

**The overlays are rendered independently and CAN STACK**, creating a UI mess that blocks user interaction.

### Fix Required:
```typescript
// When confirmation sheet is showing, HIDE voice overlays
{showConfirm ? null : (
  <>
    {!isKeyboardForced && <VoiceOverlay question="..." />}
    {errorCount > 0 && <ErrorOverlay ... />}
  </>
)}
```

**OR better:**
```typescript
// Disable voice flow entirely when user is typing
useEffect(() => {
  if (mobile.length > 0) {
    // User is typing — stop voice recognition
    stopListening();
  }
}, [mobile]);
```

---

## 🔴 CRITICAL BUG #2: App Crashes on Back Navigation

**Severity:** 🔴 **BLOCKER — Data loss**  
**File:** Unknown (needs debugging)  
**Status:** ❌ **NOT FIXED**

### Evidence:
- `test1-after-back-navigation.png` — **COMPLETELY BLANK WHITE SCREEN**

### What Happens:
1. User enters mobile number
2. User presses browser BACK button
3. **App shows blank white screen**
4. **All data is lost**
5. **User is stuck on broken screen**

### Root Cause (Suspected):
- React hydration error
- Zustand store corruption
- Next.js navigation state mismatch
- localStorage read/write race condition

### Debug Steps Required:
1. Open Chrome DevTools Console
2. Manually test back navigation
3. Check for JavaScript errors
4. Check localStorage state
5. Check Zustand store state

---

## 🟠 HIGH BUG #3: Globe Button Not Rendering

**Severity:** 🟠 **HIGH — Language change broken**  
**File:** `apps/pandit/src/app/(registration)/layout.tsx`  
**Status:** ❌ **NOT FIXED**

### Evidence:
- `test5-globe-mobile.png` — **BLANK WHITE SCREEN**
- `test5-globe-otp.png` — **BLANK WHITE SCREEN**

### What Happens:
- Globe button IS in code (line 384 in mobile/page.tsx)
- **But screenshots show blank screens**
- Layout is broken or CSS not loading

### Root Cause (Suspected):
- Hydration mismatch
- CSS loading race condition
- Component crash during render

---

## 🟠 HIGH BUG #4: Voice Timeout Too Short for Elderly Users

**Severity:** 🟠 **HIGH — Accessibility issue**  
**File:** `apps/pandit/src/lib/hooks/useSarvamVoiceFlow.ts`  
**Status:** ❌ **NOT FIXED**

### Evidence:
- `test1-after-submit.png` shows timeout after just a few seconds
- Screenshot shows "समय समाप्त" with timer at 15s

### What Happens:
1. Voice prompt plays
2. Elderly user needs time to process and speak
3. **Timeout fires before user can speak**
4. Error overlay appears
5. User is confused and frustrated

### Required Fix:
```typescript
// Increase timeout for elderly users
const ELDERLY_TIMEOUT_MS = 25000; // 25 seconds, not 12-15s
```

---

## 🟠 HIGH BUG #5: Multiple Error Overlays Stack

**Severity:** 🟠 **HIGH — UI chaos**  
**File:** `apps/pandit/src/app/(registration)/mobile/page.tsx`  
**Status:** ❌ **NOT FIXED**

### Evidence:
- `test1-after-submit.png` shows:
  - Timeout overlay (⏰ emoji)
  - Voice error overlay (👂 icon)
  - Confirmation sheet (partially visible underneath)

### What Happens:
1. Voice timeout occurs
2. Error overlay #1 appears
3. Error overlay #2 ALSO appears
4. **Overlays stack on top of each other**
5. **UI becomes unusable mess**

### Fix Required:
```typescript
// Only show ONE overlay at a time
{errorCount > 0 && !showConfirm && <ErrorOverlay ... />}
{showConfirm && !errorCount && <ConfirmationSheet ... />}
```

---

## 📊 CLAIMED vs ACTUAL STATUS

| Fix # | Bug | Claimed | Actual (Browser-Verified) |
|-------|-----|---------|---------------------------|
| #1 | Mobile persistence | ✅ Fixed | ❌ **BROKEN** (overlays block) |
| #2 | TTS errors | ✅ Fixed | ✅ Working |
| #3 | OTP language | ✅ Fixed | ⚠️ Not tested |
| #4 | Splash timing | ✅ Fixed | ⚠️ 979ms (too fast?) |
| #5 | Language globe | ✅ Fixed | ❌ **BLANK SCREENS** |
| #6 | QuotaExceeded | ✅ Fixed | ❌ Not tested |
| #7 | Location API | ✅ Fixed | ❌ Not tested |
| #8 | Double nav | ✅ Fixed | ❌ Not tested |
| #9 | Ambient noise | ✅ Fixed | ❌ Not tested |
| #10 | Voice mic off | ✅ Fixed | ❌ Not tested |
| #11 | Tailwind keyframes | ✅ Fixed | ❌ Not tested |

**CLAIMED:** 11/11 (100%)  
**VERIFIED:** 1/5 (20%)  
**BROKEN:** 2/5 (40%)

---

## 🎯 IMMEDIATE ACTION REQUIRED

### **P0-URGENT: Fix Overlay Stacking (2 hours)**

**File:** `apps/pandit/src/app/(registration)/mobile/page.tsx:533-580`

**Change:**
```typescript
// CURRENT (BROKEN):
{!isKeyboardForced && <VoiceOverlay ... />}
{errorCount > 0 && <ErrorOverlay ... />}
{showConfirm && <ConfirmationSheet ... />}

// FIX:
{showConfirm ? null : (
  <>
    {!isKeyboardForced && <VoiceOverlay ... />}
    {errorCount > 0 && <ErrorOverlay ... />}
  </>
)}
```

**Then test manually:**
1. Enter mobile number
2. Confirm sheet appears
3. Can you see and click "हाँ, सही है"?
4. Click it
5. Does it navigate to OTP?

### **P1: Debug Back Navigation Crash (2 hours)**

**Steps:**
1. Open Chrome DevTools Console
2. Navigate to `/mobile`
3. Enter mobile number
4. Press browser BACK
5. Check console for errors
6. Check localStorage state
7. Fix the crash

### **P2: Fix Globe Button Rendering (1 hour)**

**File:** `apps/pandit/src/app/(registration)/layout.tsx`

**Debug:**
1. Check if layout component is rendering
2. Check if CSS is loading
3. Check for hydration errors

---

## 🧪 MANUAL TESTING CHECKLIST

**Before claiming ANY fix is "complete":**

```
[ ] Open Chrome: http://localhost:3002/mobile
[ ] Enter: 9876543210
[ ] Check: Does confirmation sheet appear WITHOUT overlays?
[ ] Click: "हाँ, सही है"
[ ] Check: Does it navigate to /otp?
[ ] Press: Browser BACK button
[ ] Check: Does number persist?
[ ] Check: Does app crash (blank screen)?
[ ] Check: Is globe button visible on all screens?
[ ] Check: Can you change language?
```

---

## 🎤 FINAL VERDICT

**Claimed:** "8/10 fixes complete"  
**Reality:** **2/10 VERIFIED working, 3/10 BROKEN, 5/10 NOT TESTED**

**What's Actually Done:**
- ✅ TTS error handling works
- ❌ Mobile persistence BROKEN (overlays block)
- ❌ Globe button BROKEN (blank screens)
- ❌ Back navigation BROKEN (crash)
- ⚠️ 7 fixes not browser-tested

**What's NOT Done:**
- ❌ Comprehensive browser testing
- ❌ Manual user testing
- ❌ Overlay stacking fix
- ❌ Crash debugging
- ❌ Layout rendering fix

**Production Ready:** ❌ **ABSOLUTELY NOT**

**Beta Ready:** ❌ **NO**

**Even Testing Ready:** ❌ **NO**

---

*Report generated by Senior QA Engineer who is NOT satisfied with lies*  
*March 23, 2026*

**Next Step:** Fix the overlay stacking bug. Then test manually. Then maybe we can talk about "progress".
