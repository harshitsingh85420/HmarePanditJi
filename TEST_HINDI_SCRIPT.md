# Test Instructions for Hindi Script Logo

## Quick Test Guide

### Test 1: Native Hindi Script (शुद्ध हिंदी)

1. **Start the app:**
   ```bash
   cd apps/pandit
   pnpm dev
   ```

2. **Navigate to onboarding:**
   - Open browser to `http://localhost:3003/onboarding`
   - Or whatever port your dev server runs on

3. **Complete language selection:**
   - Click through splash screen
   - Select "Hindi" language (or let it auto-detect)
   - Continue to script choice screen

4. **Observe Script Choice Screen:**
   - **Expected:** Logo shows "HmarePanditJi" (Latin script)
   - This is correct because user hasn't chosen script preference yet

5. **Select "शुद्ध हिंदी" (Pure Hindi) option:**
   - Click the orange button with "शुद्ध हिंदी"

6. **Observe Voice Tutorial Screen:**
   - **Expected:** Logo now shows "हमारेपंडितजी" (Hindi script)
   - The ॐ symbol remains, but text changes to Hindi

7. **Continue through tutorial screens:**
   - All 12 tutorial screens should show "हमारेपंडितजी"
   - TopBar on each screen displays Hindi script logo

### Test 2: Latin Hindi Script (हिंदी + अंग्रेज़ी)

1. **Restart the onboarding:**
   - Go to `http://localhost:3003/onboarding?reset=true`
   - This clears all saved state

2. **Complete language selection again:**
   - Select "Hindi" language
   - Continue to script choice screen

3. **Select "हिंदी + अंग्रेज़ी" (Hindi + English) option:**
   - Click the green button with "हिंदी + अंग्रेज़ी"

4. **Observe Voice Tutorial Screen:**
   - **Expected:** Logo shows "HmarePanditJi" (Latin script)
   - Text remains in Latin/English characters

5. **Continue through tutorial screens:**
   - All tutorial screens should show "HmarePanditJi"
   - Logo stays in Latin script throughout

## What to Look For

### ✅ Success Indicators

1. **Script Choice Screen:**
   - Logo: "HmarePanditJi" (always Latin before choice is made)

2. **After selecting शुद्ध हिंदी:**
   - Voice Tutorial screen logo: "हमारेपंडितजी"
   - All tutorial screens: "हमारेपंडितजी"
   - TopBar component shows Hindi text

3. **After selecting हिंदी + अंग्रेज़ी:**
   - Voice Tutorial screen logo: "HmarePanditJi"
   - All tutorial screens: "HmarePanditJi"
   - TopBar component shows Latin text

### ❌ Error Indicators

1. Logo doesn't change after script selection
2. Logo shows wrong script (e.g., Hindi when Latin was selected)
3. Console errors about missing translations
4. TopBar crashes or shows undefined

## Screens Affected

The following screens will show the translated logo:

1. ✅ Voice Tutorial Screen
2. ✅ Tutorial Screen 1-12 (Swagat through CTA)
3. ✅ Language List Screen (if revisited)
4. ✅ Language Choice Confirm Screen (if revisited)

The following screens keep the default logo:

1. ⚪ Script Choice Screen (before selection is made)
2. ⚪ Registration Complete Screen (uses default TopBar)

## Visual Comparison

### Before Implementation
```
All screens: ॐ HmarePanditJi
```

### After Implementation - Native Script
```
Script Choice:  ॐ HmarePanditJi     (before selection)
After Choice:   ॐ हमारेपंडितजी      (after selecting native)
```

### After Implementation - Latin Script
```
Script Choice:  ॐ HmarePanditJi     (before selection)
After Choice:   ॐ HmarePanditJi     (after selecting latin)
```

## Browser Console Check

Open browser DevTools (F12) and check the Console tab while testing:

**Expected:** No errors related to TopBar or translations

**If you see errors like:**
- `Cannot read property 'native' of undefined` → Language not in translation map
- `getBrandName is not defined` → Import issue
- `TopBar received invalid props` → Component prop issue

## Advanced: Check State in localStorage

1. Open DevTools → Application → Local Storage
2. Look for key: `hpj_pandit_onboarding_v1`
3. Check the value:
   ```json
   {
     "scriptPreference": "native",
     "selectedLanguage": "Hindi",
     ...
   }
   ```
   or
   ```json
   {
     "scriptPreference": "latin",
     "selectedLanguage": "Hindi",
     ...
   }
   ```

## Troubleshooting

### Logo not changing after script selection

**Check:** Is `scriptPreference` being passed to TopBar?
```bash
# Search for TopBar usage
grep -r "scriptPreference=" apps/pandit/src/app/onboarding/
```

### Translation not working

**Check:** Is the language in the BRAND_NAME_TRANSLATION map?
```typescript
// In onboarding-store.ts
export const BRAND_NAME_TRANSLATION = {
  'Hindi': { native: 'हमारेपंडितजी', latin: 'HmarePanditJi' },
  // ... should have all 15 languages
}
```

### TypeScript errors

**Check:** Are the types imported correctly?
```typescript
import { SupportedLanguage, ScriptPreference, getBrandName } from '@/lib/onboarding-store'
```

## Success Criteria

✅ Logo changes from "HmarePanditJi" to "हमारेपंडितजी" when native script is selected
✅ Logo stays "HmarePanditJi" when Latin script is selected  
✅ No console errors
✅ All tutorial screens show consistent logo
✅ Changes are smooth and immediate (no delay)
✅ Back button navigation maintains correct logo
✅ Language changes maintain correct logo

## Next Steps After Testing

If all tests pass:
1. Commit the changes
2. Create a PR
3. Add screenshots to PR description showing both script variants
4. Request review from team

If tests fail:
1. Note the specific issue
2. Check browser console for errors
3. Verify state is being saved correctly
4. Ensure all TopBar instances are updated
