/**
 * Voice End-to-End Accuracy Test
 * Tests number word mapping, intent detection, and voice recognition accuracy
 * 
 * Usage: Run in browser console or as Node.js script
 * 
 * Test Phrases:
 * 1. "नौ आठ सात शून्य" → Expected: "9870"
 * 2. "एक चार दो पांच सात नौ" → Expected: "142579"
 * 3. "रमेश शर्मा" → Expected: "Ramesh Sharma"
 * 4. "हाँ" → Expected: "haan"
 * 5. "नहीं" → Expected: "nahi"
 */

import { convertNumberWordsToDigits } from '../lib/number-mapper';
import { detectIntent } from '../lib/voice-engine';

// ─────────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────────

interface TestCase {
  id: number;
  type: 'mobile' | 'otp' | 'name' | 'yes_no' | 'intent';
  input: string;
  expected: string;
  description: string;
}

const TEST_CASES: TestCase[] = [
  // Mobile Number Tests
  {
    id: 1,
    type: 'mobile',
    input: 'नौ आठ सात शून्य',
    expected: '9870',
    description: 'Hindi mobile number (4 digits)',
  },
  {
    id: 2,
    type: 'mobile',
    input: 'एक दो तीन चार पांच छह सात आठ नौ शून्य',
    expected: '1234567890',
    description: 'Full 10-digit mobile number in Hindi',
  },
  {
    id: 3,
    type: 'mobile',
    input: 'मेरा नंबर है नौ आठ सात शून्य दो तीन चार पांच छह',
    expected: '9870234567',
    description: 'Mobile number with preamble',
  },
  {
    id: 4,
    type: 'mobile',
    input: 'nau ath saat shoonya',
    expected: '9870',
    description: 'English transliterated mobile number',
  },
  
  // OTP Tests
  {
    id: 5,
    type: 'otp',
    input: 'एक चार दो पांच सात नौ',
    expected: '142579',
    description: '6-digit OTP in Hindi',
  },
  {
    id: 6,
    type: 'otp',
    input: 'OTP है एक दो तीन चार पांच छह',
    expected: '123456',
    description: 'OTP with preamble',
  },
  {
    id: 7,
    type: 'otp',
    input: 'ek chaar do paanch saat nau',
    expected: '142579',
    description: 'OTP in English transliteration',
  },
  
  // Name Tests
  {
    id: 8,
    type: 'name',
    input: 'रमेश शर्मा',
    expected: 'Ramesh Sharma',
    description: 'Hindi name with surname',
  },
  {
    id: 9,
    type: 'name',
    input: 'सुरेश मिश्रा',
    expected: 'Suresh Mishra',
    description: 'Another Hindi name',
  },
  
  // Yes/No Intent Tests
  {
    id: 10,
    type: 'intent',
    input: 'हाँ',
    expected: 'YES',
    description: 'Hindi yes',
  },
  {
    id: 11,
    type: 'intent',
    input: 'नहीं',
    expected: 'NO',
    description: 'Hindi no',
  },
  {
    id: 12,
    type: 'intent',
    input: 'haan ji',
    expected: 'YES',
    description: 'Transliterated yes with respect',
  },
  {
    id: 13,
    type: 'intent',
    input: 'nahin chahiye',
    expected: 'NO',
    description: 'Transliterated no',
  },
  {
    id: 14,
    type: 'intent',
    input: 'bilkul sahi',
    expected: 'YES',
    description: 'Alternative yes phrase',
  },
  {
    id: 15,
    type: 'intent',
    input: 'galat hai',
    expected: 'NO',
    description: 'Alternative no phrase',
  },
  
  // Intent Detection (Commands)
  {
    id: 16,
    type: 'intent',
    input: 'skip karo',
    expected: 'SKIP',
    description: 'Skip command',
  },
  {
    id: 17,
    type: 'intent',
    input: 'aage chalo',
    expected: 'FORWARD',
    description: 'Continue command',
  },
  {
    id: 18,
    type: 'intent',
    input: 'peeche jao',
    expected: 'BACK',
    description: 'Back command',
  },
  {
    id: 19,
    type: 'intent',
    input: 'madad chahiye',
    expected: 'HELP',
    description: 'Help command',
  },
  {
    id: 20,
    type: 'intent',
    input: 'badlo',
    expected: 'CHANGE',
    description: 'Change command',
  },
];

// ─────────────────────────────────────────────────────────────
// TEST RUNNER
// ─────────────────────────────────────────────────────────────

interface TestResult {
  id: number;
  passed: boolean;
  actual: string;
  expected: string;
  latencyMs: number;
}

function runNumberTest(testCase: TestCase): TestResult {
  const startTime = performance.now();
  
  let actual: string;
  if (testCase.type === 'mobile') {
    actual = convertNumberWordsToDigits(testCase.input, 'mobile').digits;
  } else if (testCase.type === 'otp') {
    actual = convertNumberWordsToDigits(testCase.input, 'otp').digits;
  } else if (testCase.type === 'name') {
    actual = testCase.input
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else {
    actual = testCase.input;
  }
  
  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);
  
  return {
    id: testCase.id,
    passed: actual === testCase.expected,
    actual,
    expected: testCase.expected,
    latencyMs,
  };
}

function runIntentTest(testCase: TestCase): TestResult {
  const startTime = performance.now();
  
  const detectedIntent = detectIntent(testCase.input);
  const actual = detectedIntent || 'UNKNOWN';
  
  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);
  
  return {
    id: testCase.id,
    passed: actual === testCase.expected,
    actual,
    expected: testCase.expected,
    latencyMs,
  };
}

export function runVoiceE2ETest(): {
  total: number;
  passed: number;
  failed: number;
  accuracy: number;
  avgLatencyMs: number;
  results: TestResult[];
  failedTests: TestCase[];
} {
  console.log('🧪 Voice E2E Test Suite\n');
  console.log('='.repeat(60));
  
  const results: TestResult[] = [];
  const failedTests: TestCase[] = [];
  
  for (const testCase of TEST_CASES) {
    let result: TestResult;
    
    if (testCase.type === 'intent') {
      result = runIntentTest(testCase);
    } else {
      result = runNumberTest(testCase);
    }
    
    results.push(result);
    
    if (!result.passed) {
      failedTests.push(testCase);
      console.log(`❌ Test #${result.id}: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Expected: "${result.expected}"`);
      console.log(`   Actual: "${result.actual}"`);
      console.log(`   Latency: ${result.latencyMs}ms\n`);
    } else {
      console.log(`✅ Test #${result.id}: ${testCase.description} (${result.latencyMs}ms)`);
    }
  }
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const accuracy = Math.round((passed / total) * 100);
  const avgLatencyMs = Math.round(
    results.reduce((sum, r) => sum + r.latencyMs, 0) / total
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS\n');
  console.log(`Total Phrases: ${total}`);
  console.log(`Correct: ${passed}`);
  console.log(`Incorrect: ${failed}`);
  console.log(`Accuracy: ${accuracy}%`);
  console.log(`Avg Latency: ${avgLatencyMs}ms`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`  #${test.id}: ${test.description} - "${test.input}"`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (accuracy >= 90) {
    console.log('✅ PASS - Voice accuracy meets target (90%+)');
  } else {
    console.log('⚠️  FAIL - Voice accuracy below target (90%+)');
  }
  
  if (avgLatencyMs < 300) {
    console.log('✅ PASS - Latency meets target (<300ms)');
  } else {
    console.log('⚠️  FAIL - Latency above target (<300ms)');
  }
  
  return {
    total,
    passed,
    failed,
    accuracy,
    avgLatencyMs,
    results,
    failedTests,
  };
}

// Auto-run if executed directly
if (typeof window !== 'undefined') {
  console.log('🎤 Voice E2E Test - Ready to run');
  console.log('Call: runVoiceE2ETest()');
  
  // Export to window for console access
  (window as any).runVoiceE2ETest = runVoiceE2ETest;
}

// For Node.js execution
if (typeof process !== 'undefined' && process.argv) {
  const result = runVoiceE2ETest();
  
  // Exit with error code if tests failed
  if (result.accuracy < 90) {
    process.exit(1);
  }
}
