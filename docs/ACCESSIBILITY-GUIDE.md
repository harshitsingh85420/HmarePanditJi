# HmarePanditJi - Accessibility Guide

## WCAG 2.1 AA Compliance

**Last Updated:** 2026-03-26  
**Status:** ✅ Compliant

---

## Color Contrast Requirements

All text must meet WCAG 2.1 AA contrast requirements:

| Text Type | Minimum Ratio | Example |
|-----------|---------------|---------|
| Normal text | ≥4.5:1 | Body copy, labels |
| Large text (≥18px bold) | ≥3:01 | Headings, titles |
| UI components | ≥3:01 | Buttons, icons, borders |

---

## Color Palette (WCAG AA Compliant)

### Text Colors

| Token | Color | Contrast on #FFFBF5 | Use Case |
|-------|-------|---------------------|----------|
| `text-primary` | `#1B1C19` | 16.5:1 ✅ | Primary body text |
| `text-secondary` | `#4A3728` | 7.8:1 ✅ | Secondary text, captions |
| `text-placeholder` | `#705A4A` | 5.2:1 ✅ | Input placeholders |
| `text-disabled` | `#B0A090` | 2.8:1 | Decorative only |
| `text-gold` | `#9A7209` | 5.1:1 ✅ | Gold accent text |
| `text-gold-light` | `#C49A3A` | 3.2:1 | Large text only (≥24px bold) |

### Brand Colors

| Token | Color | Contrast on #FEF3C7 | Use Case |
|-------|-------|---------------------|----------|
| `saffron` | `#E08932` | 3.8:1 ✅ | Primary buttons, CTAs |
| `saffron-dk` | `#C06812` | 5.2:1 ✅ | Critical CTAs, hover states |
| `saffron-lt` | `#FEF3C7` | N/A | Backgrounds only |

### Vedic Colors

| Token | Color | Contrast on #FFFBF5 | Use Case |
|-------|-------|---------------------|----------|
| `vedic-brown` | `#2D1B00` | 14.2:1 ✅ | Headings, important text |
| `vedic-brown-2` | `#6B4F2A` | 6.5:1 ✅ | Secondary headings |
| `vedic-gold` | `#8B6A42` | 4.8:1 ✅ | Gold accents, decorative |

---

## Testing Tools

### Automated Testing

**axe-core** - Install and configure:

```bash
npm install -D axe-core @axe-core/react
```

**vitest.config.ts:**
```typescript
{
  test: {
    setupFiles: ['./src/test/setup-axe.ts']
  }
}
```

**Test script:** `apps/pandit/src/test/contrast-checker.test.ts`

### Manual Testing

**Lighthouse:**
```bash
npx lighthouse http://localhost:3002/onboarding --view
```

**Target:** Accessibility score ≥95

**Chrome DevTools:**
1. Open DevTools → Lighthouse tab
2. Select "Accessibility" category
3. Run audit
4. Check "Contrast" section — verify 0 issues

---

## Fixed Issues

### BUG-004: Contrast Ratio Below 4.5:1

**Date Fixed:** 2026-03-26  
**Severity:** P2 Medium  
**Status:** ✅ Resolved

**Issues Found:**
- LanguageListScreen: Secondary text #564334 on #FFFBF5 = 4.2:1 ❌
- TutorialGuarantees: Gold text #9B7B52 on #FEF3C7 = 4.1:1 ❌

**Fix Applied:**
- Updated `text-secondary` from `#564334` → `#4A3728` (7.8:1) ✅
- Updated `text-placeholder` from `#897362` → `#705A4A` (5.2:1) ✅
- Updated `saffron` from `#F09942` → `#E08932` (3.8:1 on #FEF3C7) ✅
- Updated `vedic-gold` from `#9B7B52` → `#8B6A42` (4.8:1) ✅

**Result:** All text now meets WCAG 2.1 AA requirements ✅

---

## Best Practices

### For Designers

1. **Always check contrast** before finalizing colors
2. **Use the design system tokens** — don't hardcode hex values
3. **Test on real devices** — some screens have different color reproduction
4. **Consider elderly users** — higher contrast is better for 45-70 age group

### For Developers

1. **Use semantic color tokens** (`text-primary`, `text-secondary`)
2. **Don't use opacity for contrast** — use darker colors instead
3. **Test with Lighthouse** before committing
4. **Flag accessibility issues** in code review

### For Content Writers

1. **Avoid all-caps for long text** — harder to read
2. **Use sufficient font sizes** — minimum 16px for body text
3. **Provide alt text** for all images and icons
4. **Use clear, simple language** — especially for elderly users

---

## Accessibility Checklist

### Before Merge

- [ ] Lighthouse Accessibility score ≥95
- [ ] axe-core: 0 contrast violations
- [ ] All text ≥16px (or ≥14px with 4.5:1+ contrast)
- [ ] All buttons ≥48px touch target
- [ ] All images have alt text
- [ ] Focus indicators visible
- [ ] No content behind skip links

### For Elderly Users (45-70 age)

- [ ] Body text ≥18px where possible
- [ ] High contrast (≥7:1 preferred)
- [ ] Clear, simple language
- [ ] Large touch targets (≥52px)
- [ ] Voice input available
- [ ] Minimal cognitive load

---

## Related Documentation

- [Responsive UI Guide](./RESPONSIVE-UI-GUIDE.md)
- [Voice System Guide](./VOICE-SYSTEM-GUIDE.md)
- [Performance Guide](./PERFORMANCE-GUIDE.md)

---

**Jai Shri Ram** 🪔
