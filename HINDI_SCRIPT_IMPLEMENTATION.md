# Hindi Script Support Implementation

## Overview
This document describes the implementation of Hindi script support for the HmarePanditJi app logo/brand name. When users select "शुद्ध हिंदी" (Pure Hindi) script preference, the app logo now displays in Hindi script (हमारेपंडितजी) instead of Latin script (HmarePanditJi).

## Changes Made

### 1. Added Brand Name Translations (`apps/pandit/src/lib/onboarding-store.ts`)

Added a comprehensive translation map for the brand name across all supported languages:

```typescript
export const BRAND_NAME_TRANSLATION: Record<string, {native: string, latin: string}> = {
  'Hindi': {
    native: 'हमारेपंडितजी',
    latin: 'HmarePanditJi',
  },
  'Bhojpuri': {
    native: 'हमारेपंडितजी',
    latin: 'HmarePanditJi',
  },
  // ... translations for all 15 supported languages
}
```

Added helper function:
```typescript
export function getBrandName(
  language: SupportedLanguage, 
  scriptPreference: 'native' | 'latin' | null
): string
```

This function returns:
- **Native script name** when `scriptPreference === 'native'` (e.g., हमारेपंडितजी for Hindi)
- **Latin script name** when `scriptPreference === 'latin'` or null (e.g., HmarePanditJi)

### 2. Updated TopBar Components

#### `apps/pandit/src/components/TopBar.tsx`
- Added `language` and `scriptPreference` props
- Uses `getBrandName()` to dynamically display the correct script
- Maintains backward compatibility with default values

#### `apps/pandit/src/components/ui/TopBar.tsx`
- Same updates as above for the UI variant

### 3. Updated Tutorial Components (11 files)

All tutorial screen components now pass language and scriptPreference to TopBar:

- `TutorialSwagat.tsx`
- `TutorialIncome.tsx`
- `TutorialDakshina.tsx`
- `TutorialOnlineRevenue.tsx`
- `TutorialBackup.tsx`
- `TutorialPayment.tsx`
- `TutorialVoiceNav.tsx`
- `TutorialDualMode.tsx`
- `TutorialTravel.tsx`
- `TutorialVideoVerify.tsx`
- `TutorialGuarantees.tsx`
- `TutorialCTA.tsx`

Each component:
- Added `scriptPreference: ScriptPreference | null` to props interface
- Imported `ScriptPreference` type
- Passes `language` and `scriptPreference` to `<TopBar>`

### 4. Updated Other Onboarding Screens

#### `VoiceTutorialScreen.tsx`
- Passes `language` and `scriptPreference` to TopBar

#### `LanguageListScreen.tsx`
- Added optional `scriptPreference` prop
- Passes both props to TopBar

#### `LanguageChoiceConfirmScreen.tsx`
- Added optional `scriptPreference` prop
- Passes both props to TopBar

#### `ScriptChoiceScreen.tsx`
- Kept as "HmarePanditJi" (this is where users CHOOSE their script preference)
- No changes needed since script preference isn't set yet

## How It Works

### User Flow

1. **User selects language** (e.g., Hindi)
2. **User reaches Script Choice screen** - sees "HmarePanditJi" logo
3. **User selects "शुद्ध हिंदी" (native script)**
   - `scriptPreference` is set to `'native'`
   - All subsequent screens show logo as "हमारेपंडितजी"
4. **OR User selects "हिंदी + अंग्रेज़ी" (latin script)**
   - `scriptPreference` is set to `'latin'`
   - All subsequent screens show logo as "HmarePanditJi"

### Code Flow

```typescript
// User selects native script
handleScriptChoiceToVoiceTutorial('native')
  ↓
// State is saved in onboarding store
state.scriptPreference = 'native'
  ↓
// TopBar component receives props
<TopBar 
  language="Hindi"
  scriptPreference="native"
/>
  ↓
// getBrandName returns native script
getBrandName('Hindi', 'native') → 'हमारेपंडितजी'
  ↓
// Logo displays in Hindi script
<span>हमारेपंडितजी</span>
```

## Brand Name Translations by Language

| Language | Native Script | Latin Script |
|----------|---------------|--------------|
| Hindi | हमारेपंडितजी | HmarePanditJi |
| Bengali | আমাদেরপণ্ডিতজী | AmaderPanditJi |
| Tamil | நமத்பண்டித்ஜீ | NamathPanditJi |
| Telugu | మనపండిత్‌జీ | ManaPanditJi |
| Marathi | आमारेपंडितजी | AamarePanditJi |
| Gujarati | આપડાપંડિતજી | AapdaPanditJi |
| Kannada | ನಮಪಂಡಿತಜೀ | NamaPanditJi |
| Malayalam | നമത്പണ്ഡിതജീ | NamathPanditJi |
| Punjabi | ਸਾਡੇਪੰਡਿਤਜੀ | SaadePanditJi |
| Odia | ଆମପଣ୍ଡିତଜୀ | AmaPanditJi |
| Assamese | আমাৰপণ্ডিতজী | AmarPanditJi |
| Sanskrit | अस्माकपण्डितजी | AsmakaPanditJi |
| Bhojpuri | हमारेपंडितजी | HmarePanditJi |
| Maithili | हमरेपंडितजी | HamrePanditJi |
| English | OurPanditJi | OurPanditJi |

## Testing

To test the implementation:

1. Start the pandit app: `cd apps/pandit && pnpm dev`
2. Navigate to `/onboarding`
3. Select Hindi language
4. On the script choice screen, notice the logo shows "HmarePanditJi"
5. Click "शुद्ध हिंदी" (Pure Hindi)
6. On all subsequent screens (Voice Tutorial, Tutorial screens), the logo should display as "हमारेपंडितजी"
7. Restart and select "हिंदी + अंग्रेज़ी" instead
8. Logo should remain as "HmarePanditJi" on all screens

## Future Improvements

1. **Dynamic Language Support**: Currently all TopBar components default to Hindi. Could be enhanced to use the user's selected language from context/store.

2. **Registration Pages**: The registration complete page uses TopBar without language/scriptPreference props. Since users have already completed script selection, these could be updated to use saved preferences from the onboarding store.

3. **Consistent Translation Pattern**: This implementation creates a pattern that can be reused for other UI text that needs script-aware translations.

## Technical Notes

- All changes are **backward compatible** - default values ensure existing code continues to work
- Uses **TypeScript types** for type safety (`SupportedLanguage`, `ScriptPreference`)
- Follows the project's **existing patterns** for component structure
- **No breaking changes** - all new props are optional with sensible defaults
