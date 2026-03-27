#!/usr/bin/env node
/**
 * Multi-Language TTS Test Script
 * Tests TTS generation for all 15 supported languages
 *
 * Usage:
 *   npm run test-languages
 *
 * Languages tested:
 * 1. Hindi (hi-IN)
 * 2. Bhojpuri (hi-IN fallback)
 * 3. Maithili (hi-IN fallback)
 * 4. Bengali (bn-IN)
 * 5. Tamil (ta-IN)
 * 6. Telugu (te-IN)
 * 7. Kannada (kn-IN)
 * 8. Malayalam (ml-IN)
 * 9. Marathi (mr-IN)
 * 10. Gujarati (gu-IN)
 * 11. Sanskrit (hi-IN fallback)
 * 12. English (en-IN)
 * 13. Odia (or-IN)
 * 14. Punjabi (pa-IN)
 * 15. Assamese (hi-IN fallback)
 */

const API_URL = 'http://localhost:3002/api/tts';

// Welcome message for testing (will be translated per language)
const WELCOME_MESSAGE = {
  'hi-IN': 'नमस्ते। HmarePanditJi में आपका स्वागत है।',
  'bn-IN': 'নমস্কার। HmarePanditJi-তে আপনাকে স্বাগতম।',
  'ta-IN': 'வணக்கம்। HmarePanditJi-க்கு வரவேற்கிறோம்.',
  'te-IN': 'నమస్కారం. HmarePanditJiకి స్వాగతం.',
  'kn-IN': 'ನಮಸ್ಕಾರ. HmarePanditJi ಗೆ ಸ್ವಾಗತ.',
  'ml-IN': 'നമസ്കാരം. HmarePanditJi ലേക്ക് സ്വാഗതം.',
  'mr-IN': 'नमस्कार. HmarePanditJi मध्ये आपले स्वागत आहे.',
  'gu-IN': 'નમસ્તે. HmarePanditJi માં આપનું સ્વાગત છે.',
  'en-IN': 'Hello. Welcome to HmarePanditJi.',
  'or-IN': 'ନମସ୍କାର | HmarePanditJi କୁ ସ୍ୱାଗତ |',
  'pa-IN': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ। HmarePanditJi ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ।',
  // Fallback to Hindi for languages without native script support
  'Bhojpuri': 'नमस्ते। HmarePanditJi में आपका स्वागत है।',
  'Maithili': 'नमस्ते। HmarePanditJi में आपका स्वागत है।',
  'Sanskrit': 'नमस्ते। HmarePanditJi अभिवाद्यते।',
  'Assamese': 'নমস্কাৰ। HmarePanditJi লৈ আদৰণি।',
};

const LANGUAGE_TESTS = [
  {
    id: 1,
    name: 'Hindi',
    code: 'hi-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Primary language - should be perfect',
  },
  {
    id: 2,
    name: 'Bhojpuri',
    code: 'hi-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'good',
    notes: 'Uses Hindi fallback - accent via prompts',
  },
  {
    id: 3,
    name: 'Maithili',
    code: 'hi-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'good',
    notes: 'Uses Hindi fallback - accent via prompts',
  },
  {
    id: 4,
    name: 'Bengali',
    code: 'bn-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Native Bengali support',
  },
  {
    id: 5,
    name: 'Tamil',
    code: 'ta-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Native Tamil support',
  },
  {
    id: 6,
    name: 'Telugu',
    code: 'te-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Native Telugu support',
  },
  {
    id: 7,
    name: 'Kannada',
    code: 'kn-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Native Kannada support',
  },
  {
    id: 8,
    name: 'Malayalam',
    code: 'ml-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Native Malayalam support',
  },
  {
    id: 9,
    name: 'Marathi',
    code: 'mr-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Native Marathi support',
  },
  {
    id: 10,
    name: 'Gujarati',
    code: 'gu-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Native Gujarati support',
  },
  {
    id: 11,
    name: 'Sanskrit',
    code: 'hi-IN',
    speaker: 'meera',
    pace: 0.82,
    expectedQuality: 'good',
    notes: 'Uses Hindi fallback - classical pronunciation',
  },
  {
    id: 12,
    name: 'English (Indian)',
    code: 'en-IN',
    speaker: 'meera',
    pace: 0.88,
    expectedQuality: 'excellent',
    notes: 'Indian English accent',
  },
  {
    id: 13,
    name: 'Odia',
    code: 'or-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'good',
    notes: 'Native Odia support',
  },
  {
    id: 14,
    name: 'Punjabi',
    code: 'pa-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'excellent',
    notes: 'Native Punjabi support',
  },
  {
    id: 15,
    name: 'Assamese',
    code: 'as-IN',
    speaker: 'meera',
    pace: 0.85,
    expectedQuality: 'good',
    notes: 'Uses Hindi fallback - Bengali script similarity',
  },
];

async function testLanguageTTS(testCase) {
  const text = WELCOME_MESSAGE[testCase.code] || WELCOME_MESSAGE['hi-IN'];
  
  try {
    const startTime = performance.now();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        languageCode: testCase.code,
        speaker: testCase.speaker,
        pace: testCase.pace,
        pitch: 0,
        loudness: 1.0,
      }),
    });
    
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        ...testCase,
        status: 'FAILED',
        error: errorText,
        latency,
        audioBytes: 0,
      };
    }
    
    const data = await response.json();
    
    if (!data.audio || data.audio.length === 0) {
      return {
        ...testCase,
        status: 'FAILED',
        error: 'No audio in response',
        latency,
        audioBytes: 0,
      };
    }
    
    const audioBytes = Buffer.from(data.audio, 'base64').length;
    
    // Quality assessment based on audio size and latency
    let quality = 'excellent';
    if (audioBytes < 10000 || latency > 500) {
      quality = 'good';
    } else if (audioBytes < 5000 || latency > 1000) {
      quality = 'acceptable';
    }
    
    return {
      ...testCase,
      status: 'PASSED',
      latency,
      audioBytes,
      quality,
    };
  } catch (error) {
    return {
      ...testCase,
      status: 'ERROR',
      error: error.message || String(error),
      latency: 0,
      audioBytes: 0,
    };
  }
}

async function runLanguageTests() {
  console.log('🌍 Multi-Language TTS Test Suite\n');
  console.log('='.repeat(80));
  console.log(`Testing ${LANGUAGE_TESTS.length} languages...\n`);
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const testCase of LANGUAGE_TESTS) {
    console.log(`\n📝 Test #${testCase.id}: ${testCase.name} (${testCase.code})`);
    console.log(`   Speaker: ${testCase.speaker}, Pace: ${testCase.pace}`);
    console.log(`   Expected Quality: ${testCase.expectedQuality}`);
    
    const result = await testLanguageTTS(testCase);
    results.push(result);
    
    if (result.status === 'PASSED') {
      console.log(`   ✅ PASSED (${result.latency}ms) - Audio: ${result.audioBytes} bytes`);
      console.log(`   Quality: ${result.quality.toUpperCase()}`);
      passed++;
    } else {
      console.log(`   ❌ ${result.status}: ${result.error || 'Unknown error'}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RESULTS\n');
  console.log(`Total Languages: ${LANGUAGE_TESTS.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / LANGUAGE_TESTS.length) * 100)}%`);
  
  // Generate report table
  console.log('\n\n📋 LANGUAGE TEST REPORT TABLE\n');
  console.log('| Language | Code | TTS Quality | Naturalness | Speed | Status |');
  console.log('|----------|------|-------------|-------------|-------|--------|');
  
  for (const result of results) {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    const quality = result.quality || 'N/A';
    const naturalness = quality === 'excellent' ? 'Natural' : quality === 'good' ? 'Good' : 'Acceptable';
    console.log(`| ${result.name} | ${result.code} | ${quality.toUpperCase()} | ${naturalness} | ${result.pace} | ${status} |`);
  }
  
  console.log('\n\n📝 NOTES:\n');
  for (const result of results) {
    console.log(`- ${result.name}: ${result.notes}`);
  }
  
  if (failed === 0) {
    console.log('\n🎉 All language tests passed!');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} language test(s) failed`);
    process.exit(1);
  }
}

// Run tests
runLanguageTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
