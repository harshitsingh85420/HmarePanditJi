# 🎨 UI Implementation Checklist - Exact Reference Guide

**Date:** March 28, 2026  
**Status:** Ready to Execute  
**UI References:** `prompts/part 0/stitch_welcome_screen_0_15/` + `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/`

---

## 📋 HOW TO USE THIS CHECKLIST

For each screen:
1. Open the reference HTML file in Chrome
2. Open the corresponding React/TSX file in your editor
3. Compare side-by-side
4. Check off each element as you implement it
5. Test on iPhone 14 Pro viewport (393x852)

---

## ✅ PART 0: LANGUAGE SELECTION SCREENS

### **Screen S-0.0.4: Language List** 

**Reference:** `prompts/part 0/stitch_welcome_screen_0_15/language_list_s_0.0.4/code.html`  
**Target:** `apps/pandit/src/app/(auth)/language-list/page.tsx`

#### **Elements to Implement:**

**1. Header Section** ✅
```tsx
// Reference HTML Line 62-67
<header class="pt-12 px-6 pb-6">
  <h1 class="text-[28px] font-bold text-brand-dark leading-tight">
    अपनी भाषा चुनें
  </h1>
</header>
```
- [ ] Font size: 28px (mobile), 32px (tablet)
- [ ] Font weight: bold
- [ ] Color: `#2D1B00` (brand-dark / text-primary)
- [ ] Padding: pt-12 pb-6 px-6

**2. Voice Search Section** ✅
```tsx
// Reference HTML Line 71-84
<section class="px-6 mb-6">
  <div class="bg-brand-light-accent border-2 border-brand-accent rounded-2xl p-4 flex items-center space-x-4">
    <div class="bg-white p-2 rounded-full animate-pulse-soft shadow-sm">
      <svg class="h-6 w-6 text-brand-accent">...</svg>
    </div>
    <div class="flex flex-col">
      <span class="text-brand-dark font-bold text-base">भाषा का नाम बोलें</span>
      <span class="text-gray-500 text-xs">जैसे: 'Hindi', 'Tamil', 'Bengali'</span>
    </div>
  </div>
</section>
```
- [ ] Background: `#FEF3C7` (brand-light-accent / saffron-light)
- [ ] Border: 2px solid `#F09942` (brand-accent / saffron)
- [ ] Border radius: 16px (rounded-2xl)
- [ ] Padding: 16px (p-4)
- [ ] Mic icon: White circle with pulse animation
- [ ] Main text: Bold, base size
- [ ] Helper text: Gray, xs size

**3. Divider** ✅
```tsx
// Reference HTML Line 88-91
<div class="px-6 mb-6 text-center">
  <span class="text-gray-400 text-sm font-medium">─── या नीचे से चुनें ───</span>
</div>
```
- [ ] Color: Gray-400
- [ ] Font size: sm (14px)
- [ ] Font weight: medium (500)

**4. Text Search Bar** ✅
```tsx
// Reference HTML Line 95-107
<section class="px-6 mb-8">
  <div class="relative">
    <input class="w-full bg-white border border-brand-border rounded-xl py-3 pl-10 pr-4 text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-accent" placeholder="भाषा खोजें..." type="text"/>
  </div>
</section>
```
- [ ] Background: White
- [ ] Border: 1px `#F0E6D3` (brand-border / outline-variant)
- [ ] Border radius: 12px (rounded-xl)
- [ ] Padding: py-3 pl-10 pr-4
- [ ] Focus ring: 1px saffron
- [ ] Placeholder: "भाषा खोजें..."

**5. Language Grid (COMPACT FORMAT)** 🔴 **CRITICAL CHANGE**
```tsx
// Reference HTML Line 111-182 (OLD FORMAT - needs update)
// OLD: <button>हिंदी / Hindi</button>
// NEW: Compact format with emoji + shortName + scriptChar

<section class="px-6 flex-1 overflow-y-auto pb-10">
  <div class="grid grid-cols-2 gap-4">
    {ALL_LANGUAGES.map((lang) => {
      const info = LANGUAGE_DISPLAY[lang]
      return (
        <button class="flex flex-col items-center justify-center h-[64px] bg-white border border-brand-border rounded-[10px]">
          {/* NEW COMPACT FORMAT */}
          <span className="text-2xl mb-1">{info.emoji}</span>
          <span className="text-xl font-bold">{info.shortName}</span>
          <span className="text-xs text-vedic-gold">{info.scriptChar}</span>
        </button>
      )
    })}
  </div>
</section>
```

**Compact Format Implementation:**
```tsx
// File: apps/pandit/src/app/(auth)/language-list/page.tsx
// Replace lines 93-117 with this:

<motion.button 
  key={lang} 
  initial={{ opacity: 0, y: 16 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ delay: 0.04 * idx }} 
  onClick={() => handleSelect(lang)} 
  className={`relative flex flex-col items-center justify-center min-h-[64px] rounded-xl px-4 transition-all ${
    isSelected ? 'bg-saffron-light border-2 border-saffron' : 'bg-white border border-outline-variant hover:border-saffron'
  }`}
>
  <div className="flex flex-col items-center gap-1">
    {/* Emoji */}
    <span className="text-2xl xs:text-3xl mb-1" aria-hidden="true">
      {info.emoji}
    </span>
    
    {/* Short Name (2-4 chars) */}
    <span className={`text-xl font-bold ${
      isSelected ? 'text-saffron' : 'text-text-primary'
    }`}>
      {info.shortName}
    </span>
    
    {/* Script Character */}
    <span className={`text-xs ${
      isSelected ? 'text-saffron/70' : 'text-vedic-gold'
    }`}>
      {info.scriptChar}
    </span>
  </div>
  
  {/* Checkmark for selected state */}
  {isSelected && (
    <div className="absolute top-1 right-1">
      <svg className="h-4 w-4 text-saffron" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    </div>
  )}
</motion.button>
```

**Language Grid Checklist:**
- [ ] Grid: 2 columns on mobile
- [ ] Gap: 16px (gap-4)
- [ ] Button height: 64px minimum
- [ ] Border radius: 12px (rounded-xl)
- [ ] **NEW:** Emoji display (text-2xl)
- [ ] **NEW:** Short name (हि, En, த, etc.)
- [ ] **NEW:** Script character (अ, A, த, etc.)
- [ ] Selected state: Saffron border + background
- [ ] Checkmark icon on selected
- [ ] Staggered animation (0.04s delay per item)

---

### **Screen S-0.0.5: Language Confirmation**

**Reference:** `prompts/part 0/stitch_welcome_screen_0_15/language_choice_confirmation_s_0.0.5/code.html`  
**Target:** `apps/pandit/src/app/(auth)/language-confirm/page.tsx`

#### **Elements to Implement:**

**1. Language Display Card (CELEBRATORY)** 🔴 **CRITICAL CHANGE**
```tsx
// Reference HTML Line 56-71 (OLD FORMAT)
// OLD: <h1>भोजपुरी</h1><p>Bhojpuri</p>
// NEW: Emoji + shortName + scriptChar + nativeName

<div className="flex flex-col items-center gap-6">
  {/* Large Animated Emoji */}
  <motion.span 
    className="text-7xl xs:text-8xl"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    {langInfo.emoji}
  </motion.span>
  
  {/* Compact Display */}
  <div className="text-center space-y-2">
    <h1 className="text-5xl xs:text-6xl font-bold text-saffron">
      {langInfo.shortName}
    </h1>
    <p className="text-2xl text-vedic-gold">
      {langInfo.scriptChar}
    </p>
    <p className="text-lg text-text-secondary">
      {langInfo.nativeName}
    </p>
  </div>
</div>
```

**Implementation:**
```tsx
// File: apps/pandit/src/app/(auth)/language-confirm/page.tsx
// Replace lines 42-55 with this:

<motion.div 
  initial={{ scale: 0.5, opacity: 0 }} 
  animate={{ scale: 1, opacity: 1 }} 
  transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }} 
  className="flex flex-col items-center gap-6 xs:gap-8"
>
  {/* Animated Emoji */}
  <motion.div 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
    className="relative"
  >
    {/* Glow Effect */}
    <div className="absolute inset-0 bg-saffron/20 blur-3xl rounded-full animate-pulse" />
    <span className="relative text-7xl xs:text-8xl sm:text-9xl">
      {langInfo.emoji}
    </span>
  </motion.div>
  
  {/* Language Info */}
  <div className="text-center space-y-3">
    {/* Short Name (Hero) */}
    <motion.h1 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-5xl xs:text-6xl sm:text-[72px] font-bold text-saffron leading-tight"
    >
      {langInfo.shortName}
    </motion.h1>
    
    {/* Script Character */}
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-2xl xs:text-3xl text-vedic-gold"
    >
      {langInfo.scriptChar}
    </motion.p>
    
    {/* Full Native Name */}
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="text-lg xs:text-xl text-text-secondary mt-4"
    >
      {langInfo.nativeName}
    </motion.p>
  </div>
</motion.div>
```

**Checklist:**
- [ ] Emoji: 7xl (mobile), 8xl (tablet), 9xl (desktop)
- [ ] Emoji animation: Gentle scale pulse
- [ ] Glow effect behind emoji
- [ ] Short name: 5xl-6xl, bold, saffron color
- [ ] Script character: 2xl-3xl, vedic-gold
- [ ] Native name: lg-xl, text-secondary
- [ ] Staggered entrance animations

**2. Confirmation Question** ✅
```tsx
// Reference HTML Line 74-78
<div class="pt-4">
  <h2 class="text-[26px] font-semibold text-bhagwa-dark">
    क्या यही भाषा सही है?
  </h2>
</div>
```
- [ ] Font size: 26px
- [ ] Font weight: semibold (600)
- [ ] Color: `#2D1B00` (brand-dark)

**3. Voice Status Indicator** ✅
```tsx
// Reference HTML Line 81-91
<div class="flex items-center justify-center gap-1.5 h-10">
  <div class="voice-bar w-1.5 bg-bhagwa-primary rounded-full"></div>
  <div class="voice-bar w-1.5 bg-bhagwa-primary rounded-full"></div>
  <!-- 5 bars total -->
</div>
```
- [ ] 5 voice bars
- [ ] Width: 1.5 (6px)
- [ ] Height: 12-32px (animated)
- [ ] Color: `#F09942` (primary / bhagwa-primary)
- [ ] Animation: voiceWave (1.2s infinite)

**4. Action Buttons** ✅
```tsx
// Reference HTML Line 96-107
<button class="w-full bg-bhagwa-primary text-white text-[20px] font-semibold py-4 rounded-2xl shadow-lg">
  हाँ, यही भाषा चाहिए
</button>
<button class="w-full bg-transparent text-bhagwa-brown text-[18px] font-medium py-2 hover:underline">
  नहीं, फिर से चुनूँगा
</button>
```
- [ ] Primary button: h-16, bg-saffron, white text, 20px font
- [ ] Secondary button: transparent, saffron text, 18px font
- [ ] Border radius: 16px (rounded-2xl)
- [ ] Shadow on primary

**5. Keyboard Toggle** ✅
```tsx
// Reference HTML Line 112-122
<div class="absolute -bottom-4 right-0">
  <button class="p-3 bg-bhagwa-dark/5 rounded-full text-bhagwa-dark/60">
    <svg>keyboard icon</svg>
  </button>
</div>
```
- [ ] Position: absolute bottom-right
- [ ] Background: transparent with slight tint
- [ ] Icon: Keyboard (24x24)
- [ ] Border radius: full (rounded-full)

---

### **Screen S-0.0.6: Language Set Celebration**

**Reference:** `prompts/part 0/stitch_welcome_screen_0_15/language_set_celebration_s_0.0.6/code.html`  
**Target:** `apps/pandit/src/app/(auth)/language-set/page.tsx`

#### **Elements to Implement:**

**1. Celebration Layout** ✅
```tsx
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-saffron-light to-vedic-cream">
  {/* Content centered vertically and horizontally */}
</div>
```
- [ ] Background gradient: `from-saffron-light to-vedic-cream`
- [ ] Min height: screen (min-h-screen)
- [ ] Flex: column, center items

**2. Animated Emoji** ✅
```tsx
<motion.span 
  className="text-8xl"
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: 'spring', bounce: 0.5 }}
>
  {langInfo.emoji}
</motion.span>
```
- [ ] Size: 8xl-9xl
- [ ] Animation: Bounce in from top
- [ ] Spring physics

**3. Celebration Text** ✅
```tsx
<div className="mt-8 text-center space-y-3">
  <h1 className="text-6xl font-bold text-saffron">{langInfo.shortName}</h1>
  <p className="text-2xl text-vedic-gold">{langInfo.scriptChar}</p>
  <p className="text-xl text-text-primary">{langInfo.nativeName}</p>
  <p className="text-lg text-text-secondary mt-4">सेट हो गई ✓</p>
</div>
```
- [ ] Short name: 6xl, bold, saffron
- [ ] Script char: 2xl, vedic-gold
- [ ] Native name: xl, text-primary
- [ ] Success message: lg, text-secondary
- [ ] Spacing: space-y-3

---

## ✅ PART 1: HOMEPAGE

### **Screen E-01: Homepage**

**Reference:** `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/homepage_e_01/code.html`  
**Target:** `apps/pandit/src/app/(auth)/homepage/page.tsx` (Create new)

#### **Elements to Implement:**

**1. Sacred Gradient Background** ✅
```tsx
// Reference HTML Line 73-75, 93
<div class="fixed inset-0 sacred-gradient -z-10"></div>

// CSS (Line 73-75):
.sacred-gradient {
  background: linear-gradient(135deg, #FF8C00 0%, #FFFDF7 40%, #FFFDF7 100%);
}
```
- [ ] Gradient: 135deg, `#FF8C00` → `#FFFDF7`
- [ ] Position: fixed inset, z-index -10

**2. Top Bar with Language Switcher** ✅
```tsx
// Reference HTML Line 99-110
<nav class="flex justify-between items-center w-full mb-10">
  <div class="flex items-center gap-2">
    <span class="font-headline text-primary text-xl font-bold tracking-tight">
      HmarePanditJi 🪔
    </span>
  </div>
  <button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
    <span class="material-symbols-outlined">language</span>
  </button>
</nav>
```
- [ ] Flex: justify-between, items-center
- [ ] Logo: "HmarePanditJi 🪔", xl bold, primary color
- [ ] Language button: 40x40, rounded-full, shadow-sm
- [ ] Icon: Material Symbols "language"

**3. Hero Section** ✅
```tsx
// Reference HTML Line 113-123
<header class="mb-12">
  <h1 class="font-headline text-3xl font-bold text-on-surface leading-tight mb-4 font-devanagari">
    पंडित जी का वक्त पूजा में लगे, बाकी सब हम सँभालेंगे
  </h1>
  <p class="text-primary font-medium text-lg font-devanagari">
    आपकी आध्यात्मिक यात्रा का डिजिटल साथी
  </p>
</header>
```
- [ ] Headline: 3xl, bold, font-serif (Noto Serif)
- [ ] Subheading: lg, medium, primary color
- [ ] Font: Devanagari for Hindi text
- [ ] Margin bottom: 12 (mb-12)

**4. Customer Card (Indigo Tint)** ✅
```tsx
// Reference HTML Line 127-138
<div class="relative overflow-hidden p-8 rounded-3xl bg-indigo-50/60 border border-indigo-100/50 shadow-sm">
  <div class="mb-4 text-5xl">🙏</div>
  <h2 class="text-2xl font-bold text-indigo-900 font-devanagari mb-2">
    मुझे पंडित चाहिए
  </h2>
  <p class="text-indigo-700/80 text-sm">Find verified priests for your rituals</p>
  <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl"></div>
</div>
```
- [ ] Background: indigo-50/60 (light indigo tint)
- [ ] Border: indigo-100/50
- [ ] Padding: 8 (p-8)
- [ ] Border radius: 3xl (24px)
- [ ] Emoji: 🙏 (5xl)
- [ ] Title: 2xl, bold, indigo-900
- [ ] Subtitle: sm, indigo-700/80
- [ ] Decorative blur: bottom-right corner

**5. Pandit Card (Primary Elevated)** ✅
```tsx
// Reference HTML Line 141-161
<div class="relative overflow-hidden p-8 rounded-3xl bg-white shadow-[0px_8px_24px_rgba(144,77,0,0.08)] border-l-4 border-primary">
  <div class="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
    <span class="w-2 h-2 rounded-full bg-secondary"></span>
    Joining free
  </div>
  <div class="mb-4 text-5xl">🪔</div>
  <h2 class="text-2xl font-bold text-on-surface font-devanagari mb-6">
    क्या आप एक पंडित हैं?
  </h2>
  <button class="w-full h-14 bg-gradient-to-b from-primary-container to-tertiary-container text-white font-bold rounded-xl shadow-lg">
    Pandit Ke Roop Mein Judein 🪔
  </button>
  <p class="mt-4 text-on-surface-variant text-sm font-devanagari">
    पंजीकरण में मात्र २ मिनट लगेंगे
  </p>
</div>
```
- [ ] Background: white (surface-container-lowest)
- [ ] Shadow: `0px_8px_24px_rgba(144,77,0,0.08)`
- [ ] Left border: 4px primary (saffron)
- [ ] Badge: "Joining free" with green dot
- [ ] Emoji: 🪔 (5xl)
- [ ] Title: 2xl, bold
- [ ] Button: h-14, gradient (primary-container → tertiary-container)
- [ ] Helper text: sm, on-surface-variant

**6. Footer Section** ✅
```tsx
// Reference HTML Line 165-181
<footer class="mt-12 flex flex-col items-center gap-6">
  <div class="flex items-center gap-2">
    <span className="text-on-surface-variant">पहले से जुड़े हैं?</span>
    <a className="text-primary font-bold underline" href="#">Login</a>
  </div>
  <div class="flex flex-col items-center bg-surface-container-low w-full py-4 rounded-2xl gap-1">
    <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
      Help & Support
    </span>
    <div class="flex items-center gap-2 text-primary">
      <span class="material-symbols-outlined">support_agent</span>
      <span className="font-bold text-lg">+91 1800-PANDIT</span>
    </div>
  </div>
</footer>
```
- [ ] "Already joined?" text
- [ ] Login link: primary color, bold, underlined
- [ ] Help & Support card
- [ ] Background: surface-container-low
- [ ] Padding: py-4
- [ ] Border radius: 2xl
- [ ] Support icon + phone number

---

## 📊 TESTING CHECKLIST

### **Visual Testing (All Screens)**

**Viewport Testing:**
- [ ] iPhone 14 Pro (393x852)
- [ ] iPhone 14 Pro Max (430x932)
- [ ] Small Android (360x800)
- [ ] iPad Mini (768x1024)

**Touch Target Testing:**
- [ ] All buttons min 48px height (ideally 56-64px)
- [ ] All interactive elements min 48x48px
- [ ] Adequate spacing between buttons (min 8px)

**Typography Testing:**
- [ ] Body text min 16px (readable without glasses)
- [ ] Headings use correct font sizes
- [ ] Line heights appropriate (1.2-1.5)

**Color Testing:**
- [ ] All colors match reference HTML exactly
- [ ] Saffron: `#F09942` (primary)
- [ ] Background: `#FFFBF5` (vedic-cream)
- [ ] Text primary: `#2D1B00` (vedic-brown)
- [ ] Text secondary: `#6B4F2A` (vedic-brown-2)

**Animation Testing:**
- [ ] Staggered animations on grid items
- [ ] Smooth transitions (no jank)
- [ ] Animations complete in <1s
- [ ] No motion sickness triggers

---

## ♿ ACCESSIBILITY CHECKLIST

**Screen Reader:**
- [ ] All images have alt text
- [ ] All buttons have aria-label
- [ ] Language names announced correctly
- [ ] Focus order logical

**Keyboard Navigation:**
- [ ] Tab through all elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] Focus indicators visible

**High Contrast:**
- [ ] Text contrast ratio >4.5:1
- [ ] Button borders visible
- [ ] Focus rings visible

---

## 🎯 ACCEPTANCE CRITERIA

### **Language List Screen (S-0.0.4):**
- [ ] Grid displays all 15 languages
- [ ] Compact format: emoji + shortName + scriptChar
- [ ] Voice search section present
- [ ] Text search works
- [ ] Selected state shows checkmark
- [ ] Staggered animations smooth
- [ ] Touch targets min 64px height

### **Language Confirmation (S-0.0.5):**
- [ ] Large animated emoji
- [ ] Compact display (shortName prominent)
- [ ] Voice status indicator (5 bars)
- [ ] Two action buttons (हाँ/नहीं)
- [ ] Keyboard toggle visible

### **Language Set (S-0.0.6):**
- [ ] Celebration layout centered
- [ ] Animated emoji with glow
- [ ] Success message
- [ ] Auto-advance after 1.8s

### **Homepage (E-01):**
- [ ] Sacred gradient background
- [ ] Two cards (Customer + Pandit)
- [ ] Language switcher in top bar
- [ ] Help & Support footer
- [ ] All animations smooth

---

**END OF CHECKLIST**

**Last Updated:** March 28, 2026  
**Maintained By:** Frontend Team Lead  
**Version:** 1.0
