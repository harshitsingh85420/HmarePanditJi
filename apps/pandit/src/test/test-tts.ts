#!/usr/bin/env node
/**
 * TTS Integration Test Script
 * Tests the /api/tts route and audio caching
 * 
 * Usage:
 *   npm run test-tts
 */

const API_URL = 'http://localhost:3002/api/tts';

const TEST_CASES = [
  {
    name: 'Short Hindi greeting',
    text: 'नमस्ते',
    languageCode: 'hi-IN',
    speaker: 'meera',
    pace: 0.82,
  },
  {
    name: 'Long text (500 chars)',
    text: 'नमस्ते। मैं आपका डिजिटल सहायक हूँ। मैं हिंदी, भोजपुरी, मैथिली और कई अन्य भारतीय भाषाएं समझता हूँ। आप मुझसे बात कर सकते हैं और मैं आपकी मदद करूंगा। पूजा बुकिंग, पंडित जी खोजना, या किसी भी धार्मिक कार्य के लिए मैं यहां हूं। कृपया बताएं मैं आपकी कैसे सहायता कर सकता हूं। यह एक लंबा टेक्स्ट है जो यह सुनिश्चित करने के लिए है कि TTS सिस्टम लंबे टेक्स्ट को भी सही तरीके से संभाल सकता है।',
    languageCode: 'hi-IN',
    speaker: 'meera',
    pace: 0.82,
  },
  {
    name: 'English text',
    text: 'Hello, welcome to HmarePanditJi',
    languageCode: 'en-IN',
    speaker: 'meera',
    pace: 0.82,
  },
  {
    name: 'Number pronunciation test',
    text: 'आपका मोबाइल नंबर नौ आठ सात शून्य है',
    languageCode: 'hi-IN',
    speaker: 'meera',
    pace: 0.82,
  },
];

async function testTTS() {
  console.log('🎤 TTS Integration Test\n');
  console.log('=' .repeat(50));

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Text: ${testCase.text.slice(0, 50)}${testCase.text.length > 50 ? '...' : ''}`);

    try {
      const startTime = performance.now();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testCase.text,
          languageCode: testCase.languageCode,
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
        console.log(`   ❌ FAILED (${response.status}): ${errorText}`);
        failed++;
        continue;
      }

      const data = await response.json();

      if (!data.audio || data.audio.length === 0) {
        console.log(`   ❌ FAILED: No audio in response`);
        failed++;
        continue;
      }

      const audioBytes = Buffer.from(data.audio, 'base64').length;
      console.log(`   ✅ PASSED (${latency}ms) - Audio: ${audioBytes} bytes`);
      passed++;
    } catch (error: any) {
      console.log(`   ❌ ERROR: ${error.message || String(error)}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed');
    process.exit(1);
  }
}

// Cache test
async function testCache() {
  console.log('\n\n🗄️  Cache Performance Test\n');
  console.log('='.repeat(50));

  const text = 'नमस्ते';
  const config = {
    text,
    languageCode: 'hi-IN',
    speaker: 'meera',
    pace: 0.82,
    pitch: 0,
    loudness: 1.0,
  };

  // First call (cache miss)
  console.log('\n📝 First call (cache miss)...');
  const start1 = performance.now();
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const latency1 = Math.round(performance.now() - start1);
  console.log(`   Latency: ${latency1}ms`);

  // Second call (should be cached in client)
  console.log('\n📝 Second call (should use cache)...');
  const start2 = performance.now();
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const latency2 = Math.round(performance.now() - start2);
  console.log(`   Latency: ${latency2}ms`);

  console.log('\n' + '='.repeat(50));
  console.log(`Cache improvement: ${latency1 - latency2}ms (${Math.round((1 - latency2 / latency1) * 100)}% faster)`);
}

// Run tests
async function runTests() {
  try {
    await testTTS();
    await testCache();
  } catch (error) {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  }
}

runTests();
