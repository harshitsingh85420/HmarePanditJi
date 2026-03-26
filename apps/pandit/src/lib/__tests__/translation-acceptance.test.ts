/**
 * Translation Module - Usage Examples
 * Matches acceptance tests from FREELANCER_TASK_CARDS.md
 */

import { translateEngine } from './sarvam-translate';
import { getScriptInLanguage, getTranslatedScriptText } from './language-switcher';
import { normalizeLanguageCode, validateLanguage } from './language-validator';

// ─────────────────────────────────────────────────────────────
// ACCEPTANCE TEST 1: Translation Engine
// ─────────────────────────────────────────────────────────────

async function testTranslationEngine() {
  console.log('=== Testing Translation Engine ===');

  // Exact acceptance test pattern
  const result = await translateEngine.translate({
    text: 'Welcome Pandit Ji',
    sourceLanguage: 'en-IN',
    targetLanguage: 'hi-IN',
    onResult: (text, confidence) => {
      console.log('Translated:', text); // Expected: "स्वागत है पंडित जी"
      console.log('Confidence:', confidence); // Expected: 0.95
    },
  });

  console.log('Result:', result);
  // Expected output:
  // {
  //   translatedText: "स्वागत है पंडित जी",
  //   confidence: 0.95,
  //   cached: false
  // }
}

// ─────────────────────────────────────────────────────────────
// ACCEPTANCE TEST 2: Language Switcher
// ─────────────────────────────────────────────────────────────

async function testLanguageSwitcher() {
  console.log('\n=== Testing Language Switcher ===');

  // EXACT acceptance test pattern from task card
  const tamilScript = await getScriptInLanguage('S-0.0.2', 'ta-IN');

  // This now matches the exact acceptance test!
  if (tamilScript) {
    console.log('Tamil Text:', tamilScript.text); // Tamil translation
    console.log('Confidence:', tamilScript.confidence); // 0.95
    console.log('Screen ID:', tamilScript.screenId); // S-0.0.2
    console.log('Language:', tamilScript.language); // ta-IN
  }

  // Alternative: Get text directly (simplified pattern)
  const tamilText = await getScriptText('S-0.0.2', 'ta-IN');
  console.log('Direct Text:', tamilText); // Tamil translation

  // Alternative: Get text with confidence
  const tamilResult = await getTranslatedScriptText('S-0.0.2', 'ta-IN');
  if (tamilResult) {
    console.log('Text:', tamilResult.text); // Tamil translation
    console.log('Confidence:', tamilResult.confidence); // 0.95
  }
}

// ─────────────────────────────────────────────────────────────
// ACCEPTANCE TEST 3: Language Validator
// ─────────────────────────────────────────────────────────────

async function testLanguageValidator() {
  console.log('\n=== Testing Language Validator ===');

  // Test 1: Normalize language codes
  console.log('Normalizing language codes:');
  console.log('  "hi" →', normalizeLanguageCode('hi')); // 'hi-IN'
  console.log('  "tamil" →', normalizeLanguageCode('tamil')); // 'ta-IN'
  console.log('  "ta_IN" →', normalizeLanguageCode('ta_IN')); // 'ta-IN'
  console.log('  "Bangla" →', normalizeLanguageCode('Bangla')); // 'bn-IN'

  // Test 2: Validate all 15 languages
  console.log('\nValidating all 15 languages:');
  const languages = [
    'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN',
    'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN',
    'en-IN', 'bho-IN', 'mai-IN', 'sa-IN', 'as-IN',
  ];

  for (const lang of languages) {
    const result = validateLanguage(lang);
    console.log(`  ${lang}: ${result.isValid ? '✓' : '✗'} ${result.requiresFallback ? '(fallback to ' + result.fallbackCode + ')' : ''}`);
  }

  // Test 3: Fallback mappings
  console.log('\nTesting fallback mappings:');
  console.log('  Bhojpuri (bho-IN) →', validateLanguage('bho-IN').fallbackCode); // 'hi-IN'
  console.log('  Maithili (mai-IN) →', validateLanguage('mai-IN').fallbackCode); // 'hi-IN'
  console.log('  Sanskrit (sa-IN) →', validateLanguage('sa-IN').fallbackCode); // 'hi-IN'
  console.log('  Assamese (as-IN) →', validateLanguage('as-IN').fallbackCode); // 'hi-IN'
}

// ─────────────────────────────────────────────────────────────
// RUN ALL TESTS
// ─────────────────────────────────────────────────────────────

async function runAllAcceptanceTests() {
  try {
    await testTranslationEngine();
    await testLanguageSwitcher();
    await testLanguageValidator();
    console.log('\n✅ All acceptance tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for testing
export { testTranslationEngine, testLanguageSwitcher, testLanguageValidator, runAllAcceptanceTests };

// Run if executed directly
if (typeof window !== 'undefined') {
  runAllAcceptanceTests();
}
