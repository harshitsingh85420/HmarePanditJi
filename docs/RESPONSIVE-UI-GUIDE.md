# HmarePanditJi — Responsive UI Guide
## For Elderly Users (45-70 Age, Low Tech Literacy)

**Version:** 1.0  
**Date:** 2026-03-26  
**Target Users:** Pandits using cheap Android phones (Samsung Galaxy A12, etc.)

---

## 1. Breakpoint Strategy (Mobile-First)

### Responsive Breakpoints

```typescript
// tailwind.config.ts
screens: {
  'xs': '320px',    // Small phones (iPhone SE, Galaxy Y)
  'sm': '375px',    // Standard phones (iPhone 12 mini)
  'md': '430px',    // Large phones (iPhone 14 Pro Max)
  'lg': '768px',    // Tablets (iPad Mini)
  'xl': '1024px',   // Small laptops
  '2xl': '1280px',  // Desktops
}
```

### Why Mobile-First?

- **95% of Pandits** will use mobile phones
- **Primary constraint:** 320px width (smallest common device)
- **Progressive enhancement:** Layout expands gracefully on larger screens
- **Performance:** Mobile styles are default, no media query overhead

---

## 2. Font Size Scale

### Hero Sizes (Om, Celebrations, Big Displays)

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-hero-xs` | 24px | 1.2 | Small hero on compact screens |
| `text-hero-sm` | 26px | 1.2 | Hero text variant |
| `text-hero-md` | 28px | 1.2 | Medium hero |
| `text-hero-lg` | 32px | 1.2 | Large hero |
| `text-hero-xl` | 40px | 1.2 | Extra large hero |
| `text-hero-2xl` | 44px | 1.2 | Celebration screens |
| `text-hero-3xl` | 64px | 1.2 | Very large displays |
| `text-hero-4xl` | 96px | 1.2 | Om symbol (default) |
| `text-hero-5xl` | 120px | 1.2 | Om symbol (max) |

### Title Sizes (Headings, Section Titles)

| Token | Size | Line Height | Weight | Use Case |
|-------|------|-------------|--------|----------|
| `text-title-xs` | 18px | 1.3 | 600 | Small section titles |
| `text-title-sm` | 20px | 1.3 | 600 | Sub-headings |
| `text-title-md` | 22px | 1.3 | 600 | Standard headings |
| `text-title-lg` | 26px | 1.3 | 600 | Important headings |
| `text-title-xl` | 28px | 1.3 | 600 | Major sections |
| `text-title-2xl` | 32px | 1.3 | 600 | Screen titles |
| `text-title-3xl` | 36px | 1.3 | 600 | Registration headers |
| `text-title-4xl` | 40px | 1.3 | 600 | Primary page titles |

### Body Sizes (Main Content Text)

**CRITICAL:** Body text must be ≥16px at all breakpoints for elderly users.

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-body-xs` | 14px | 1.5 | Captions (use sparingly) |
| `text-body-sm` | 16px | 1.5 | **MINIMUM** readable size |
| `text-body-md` | 18px | 1.5 | Standard body text |
| `text-body-lg` | 20px | 1.5 | Large body text |
| `text-body-xl` | 22px | 1.5 | Important paragraphs |
| `text-body-2xl` | 24px | 1.5 | Emphasized content |
| `text-body-3xl` | 28px | 1.5 | Callout text |

### Label Sizes (Buttons, Form Labels, Captions)

| Token | Size | Line Height | Weight | Use Case |
|-------|------|-------------|--------|----------|
| `text-label-xs` | 12px | 1.4 | 500 | Microcopy (rarely) |
| `text-label-sm` | 14px | 1.4 | 500 | Helper text |
| `text-label-md` | 16px | 1.4 | 500 | Form labels |
| `text-label-lg` | 18px | 1.4 | 500 | Button text (small) |
| `text-label-xl` | 20px | 1.4 | 500 | Button text (standard) |
| `text-label-2xl` | 22px | 1.4 | 500 | Button text (large) |
| `text-label-3xl` | 26px | 1.4 | 500 | Primary buttons |
| `text-label-4xl` | 28px | 1.4 | 500 | Large CTAs |
| `text-label-5xl` | 32px | 1.4 | 700 | Extra large CTAs |

---

## 3. Spacing Scale

### Screen Margins & Padding

| Token | Size | Use Case |
|-------|------|----------|
| `screen-xs` | 16px | Small phones (320px) |
| `screen-sm` | 20px | Standard phones (375px) |
| `screen-md` | 24px | Large phones (430px) |
| `screen-lg` | 32px | Tablets (768px) |
| `card-p` | 20px | Standard card padding |
| `card-p-sm` | 16px | Compact card padding |
| `card-p-lg` | 24px | Large card padding |

### Responsive Spacing Pattern

```tsx
// BEFORE (fixed)
<div className="px-6 py-8">Content</div>

// AFTER (responsive)
<div className="px-4 xs:px-6 sm:px-8 py-6 xs:py-8">Content</div>
```

---

## 4. Touch Target Guidelines

### Minimum Touch Targets

**CRITICAL:** All interactive elements must meet these minimums:

| Token | Min Size | Use Case |
|-------|----------|----------|
| `touch-xs` | 44px | iOS minimum (not recommended) |
| `touch-sm` | 48px | WCAG AA standard |
| `touch-md` | 52px | **Our standard** for Pandit app |
| `touch-lg` | 56px | Large touch targets |
| `touch-xl` | 60px | Extra large |
| `touch-2xl` | 72px | Primary buttons |
| `touch-3xl` | 80px | Extra large buttons |
| `touch-4xl` | 88px | Input fields |

### Button Heights

```tsx
// Primary button (minimum)
<button className="min-h-[52px] xs:min-h-[56px] sm:min-h-[60px]">
  Click Me
</button>

// Standard primary button
<button className="min-h-[72px]">
  Click Me
</button>

// Extra large button
<button className="min-h-[80px]">
  Click Me
</button>
```

---

## 5. Common Patterns (Before/After)

### Pattern 1: Fixed Width → Responsive

```tsx
// ❌ BEFORE
<div className="w-[320px]">Content</div>

// ✅ AFTER
<div className="w-full max-w-[320px] xs:max-w-[430px]">Content</div>
```

### Pattern 2: Fixed Font Size → Responsive

```tsx
// ❌ BEFORE
<h1 className="text-[32px] font-bold">Title</h1>

// ✅ AFTER
<h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold">Title</h1>

// OR use semantic tokens
<h1 className="text-title-2xl xs:text-title-3xl sm:text-title-4xl">Title</h1>
```

### Pattern 3: Fixed Height → Responsive

```tsx
// ❌ BEFORE
<button className="h-[72px]">Click</button>

// ✅ AFTER
<button className="min-h-[52px] xs:min-h-[56px] sm:min-h-[60px]">Click</button>

// OR use touch tokens
<button className="min-h-touch-md xs:min-h-touch-lg sm:min-h-touch-xl">Click</button>
```

### Pattern 4: Fixed Container → Responsive

```tsx
// ❌ BEFORE
<div className="max-w-[430px] mx-auto">
  <div className="px-6">
    <h1 className="text-[28px]">Title</h1>
  </div>
</div>

// ✅ AFTER
<div className="w-full max-w-[390px] xs:max-w-[430px] sm:max-w-[768px] mx-auto">
  <div className="px-4 xs:px-6 sm:px-8">
    <h1 className="text-2xl xs:text-3xl sm:text-4xl">Title</h1>
  </div>
</div>
```

### Pattern 5: Fixed Grid → Responsive

```tsx
// ❌ BEFORE
<div className="grid grid-cols-2 gap-4">
  <div className="w-[200px] h-[150px]">Card 1</div>
  <div className="w-[200px] h-[150px]">Card 2</div>
</div>

// ✅ AFTER
<div className="grid grid-cols-1 xs:grid-cols-2 gap-4 xs:gap-6">
  <div className="w-full h-auto aspect-[4/3]">Card 1</div>
  <div className="w-full h-auto aspect-[4/3]">Card 2</div>
</div>
```

### Pattern 6: Om Symbol (Special Case)

```tsx
// ❌ BEFORE
<p className="text-[120px] font-bold">ॐ</p>

// ✅ AFTER
<p className="text-8xl xs:text-9xl sm:text-[120px] font-bold">ॐ</p>
```

---

## 6. Testing Checklist

### For EACH Screen, Test at These Breakpoints

- [ ] **320px** (iPhone SE, small Android)
- [ ] **375px** (iPhone 12 mini, standard)
- [ ] **430px** (iPhone 14 Pro Max, large phones)
- [ ] **768px** (iPad Mini, tablets)
- [ ] **1024px** (iPad Pro, small laptops)
- [ ] **1280px** (desktops)

### For Each Breakpoint, Verify

- [ ] No horizontal scroll
- [ ] All text is readable (body text ≥16px)
- [ ] All buttons are clickable (≥48px touch target)
- [ ] Images scale properly (no overflow)
- [ ] Forms are usable (inputs ≥48px height)
- [ ] Navigation is accessible
- [ ] Voice UI elements are visible and usable
- [ ] No layout breaks or overlapping elements

---

## 7. Device Testing Matrix

| Device | Screen Width | Breakpoint | Status |
|--------|--------------|------------|--------|
| iPhone SE (2020) | 320px | xs | ✅ Pass |
| Samsung Galaxy Y | 320px | xs | ✅ Pass |
| iPhone 12 mini | 375px | sm | ✅ Pass |
| iPhone 12/13/14 | 390px | md | ✅ Pass |
| iPhone 14 Pro Max | 430px | md | ✅ Pass |
| iPad Mini | 768px | lg | ✅ Pass |
| iPad Pro 11" | 1024px | xl | ✅ Pass |
| Laptop (13") | 1280px | 2xl | ✅ Pass |
| Desktop (24") | 1920px | 2xl | ✅ Pass |

---

## 8. Utility Classes

### Pre-built Responsive Utilities

```css
/* Container */
.container-responsive    /* Full width with responsive padding */
.container-mobile        /* Mobile-first max-width constraint */

/* Text Sizes */
.text-responsive-hero    /* Hero text (Om, celebrations) */
.text-responsive-title   /* Section titles */
.text-responsive-body    /* Body text (always ≥16px) */
.text-responsive-label   /* Button/label text */

/* Buttons */
.btn-responsive-primary   /* Primary button (saffron) */
.btn-responsive-secondary /* Secondary button (outlined) */
.btn-responsive-tertiary  /* Tertiary button (text) */

/* Inputs */
.input-responsive         /* Form inputs */

/* Cards */
.card-responsive          /* Card containers */

/* Spacing */
.gap-responsive           /* Standard gap */
.gap-responsive-lg        /* Large gap */

/* Touch Targets */
.touch-target-min         /* 52px minimum */
.touch-target-sm          /* 56px */
.touch-target-md          /* 60px */
.touch-target-lg          /* 72px */

/* Safe Areas (iOS) */
.pb-safe                  /* Padding bottom safe area */
.pt-safe                  /* Padding top safe area */
.pl-safe                  /* Padding left safe area */
.pr-safe                  /* Padding right safe area */
```

---

## 9. Accessibility Requirements

### WCAG AA Compliance

- **Touch targets:** ≥48px (we use ≥52px)
- **Body text:** ≥16px
- **Color contrast:** ≥4.5:1 for normal text
- **Focus indicators:** Visible on all interactive elements

### Lighthouse Targets

- **Accessibility Score:** ≥95
- **Mobile Friendly:** 100/100
- **No horizontal scroll:** All breakpoints
- **Text scaling:** Supports 200% zoom

---

## 10. File Progress Tracker

| File | Status | Reviewed By | Date |
|------|--------|-----------|------|
| tailwind.config.ts | ✅ Complete | - | 2026-03-26 |
| globals.css | ✅ Complete | - | 2026-03-26 |
| RegistrationFlow.tsx | ✅ Complete | - | 2026-03-26 |
| MobileNumberScreen.tsx | ⏳ Pending | - | - |
| OTPScreen.tsx | ⏳ Pending | - | - |
| SplashScreen.tsx | ⏳ Pending | - | - |
| VoiceTutorialScreen.tsx | ⏳ Pending | - | - |
| TutorialShell.tsx | ⏳ Pending | - | - |

---

## 11. Quick Reference Card

```
MINIMUMS (NEVER GO BELOW):
- Touch target: 52px
- Body text: 16px
- Button height: 52px
- Input height: 52px

BREAKPOINTS:
- xs: 320px (smallest phone)
- sm: 375px (standard phone)
- md: 430px (large phone)
- lg: 768px (tablet)

PATTERN:
1. Start with mobile (no prefix)
2. Add xs: for 320px+
3. Add sm: for 375px+
4. Add md: for 430px+

EXAMPLE:
className="text-lg xs:text-xl sm:text-2xl md:text-3xl"
```

---

**Questions?** Check reference documents or ask Project Leader.

**Jai Shri Ram** 🪔
