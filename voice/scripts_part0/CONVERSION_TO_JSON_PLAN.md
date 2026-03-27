# Voice Scripts Conversion Plan

## Current Issue

Voice script files in `voice/scripts_part0/` are `.ts` files containing only data (no logic). These should be `.json` files for:
- Better separation of concerns (data vs code)
- Easier translation workflow
- Smaller bundle size (no TypeScript compilation)
- Better tooling support for translators

## Files to Convert

### Priority 1: Convert to JSON

These files contain only data and should be converted:

| Current File | Should Be | Size | Reason |
|-------------|-----------|------|--------|
| `09_S-0.1_Swagat.ts` | `09_S-0.1_Swagat.json` | 4796 lines | Pure data (375 scripts) |
| `10_S-0.2_Income_Hook.ts` | `10_S-0.2_Income_Hook.json` | ~500 lines | Pure data |
| `11_S-0.3_Fixed_Dakshina.ts` | `11_S-0.3_Fixed_Dakshina.json` | ~500 lines | Pure data |
| `12_S-0.4_Online_Revenue.ts` | `12_S-0.4_Online_Revenue.json` | ~500 lines | Pure data |
| `13_S-0.5_Backup_Pandit.ts` | `13_S-0.5_Backup_Pandit.json` | ~500 lines | Pure data |
| `14_S-0.6_Instant_Payment.ts` | `14_S-0.6_Instant_Payment.json` | ~500 lines | Pure data |
| `15_S-0.7_Voice_Nav_Demo.ts` | `15_S-0.7_Voice_Nav_Demo.json` | ~500 lines | Pure data |
| `16_S-0.8_Dual_Mode.ts` | `16_S-0.8_Dual_Mode.json` | ~500 lines | Pure data |
| `17_S-0.9_Travel_Calendar.ts` | `17_S-0.9_Travel_Calendar.json` | ~500 lines | Pure data |
| `18_S-0.10_Video_Verification.ts` | `18_S-0.10_Video_Verification.json` | ~500 lines | Pure data |
| `19_S-0.11_4_Guarantees.ts` | `19_S-0.11_4_Guarantees.json` | ~500 lines | Pure data |
| `20_S-0.12_Final_CTA.ts` | `20_S-0.12_Final_CTA.json` | ~500 lines | Pure data |

### Keep as TypeScript

These files should remain `.ts`:

| File | Reason |
|------|--------|
| `index.ts` | Re-exports and metadata (logic) |
| `generate.ts` | Code generation logic |
| `generate-all-variants.js` | Build script |
| `generate-simple.js` | Build script |

### Documentation Files (Keep as-is)

| File | Reason |
|------|--------|
| `NATIVE_SPEAKER_QA_WORKFLOW.md` | Documentation |
| `QA_REPORT.md` | Documentation |
| `QA_TRACKING.md` | Documentation |
| `package.json` | Package config |
| `tsconfig.json` | TypeScript config |

### Test Files (Can Stay as .js)

| File | Reason |
|------|--------|
| `test-tts.js` | Test script (JavaScript OK) |
| `test-multi-language-tts.js` | Test script (JavaScript OK) |

---

## Conversion Script

Run this script to convert all data files to JSON:

```bash
# Conversion script (to be created)
node scripts/convert-voice-scripts-to-json.js
```

---

## Import Changes

After conversion, update imports in `apps/pandit/src/lib/voice-scripts-part0.ts`:

**Before:**
```typescript
export { S0_1_SWAGAT } from '../../voice/scripts_part0/09_S-0.1_Swagat';
```

**After:**
```typescript
import S0_1_SWAGAT_DATA from '../../voice/scripts_part0/09_S-0.1_Swagat.json';
export const S0_1_SWAGAT = S0_1_SWAGAT_DATA;
```

---

## Benefits

1. **Clearer Separation**: Data (JSON) vs Logic (TS)
2. **Translator-Friendly**: Translators can edit JSON without TypeScript knowledge
3. **Smaller Bundle**: No TypeScript compilation overhead
4. **Better Tooling**: JSON validators, linters, formatters work better
5. **Faster Builds**: JSON files don't need TypeScript compilation

---

## Timeline

- **Day 1**: Create conversion script
- **Day 2**: Run conversion, update imports
- **Day 3**: Test all voice scripts load correctly
- **Day 4**: Update translator documentation

---

## Risk Mitigation

- Keep `.ts` files as backup until conversion verified
- Run full test suite after conversion
- Verify all 900 scripts load correctly
- Test TTS playback for all languages
