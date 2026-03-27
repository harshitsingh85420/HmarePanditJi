# UI Fixed Pixels Audit Report

**Project:** HmarePanditJi - Pandit App  
**Date:** 2026-03-26  
**Target:** Mobile-first responsive UI for low tech literacy users (age 45-70)  
**Total Fixed Pixel Instances Found:** 558

---

## Audit Summary

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| Width (w-[XXXpx]) | ~180 | Critical | Pending |
| Height (h-[XXXpx]) | ~120 | Critical | Pending |
| Font Size (text-[XXXpx]) | ~150 | High | Pending |
| Max Width (max-w-[XXXpx]) | ~40 | Medium | Pending |
| Min Height (min-h-[XXXpx]) | ~35 | Medium | Pending |
| Spacing (gap-[XXXpx], m-[XXXpx], p-[XXXpx]) | ~33 | Low | Pending |

---

## Files by Priority

### PRIORITY 1 - Registration Flow (6 files)
1. `apps/pandit/src/app/(registration)/mobile/page.tsx`
2. `apps/pandit/src/app/(registration)/otp/page.tsx`
3. `apps/pandit/src/app/(registration)/profile/page.tsx`
4. `apps/pandit/src/app/(registration)/permissions/mic/page.tsx`
5. `apps/pandit/src/app/(registration)/permissions/location/page.tsx`
6. `apps/pandit/src/app/(registration)/permissions/notifications/page.tsx`

### PRIORITY 2 - Onboarding (6 files)
7. `apps/pandit/src/app/onboarding/page.tsx`
8. `apps/pandit/src/app/onboarding/screens/SplashScreen.tsx`
9. `apps/pandit/src/app/onboarding/screens/LocationPermissionScreen.tsx`
10. `apps/pandit/src/app/onboarding/screens/ManualCityScreen.tsx`
11. `apps/pandit/src/app/onboarding/screens/LanguageConfirmScreen.tsx`
12. `apps/pandit/src/app/onboarding/screens/LanguageListScreen.tsx`

### PRIORITY 3 - Tutorial Screens (12 files)
13-24. All files in `apps/pandit/src/app/onboarding/screens/tutorial/`

### PRIORITY 4 - Homepage & Entry (3 files)
25. `apps/pandit/src/app/(auth)/page.tsx`
26. `apps/pandit/src/app/(auth)/identity/page.tsx`
27. `apps/pandit/src/app/(auth)/referral/[code]/page.tsx`

---

## Detailed Findings

### Critical Width Issues (w-[XXXpx])

| File | Line | Current Value | Proposed Fix | Priority |
|------|------|---------------|--------------|----------|
| VoiceTutorialScreen.tsx | 110 | w-[180px] | w-44 xs:w-48 | Critical |
| VoiceTutorialScreen.tsx | 123 | w-[140px] | w-36 xs:w-40 | Critical |
| VoiceTutorialScreen.tsx | 153 | w-[56px] | w-14 xs:w-16 | Critical |
| RegistrationFlow.tsx | 75 | w-[72px] | w-18 xs:w-20 | Critical |
| RegistrationFlow.tsx | 216 | w-[72px] | w-18 xs:w-20 | Critical |
| SplashScreen.tsx | 59 | w-[120px] | w-28 xs:w-32 | Critical |

### Critical Height Issues (h-[XXXpx])

| File | Line | Current Value | Proposed Fix | Priority |
|------|------|---------------|--------------|----------|
| VoiceTutorialScreen.tsx | 110 | h-[180px] | h-44 xs:h-48 | Critical |
| VoiceTutorialScreen.tsx | 115 | h-[180px] | h-44 xs:h-48 | Critical |
| VoiceTutorialScreen.tsx | 120 | h-[180px] | h-44 xs:h-48 | Critical |
| VoiceTutorialScreen.tsx | 123 | h-[140px] | h-36 xs:h-40 | Critical |
| VoiceTutorialScreen.tsx | 143 | h-[2px] | h-0.5 | Critical |
| RegistrationFlow.tsx | 75 | h-[72px] | h-18 xs:h-20 | Critical |

### Critical Font Size Issues (text-[XXXpx])

| File | Line | Current Value | Proposed Fix | Priority |
|------|------|---------------|--------------|----------|
| VoiceTutorialScreen.tsx | 104 | text-[22px] | text-xl xs:text-2xl | High |
| VoiceTutorialScreen.tsx | 124 | text-[80px] | text-7xl xs:text-8xl | High |
| VoiceTutorialScreen.tsx | 131 | text-[20px] | text-lg xs:text-xl | High |
| VoiceTutorialScreen.tsx | 133 | text-[18px] | text-base xs:text-lg | High |
| VoiceTutorialScreen.tsx | 137 | text-[32px] | text-2xl xs:text-3xl | High |
| VoiceTutorialScreen.tsx | 160 | text-[44px] | text-4xl xs:text-5xl | High |
| RegistrationFlow.tsx | 70 | text-[120px] | text-9xl xs:text-[140px] | High |
| RegistrationFlow.tsx | 71 | text-[32px] | text-2xl xs:text-3xl | High |
| RegistrationFlow.tsx | 81 | text-[36px] | text-3xl xs:text-4xl | High |
| RegistrationFlow.tsx | 102 | text-[40px] | text-3xl xs:text-4xl | High |

### Container Issues (max-w-[XXXpx])

| File | Line | Current Value | Proposed Fix | Priority |
|------|------|---------------|--------------|----------|
| VoiceTutorialScreen.tsx | 96 | max-w-[390px] | max-w-full xs:max-w-[390px] | Medium |
| RegistrationFlow.tsx | 67 | max-w-[390px] | max-w-full xs:max-w-[390px] | Medium |
| TutorialShell.tsx | 53 | max-w-[390px] | max-w-full xs:max-w-[390px] | Medium |

---

## Fix Patterns Applied

### Pattern 1: Fixed Width → Responsive
```tsx
// BEFORE
<div className="w-[320px]">Content</div>

// AFTER
<div className="w-full max-w-[320px] xs:max-w-[430px]">Content</div>
```

### Pattern 2: Fixed Font Size → Responsive
```tsx
// BEFORE
<h1 className="text-[32px] font-bold">Title</h1>

// AFTER
<h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold">Title</h1>
```

### Pattern 3: Fixed Height → Responsive
```tsx
// BEFORE
<button className="h-[72px]">Click</button>

// AFTER
<button className="min-h-[52px] xs:min-h-[56px] sm:min-h-[60px]">Click</button>
```

### Pattern 4: Fixed Container → Responsive
```tsx
// BEFORE
<div className="max-w-[430px] mx-auto">
  <div className="px-6">Content</div>
</div>

// AFTER
<div className="w-full max-w-[430px] xs:max-w-[768px] mx-auto">
  <div className="px-4 xs:px-6 sm:px-8">Content</div>
</div>
```

### Pattern 5: Fixed Grid → Responsive
```tsx
// BEFORE
<div className="grid grid-cols-2 gap-4">
  <div className="w-[200px] h-[150px]">Card</div>
</div>

// AFTER
<div className="grid grid-cols-1 xs:grid-cols-2 gap-4 xs:gap-6">
  <div className="w-full h-auto aspect-[4/3]">Card</div>
</div>
```

---

## Testing Checklist (Per Screen)

For EACH screen, test at these breakpoints:
- [ ] 320px width (iPhone SE, small Android)
- [ ] 375px width (iPhone 12 mini, standard)
- [ ] 430px width (iPhone 14 Pro Max, large phones)
- [ ] 768px width (iPad Mini, tablets)
- [ ] 1024px width (iPad Pro, small laptops)
- [ ] 1280px width (desktops)

For each breakpoint, verify:
- [ ] No horizontal scroll
- [ ] All text is readable (body text ≥16px)
- [ ] All buttons are clickable (≥48px touch target)
- [ ] Images scale properly (no overflow)
- [ ] Forms are usable (inputs ≥48px height)
- [ ] Navigation is accessible
- [ ] Voice UI elements are visible and usable
- [ ] No layout breaks or overlapping elements

---

## Progress Tracker

| File | Status | Reviewed By | Date |
|------|--------|-----------|------|
| tailwind.config.ts | Pending | - | - |
| globals.css | Pending | - | - |
| VoiceTutorialScreen.tsx | Pending | - | - |
| RegistrationFlow.tsx | Pending | - | - |
| OTPScreen.tsx | Pending | - | - |
| MobileNumberScreen.tsx | Pending | - | - |
| SplashScreen.tsx | Pending | - | - |
| TutorialShell.tsx | Pending | - | - |

---

## Notes

1. **Touch Target Standard:** All interactive elements must be ≥52px (WCAG AA standard for low tech literacy users)
2. **Minimum Font Size:** Body text must be ≥16px at all breakpoints
3. **Container Strategy:** Use `max-w-[390px]` as mobile constraint, but allow expansion on larger screens
4. **Spacing Scale:** Use Tailwind's spacing scale (px-4, px-5, px-6) instead of fixed values
5. **Font Scale:** Use semantic font sizes (text-lg, text-xl, text-2xl) with responsive modifiers

---

**Next Steps:**
1. Update tailwind.config.ts with responsive breakpoints
2. Add responsive utility classes to globals.css
3. Fix files in priority order (Registration → Onboarding → Tutorial → Homepage)
4. Test at all 6 breakpoints
5. Document in RESPONSIVE-UI-GUIDE.md
