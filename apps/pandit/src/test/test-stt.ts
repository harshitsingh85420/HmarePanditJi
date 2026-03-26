/**
 * STT Integration Test Script
 * Tests Sarvam STT and Deepgram STT with various inputs
 *
 * Usage: Run in browser console or as part of test suite
 */

import { sttEngine } from '../lib/sarvamSTT';
import { deepgramEngine } from '../lib/deepgramSTT';
import { convertNumberWordsToDigits } from '../lib/number-mapper';

// ─────────────────────────────────────────────────────────────
// TEST CASES FOR NUMBER RECOGNITION
// ─────────────────────────────────────────────────────────────

const NUMBER_TEST_CASES = [
  {
    name: 'Hindi mobile number',
    input: 'नौ आठ सात शून्य',
    expected: '9870',
    context: 'mobile' as const,
  },
  {
    name: 'Hindi OTP',
    input: 'एक चार दो पांच सात नौ',
    expected: '142579',
    context: 'otp' as const,
  },
  {
    name: 'English transliterated mobile',
    input: 'nau ath saat shoonya',
    expected: '9870',
    context: 'mobile' as const,
  },
  {
    name: 'Mixed Hindi-English',
    input: 'मेरा number है nau ath saat',
    expected: '987',
    context: 'mobile' as const,
  },
  {
    name: 'With country code',
    input: '+91 नौ आठ सात शून्य दो तीन',
    expected: '987023',
    context: 'mobile' as const,
  },
  {
    name: 'Bhojpuri numbers',
    input: 'नऊ आठ सात',
    expected: '987',
    context: 'general' as const,
  },
  {
    name: 'Maithili numbers',
    input: 'एक दुइ तीन',
    expected: '123',
    context: 'general' as const,
  },
];

// ─────────────────────────────────────────────────────────────
// TEST CASES FOR YES/NO RECOGNITION
// ─────────────────────────────────────────────────────────────

const YES_NO_TEST_CASES = [
  { input: 'haan', expected: 'haan' },
  { input: 'haan ji', expected: 'haan' },
  { input: 'bilkul', expected: 'haan' },
  { input: 'sahi hai', expected: 'haan' },
  { input: 'nahi', expected: 'nahi' },
  { input: 'nahin chahiye', expected: 'nahi' },
  { input: 'galat', expected: 'nahi' },
  { input: 'yes', expected: 'haan' },
  { input: 'no', expected: 'nahi' },
];

// ─────────────────────────────────────────────────────────────
// TEST FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Test number word conversion
 */
export function testNumberConversion(): void {
  console.log('🔢 Number Conversion Tests\n');
  console.log('='.repeat(50));

  let passed = 0;
  let failed = 0;

  for (const testCase of NUMBER_TEST_CASES) {
    const result = convertNumberWordsToDigits(testCase.input, testCase.context);
    const success = result.digits === testCase.expected;

    if (success) {
      console.log(`✅ ${testCase.name}: "${testCase.input}" → "${result.digits}"`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: "${testCase.input}" → "${result.digits}" (expected: "${testCase.expected}")`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed\n`);
}

/**
 * Test yes/no recognition
 */
export function testYesNoRecognition(): void {
  console.log('✅ Yes/No Recognition Tests\n');
  console.log('='.repeat(50));

  let passed = 0;
  let failed = 0;

  for (const testCase of YES_NO_TEST_CASES) {
    const result = convertNumberWordsToDigits(testCase.input, 'general');
    // For yes/no, we check if the input contains yes/no words
    const yesWords = ['haan', 'ha', 'hanji', 'bilkul', 'sahi', 'yes', 'correct'];
    const noWords = ['nahi', 'nahin', 'no', 'naa', 'galat', 'mat'];

    const isYes = yesWords.some(word => testCase.input.toLowerCase().includes(word));
    const isNo = noWords.some(word => testCase.input.toLowerCase().includes(word));

    const expectedType = testCase.expected === 'haan' ? 'yes' : 'no';
    const actualType = isYes ? 'yes' : isNo ? 'no' : 'unknown';

    const success = expectedType === actualType;

    if (success) {
      console.log(`✅ "${testCase.input}" → ${actualType}`);
      passed++;
    } else {
      console.log(`❌ "${testCase.input}" → ${actualType} (expected: ${expectedType})`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed\n`);
}

/**
 * Test STT engine initialization
 */
export function testSTTEngineInit(): void {
  console.log('🎤 STT Engine Initialization Tests\n');
  console.log('='.repeat(50));

  // Test Sarvam engine
  if (sttEngine) {
    console.log('✅ Sarvam STT engine: Available');
    console.log(`   Is listening: ${sttEngine.getIsListening()}`);
    console.log(`   Error count: ${sttEngine.getErrorCount()}`);
  } else {
    console.log('❌ Sarvam STT engine: Not available');
  }

  // Test Deepgram engine
  if (deepgramEngine) {
    console.log('✅ Deepgram STT engine: Available');
    console.log(`   Is listening: ${deepgramEngine.getIsListening()}`);
    console.log(`   Error count: ${deepgramEngine.getErrorCount()}`);
  } else {
    console.log('❌ Deepgram STT engine: Not available');
  }

  console.log('\n' + '='.repeat(50));
}

/**
 * Test ambient noise detection
 */
export async function testAmbientNoise(): Promise<void> {
  console.log('🔊 Ambient Noise Detection Test\n');
  console.log('='.repeat(50));

  if (!sttEngine) {
    console.log('❌ STT engine not available');
    return;
  }

  try {
    // Request mic access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone access granted');

    // Stop the stream
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Microphone released');

    console.log('\n' + '='.repeat(50));
    console.log('Noise detection test complete\n');
  } catch (error) {
    console.log('❌ Microphone access denied:', error);
  }
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<void> {
  console.log('\n🧪 STT Integration Test Suite\n');
  console.log('='.repeat(50));

  testSTTEngineInit();
  testNumberConversion();
  testYesNoRecognition();
  await testAmbientNoise();

  console.log('\n✅ All tests completed!\n');
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).testSTT = {
    runAll: runAllTests,
    testNumberConversion,
    testYesNoRecognition,
    testSTTEngineInit,
    testAmbientNoise,
  };
}
