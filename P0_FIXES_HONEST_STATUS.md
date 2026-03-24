# P0 Fixes - HONEST Status Report

**Date:** 2026-03-23  
**Test Method:** Automated Chrome Browser Tests  
**Test Script:** `browser-test-p0-fixes.js`

---

## 📊 TEST RESULTS (Browser-Verified)

| Test | Status | Notes |
|------|--------|-------|
| #1 Mobile Number Persistence | ❌ **FAIL** | Number lost on back navigation |
| #2 TTS Error Handling | ✅ **PASS** | App doesn't freeze on TTS failure |
| #3 OTP Language Mismatch | ⚠️ **Manual** | Requires language switching test |
| #4 Splash Screen Timing | ✅ **PASS** | 3218ms (target: ~2.5s) |
| #5 Language Globe Button | ✅ **PASS** | Present on all screens |

**Passing: 3/5 (60%)**

---

## 🔴 CRITICAL: Mobile Number Persistence STILL Broken

### What the Test Proved:
1. ✅ Number entered correctly: `9876543210`
2. ✅ Submit button clicked: "आगे बढ़ें →"
3. ✅ Confirmation button clicked: "हाँ, सही है"
4. ❌ **Navigation to OTP: DIDN'T HAPPEN** - Still on `/mobile`
5. ❌ **Number after back: EMPTY** - Lost

### Root Cause Analysis:

The browser test screenshots reveal **TWO blocking issues**:

#### Issue #1: Session Timeout Overlay Blocking Navigation
The "समय समाप्त" (Time's Up) overlay appears during the test, blocking the confirmation sheet and preventing navigation.

**Evidence:** Screenshot `test1-after-submit.png` shows:
- Confirmation sheet with mobile number visible
- Session timeout overlay on top
- Navigation never completes

**Why this happens:**
- Session timeout hook (`useSession.ts`) has a bug
- The `idleTimer` variable is declared but never used
- Only `warningTimer` is set, which directly triggers timeout
- Test environment may have accelerated timers

#### Issue #2: Mobile Number Not Persisting to localStorage
Even if navigation worked, the number isn't being saved properly.

**Current flow:**
1. User enters number → `handleInputChange` called
2. `setMobile(mobile)` updates Zustand store
3. `localStorage.setItem` is called (added in recent fix)
4. User clicks confirm → `handleConfirm` called
5. Navigation happens

**Where it breaks:**
- Step 3 might be failing silently
- Or Step 5 happens before Step 3 completes
- Back navigation reads from localStorage, which is empty

---

## 🟢 What's Actually Working

### ✅ TTS Error Handling
- All `speakWithSarvam` calls have `.catch()` handlers
- App continues navigation even if TTS fails
- **Verified by browser test**

### ✅ Splash Screen Timing
- Changed from 4000ms to 2500ms
- Browser measured: 3218ms (includes render time)
- **Verified by browser test**

### ✅ Language Globe Button
- Present on `/onboarding`, `/mobile`, `/otp`
- Clickable and functional
- **Verified by browser test**

---

## 🔧 Fixes Required

### Fix #1: Session Timeout Bug (Priority: HIGH)
**File:** `apps/pandit/src/hooks/useSession.ts:16-21`

**Current (broken):**
```typescript
const resetTimer = useCallback(() => {
  clearTimeout(idleTimer)
  clearTimeout(warningTimer)

  warningTimer = setTimeout(() => {
    setSessionTimeout(true)
  }, IDLE_TIMEOUT)
}, [setSessionTimeout])
```

**Fix:**
```typescript
const resetTimer = useCallback(() => {
  clearTimeout(idleTimer)
  clearTimeout(warningTimer)

  idleTimer = setTimeout(() => {
    warningTimer = setTimeout(() => {
      setSessionTimeout(true)
    }, SESSION_TIMEOUT_WARNING)
  }, IDLE_TIMEOUT)
}, [setSessionTimeout, setSessionTimeout])
```

### Fix #2: Mobile Number Persistence (Priority: CRITICAL)
**File:** `apps/pandit/src/app/(registration)/mobile/page.tsx:275-330`

**Current status:** localStorage write added but not working

**Next steps:**
1. Add console.log to debug localStorage write
2. Check if localStorage is blocked (incognito mode?)
3. Verify Zustand persist middleware configuration
4. Consider using sessionStorage instead

### Fix #3: OTP Language (Priority: MEDIUM)
**File:** `apps/pandit/src/app/(registration)/otp/page.tsx`

**Status:** Code changes made, needs manual verification

**Manual test required:**
1. Change language to Tamil/Telugu/etc.
2. Go to OTP screen
3. Verify TTS uses correct language code

---

## 📈 Progress Timeline

| Date | Claimed | Actual (Browser-Tested) |
|------|---------|------------------------|
| 2026-03-23 Morning | 100% Complete | 77% (Code inspection) |
| 2026-03-23 Afternoon | 100% Complete | 35-40% (First browser test) |
| 2026-03-23 Evening | - | 60% (Current) |

**Lesson learned:** Code inspection ≠ Working code. Always test in browser.

---

## 🎯 Next Actions

1. **Fix session timeout bug** (30 min)
2. **Debug localStorage write** (1 hour)
3. **Manual OTP language test** (30 min)
4. **Re-run browser tests** 
5. **Only then claim "P0 Fixed"**

---

## 📁 Evidence Files

- `test-outputs/p0-visual-tests/test-report.html` - HTML report
- `test-outputs/p0-visual-tests/test-results.json` - Raw data
- `test-outputs/p0-visual-tests/test1-*.png` - 5 screenshots proving failure
- `browser-test-p0-fixes.js` - Test script

---

**Bottom line:** Don't ship until Test #1 passes. Users' data depends on it.
