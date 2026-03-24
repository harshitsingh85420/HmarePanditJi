# UI/UX Accessibility Fixes - Implementation Guide

## Context
This document provides implementation instructions for fixing critical accessibility issues identified in the UI audit for elderly Hindu Pandits (age 45-70) with low tech literacy.

**Priority:** CRITICAL - These fixes are essential for the target user demographic.

---

## 1. TYPOGRAPHY - Minimum Font Sizes

### Problem
The codebase uses `text-xs` (12px) and `text-sm` (14px) throughout, which is unreadable for elderly users without glasses.

### Solution
**Replace ALL instances according to this mapping:**
- `text-xs` → `text-base` (16px minimum)
- `text-sm` → `text-lg` (18px for labels/subtexts)
- Primary body text should be `text-body` (as defined in HPJ_Developer_Prompts_Master.md)
- Primary labels should be `text-label` (as defined in prompts)

### Files to Update (109 instances total):
Key priority files:
1. `apps/pandit/src/app/onboarding/screens/RegistrationFlow.tsx` - Lines 83, 135, 210
2. `apps/pandit/src/app/onboarding/screens/MobileNumberScreen.tsx` - Lines 210, 259, 282
3. `apps/pandit/src/app/onboarding/screens/OTPScreen.tsx` - Line 178
4. `apps/pandit/src/app/onboarding/screens/ManualCityScreen.tsx` - Lines 621, 625, 659, 685
5. `apps/pandit/src/app/(registration)/profile/page.tsx` - Lines 152, 186, 198, 213
6. `apps/pandit/src/app/(registration)/mobile/page.tsx` - Lines 460, 645
7. `apps/pandit/src/app/(registration)/otp/page.tsx` - Lines 375, 398, 422, 433, 441, 447, 453, 459, 538
8. `apps/pandit/src/app/(auth)/login/page.tsx` - Lines 141, 156, 177

**Search command:**
```bash
grep -rn "text-xs\|text-sm" apps/pandit/src/app/ apps/pandit/src/components/
```

---

## 2. FAT-FINGER HAZARDS - Touch Target Sizes

### Problem
Interactive elements are too small (40px height). Elderly users need minimum 52-56px touch targets.

### Solution
**Add `min-h-[56px]` to ALL interactive elements:**
- Buttons (primary, secondary, text buttons)
- Input fields
- City selection chips
- Back navigation buttons
- Voice toggle buttons

### Specific Fixes:

#### RegistrationFlow.tsx Line 72-77:
```tsx
// BEFORE:
<button onClick={onBack} className="w-10 h-10 -ml-2 flex items-center justify-center text-vedic-gold rounded-full" aria-label="Go back">

// AFTER:
<button onClick={onBack} className="w-[56px] h-[56px] -ml-2 flex items-center justify-center text-vedic-gold rounded-full min-h-[56px] min-w-[56px]" aria-label="Go back">
```

#### ManualCityScreen.tsx Line 685:
```tsx
// BEFORE:
className="whitespace-nowrap px-5 py-2 min-h-[52px] bg-white border-2 border-primary text-primary rounded-full font-semibold text-sm active:bg-primary-lt shrink-0 focus:ring-2 focus:ring-primary focus:outline-none"

// AFTER:
className="whitespace-nowrap px-6 py-3 min-h-[56px] bg-white border-2 border-primary text-primary rounded-full font-semibold text-lg active:bg-primary-lt shrink-0 focus:ring-2 focus:ring-primary focus:outline-none"
```

---

## 3. DESIGN TOKEN UNIFICATION

### Problem
Components use Part 0 tokens (`bg-vedic-cream`, `text-vedic-brown`) instead of Part 1 system (`surface-base`, `surface-card`, `saffron`, `trust-green`).

### Solution
**Replace all color tokens:**
- `bg-vedic-cream` → `bg-surface-base`
- `text-vedic-brown` → `text-text-primary`
- `text-vedic-gold` → `text-saffron`
- `bg-primary-lt` → `bg-surface-card`
- `border-vedic-border` → `border-outline-variant`
- `text-trust-green` → Keep as is (already Part 1)
- `bg-trust-green-bg` → `bg-success-bg`

### Files to Update:
Same files as typography fixes above.

---

## 4. HINDI LOCALIZATION - Login Screen

### Problem
English text "Login" is confusing for the target demographic.

### Solution
**Update `apps/pandit/src/app/(auth)/login/page.tsx`:**

```tsx
// BEFORE:
<h1 className="text-2xl font-bold">Login</h1>

// AFTER:
<h1 className="text-2xl font-bold">पहले से पंजीकृत? लॉगिन करें</h1>
```

Also update any English labels to Hindi throughout the login flow.

---

## 5. LANGUAGE SWITCHER - Textual Toggle

### Problem
Abstract icon for language switching is confusing.

### Solution
**Update `apps/pandit/src/components/ui/TopBar.tsx`:**

```tsx
// BEFORE:
<button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant/30 text-primary font-medium text-sm hover:bg-primary/5 transition-colors">
  <GlobeIcon />
</button>

// AFTER:
<button className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/30 text-primary font-medium text-lg hover:bg-primary/5 transition-colors min-h-[56px]">
  <span>हिन्दी</span>
  <span className="text-outline-variant">/</span>
  <span>English</span>
</button>
```

---

## 6. PROMINENT ॐ (OM) SYMBOL

### Problem
The sacred ॐ symbol is treated as a tiny decorative icon instead of a trust signal.

### Solution
**Update `apps/pandit/src/components/ui/TopBar.tsx` or wherever ॐ appears:**

```tsx
// BEFORE:
<div className="text-2xl">ॐ</div>

// AFTER:
<div className="text-[48px] font-bold text-saffron mb-4" aria-label="Sacred Om symbol">ॐ</div>
```

Make it large, prominent, and positioned at the top center of onboarding screens.

---

## 7. PROGRESS INDICATORS

### Problem
Thin progress bars and dots (height 6px) are too subtle.

### Solution
**Update progress indicators throughout:**

```tsx
// BEFORE:
<div className="flex gap-1.5">
  {[1, 2, 3, 4].map(i => (
    <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-vedic-border'}`} />
  ))}
</div>
<p className="text-xs text-vedic-gold mt-1">Step 3/4</p>

// AFTER:
<div className="flex gap-2">
  {[1, 2, 3, 4].map(i => (
    <div key={i} className={`flex-1 h-3 rounded-full ${i <= 3 ? 'bg-saffron' : 'bg-outline-variant'}`} />
  ))}
</div>
<p className="text-lg text-saffron font-bold mt-2">कदम 3 / 4</p>
```

---

## 8. VOICE FALLBACK EDGE CASES

### Problem
`useSarvamVoiceFlow` hook doesn't properly handle:
1. Ambient noise > 65dB check
2. 3-error cascade (should switch to keyboard automatically)

### Solution
**Update `apps/pandit/src/lib/hooks/useSarvamVoiceFlow.ts`:**

```typescript
// Add ambient noise check BEFORE starting voice:
useEffect(() => {
  const checkAmbientNoise = async () => {
    const noiseLevel = await measureAmbientNoise();
    if (noiseLevel > 65) {
      // Too loud (temple bells, traffic)
      // Automatically switch to keyboard mode
      setVoiceAvailable(false);
      setFallbackReason('ambient_noise_high');
      return false;
    }
    return true;
  };
  
  checkAmbientNoise();
}, []);

// Add 3-error cascade logic:
const handleError = useCallback((error: VoiceError) => {
  setErrorCount(prev => {
    const newCount = prev + 1;
    if (newCount >= 3) {
      // After 3 failures, switch to keyboard permanently
      setVoiceAvailable(false);
      setFallbackReason('max_retries_exceeded');
      onSaveError?.('Voice recognition failed 3 times. Switching to keyboard input.');
    }
    return newCount;
  });
}, [onSaveError]);
```

---

## Implementation Priority

### Phase 1 (CRITICAL - Do First):
1. ✅ Fix build cache (completed)
2. Typography fixes (text-xs → text-base, text-sm → text-lg)
3. Touch target sizes (min-h-[56px])
4. Hindi localization for "Login"

### Phase 2 (HIGH - Do Second):
5. Design token unification
6. Language switcher textual toggle
7. Prominent ॐ symbol
8. Progress indicators

### Phase 3 (MEDIUM - Do Third):
9. Voice fallback edge cases

---

## Testing Checklist

After implementing fixes:
- [ ] All text is readable without glasses (minimum 16px)
- [ ] All buttons are easily tappable (minimum 56px height)
- [ ] Login screen shows Hindi text
- [ ] Language switcher shows "हिन्दी / English" text
- [ ] ॐ symbol is large and prominent on onboarding screens
- [ ] Progress shows "कदम X / Y" instead of "Step X/Y"
- [ ] Voice fails gracefully in noisy environments
- [ ] Voice switches to keyboard after 3 failures
- [ ] Build completes without errors: `npm run build`

---

## Notes for Developers

**This is NOT a typical SaaS app.** The target users are:
- Age 45-70 Hindu Pandits
- Low tech literacy
- May not wear reading glasses
- May have shaky hands
- Primary language is Hindi/Sanskrit, not English
- Need clear visual hierarchy with large, bold elements
- Trust signals (ॐ, saffron colors) must be prominent

**Do NOT:**
- Use text smaller than 16px
- Make buttons smaller than 56px
- Use English where Hindi is available
- Hide important symbols in corners
- Use thin progress indicators

**DO:**
- Scale up everything
- Use bold, clear typography
- Make trust signals prominent
- Provide multiple input methods (voice + keyboard)
- Fail gracefully with clear error messages in Hindi

---

## Command to Find All Issues

```bash
# Find all small text
grep -rn "text-xs\|text-sm" apps/pandit/src/

# Find all small touch targets
grep -rn "w-10 h-10\|w-8 h-8\|h-10\|h-8" apps/pandit/src/

# Find old color tokens
grep -rn "vedic-cream\|vedic-brown\|vedic-gold\|vedic-border" apps/pandit/src/

# Find English text that should be Hindi
grep -rn "Login\|Step\|Mobile\|Name\|City" apps/pandit/src/app/\(auth\)/ apps/pandit/src/app/onboarding/
```

---

**Document Created:** 2024-03-24
**Based on:** UI Accessibility Audit Report (Part 0.0, Part 0, Part 1)
**Target User:** Hindu Pandit, Age 45-70, Low Tech Literacy
