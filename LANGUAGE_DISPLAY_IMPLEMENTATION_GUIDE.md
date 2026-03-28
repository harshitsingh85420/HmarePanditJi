# 🌐 Language Display Implementation Guide

**Date:** March 28, 2026  
**Status:** ✅ **COMPLETE**  
**Updated By:** AI Leadership Team

---

## 📊 WHAT CHANGED

### Before (Old Format):
```typescript
export const LANGUAGE_DISPLAY: Record<SupportedLanguage, {
  nativeName: string
  latinName: string
  scriptChar: string
  emoji: string
}> = {
  Hindi: { nativeName: 'हिंदी', latinName: 'Hindi', scriptChar: 'अ', emoji: '🇮🇳' },
  English: { nativeName: 'English', latinName: 'English', scriptChar: 'A', emoji: '🌐' },
  // ...
}
```

**UI Problem:** Displaying `Hindi/English` takes too much screen space:
```tsx
// Takes too much space, not elegant
<div>{lang.nativeName} / {lang.latinName}</div>
// Output: "हिंदी / Hindi" (too long for mobile buttons)
```

---

### After (New Compact Format):
```typescript
export const LANGUAGE_DISPLAY: Record<SupportedLanguage, {
  nativeName: string      // Full name (for screen readers, accessibility)
  shortName: string       // Compact display (2-4 chars for UI buttons/cards)
  latinName: string       // English name (reference only)
  scriptChar: string      // Single character representing the script
  emoji: string           // Flag/cultural emoji
}> = {
  Hindi:     { nativeName: 'हिंदी',     shortName: 'हि',  latinName: 'Hindi',     scriptChar: 'अ', emoji: '🇮🇳' },
  English:   { nativeName: 'English',   shortName: 'En',  latinName: 'English',   scriptChar: 'A', emoji: '🌐' },
  Tamil:     { nativeName: 'தமிழ்',     shortName: 'த',   latinName: 'Tamil',     scriptChar: 'த', emoji: '🌺' },
  Telugu:    { nativeName: 'తెలుగు',    shortName: 'తె',  latinName: 'Telugu',    scriptChar: 'తె', emoji: '🌴' },
  Bengali:   { nativeName: 'বাংলা',     shortName: 'বা',  latinName: 'Bengali',   scriptChar: 'ব', emoji: '🐟' },
  Kannada:   { nativeName: 'ಕನ್ನಡ',    shortName: 'ಕ',   latinName: 'Kannada',   scriptChar: 'ಕ', emoji: '🏔️' },
  Malayalam: { nativeName: 'മലയാളം',    shortName: 'മ',   latinName: 'Malayalam', scriptChar: 'മ', emoji: '🌿' },
  Marathi:   { nativeName: 'मराठी',     shortName: 'म',   latinName: 'Marathi',   scriptChar: 'म', emoji: '🟠' },
  Gujarati:  { nativeName: 'ગુજરાતી',   shortName: 'ગુ',  latinName: 'Gujarati',  scriptChar: 'ગ', emoji: '🦚' },
  Bhojpuri:  { nativeName: 'भोजपुरी',   shortName: 'भो',  latinName: 'Bhojpuri',  scriptChar: 'भ', emoji: '🌾' },
  Maithili:  { nativeName: 'मैथिली',    shortName: 'मै',  latinName: 'Maithili',  scriptChar: 'म', emoji: '🪔' },
  Sanskrit:  { nativeName: 'संस्कृत',   shortName: 'सं',  latinName: 'Sanskrit',  scriptChar: 'ॐ', emoji: '📜' },
  Odia:      { nativeName: 'ଓଡ଼ିଆ',    shortName: 'ଓ',   latinName: 'Odia',      scriptChar: 'ଓ', emoji: '🌊' },
  Punjabi:   { nativeName: 'ਪੰਜਾਬੀ',   shortName: 'ਪੰ',  latinName: 'Punjabi',   scriptChar: 'ਪ', emoji: '🌻' },
  Assamese:  { nativeName: 'অসমীয়া',   shortName: 'অ',   latinName: 'Assamese',  scriptChar: 'অ', emoji: '🦅' },
}
```

---

## 🎨 UI IMPLEMENTATION PATTERNS

### Pattern 1: Language Selection Grid (Recommended)

```tsx
import { LANGUAGE_DISPLAY, ALL_LANGUAGES } from '@/lib/onboarding-store'

export default function LanguageGrid({ onSelect }: { onSelect: (lang: SupportedLanguage) => void }) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {ALL_LANGUAGES.map((lang) => {
        const info = LANGUAGE_DISPLAY[lang]
        return (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-card active:scale-95 transition-transform"
          >
            <span className="text-3xl">{info.emoji}</span>
            <span className="text-2xl font-bold text-vedic-brown">{info.shortName}</span>
            <span className="text-xs text-vedic-gold">{info.scriptChar}</span>
          </button>
        )
      })}
    </div>
  )
}
```

**Visual Output:**
```
┌─────────┐  ┌─────────┐  ┌─────────┐
│   🇮🇳    │  │   🌾    │  │   🪔    │
│   हि    │  │   भो    │  │   मै    │
│   अ    │  │   भ    │  │   म    │
└─────────┘  └─────────┘  └─────────┘
```

---

### Pattern 2: Language List with Compact Display

```tsx
import { LANGUAGE_DISPLAY, ALL_LANGUAGES } from '@/lib/onboarding-store'

export default function LanguageList({ selected, onSelect }: { 
  selected: SupportedLanguage
  onSelect: (lang: SupportedLanguage) => void 
}) {
  return (
    <div className="space-y-2 p-4">
      {ALL_LANGUAGES.map((lang) => {
        const info = LANGUAGE_DISPLAY[lang]
        const isSelected = selected === lang
        return (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
              isSelected 
                ? 'bg-saffron-light border-2 border-saffron' 
                : 'bg-white border-2 border-transparent'
            }`}
          >
            <span className="text-3xl">{info.emoji}</span>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-vedic-brown">{info.shortName}</span>
                <span className="text-sm text-vedic-gold">({info.scriptChar})</span>
              </div>
              <span className="text-xs text-text-secondary">{info.nativeName}</span>
            </div>
            {isSelected && (
              <span className="text-saffron text-2xl">✓</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

**Visual Output:**
```
┌───────────────────────────────────────┐
│ 🇮🇳  हि (अ)                ✓         │
│     हिंदी                             │
├───────────────────────────────────────┤
│ 🌾  भो (भ)                           │
│     भोजपुरी                           │
└───────────────────────────────────────┘
```

---

### Pattern 3: Language Confirmation Card

```tsx
import { LANGUAGE_DISPLAY } from '@/lib/onboarding-store'

export default function LanguageConfirmCard({ language }: { language: SupportedLanguage }) {
  const info = LANGUAGE_DISPLAY[language]
  
  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-card-saffron">
      <span className="text-6xl mb-4">{info.emoji}</span>
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-saffron">{info.shortName}</h1>
        <p className="text-xl text-vedic-gold">{info.scriptChar}</p>
        <p className="text-lg text-text-secondary">{info.nativeName}</p>
      </div>
    </div>
  )
}
```

**Visual Output:**
```
┌─────────────────────────┐
│                         │
│          🇮🇳            │
│                         │
│         हि              │
│         अ               │
│       हिंदी             │
│                         │
└─────────────────────────┘
```

---

### Pattern 4: Top Bar Language Switcher

```tsx
import { LANGUAGE_DISPLAY } from '@/lib/onboarding-store'

export default function TopBar({ currentLanguage, onLanguageChange }: {
  currentLanguage: SupportedLanguage
  onLanguageChange: () => void
}) {
  const info = LANGUAGE_DISPLAY[currentLanguage]
  
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">ॐ</span>
        <span className="font-bold text-lg">HmarePanditJi</span>
      </div>
      <button
        onClick={onLanguageChange}
        className="flex items-center gap-2 px-3 py-2 bg-saffron-light rounded-full active:scale-95 transition-transform"
      >
        <span className="text-lg">{info.emoji}</span>
        <span className="text-sm font-bold text-saffron">{info.shortName}</span>
        <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
      </button>
    </header>
  )
}
```

**Visual Output:**
```
┌─────────────────────────────────────┐
│ ॐ HmarePanditJi      🇮🇳 हि ▼     │
└─────────────────────────────────────┘
```

---

### Pattern 5: Language Set Celebration

```tsx
import { LANGUAGE_DISPLAY } from '@/lib/onboarding-store'

export default function LanguageSetCelebration({ language }: { language: SupportedLanguage }) {
  const info = LANGUAGE_DISPLAY[language]
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-saffron-light to-vedic-cream">
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-saffron/20 blur-3xl rounded-full animate-glow" />
        
        {/* Emoji */}
        <span className="relative text-8xl animate-bounce">{info.emoji}</span>
        
        {/* Text */}
        <div className="mt-8 text-center space-y-3">
          <h1 className="text-6xl font-bold text-saffron">{info.shortName}</h1>
          <p className="text-2xl text-vedic-gold">{info.scriptChar}</p>
          <p className="text-xl text-text-primary">{info.nativeName}</p>
          <p className="text-lg text-text-secondary mt-4">सेट हो गई</p>
        </div>
      </div>
    </div>
  )
}
```

**Visual Output:**
```
┌─────────────────────────────────────┐
│                                     │
│           🇮🇳 (bounce animation)    │
│                                     │
│           हि                        │
│           अ                         │
│         हिंदी                       │
│       सेट हो गई                     │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 RESPONSIVE DESIGN GUIDELINES

### Mobile (320px - 390px)
```tsx
// Use compact format exclusively
<div className="flex items-center gap-2">
  <span className="text-2xl">{info.emoji}</span>
  <span className="text-lg font-bold">{info.shortName}</span>
  <span className="text-xs text-vedic-gold">{info.scriptChar}</span>
</div>
```

### Tablet (391px - 768px)
```tsx
// Can show nativeName + shortName
<div className="flex items-center gap-3">
  <span className="text-3xl">{info.emoji}</span>
  <div>
    <div className="flex items-center gap-2">
      <span className="text-xl font-bold">{info.shortName}</span>
      <span className="text-sm text-vedic-gold">({info.scriptChar})</span>
    </div>
    <span className="text-sm text-text-secondary">{info.nativeName}</span>
  </div>
</div>
```

### Desktop (>768px)
```tsx
// Can show full display
<div className="flex items-center gap-4">
  <span className="text-4xl">{info.emoji}</span>
  <div>
    <span className="text-2xl font-bold">{info.nativeName}</span>
    <span className="text-sm text-vedic-gold ml-2">({info.latinName})</span>
  </div>
</div>
```

---

## ♿ ACCESSIBILITY GUIDELINES

### Screen Reader Support
```tsx
<button
  onClick={() => onSelect(lang)}
  aria-label={`Select ${info.nativeName} language`}
  className="..."
>
  <span className="text-3xl" aria-hidden="true">{info.emoji}</span>
  <span className="text-2xl font-bold">{info.shortName}</span>
  <span className="sr-only">{info.latinName}</span>
</button>
```

### High Contrast Mode
```tsx
<span className={`text-2xl font-bold ${
  isSelected 
    ? 'text-white bg-saffron px-2 py-1 rounded' 
    : 'text-vedic-brown'
}`}>
  {info.shortName}
</span>
```

---

## 🔧 MIGRATION GUIDE

### Files That Need Updating:

**Already Updated:**
- ✅ `apps/pandit/src/lib/onboarding-store.ts` (LANGUAGE_DISPLAY definition)

**Need Manual Review:**
1. `apps/pandit/src/app/(auth)/language-set/page.tsx`
2. `apps/pandit/src/app/(auth)/language-list/page.tsx`
3. `apps/pandit/src/app/(auth)/language-confirm/page.tsx`
4. `apps/pandit/src/app/onboarding/screens/LanguageChoiceConfirmScreen.tsx`
5. `apps/pandit/src/app/onboarding/screens/LanguageConfirmScreen.tsx`
6. `apps/pandit/src/app/onboarding/screens/LanguageListScreen.tsx`
7. `apps/pandit/src/app/onboarding/screens/LanguageSetScreen.tsx`
8. `apps/pandit/src/components/LanguageBottomSheet.tsx`
9. `apps/pandit/src/components/LanguageChangeBottomSheet.tsx`
10. `apps/pandit/src/components/ui/LanguageBottomSheet.tsx`

### Migration Steps:

**Step 1:** Find all uses of `nativeName` and `latinName`:
```bash
cd apps/pandit
grep -r "nativeName\|latinName" src/app src/components
```

**Step 2:** Replace with `shortName` where appropriate:
```tsx
// Before
<p className="text-2xl">{langInfo.nativeName}</p>
<p className="text-lg">{langInfo.latinName}</p>

// After (compact)
<div className="flex items-center gap-2">
  <span className="text-3xl">{langInfo.emoji}</span>
  <span className="text-2xl font-bold">{langInfo.shortName}</span>
  <span className="text-xs text-vedic-gold">{langInfo.scriptChar}</span>
</div>
```

**Step 3:** Test on mobile viewport (390px):
```bash
# Open Chrome DevTools
# Set viewport to 390x844 (iPhone 14/14 Pro)
# Verify language buttons fit without overflow
```

---

## ✅ TESTING CHECKLIST

### Visual Testing:
- [ ] Language grid fits 3 columns on 320px viewport
- [ ] Language buttons are tappable (min 48px × 48px)
- [ ] Text is readable without glasses (min 16px for body)
- [ ] Emoji displays correctly on all devices
- [ ] ScriptChar renders correctly for all 15 languages

### Functional Testing:
- [ ] Language selection works via voice ("Hindi", "Tamil", etc.)
- [ ] Language selection works via touch
- [ ] Selected language persists across page reload
- [ ] Language change widget works from TopBar
- [ ] Voice scripts play in selected language

### Accessibility Testing:
- [ ] Screen reader announces full language name
- [ ] High contrast mode shows clear borders
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus indicators visible on all language buttons

---

## 📊 LANGUAGE DISPLAY COMPARISON

| Language | Old Display | New Compact | Space Saved |
|----------|-------------|-------------|-------------|
| Hindi | "हिंदी / Hindi" | "हि" | ~70% |
| English | "English / English" | "En" | ~85% |
| Tamil | "தமிழ் / Tamil" | "த" | ~90% |
| Telugu | "తెలుగు / Telugu" | "తె" | ~88% |
| Bengali | "বাংলা / Bengali" | "বা" | ~87% |
| Kannada | "ಕನ್ನಡ / Kannada" | "ಕ" | ~88% |
| Malayalam | "മലയാളം / Malayalam" | "മ" | ~90% |
| Marathi | "मराठी / Marathi" | "म" | ~85% |
| Gujarati | "ગુજરાતી / Gujarati" | "ગુ" | ~83% |
| Bhojpuri | "भोजपुरी / Bhojpuri" | "भो" | ~82% |
| Maithili | "मैथिली / Maithili" | "मै" | ~82% |
| Sanskrit | "संस्कृत / Sanskrit" | "सं" | ~85% |
| Odia | "ଓଡ଼ିଆ / Odia" | "ଓ" | ~88% |
| Punjabi | "ਪੰਜਾਬੀ / Punjabi" | "ਪੰ" | ~85% |
| Assamese | "অসমীয়া / Assamese" | "অ" | ~88% |

**Average Space Saved:** ~86%

---

## 🎯 BEST PRACTICES

### DO:
- ✅ Use `shortName` for buttons, cards, and compact UI
- ✅ Use `nativeName` for screen readers and celebration screens
- ✅ Use `emoji` for visual recognition
- ✅ Use `scriptChar` for cultural authenticity
- ✅ Keep `latinName` for developer reference only

### DON'T:
- ❌ Display `nativeName / latinName` side-by-side (takes too much space)
- ❌ Use only `latinName` (defeats the purpose of native language support)
- ❌ Remove `emoji` (helps with quick visual recognition)
- ❌ Make buttons smaller than 48px × 48px (accessibility violation)

---

## 📞 SUPPORT

For questions about language display implementation:
- Check this guide first
- Review the HTML reference files in `prompts/part 0/stitch_welcome_screen_0_15/`
- Ask in Slack: #hmarepanditji-dev

---

**Last Updated:** March 28, 2026  
**Maintained By:** Frontend Team Lead  
**Version:** 1.0
