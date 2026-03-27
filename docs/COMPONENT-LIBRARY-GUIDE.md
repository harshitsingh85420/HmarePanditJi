# Component Library Guide
## HmarePanditJi - UI Component Documentation

**Version:** 1.0.0  
**Last Updated:** March 26, 2026  
**Target Users:** Elderly Pandits (age 45-70), Low tech literacy  

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design System Overview](#design-system-overview)
3. [Component Catalog](#component-catalog)
4. [Usage Guidelines](#usage-guidelines)
5. [Responsive Design Patterns](#responsive-design-patterns)
6. [Accessibility Guidelines](#accessibility-guidelines)
7. [TypeScript Types Reference](#typescript-types-reference)
8. [Testing Guidelines](#testing-guidelines)

---

## Introduction

### Purpose

This document serves as the comprehensive guide for the HmarePanditJi component library. All components are designed with elderly users (age 45-70) in mind, featuring:

- **Large touch targets** (≥52px minimum)
- **High contrast colors** for low vision
- **Clear Hindi typography** with Devanagari support
- **Simple, intuitive interactions**
- **Voice-first design patterns**

### Design Principles

1. **Clarity Over Cleverness** - Every component should be immediately understandable
2. **Touch-Friendly** - All interactive elements must be easily tappable with large thumbs
3. **Forgiving** - Components should handle mistakes gracefully
4. **Consistent** - Similar patterns across all components
5. **Accessible** - WCAG 2.1 AA compliance minimum

---

## Design System Overview

### Color Palette

All colors are defined in `tailwind.config.ts` and should be used via Tailwind classes.

#### Primary Colors (Saffron - Sacred, Auspicious)

| Token | Value | Usage |
|-------|-------|-------|
| `saffron` | `#FF8C00` | Primary CTAs, highlights |
| `saffron-dark` | `#904D00` | Pressed states, dark accents |
| `saffron-light` | `#FFF3E0` | Background tints |
| `saffron-tint` | `#FFF8E1` | Subtle backgrounds |
| `saffron-border` | `#FFB300` | Borders, dividers |

#### Surface Colors (Backgrounds)

| Token | Value | Usage |
|-------|-------|-------|
| `surface-base` | `#FBF9F3` | Main screen background |
| `surface-card` | `#FFFFFF` | Card backgrounds |
| `surface-muted` | `#F5F3EE` | Muted containers |
| `surface-dim` | `#E4E2DD` | Dimmed containers |
| `surface-high` | `#EAE8E2` | High emphasis areas |

#### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `text-primary` | `#1B1C19` | Primary text |
| `text-secondary` | `#564334` | Secondary text |
| `text-placeholder` | `#897362` | Placeholder text |
| `text-disabled` | `#C7C7CC` | Disabled text |

#### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `trust-green` | `#1B6D24` | Success states, money |
| `trust-green-bg` | `#E8F5E9` | Success backgrounds |
| `warning-amber` | `#F89100` | Warning states |
| `warning-amber-bg` | `#FFF3E0` | Warning backgrounds |
| `error-red` | `#BA1A1A` | Error states |
| `error-red-bg` | `#FFDAD6` | Error backgrounds |

### Typography

#### Font Families

```typescript
// Google Fonts loaded in layout.tsx
font-devanagari: 'Noto Sans Devanagari', sans-serif
font-serif: 'Noto Serif', serif
font-body: 'Public Sans', sans-serif
font-label: 'Noto Sans Devanagari', sans-serif
font-headline: 'Noto Serif', serif
```

#### Font Sizes (Responsive Scale)

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `hero` | 28px | 1.2 | 700 | Screen titles |
| `title` | 22px | 1.3 | 600 | Section headers |
| `body` | 18px | 1.5 | 400 | Body text |
| `body-sm` | 16px | 1.5 | 400 | Secondary text |
| `label` | 14px | 1.5 | 400 | Form labels |
| `micro` | 12px | 1.4 | 400 | Captions |

### Spacing

#### Screen Layout

```typescript
spacing: {
  'screen-x': '20px',  // Horizontal screen margin
  'card-p': '20px',    // Card padding
}
```

#### Touch Targets

```typescript
minHeight: {
  'touch': '52px',   // Minimum touch target
  'btn': '56px',     // Primary button height
  'btn-sm': '48px',  // Secondary button height
  'confirm': '60px', // Confirmation buttons
}
```

### Border Radius

```typescript
borderRadius: {
  'card': '16px',
  'card-sm': '12px',
  'btn': '12px',
  'pill': '9999px',
}
```

### Shadows

```typescript
boxShadow: {
  'card': '0px 2px 8px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)',
  'card-saffron': '0px 4px 16px rgba(255,140,0,0.12), 0px 2px 4px rgba(0,0,0,0.06)',
  'btn-saffron': '0px 4px 12px rgba(255,140,0,0.35)',
  'btn-saffron-pressed': '0px 1px 4px rgba(255,140,0,0.20)',
  'sheet': '0px -4px 20px rgba(0,0,0,0.10)',
  'top-bar': '0px 2px 10px rgba(144,77,0,0.05)',
}
```

---

## Component Catalog

### Core Components

#### Button

**File:** `apps/pandit/src/components/ui/Button.tsx`

**Purpose:** Primary interactive element for all actions.

**Variants:**
- `primary` - Main CTAs (saffron background, white text)
- `secondary` - Secondary actions (outlined saffron)
- `ghost` - Minimal emphasis (text only)
- `danger` - Destructive actions (red background)
- `outline` - Bordered buttons
- `text` - Text-only links
- `danger-text` - Text-only destructive

**Sizes:**
- `sm` - 48px height (small screens)
- `md` - 52px height (default, recommended)
- `lg` - 56px height (ideal for elderly)

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'text' | 'danger-text'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
  className?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  iconComponent?: React.ReactNode
}
```

**Usage:**
```tsx
// Primary CTA
<Button variant="primary" size="lg" fullWidth>
  आगे बढ़ें
</Button>

// Loading state
<Button variant="primary" isLoading={isSubmitting}>
  सत्यापित हो रहा है...
</Button>

// With icon
<Button variant="secondary" icon="arrow_forward" iconPosition="right">
  Next Step
</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>
  Delete Account
</Button>
```

**Accessibility:**
- All buttons have proper `type` attribute
- Disabled state uses `aria-disabled`
- Loading state announced via `role="status"`
- Focus indicators always visible

---

#### Input

**File:** `apps/pandit/src/components/ui/Input.tsx`

**Purpose:** Text input for forms with full accessibility support.

**Variants:**
- `default` - Standard input
- `error` - Error state (red border)
- `success` - Success state (green border)

**Sizes:**
- `sm` - 44px height
- `md` - 52px height (recommended)
- `lg` - 56px height (ideal for elderly)

**Props:**
```typescript
interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'tel' | 'password' | 'number' | 'email'
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  maxLength?: number
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'error' | 'success'
  icon?: 'left' | 'right'
  iconComponent?: React.ReactNode
  onIconClick?: () => void
  name?: string
  id?: string
  required?: boolean
  autoComplete?: string
}
```

**Usage:**
```tsx
// Basic input with label
<Input
  value={mobile}
  onChange={setMobile}
  label="Mobile Number"
  type="tel"
  placeholder="98765 43210"
  size="lg"
/>

// Error state
<Input
  value={otp}
  onChange={setOtp}
  label="OTP"
  error="Please enter 6-digit OTP"
  variant="error"
/>

// With icon (voice button)
<Input
  value={name}
  onChange={setName}
  label="Full Name"
  icon="right"
  iconComponent={<MicIcon />}
  onIconClick={handleVoiceInput}
/>
```

**Accessibility:**
- Label properly associated via `htmlFor`
- Error message linked via `aria-describedby`
- `aria-invalid` set for error states
- Focus indicators always visible

---

#### Card

**File:** `apps/pandit/src/components/ui/Card.tsx`

**Purpose:** Container for grouping related content.

**Variants:**
- `default` - White background with shadow
- `elevated` - Enhanced shadow for emphasis
- `outlined` - Border only, no background
- `muted` - Cream background, no shadow
- `highlighted` - Border with primary color

**Padding:**
- `default` - Standard padding (p-5)
- `none` - No padding
- `large` - Extra padding (p-6)
- `responsive` - Responsive padding (p-4 xs:p-6 sm:p-8)

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'muted' | 'highlighted'
  padding?: 'default' | 'none' | 'large' | 'responsive'
  clickable?: boolean
  onClick?: () => void
  role?: string
  ariaLabel?: string
}
```

**Usage:**
```tsx
// Default card
<Card variant="default" padding="responsive">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Clickable card
<Card 
  clickable 
  onClick={handleCardClick}
  ariaLabel="Select this booking option"
>
  <BookingDetails />
</Card>

// Elevated card for emphasis
<Card variant="elevated">
  <ImportantInformation />
</Card>
```

**Sub-components:**
- `CardHeader` - Consistent header spacing
- `CardTitle` - Typography-styled title
- `CardDescription` - Secondary text styling
- `CardContent` - Main content area
- `CardFooter` - Bottom section with border

---

### Layout Components

#### TopBar

**File:** `apps/pandit/src/components/TopBar.tsx`

**Purpose:** Consistent header across all screens.

**Features:**
- ॐ symbol + "HmarePanditJi" branding
- Back button (conditional)
- Language switcher
- Saffron gradient background

**Props:**
```typescript
interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
  title?: string
}
```

**Usage:**
```tsx
<TopBar 
  showBack 
  onBack={handleBack}
  onLanguageChange={handleLanguageChange}
/>
```

---

#### SahayataBar

**File:** `apps/pandit/src/components/ui/SahayataBar.tsx`

**Purpose:** Help and support bar with emergency contacts.

**Features:**
- SOS emergency button
- Helpline call button
- Regular help button

**Usage:**
```tsx
<SahayataBar />
```

---

### Overlay Components

#### CelebrationOverlay

**File:** `apps/pandit/src/components/overlays/CelebrationOverlay.tsx`

**Purpose:** Success animation for completed actions.

**Features:**
- Saffron glow ring
- Checkmark draw animation
- Confetti particles
- 1.4s auto-dismiss

**Usage:**
```tsx
// Triggered via Zustand store
const { triggerCelebration } = useUIStore()
triggerCelebration('Registration Complete')
```

---

#### NetworkBanner

**File:** `apps/pandit/src/components/overlays/NetworkBanner.tsx`

**Purpose:** Network status indicator.

**Features:**
- Online: Green banner (auto-dismiss 2s)
- Offline: Amber banner (sticky)

**Usage:**
```tsx
// Automatic via useNetwork hook
<NetworkBanner />
```

---

#### ErrorOverlay

**File:** `apps/pandit/src/components/voice/ErrorOverlay.tsx`

**Purpose:** Voice error states with retry options.

**Features:**
- Error 1: "माफ़ कीजिए, फिर से बोलिए"
- Error 2: "आवाज़ समझ नहीं आई"
- Error 3: "Keyboard से जवाब दीजिए"
- Progress indicators (1-3)

**Usage:**
```tsx
<ErrorOverlay 
  onRetry={handleRetry}
  onUseKeyboard={handleKeyboard}
/>
```

---

#### ConfirmationSheet

**File:** `apps/pandit/src/components/voice/ConfirmationSheet.tsx`

**Purpose:** Voice transcription confirmation.

**Features:**
- Bottom sheet slide-up
- Transcribed text display
- "हाँ, सही है" / "नहीं, बदलें" buttons
- 15s countdown

**Usage:**
```tsx
<ConfirmationSheet
  transcribedText={transcribedText}
  confidence={confidence}
  isVisible={showConfirm}
  onConfirm={handleConfirm}
  onRetry={handleRetry}
  onEdit={handleEdit}
/>
```

---

### Utility Components

#### SkipButton

**File:** `apps/pandit/src/components/ui/SkipButton.tsx`

**Purpose:** Skip tutorial/onboarding steps.

**Features:**
- 64px touch target
- Subtle design
- Hindi label

**Usage:**
```tsx
<SkipButton onClick={handleSkip} />
```

---

#### ProgressDots

**File:** `apps/pandit/src/components/ui/ProgressDots.tsx`

**Purpose:** Tutorial step indicators.

**Features:**
- Active/completed/inactive states
- Clickable completed dots
- Screen reader labels

**Props:**
```typescript
interface ProgressDotsProps {
  total: number
  current: number  // 1-indexed
  onDotClick?: (index: number) => void
}
```

**Usage:**
```tsx
<ProgressDots total={12} current={3} />
```

---

#### KeyboardToggle

**File:** `apps/pandit/src/components/KeyboardToggle.tsx`

**Purpose:** Switch between voice and keyboard input.

**Features:**
- 64px touch target
- Clear icon + text
- aria-hidden on decorative icon

**Usage:**
```tsx
<KeyboardToggle onClick={handleToggle} />
```

---

## Usage Guidelines

### When to Use Which Component

#### Buttons

| Use Case | Recommended Variant |
|----------|---------------------|
| Primary CTA (Continue, Submit) | `primary`, size `lg` |
| Secondary action (Back, Cancel) | `secondary` or `outline` |
| Destructive action (Delete) | `danger` |
| Link-style action | `text` or `ghost` |
| Confirmation dialog | `ConfirmButtons` component |

#### Inputs

| Use Case | Recommended Size |
|----------|------------------|
| Mobile number | `lg` (56px) |
| OTP | `lg` (56px) |
| Name | `lg` (56px) |
| Search | `md` (52px) |
| Filters | `sm` (44px) |

#### Cards

| Use Case | Recommended Variant |
|----------|---------------------|
| Content grouping | `default` |
| Emphasis needed | `elevated` |
| Selection options | `clickable` with `highlighted` |
| Inline content | `muted` |

---

## Responsive Design Patterns

### Breakpoint System

```typescript
// Tailwind default breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
```

### Mobile-First Approach

All components are designed mobile-first (390px base) and scale up:

```tsx
// Responsive padding example
<div className="p-4 xs:p-6 sm:p-8">
  {/* Content */}
</div>

// Responsive text sizing
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  {/* Title */}
</h1>
```

### Container Constraints

The app is constrained to mobile-width even on larger screens:

```tsx
// Root layout constraint
<div className="relative mx-auto w-full max-w-[430px] min-h-screen">
  {/* App content */}
</div>
```

---

## Accessibility Guidelines

### Touch Targets

**Minimum Size:** 52px × 52px

```tsx
// Correct
<button className="min-h-[52px] min-w-[52px]">
  Click me
</button>

// Incorrect - too small
<button className="h-8 w-8">
  Click me
</button>
```

### Focus Management

All interactive elements must have visible focus indicators:

```tsx
// Standard focus ring
<button className="focus:ring-2 focus:ring-primary focus:outline-none">
  Click me
</button>

// Custom focus ring
<button className="focus:ring-2 focus:ring-saffron focus:ring-offset-2">
  Click me
</button>
```

### ARIA Labels

All interactive elements need accessible names:

```tsx
// Icon-only button
<button aria-label="Go back to previous screen">
  <BackIcon />
</button>

// Button with icon
<button>
  <MicIcon aria-hidden="true" />
  Speak
</button>
```

### Screen Reader Announcements

Use `role="status"` and `aria-live` for dynamic content:

```tsx
// Loading state
<div role="status" aria-live="polite">
  Loading...
</div>

// Error state
<div role="alert" aria-live="assertive">
  Error message
</div>
```

### Keyboard Navigation

All components must support keyboard navigation:

- **Tab** - Move focus forward
- **Shift+Tab** - Move focus backward
- **Enter** - Activate focused element
- **Escape** - Close dialogs/sheets
- **Arrow keys** - Navigate within components

---

## TypeScript Types Reference

### Common Types

```typescript
// Variant types
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'text'
type InputVariant = 'default' | 'error' | 'success'
type CardVariant = 'default' | 'elevated' | 'outlined' | 'muted' | 'highlighted'

// Size types
type ButtonSize = 'sm' | 'md' | 'lg'
type InputSize = 'sm' | 'md' | 'lg'

// State types
type LoadingState = 'idle' | 'loading' | 'success' | 'error'
type NetworkState = 'online' | 'offline'
```

### Utility Types

```typescript
// Props with children
interface WithChildren {
  children: React.ReactNode
  className?: string
}

// Props with optional onClick
interface WithClickHandler {
  onClick?: () => void
  clickable?: boolean
}

// Polymorphic component props
type AsProp<C extends React.ElementType> = {
  as?: C
} & React.ComponentPropsWithoutRef<C>
```

---

## Testing Guidelines

### Unit Testing

Test each component in isolation:

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('status')).toBeVisible()
  })
})
```

### E2E Testing

Use role-based selectors with Hindi text support:

```typescript
import { test, expect } from '@playwright/test'

test('should submit form', async ({ page }) => {
  // Use role-based selectors
  await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
  await page.getByRole('button', { name: /continue|आगे/i }).click()
  
  // Verify navigation
  await expect(page.getByRole('heading', { name: /otp/i })).toBeVisible()
})
```

### Accessibility Testing

Use axe-core for automated accessibility checks:

```tsx
import { axe } from 'jest-axe'

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## Component Maintenance

### Adding New Components

1. Create file in appropriate directory (`ui/`, `overlays/`, `voice/`)
2. Define TypeScript interface for props
3. Implement component with accessibility in mind
4. Add JSDoc documentation
5. Export from index file
6. Add to this documentation

### Updating Existing Components

1. Check COMPONENT-AUDIT.md for known issues
2. Make changes with backward compatibility
3. Update TypeScript types
4. Update this documentation
5. Run tests to verify no regressions

### Deprecating Components

1. Add `@deprecated` JSDoc tag
2. Add console warning in development
3. Update documentation with migration path
4. Wait one sprint before removal

---

## Language Persistence

### LanguageBottomSheet

**File:** `apps/pandit/src/components/LanguageBottomSheet.tsx`

**Persistence:** LanguageBottomSheet persists selection to localStorage.

**Storage Key:** `'hpj_preferred_language'`

**Fallback:** Hindi if no preference saved

**Implementation:**
```typescript
// Save on language select
useEffect(() => {
  if (typeof window !== 'undefined' && selectedLanguage) {
    localStorage.setItem('hpj_preferred_language', selectedLanguage)
  }
}, [selectedLanguage])

// Load on mount
useEffect(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('hpj_preferred_language')
    if (saved && selectedLanguage !== saved) {
      setSelectedLanguage(saved as SupportedLanguage)
    }
  }
}, [])
```

### LanguageChangeWidget

**File:** `apps/pandit/src/components/widgets/LanguageChangeWidget.tsx`

**Persistence:** Same localStorage key `'hpj_preferred_language'`

**Note:** Both components share the same storage key, ensuring consistent language preference across the app.

### onboarding-store.ts

**File:** `apps/pandit/src/lib/onboarding-store.ts`

**Function:** `loadOnboardingState()`

**Behavior:** Checks for desktop language preference and overrides saved state if found.

```typescript
// BUG-002 FIX: Check for desktop language preference
const desktopLang = localStorage.getItem('hpj_preferred_language')
if (desktopLang && ALL_LANGUAGES.includes(desktopLang as SupportedLanguage)) {
  state.selectedLanguage = desktopLang as SupportedLanguage
}
```

### Test Coverage

**File:** `apps/pandit/src/test/language-persistence.test.ts`

**Test Cases:**
1. ✅ Select Hindi on desktop → refresh → verify Hindi persists
2. ✅ Select Tamil on mobile → refresh → verify Tamil persists
3. ✅ Select language → close tab → reopen → verify persists
4. ✅ Clear localStorage → verify defaults to Hindi
5. ✅ Cross-tab persistence
6. ✅ All 15 supported languages

---

## Support

For questions or issues:

1. Check this documentation first
2. Review COMPONENT-AUDIT.md for known issues
3. Check existing GitHub issues
4. Tag Senior UI/UX Developer for component questions
5. Tag Project Leader for architectural decisions

---

**Document Version:** 1.0.1 (Updated: BUG-002 Fix)
**Maintained By:** Frontend Development Team
**Review Schedule:** Every sprint
