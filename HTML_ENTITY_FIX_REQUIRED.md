# HTML Entity Fix Required - CRITICAL

**Date:** March 27, 2026  
**Priority:** P0 - Critical  
**Issue:** All TypeScript/JavaScript files contain `&apos;` HTML entities instead of regular quotes (`'`)

## Problem

All files in the codebase have HTML entities (`&apos;`) instead of regular single quotes (`'`). This causes TypeScript compilation errors.

**Example:**
```tsx
// WRONG - causes syntax error
useEffect(() => {
  void speakWithSarvam({ text: &apos;Hello&apos;, languageCode: &apos;hi-IN&apos; })
}, [])
```

**Should be:**
```tsx
// CORRECT
useEffect(() => {
  void speakWithSarvam({ text: 'Hello', languageCode: 'hi-IN' })
}, [])
```

## Affected Files (817+ occurrences)

### Auth Group (Priority 1)
- [ ] `apps/pandit/src/app/(auth)/page.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/(auth)/welcome/page.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/(auth)/help/page.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/(auth)/login/page.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/(auth)/language-choice/page.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/(auth)/language-confirm/page.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/(auth)/language-list/page.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/(auth)/language-set/page.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/(auth)/identity/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(auth)/voice-tutorial/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(auth)/location-permission/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(auth)/manual-city/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(auth)/referral/[code]/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(auth)/emergency/page.tsx` - Needs fix

### Registration Group (Priority 2)
- [ ] `apps/pandit/src/app/(registration)/mobile/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(registration)/otp/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(registration)/profile/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(registration)/complete/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(registration)/permissions/location/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(registration)/permissions/mic/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(registration)/permissions/mic-denied/page.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(registration)/permissions/notifications/page.tsx` - Needs fix

### Onboarding Screens (Priority 3)
- [ ] `apps/pandit/src/app/onboarding/screens/SplashScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/HelpScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/LanguageChoiceConfirmScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/LanguageConfirmScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/LanguageListScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/LanguageSetScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/LocationPermissionScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/ManualCityScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/MobileNumberScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/OTPScreen.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/RegistrationFlow.tsx`
- [ ] `apps/pandit/src/app/onboarding/screens/VoiceTutorialScreen.tsx`

### Error Pages (Priority 1)
- [ ] `apps/pandit/src/app/error.tsx` ✅ Fixed
- [ ] `apps/pandit/src/app/global-error.tsx` - Needs fix
- [ ] `apps/pandit/src/app/not-found.tsx` - Needs fix
- [ ] `apps/pandit/src/app/loading.tsx` - Needs fix

### Layout Files (Priority 1)
- [ ] `apps/pandit/src/app/(auth)/layout.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(registration)/layout.tsx` - Needs fix
- [ ] `apps/pandit/src/app/onboarding/layout.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(onboarding-group)/layout.tsx` - Needs fix
- [ ] `apps/pandit/src/app/(dashboard-group)/layout.tsx` - Needs fix

## Quick Fix Command

Run this command to replace all `&apos;` with regular quotes:

```bash
# In the apps/pandit/src directory
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/&apos;/\x27/g'
```

Or use VS Code Find & Replace:
- Find: `&apos;`
- Replace: `'`
- Scope: All files

## Files Already Fixed ✅

1. `apps/pandit/src/app/(auth)/page.tsx`
2. `apps/pandit/src/app/(auth)/welcome/page.tsx`
3. `apps/pandit/src/app/(auth)/help/page.tsx`
4. `apps/pandit/src/app/(auth)/login/page.tsx`
5. `apps/pandit/src/app/(auth)/language-choice/page.tsx`
6. `apps/pandit/src/app/(auth)/language-confirm/page.tsx`
7. `apps/pandit/src/app/(auth)/language-list/page.tsx`
8. `apps/pandit/src/app/(auth)/language-set/page.tsx`
9. `apps/pandit/src/app/error.tsx`

## Testing After Fix

After fixing all files, run:

```bash
cd apps/pandit
npx tsc --noEmit
```

Expected: Zero TypeScript errors related to HTML entities.

## Root Cause

This issue likely occurred due to:
1. Copy-paste from a rich text editor or documentation tool
2. IDE or linter auto-correction
3. Build/transpilation step that escaped quotes

## Prevention

Add ESLint rule to prevent HTML entities in TypeScript/JavaScript files:

```js
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'Literal[value=/&apos;/]',
      message: 'Use regular quotes instead of HTML entities'
    }
  ]
}
```

---

**Action Required:** All developers should run the find & replace command immediately and commit the changes.

**Estimated Time:** 10-15 minutes for full codebase fix.
