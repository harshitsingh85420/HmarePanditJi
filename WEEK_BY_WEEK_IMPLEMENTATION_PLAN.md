# 📅 HmarePanditJi - Week-by-Week Implementation Plan

**Date:** March 28, 2026  
**Status:** Ready to Execute  
**UI Reference:** `prompts/part 0/stitch_welcome_screen_0_15/` + `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/`

---

## 🎯 WEEK 1 (March 28 - April 3): UI Foundation + Critical Fixes

### **Day 1-2 (March 28-29): Language Display UI Update**

**Priority:** 🔴 **CRITICAL**  
**Assigned to:** Frontend Developer (Arjun Mehta)  
**Budget:** Already included in previous ₹10,000  
**Timeline:** 2 days

---

#### **Task 1.1: Update Language Grid to Compact Format**

**Reference HTML:** `prompts/part 0/stitch_welcome_screen_0_15/language_list_s_0.0.4/code.html`

**Current Issue:**
```tsx
// Line 97-98 in language-list/page.tsx
<span className="text-lg xs:text-xl sm:text-[26px] font-bold leading-tight">
  {info.nativeName}
</span>
<span className="text-sm xs:text-base sm:text-[22px] text-saffron leading-tight mt-1">
  {info.latinName}
</span>
// Output: "हिंदी / Hindi" (takes too much space)
```

**Required Change:**
```tsx
// Replace with compact format + emoji + scriptChar
<div className="flex flex-col items-center gap-1">
  <span className="text-3xl mb-1">{info.emoji}</span>
  <span className="text-xl xs:text-2xl font-bold text-text-primary">
    {info.shortName}
  </span>
  <span className="text-xs text-vedic-gold">
    {info.scriptChar}
  </span>
</div>
```

**Files to Update:**
1. `apps/pandit/src/app/(auth)/language-list/page.tsx` (Line 93-117)
2. `apps/pandit/src/app/onboarding/screens/LanguageListScreen.tsx` (Line 100-120)

**Step-by-Step:**

**Step 1:** Open `apps/pandit/src/app/(auth)/language-list/page.tsx`

**Step 2:** Find the language grid section (around line 88-120):
```tsx
<section className="px-4 xs:px-6 flex-1 overflow-y-auto pb-6 xs:pb-8">
  <div className="grid grid-cols-2 gap-2 xs:gap-3">
    {filteredLanguages.map((lang, idx) => {
      const info = LANGUAGE_DISPLAY[lang]
      const isSelected = selectedLanguage === lang
      return (
        <motion.button key={lang} ...>
          {/* CURRENT CODE - REPLACE THIS */}
          <span className={`text-lg xs:text-xl sm:text-[26px] font-bold leading-tight ${isSelected ? 'text-saffron' : 'text-text-primary'}`}>
            {info.nativeName}
          </span>
          <span className="text-sm xs:text-base sm:text-[22px] text-saffron leading-tight mt-1">
            {info.latinName}
          </span>
        </motion.button>
      )
    })}
  </div>
</section>
```

**Step 3:** Replace with compact format:
```tsx
<motion.button 
  key={lang} 
  initial={{ opacity: 0, y: 16 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ delay: 0.04 * idx }} 
  onClick={() => handleSelect(lang)} 
  className={`relative flex flex-col items-center justify-center min-h-[64px] xs:min-h-[72px] sm:min-h-[96px] rounded-xl px-3 xs:px-4 sm:px-5 transition-all ${
    isSelected ? 'bg-saffron-light border-2 border-saffron' : 'bg-white border border-outline-variant hover:border-saffron'
  }`}
>
  {/* Emoji + Compact Display */}
  <div className="flex flex-col items-center gap-1">
    {/* Emoji (only for unselected state) */}
    {!isSelected && (
      <span className="text-2xl xs:text-3xl mb-1" aria-hidden="true">
        {info.emoji}
      </span>
    )}
    
    {/* Short Name (2-4 chars) */}
    <span className={`text-xl xs:text-2xl font-bold leading-tight ${
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
    <div className="absolute top-1 xs:top-2 right-1 xs:right-2">
      <svg className="h-4 w-4 xs:h-5 xs:w-5 text-saffron" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    </div>
  )}
</motion.button>
```

**Step 4:** Test on mobile viewport:
```bash
# Open Chrome DevTools
# Set device to iPhone 14 Pro (393x852)
# Verify all 15 languages fit in 2-column grid
# Check that buttons are min 64px height (touch target)
```

---

#### **Task 1.2: Update Language Confirmation Screen**

**Reference HTML:** `prompts/part 0/stitch_welcome_screen_0_15/language_choice_confirmation_s_0.0.5/code.html`

**Current Issue:**
```tsx
// Line 49-50 in language-confirm/page.tsx
<h1 className="text-4xl xs:text-5xl sm:text-[56px] font-bold text-saffron leading-tight">
  {langInfo.nativeName}
</h1>
<p className="text-lg xs:text-xl sm:text-[24px] font-normal text-text-secondary mt-2">
  {langInfo.latinName}
</p>
```

**Required Change (Compact + Celebratory):**
```tsx
<div className="flex flex-col items-center gap-4">
  {/* Large Emoji */}
  <span className="text-7xl xs:text-8xl sm:text-9xl animate-bounce">
    {langInfo.emoji}
  </span>
  
  {/* Compact Display */}
  <div className="text-center space-y-2">
    <h1 className="text-5xl xs:text-6xl sm:text-[72px] font-bold text-saffron leading-tight">
      {langInfo.shortName}
    </h1>
    <p className="text-2xl xs:text-3xl text-vedic-gold">
      {langInfo.scriptChar}
    </p>
    <p className="text-lg xs:text-xl text-text-secondary mt-4">
      {langInfo.nativeName}
    </p>
  </div>
</div>
```

**Files to Update:**
1. `apps/pandit/src/app/(auth)/language-confirm/page.tsx` (Line 45-55)
2. `apps/pandit/src/app/onboarding/screens/LanguageChoiceConfirmScreen.tsx` (Line 85-95)

**Step-by-Step:**

**Step 1:** Open `apps/pandit/src/app/(auth)/language-confirm/page.tsx`

**Step 2:** Find the language card section (around line 42-55):
```tsx
<motion.div 
  initial={{ scale: 0.8, opacity: 0 }} 
  animate={{ scale: 1, opacity: 1 }} 
  transition={{ duration: 0.7, type: 'spring' }} 
  className="space-y-4 xs:space-y-6 text-center"
>
  <div className="text-6xl xs:text-7xl sm:text-8xl">{langInfo.scriptChar}</div>
  <div>
    <h1 className="text-4xl xs:text-5xl sm:text-[56px] font-bold text-saffron leading-tight">
      {langInfo.nativeName}
    </h1>
    <p className="text-lg xs:text-xl sm:text-[24px] font-normal text-text-secondary mt-2">
      {langInfo.latinName}
    </p>
  </div>
</motion.div>
```

**Step 3:** Replace with celebratory format:
```tsx
<motion.div 
  initial={{ scale: 0.5, opacity: 0 }} 
  animate={{ scale: 1, opacity: 1 }} 
  transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }} 
  className="flex flex-col items-center gap-6 xs:gap-8"
>
  {/* Large Animated Emoji */}
  <motion.div 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
    className="text-7xl xs:text-8xl sm:text-9xl"
  >
    {langInfo.emoji}
  </motion.div>
  
  {/* Language Display */}
  <div className="text-center space-y-3 xs:space-y-4">
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

**Step 4:** Add glow effect behind emoji (optional but matches reference):
```tsx
{/* Glow Effect Behind Emoji */}
<div className="relative">
  <div className="absolute inset-0 bg-saffron/20 blur-3xl rounded-full animate-pulse" />
  <motion.div 
    className="relative text-7xl xs:text-8xl sm:text-9xl"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    {langInfo.emoji}
  </motion.div>
</div>
```

---

#### **Task 1.3: Update Language Set Celebration Screen**

**Reference HTML:** `prompts/part 0/stitch_welcome_screen_0_15/language_set_celebration_s_0.0.6/code.html`

**Files to Update:**
1. `apps/pandit/src/app/(auth)/language-set/page.tsx` (Line 35-45)
2. `apps/pandit/src/app/onboarding/screens/LanguageSetScreen.tsx` (Line 45-55)

**Required Code:**
```tsx
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-saffron-light to-vedic-cream">
  <div className="relative">
    {/* Animated Glow */}
    <motion.div 
      className="absolute inset-0 bg-saffron/20 blur-3xl rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    
    {/* Emoji */}
    <motion.span 
      className="relative text-8xl xs:text-9xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
    >
      {langInfo.emoji}
    </motion.span>
  </div>
  
  {/* Text */}
  <div className="mt-8 text-center space-y-3">
    <motion.h1 
      className="text-6xl xs:text-7xl font-bold text-saffron"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring' }}
    >
      {langInfo.shortName}
    </motion.h1>
    
    <motion.p 
      className="text-2xl text-vedic-gold"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {langInfo.scriptChar}
    </motion.p>
    
    <motion.p 
      className="text-xl text-text-primary"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      {langInfo.nativeName}
    </motion.p>
    
    <motion.p 
      className="text-lg text-text-secondary mt-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      सेट हो गई ✓
    </motion.p>
  </div>
</div>
```

---

### **Day 3-4 (March 30-31): Homepage UI Polish**

**Priority:** 🔴 **CRITICAL**  
**Assigned to:** Frontend Developer  
**Budget:** ₹5,000 (additional)  
**Timeline:** 2 days

---

#### **Task 1.4: Homepage E-01 Implementation**

**Reference HTML:** `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/homepage_e_01/code.html`

**Key UI Elements from Reference:**
```html
<!-- Sacred Gradient Background -->
<div class="fixed inset-0 sacred-gradient -z-10"></div>
<!-- sacred-gradient = linear-gradient(135deg, #FF8C00 0%, #FFFDF7 40%, #FFFDF7 100%) -->

<!-- Top Bar with Language Switcher -->
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

<!-- Hero Section -->
<header class="mb-12">
  <h1 class="font-headline text-3xl font-bold text-on-surface leading-tight mb-4 font-devanagari">
    पंडित जी का वक्त पूजा में लगे, बाकी सब हम सँभालेंगे
  </h1>
  <p class="text-primary font-medium text-lg font-devanagari">
    आपकी आध्यात्मिक यात्रा का डिजिटल साथी
  </p>
</header>

<!-- Card 1: Customer (Indigo Tint) -->
<div class="relative overflow-hidden p-8 rounded-3xl bg-indigo-50/60 border border-indigo-100/50 shadow-sm">
  <div class="mb-4 text-5xl">🙏</div>
  <h2 class="text-2xl font-bold text-indigo-900 font-devanagari mb-2">
    मुझे पंडित चाहिए
  </h2>
  <p class="text-indigo-700/80 text-sm">Find verified priests for your rituals</p>
</div>

<!-- Card 2: Pandit (Primary Elevated) -->
<div class="relative overflow-hidden p-8 rounded-3xl bg-white shadow-[0px_8px_24px_rgba(144,77,0,0.08)]">
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

**Files to Create/Update:**
1. `apps/pandit/src/app/(auth)/homepage/page.tsx` (Create new)
2. `apps/pandit/src/app/(auth)/layout.tsx` (Update with sacred gradient)

**Step-by-Step:**

**Step 1:** Create `apps/pandit/src/app/(auth)/homepage/page.tsx`:
```tsx
'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Homepage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen bg-surface-base overflow-hidden">
      {/* Sacred Gradient Background */}
      <div className="fixed inset-0 sacred-gradient -z-10" />
      
      {/* Main Content */}
      <div className="min-h-screen flex flex-col px-6 pb-12 pt-4">
        
        {/* Top Bar */}
        <nav className="flex justify-between items-center w-full mb-10">
          <div className="flex items-center gap-2">
            <span className="font-serif text-primary text-xl font-bold tracking-tight">
              HmarePanditJi 🪔
            </span>
          </div>
          <button 
            onClick={() => router.push('/language-list')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm text-primary transition-transform active:scale-90"
          >
            <span className="material-symbols-outlined">language</span>
          </button>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-serif text-3xl font-bold text-on-surface leading-tight mb-4 font-devanagari"
          >
            पंडित जी का वक्त पूजा में लगे,<br />
            बाकी सब हम सँभालेंगे
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-primary font-medium text-lg font-devanagari"
          >
            आपकी आध्यात्मिक यात्रा का डिजिटल साथी
          </motion.p>
        </header>

        {/* Main Cards */}
        <main className="flex-grow flex flex-col gap-6">
          
          {/* Card 1: Customer (Indigo Tint) */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden p-8 rounded-3xl bg-indigo-50/60 border border-indigo-100/50 shadow-sm flex flex-col items-center justify-center text-center active:scale-[0.98] transition-all"
          >
            <div className="mb-4 text-5xl">🙏</div>
            <h2 className="text-2xl font-bold text-indigo-900 font-devanagari mb-2">
              मुझे पंडित चाहिए
            </h2>
            <p className="text-indigo-700/80 text-sm">
              Find verified priests for your rituals
            </p>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl" />
          </motion.div>

          {/* Card 2: Pandit (Primary Elevated) */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden p-8 rounded-3xl bg-surface-container-lowest shadow-[0px_8px_24px_rgba(144,77,0,0.08)] flex flex-col items-center justify-center text-center border-l-4 border-primary active:scale-[0.98] transition-all"
          >
            {/* Badge */}
            <div className="absolute top-4 right-4 bg-success-lt text-success px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              Joining free
            </div>
            
            <div className="mb-4 text-5xl">🪔</div>
            <h2 className="text-2xl font-bold text-on-surface font-devanagari mb-6">
              क्या आप एक पंडित हैं?
            </h2>
            
            {/* Primary Saffron Button */}
            <button 
              onClick={() => router.push('/mobile')}
              className="w-full h-14 bg-gradient-to-b from-primary-container to-tertiary-container text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 px-6 active:scale-95 transition-transform"
            >
              Pandit Ke Roop Mein Judein 🪔
            </button>
            
            <p className="mt-4 text-on-surface-variant text-sm font-devanagari">
              पंजीकरण में मात्र २ मिनट लगेंगे
            </p>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant font-devanagari">पहले से जुड़े हैं?</span>
            <a className="text-primary font-bold decoration-primary/30 underline underline-offset-4" href="#">
              Login
            </a>
          </div>
          
          {/* Help & Support */}
          <div className="flex flex-col items-center bg-surface-container-low w-full py-4 rounded-2xl gap-1">
            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
              Help & Support
            </span>
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              <span className="font-bold text-lg">+91 1800-PANDIT</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
```

**Step 2:** Add sacred gradient to `apps/pandit/src/app/globals.css`:
```css
/* Add to globals.css */
.sacred-gradient {
  background: linear-gradient(135deg, #FF8C00 0%, #FFFDF7 40%, #FFFDF7 100%);
}

/* Material Symbols */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-family: 'Material Symbols Outlined';
}
```

---

### **Day 5-7 (April 1-3): Voice Script Integration**

**Priority:** 🔴 **CRITICAL**  
**Assigned to:** Backend Developer + Voice Script Specialist (once hired)  
**Budget:** ₹10,000 (Backend) + Voice Script Specialist budget  
**Timeline:** 3 days

---

#### **Task 1.5: Voice Scripts for All Language Screens**

**Reference:** `prompts/part 0/HPJ_Voice_System_Complete.md` (Lines 1-652)

**Scripts to Implement:**

**S-0.0.4 Language List:**
```typescript
// File: apps/pandit/src/lib/voice-scripts.ts
export const LANGUAGE_LIST_SCREEN = {
  scripts: {
    main: {
      hindi: "कृपया अपनी भाषा का नाम बोलिए। जैसे — 'भोजपुरी', 'Tamil', 'Telugu', 'Bengali' — या नीचे से चुनें।",
      english: "Please say your language name. For example — 'Bhojpuri', 'Tamil', 'Telugu', 'Bengali' — or select from below.",
    },
    timeout: {
      hindi: "आवाज़ नहीं पहचान पाया। नीचे से भाषा छूकर चुनें।",
      english: "Could not recognize voice. Please select language by touching below.",
    },
  },
}
```

**S-0.0.5 Language Confirmation:**
```typescript
export const LANGUAGE_CONFIRM_SCREEN = {
  scripts: {
    confirm: {
      hindi: "आपने भोजपुरी कही। सही है? 'हाँ' बोलें या 'नहीं' बोलें।",
      english: "You said Bhojpuri. Is this correct? Say 'Yes' or 'No'.",
    },
    success: {
      hindi: "बहुत अच्छा!",
      english: "Very good!",
    },
  },
}
```

**S-0.0.6 Language Set:**
```typescript
export const LANGUAGE_SET_SCREEN = {
  scripts: {
    celebration: {
      hindi: "बहुत अच्छा! अब हम आपसे हिंदी में बात करेंगे।",
      tamil: "Romba nalla! Ab hum aapse Tamil mein baat karenge.",
      telugu: "Chala manchidi! Ab hum aapse Telugu mein baat karenge.",
    },
  },
}
```

---

## 📅 WEEK 2 (April 4-10): Registration Flow + WebOTP

### **Day 1-2 (April 4-5): Mobile Number + OTP Screens**

**Priority:** 🟡 **HIGH**  
**Assigned to:** Frontend Developer  
**Budget:** ₹8,000  
**Timeline:** 2 days

**Reference Folders:**
- `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/mobile_collection_r_01/`
- `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/otp_verification_r_02/`

**Tasks:**
1. Update Mobile Number screen to match reference HTML
2. Update OTP screen to match reference HTML
3. Add WebOTP integration (already in `webotp.ts`)
4. Add voice integration for number dictation

---

### **Day 3-4 (April 6-7): Mic Permission + Location**

**Priority:** 🟡 **HIGH**  
**Assigned to:** Frontend Developer  
**Budget:** ₹6,000  
**Timeline:** 2 days

**Reference Folders:**
- `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/mic_permission_p_02_1/`
- `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/location_permission_s_0.0.2/`

**Tasks:**
1. Implement Mic Permission screen (P-02)
2. Implement Mic Denied Recovery (P-02-B)
3. Implement Location Permission (S-0.0.2)
4. Add voice tutorial overlay

---

### **Day 5-7 (April 8-10): QA Testing**

**Priority:** 🟡 **HIGH**  
**Assigned to:** QA Tester (to be hired)  
**Budget:** ₹25,000  
**Timeline:** 3 days

**Tasks:**
1. Test all language screens on 5 devices
2. Verify compact language display fits on all viewports
3. Test voice scripts in 5 languages
4. Log all bugs in standardized format

---

## 📅 WEEK 3 (April 11-17): Tutorial Screens (Part 0)

### **Day 1-3 (April 11-13): Tutorial Screens S-0.1 to S-0.6**

**Priority:** 🟢 **MEDIUM**  
**Assigned to:** Frontend Developer  
**Budget:** ₹12,000  
**Timeline:** 3 days

**Reference Folders:**
- `prompts/part 0/stitch_welcome_screen_0_15/welcome_s_0.1_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/income_hook_s_0.2_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/fixed_dakshina_s_0.3_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/online_revenue_s_0.4_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/backup_opportunity_4_15_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/instant_payment_5_15_animated/`

**Tasks:**
1. Update all 6 tutorial screens to match reference HTML
2. Add voice narration for each screen
3. Implement swipe gestures (forward/back)
4. Add progress dots (12 total)

---

### **Day 4-6 (April 14-16): Tutorial Screens S-0.7 to S-0.12**

**Priority:** 🟢 **MEDIUM**  
**Assigned to:** Frontend Developer  
**Budget:** ₹12,000  
**Timeline:** 3 days

**Reference Folders:**
- `prompts/part 0/stitch_welcome_screen_0_15/voice_navigation_7_15_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/dual_mode_8_15_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/travel_calendar_9_15_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/video_verification_10_15_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/4_guarantees_11_15_animated/`
- `prompts/part 0/stitch_welcome_screen_0_15/final_decision_12_15_animated/`

**Tasks:**
1. Update remaining 6 tutorial screens
2. Add voice navigation demo (S-0.7)
3. Add final CTA screen (S-0.12)
4. Implement skip functionality

---

### **Day 7 (April 17): Integration Testing**

**Priority:** 🟢 **MEDIUM**  
**Assigned to:** Backend Developer  
**Budget:** ₹5,000  
**Timeline:** 1 day

**Tasks:**
1. Test complete onboarding flow (S-0.0.1 → S-0.12)
2. Verify Sarvam TTS/STT on all screens
3. Fix any TypeScript errors
4. Optimize bundle size

---

## 📅 WEEK 4 (April 18-24): Polish + Launch

### **Day 1-3 (April 18-20): UI Polish**

**Priority:** 🟢 **MEDIUM**  
**Assigned to:** UI/UX Designer (to be hired)  
**Budget:** ₹20,000  
**Timeline:** 3 days

**Tasks:**
1. Compare all screens with HTML reference files
2. Fix spacing, colors, animations
3. Create missing illustrations
4. Export optimized assets

---

### **Day 4-5 (April 21-22): DevOps Deployment**

**Priority:** 🟢 **MEDIUM**  
**Assigned to:** DevOps Engineer (to be hired)  
**Budget:** ₹15,000  
**Timeline:** 2 days

**Tasks:**
1. Deploy to Vercel production
2. Set up Sentry error tracking
3. Configure Lighthouse CI
4. Set up uptime monitoring

---

### **Day 6-7 (April 23-24): Beta Testing**

**Priority:** 🟢 **MEDIUM**  
**Assigned to:** QA Tester + Product Lead  
**Budget:** Included in QA budget  
**Timeline:** 2 days

**Tasks:**
1. Beta test with 10 Pandits
2. Collect feedback
3. Fix critical bugs
4. Prepare for launch

---

## 📊 BUDGET SUMMARY BY WEEK

| Week | Tasks | Budget | Status |
|------|-------|--------|--------|
| **Week 1** | Language UI + Homepage + Voice Scripts | ₹25,000 | 🔴 In Progress |
| **Week 2** | Registration + Permissions + QA | ₹39,000 | ⏭️ Pending |
| **Week 3** | Tutorial Screens (12 total) | ₹29,000 | ⏭️ Pending |
| **Week 4** | Polish + DevOps + Beta | ₹35,000 | ⏭️ Pending |
| **TOTAL** | **4 Weeks** | **₹1,28,000** | |

**Already Spent:** ₹7,000 (TypeScript fix + Backend Day 1)  
**Week 1 Commitments:** ₹25,000 (Language UI + Homepage)  
**Remaining Budget from ₹5,19,000:** ₹3,91,000 (75% savings!)

---

## ✅ IMMEDIATE ACTIONS (TODAY - March 28)

1. **Pay Arjun Mehta:** ₹10,000 (Frontend Task Card 3 complete)
2. **Pay Rajesh Kumar:** ₹5,000 (Backend Day 1 complete)
3. **Post Voice Script Specialist Job** - CRITICAL PATH
4. **Start Task 1.1:** Update Language Grid (Arjun - 2 days)

---

**END OF WEEK-BY-WEEK PLAN**

**Next Review:** April 3, 2026 (10 AM IST)  
**Attendees:** All team members  
**Agenda:** Week 1 deliverables review, Week 2 planning
