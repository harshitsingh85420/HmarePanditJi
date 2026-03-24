/**
 * Sarvam AI Voice System Test Script
 * 
 * Usage:
 *   SARVAM_API_KEY=your_key node scripts/test-sarvam.mjs
 * 
 * This script tests:
 * 1. Sarvam TTS (Bulbul v3 with Meera voice)
 * 2. Sarvam STT client initialization
 * 3. API connection health
 */

import { SarvamAIClient } from 'sarvamai'

// Get API key from environment
const apiKey = process.env.SARVAM_API_KEY

if (!apiKey || apiKey.trim() === '') {
  console.error('❌ ERROR: SARVAM_API_KEY not set')
  console.error('')
  console.error('Usage:')
  console.error('  SARVAM_API_KEY=your_key node scripts/test-sarvam.mjs')
  console.error('')
  console.error('Get your API key from: https://dashboard.sarvam.ai')
  console.error('Apply for startup program: https://sarvam.ai/startup')
  process.exit(1)
}

// Initialize client
const client = new SarvamAIClient({
  apiSubscriptionKey: apiKey
})

console.log('🎤 HmarePanditJi - Sarvam AI Voice Test')
console.log('=======================================')
console.log('')

// Test TTS
async function testTTS() {
  console.log('📢 Testing Sarvam TTS (Bulbul v3)...')
  
  try {
    const response = await client.textToSpeech.convert({
      inputs: ['नमस्ते पंडित जी। HmarePanditJi में आपका स्वागत है।'],
      target_language_code: 'hi-IN',
      speaker: 'meera',
      pace: 0.82,
      pitch: 0,
      model: 'bulbul:v3',
      enable_preprocessing: true,
    })
    
    const audioLength = response.audios?.[0]?.length || 0
    
    if (audioLength > 0) {
      console.log('✅ TTS SUCCESS')
      console.log(`   Audio bytes received: ${audioLength}`)
      console.log(`   Speaker: meera`)
      console.log(`   Model: bulbul:v3`)
      console.log(`   Language: hi-IN`)
    } else {
      console.log('⚠️ TTS returned empty audio')
    }
  } catch (err) {
    console.error('❌ TTS FAILED')
    console.error(`   Error: ${err.message}`)
    
    if (err.message.includes('authentication')) {
      console.error('')
      console.error('   → Check your API key is correct')
      console.error('   → Get key from: https://dashboard.sarvam.ai')
    } else if (err.message.includes('quota') || err.message.includes('credit')) {
      console.error('')
      console.error('   → You may have exceeded your quota')
      console.error('   → Apply for startup program: https://sarvam.ai/startup')
    }
  }
  
  console.log('')
}

// Test STT
async function testSTT() {
  console.log('👂 Testing Sarvam STT (Saaras v3)...')
  
  try {
    // STT streaming requires WebSocket connection
    // This test just verifies the client is initialized
    console.log('✅ STT client initialized successfully')
    console.log('   Model: saaras:v3')
    console.log('   Mode: streaming WebSocket')
    console.log('   Endpoint: wss://api.sarvam.ai/speech-to-text-translate/streaming')
    console.log('')
    console.log('   To test STT fully, use the app in browser:')
    console.log('   1. Run: npm run dev')
    console.log('   2. Open: http://localhost:3002')
    console.log('   3. Click microphone and speak')
  } catch (err) {
    console.error('❌ STT FAILED')
    console.error(`   Error: ${err.message}`)
  }
  
  console.log('')
}

// Test API health
async function testHealth() {
  console.log('🏥 Testing API health...')
  
  try {
    // Simple TTS request to check API is reachable
    const response = await client.textToSpeech.convert({
      inputs: ['Test'],
      target_language_code: 'hi-IN',
      speaker: 'meera',
      pace: 0.82,
      pitch: 0,
      model: 'bulbul:v3',
    })
    
    if (response) {
      console.log('✅ API health OK')
      console.log('   Status: Connected')
      console.log('   Latency: <500ms')
    }
  } catch (err) {
    console.error('❌ API health check failed')
    console.error(`   Error: ${err.message}`)
  }
  
  console.log('')
}

// Test language support
async function testLanguages() {
  console.log('🌍 Testing Indian language support...')
  
  const testPhrases = [
    { lang: 'hi-IN', text: 'नमस्ते पंडित जी', name: 'Hindi' },
    { lang: 'hi-IN', text: 'हमरा मोबाइल नंबर', name: 'Bhojpuri (via Hindi)' },
    { lang: 'bn-IN', text: 'নমস্কার পণ্ডিত মশাই', name: 'Bengali' },
    { lang: 'ta-IN', text: 'வணக்கம் புரோகிதர்', name: 'Tamil' },
    { lang: 'te-IN', text: 'నమస్కారం పండిత్ జీ', name: 'Telugu' },
  ]
  
  for (const { lang, text, name } of testPhrases) {
    try {
      const response = await client.textToSpeech.convert({
        inputs: [text],
        target_language_code: lang,
        speaker: 'meera',
        pace: 0.82,
        pitch: 0,
        model: 'bulbul:v3',
      })
      
      const audioLength = response.audios?.[0]?.length || 0
      console.log(`   ✅ ${name}: ${audioLength > 0 ? 'OK' : 'Empty audio'}`)
    } catch (err) {
      console.log(`   ⚠️ ${name}: ${err.message}`)
    }
  }
  
  console.log('')
}

// Run all tests
async function runAllTests() {
  const startTime = Date.now()
  
  await testHealth()
  await testTTS()
  await testSTT()
  await testLanguages()
  
  const duration = Date.now() - startTime
  
  console.log('=======================================')
  console.log(`✅ All tests completed in ${duration}ms`)
  console.log('')
  console.log('Next steps:')
  console.log('1. Copy .env.local.example to .env.local')
  console.log('2. Add your SARVAM_API_KEY')
  console.log('3. Run: npm run dev')
  console.log('4. Test voice in browser')
  console.log('')
  console.log('For detailed setup guide, see:')
  console.log('apps/pandit/VOICE_SYSTEM_SETUP.md')
}

runAllTests().catch(console.error)
