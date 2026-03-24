# 🧩 New UI Components Integration Guide

**Date:** 24 March 2026  
**Status:** ✅ Ready for Production

---

## 📦 New Components Available

### 1. EmergencySOS Component

**Location:** `src/components/emergency/EmergencySOS.tsx`

**Purpose:** Provides emergency assistance feature for Pandits in distress.

**Features:**
- GPS location capture
- SOS pulse animation
- Voice confirmation in Hindi
- Family & team alert system
- 24/7 availability notice

**Usage:**

```tsx
// Option 1: Direct route
import EmergencySOS from '@/components/emergency/EmergencySOS'

// In your page component
<EmergencySOS />

// Option 2: Navigate via router
router.push('/emergency-sos')
```

**Integration Steps:**

1. Create the route file:
```tsx
// src/app/emergency-sos/page.tsx
'use client'
import EmergencySOS from '@/components/emergency/EmergencySOS'

export default function EmergencySOSPage() {
  return <EmergencySOS />
}
```

2. Add to navigation (optional):
```tsx
// In SahayataBar or bottom nav
<button onClick={() => router.push('/emergency-sos')}>
  <span className="material-symbols-outlined">emergency</span>
  <span>SOS</span>
</button>
```

---

### 2. LanguageChangeWidget Component

**Location:** `src/components/widgets/LanguageChangeWidget.tsx`

**Purpose:** Global floating widget for language switching.

**Features:**
- Supports 12 Indian languages
- Floating action button (bottom-right)
- Animated language selection sheet
- Voice announcement on change
- Current language badge

**Usage:**

```tsx
import { LanguageChangeWidget } from '@/components/widgets/LanguageChangeWidget'
import { useState } from 'react'

export default function YourPage() {
  const [language, setLanguage] = useState<SupportedLanguage>('Hindi')

  return (
    <>
      {/* Your page content */}
      
      {/* Add widget at bottom of page */}
      <LanguageChangeWidget
        currentLanguage={language}
        onLanguageChange={(newLang) => {
          setLanguage(newLang)
          // Update your app's language context/store
        }}
      />
    </>
  )
}
```

**Global Integration (Recommended):**

```tsx
// src/app/layout.tsx or root layout
import { LanguageChangeWidget } from '@/components/widgets/LanguageChangeWidget'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('Hindi')

  return (
    <html lang={language.toLowerCase()}>
      <body>
        {children}
        <LanguageChangeWidget
          currentLanguage={language}
          onLanguageChange={setLanguage}
        />
      </body>
    </html>
  )
}
```

---

### 3. PremiumIcons Components

**Location:** `src/components/illustrations/PremiumIcons.tsx`

**Purpose:** Culturally resonant SVG illustrations replacing generic Material Icons.

**Available Illustrations:**

#### DiyaIllustration
```tsx
import { DiyaIllustration } from '@/components/illustrations/PremiumIcons'

// Usage
<DiyaIllustration 
  size="lg"           // 'sm' | 'md' | 'lg'
  animated={true}     // Enable flame animation
  className="mb-6"    // Additional CSS classes
/>
```

**Best for:** Identity screens, welcome screens, religious contexts

#### OmIllustration
```tsx
import { OmIllustration } from '@/components/illustrations/PremiumIcons'

// Usage
<OmIllustration 
  size="lg" 
  animated={true} 
/>
```

**Best for:** Welcome screens, loading states, spiritual contexts

#### TempleIllustration
```tsx
import { TempleIllustration } from '@/components/illustrations/PremiumIcons'

// Usage
<TempleIllustration 
  size="lg" 
  animated={true} 
/>
```

**Best for:** Success/celebration screens, registration complete, achievements

---

## 🎨 CSS Classes Reference

### Background Classes

```tsx
// Sacred gradient backdrop
<div className="bg-sacred" />

// Diya halo effect
<div className="diya-halo" />

// Splash gradient (onboarding)
<div className="splash-gradient" />
```

### Animation Classes

```tsx
// Shimmer text effect (on religious text/icons)
<span className="shimmer-text">ॐ</span>

// Active voice glow (when mic is listening)
<div className="saffron-glow-active">
  {/* Voice waveform or mic icon */}
</div>

// SOS pulse animation
<button className="sos-pulse">
  <span className="material-symbols-outlined">emergency</span>
</button>
```

---

## 📋 Migration Checklist

### For Existing Screens:

- [ ] **Homepage** (`src/app/(auth)/page.tsx`)
  - ✅ Replace inline gradients with `bg-sacred`
  - ✅ Add shimmer to religious text
  - [ ] Add LanguageChangeWidget

- [ ] **Identity Confirmation** (`src/app/(auth)/identity/page.tsx`)
  - ✅ Replace inline gradients with `bg-sacred`
  - ✅ Replace generic icon with `<DiyaIllustration />`
  - ✅ Add saffron-glow to voice button

- [ ] **Welcome Screen** (`src/app/(auth)/welcome/page.tsx`)
  - ✅ Replace inline gradients with `bg-sacred`
  - ✅ Replace generic icon with `<OmIllustration />`
  - ✅ Add saffron-glow to voice button

- [ ] **Registration Complete** (`src/app/(registration)/complete/page.tsx`)
  - ✅ Replace inline gradients with `bg-sacred`
  - ✅ Replace generic icon with `<TempleIllustration />`
  - ✅ Add saffron-glow to success state

- [ ] **Voice Components**
  - ✅ Add `saffron-glow-active` to VoiceOverlay
  - ✅ Add `saffron-glow-active` to ErrorOverlay
  - [ ] Test animations on low-end devices

---

## 🔧 Customization Guide

### Changing Animation Speeds

Edit `src/app/globals.css`:

```css
/* Slower shimmer (more subtle) */
.shimmer-text {
  animation: shimmer 5s ease-in-out infinite; /* was 3s */
}

/* Faster SOS pulse (more urgent) */
.sos-pulse {
  animation: sos-pulse 1s infinite; /* was 2s */
}
```

### Changing Colors

Edit Tailwind config (`tailwind.config.ts`):

```ts
colors: {
  saffron: '#FF9500', // was '#FF8C00'
  'saffron-light': '#FFF5E0', // was '#FFF3E0'
  // ...
}
```

### Adding New Languages

Edit `src/components/widgets/LanguageChangeWidget.tsx`:

```ts
const LANGUAGES = [
  // ... existing languages
  { name: 'Rajasthani', native: 'राजस्थानी', flag: '🇮🇳' },
  { name: 'Sindhi', native: 'سنڌي', flag: '🇮🇳' },
]
```

---

## 🧪 Testing Checklist

### Visual Testing:

- [ ] **SOS Pulse Animation** - Smooth, not jarring
- [ ] **Shimmer Text** - Subtle, readable on all backgrounds
- [ ] **Saffron Glow** - Visible but not overwhelming
- [ ] **SVG Illustrations** - Crisp on all screen sizes
- [ ] **Language Widget** - Doesn't block important UI

### Performance Testing:

- [ ] **Low-end Android** (₹5,000-10,000 range)
  - [ ] Animations run at 60fps
  - [ ] No jank during voice interactions
  - [ ] SVG illustrations load quickly

- [ ] **Battery Impact**
  - [ ] Animations don't drain battery excessively
  - [ ] Consider reducing animation frequency after 5 minutes

### Accessibility Testing:

- [ ] **Reduced Motion** - Respect `prefers-reduced-motion`
- [ ] **Screen Readers** - SVG illustrations have `aria-label`
- [ ] **Color Contrast** - All text meets WCAG AA standards

---

## 📱 Responsive Design

All components are mobile-first and responsive:

```tsx
// LanguageChangeWidget positioning
fixed bottom-24 right-4  // Perfect for thumb reach

// EmergencySOS layout
flex flex-col items-center  // Centers on all screens

// PremiumIcons sizing
size="sm"   // w-16 h-16 (compact screens)
size="md"   // w-24 h-24 (standard)
size="lg"   // w-48 h-48 (hero illustrations)
```

---

## 🐛 Known Issues & Workarounds

### Issue 1: Shimmer text not visible on light backgrounds

**Workaround:** Add darker outline:
```tsx
<span className="shimmer-text text-saffron drop-shadow-md">ॐ</span>
```

### Issue 2: SOS pulse too bright at night

**Fix:** Reduce opacity in dark mode:
```css
.dark .sos-pulse {
  animation: sos-pulse 2s infinite;
  opacity: 0.7;
}
```

### Issue 3: Language widget blocks footer buttons

**Fix:** Adjust positioning:
```tsx
// Move widget higher on small screens
className="bottom-32 right-4 sm:bottom-24"
```

---

## 📞 Support

For questions or issues:

1. Check `UI_UX_AUDIT_RESPONSE.md` for implementation details
2. Review HTML reference mockups in `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/`
3. Consult `globals.css` for all CSS class definitions

---

**Happy Coding! 🪔**
