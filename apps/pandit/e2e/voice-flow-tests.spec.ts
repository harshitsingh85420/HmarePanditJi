import { test, expect, Page } from '@playwright/test'

/**
 * Voice Flow Testing Framework
 * 
 * Tests all voice interactions including:
 * - TTS (Text-to-Speech) playback
 * - STT (Speech-to-Text) recognition
 * - Intent detection accuracy
 * - Error handling
 * - Keyboard fallback
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Mock TTS response for testing
 */
async function mockTTSResponse(page: Page, language: string = 'hi-IN') {
  await page.route('**/api/tts', async (route) => {
    const mockAudioBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        audioBase64: mockAudioBase64,
        duration: 3.5,
        language: language
      })
    })
  })
}

/**
 * Mock STT response for testing
 */
async function mockSTTResponse(page: Page, transcript: string, confidence: number = 0.95) {
  await page.route('**/api/stt', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        transcript: transcript,
        confidence: confidence,
        language: 'hi-IN'
      })
    })
  })
}

/**
 * Simulate voice input
 */
async function simulateVoiceInput(page: Page, transcript: string) {
  // Click mic button
  await page.click('[data-testid="mic-btn"]')
  
  // Wait for listening state
  await page.waitForTimeout(1000)
  
  // Mock the STT response
  await mockSTTResponse(page, transcript)
  
  // Simulate speaking completed
  await page.dispatchEvent('[data-testid="mic-btn"]', 'speaking', { transcript })
  
  // Wait for response
  await page.waitForTimeout(2000)
}

/**
 * Verify TTS playback
 */
async function verifyTTSPlayback(page: Page, expectedDuration?: number) {
  // Wait for voice to start
  await page.waitForTimeout(500)
  
  // Voice indicator should be active
  const voiceIndicator = page.locator('[data-testid="voice-indicator"]')
  await expect(voiceIndicator).toBeVisible()
  await expect(voiceIndicator).toHaveClass(/active|playing/)
  
  // Wait for expected duration or default 5 seconds
  const duration = expectedDuration || 5000
  await page.waitForTimeout(duration)
  
  // Voice indicator should be inactive after completion
  await expect(voiceIndicator).not.toHaveClass(/active|playing/)
}

/**
 * Verify voice intent detection
 */
async function verifyIntentDetection(page: Page, expectedIntent: string) {
  // Wait for intent to be detected
  await page.waitForTimeout(2000)
  
  // Verify intent displayed
  const intentDisplay = page.locator('[data-testid="intent-display"]')
  await expect(intentDisplay).toBeVisible()
  await expect(intentDisplay).toContainText(expectedIntent)
}

// ============================================================================
// TTS PLAYBACK TESTS (All 21 Screens)
// ============================================================================

test.describe('TTS Playback Tests - All Screens', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock TTS for all tests
    await mockTTSResponse(page)
  })
  
  // Test TTS on Part 0.0 screens
  test.describe('Part 0.0 Screens', () => {
    const screens = [
      { id: 'S-0.0.1', name: 'Splash Screen', url: '/onboarding' },
      { id: 'S-0.0.2', name: 'Location Permission', url: '/onboarding' },
      { id: 'S-0.0.2B', name: 'Manual City Entry', url: '/onboarding' },
      { id: 'S-0.0.3', name: 'Language Selection', url: '/onboarding' },
      { id: 'S-0.0.4', name: 'Language Confirmation', url: '/onboarding' },
      { id: 'S-0.0.5', name: 'Voice Permission', url: '/onboarding' },
      { id: 'S-0.0.6', name: 'Welcome & Celebration', url: '/onboarding' },
      { id: 'S-0.0.7', name: 'Tutorial Introduction', url: '/onboarding' },
      { id: 'S-0.0.8', name: 'Tutorial Start', url: '/onboarding' }
    ]
    
    for (const screen of screens) {
      test(`${screen.id}: ${screen.name} - TTS should play on load`, async ({ page }) => {
        await page.goto(screen.url)
        
        // Navigate to specific screen if needed
        if (screen.id === 'S-0.0.2') {
          await page.waitForTimeout(3500) // Wait for splash
        } else if (screen.id === 'S-0.0.2B') {
          await page.waitForTimeout(3500)
          await page.click('[data-testid="manual-location-btn"]')
        } else if (screen.id === 'S-0.0.3') {
          await page.waitForTimeout(3500)
          await page.click('[data-testid="manual-location-btn"]')
          await page.fill('[data-testid="city-input"]', 'Delhi')
          await page.click('[data-testid="continue-btn"]')
        }
        
        // Verify TTS plays
        await verifyTTSPlayback(page)
      })
    }
  })
  
  // Test TTS on Part 0 screens
  test.describe('Part 0 Screens (Tutorial)', () => {
    for (let i = 1; i <= 12; i++) {
      test(`S-0.${i}: Tutorial Screen ${i} - TTS should play on load`, async ({ page }) => {
        // Navigate to tutorial
        await page.goto('/onboarding')
        await page.waitForTimeout(3500)
        await page.click('[data-testid="manual-location-btn"]')
        await page.fill('[data-testid="city-input"]', 'Delhi')
        await page.click('[data-testid="continue-btn"]')
        await page.click('[data-testid="lang-hindi"]')
        await page.click('[data-testid="continue-btn"]')
        
        // Navigate to specific tutorial screen
        for (let j = 1; j < i; j++) {
          await page.click('[data-testid="next-btn"]')
          await page.waitForTimeout(500)
        }
        
        // Verify TTS plays
        await verifyTTSPlayback(page)
      })
    }
  })
  
  // Test TTS on Part 1 screens
  test.describe('Part 1 Screens (Registration)', () => {
    const screens = [
      { id: 'S-1.1', name: 'Mobile Number', url: '/registration/mobile' },
      { id: 'S-1.2', name: 'OTP Verification', url: '/registration/otp' },
      { id: 'S-1.3', name: 'Name Entry', url: '/registration/name' },
      { id: 'S-1.4', name: 'Gotra', url: '/registration/gotra' },
      { id: 'S-1.5', name: 'Specialization', url: '/registration/specialization' },
      { id: 'S-1.6', name: 'Experience', url: '/registration/experience' },
      { id: 'S-1.7', name: 'Profile Photo', url: '/registration/photo' },
      { id: 'S-1.8', name: 'Bank Details', url: '/registration/bank' },
      { id: 'S-1.9', name: 'Profile Complete', url: '/registration/complete' }
    ]
    
    for (const screen of screens) {
      test(`${screen.id}: ${screen.name} - TTS should play on load`, async ({ page }) => {
        await page.goto(screen.url)
        
        // Verify TTS plays
        await verifyTTSPlayback(page)
      })
    }
  })
})

// ============================================================================
// STT RECOGNITION TESTS
// ============================================================================

test.describe('STT Recognition Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await mockTTSResponse(page)
  })
  
  test('should recognize YES intent in Hindi', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Mock STT with YES response
    await mockSTTResponse(page, 'हाँ')
    
    // Simulate voice input
    await simulateVoiceInput(page, 'हाँ')
    
    // Verify YES intent detected
    await verifyIntentDetection(page, 'YES')
    
    // Should navigate to next screen
    await page.waitForTimeout(2000)
    await expect(page.locator('[data-testid="next-btn"]')).toBeVisible()
  })
  
  test('should recognize NO intent in Hindi', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Mock STT with NO response
    await mockSTTResponse(page, 'नहीं')
    
    // Simulate voice input
    await simulateVoiceInput(page, 'नहीं')
    
    // Verify NO intent detected
    await verifyIntentDetection(page, 'NO')
  })
  
  test('should recognize SKIP intent in Hindi', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Mock STT with SKIP response
    await mockSTTResponse(page, 'छोड़ दो')
    
    // Simulate voice input
    await simulateVoiceInput(page, 'छोड़ दो')
    
    // Verify SKIP intent detected
    await verifyIntentDetection(page, 'SKIP')
    
    // Should skip tutorial
    await page.waitForTimeout(2000)
    await expect(page.url()).toContain('/registration')
  })
  
  test('should recognize numeric input', async ({ page }) => {
    await page.goto('/registration/mobile')
    
    // Mock STT with phone number
    await mockSTTResponse(page, '9876543210')
    
    // Simulate voice input
    await simulateVoiceInput(page, '9876543210')
    
    // Verify number is filled
    await page.waitForTimeout(2000)
    await expect(page.locator('[data-testid="phone-input"]')).toHaveValue('9876543210')
  })
  
  test('should recognize English responses', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-english"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Mock STT with English YES
    await mockSTTResponse(page, 'Yes')
    
    // Simulate voice input
    await simulateVoiceInput(page, 'Yes')
    
    // Verify YES intent detected
    await verifyIntentDetection(page, 'YES')
  })
})

// ============================================================================
// INTENT DETECTION ACCURACY TESTS
// ============================================================================

test.describe('Intent Detection Accuracy Tests', () => {
  
  const intentTests = [
    // Hindi intents
    { input: 'हाँ', expected: 'YES', language: 'hi' },
    { input: 'हां', expected: 'YES', language: 'hi' },
    { input: 'जी हाँ', expected: 'YES', language: 'hi' },
    { input: 'नहीं', expected: 'NO', language: 'hi' },
    { input: 'ना', expected: 'NO', language: 'hi' },
    { input: 'छोड़ दो', expected: 'SKIP', language: 'hi' },
    { input: 'स्किप', expected: 'SKIP', language: 'hi' },
    { input: 'आगे बढ़ो', expected: 'NEXT', language: 'hi' },
    { input: 'पीछे जाओ', expected: 'BACK', language: 'hi' },
    
    // English intents
    { input: 'Yes', expected: 'YES', language: 'en' },
    { input: 'Yeah', expected: 'YES', language: 'en' },
    { input: 'Yup', expected: 'YES', language: 'en' },
    { input: 'No', expected: 'NO', language: 'en' },
    { input: 'Nah', expected: 'NO', language: 'en' },
    { input: 'Skip', expected: 'SKIP', language: 'en' },
    { input: 'Next', expected: 'NEXT', language: 'en' },
    { input: 'Back', expected: 'BACK', language: 'en' },
    
    // Tamil intents
    { input: 'ஆமாம்', expected: 'YES', language: 'ta' },
    { input: 'இல்லை', expected: 'NO', language: 'ta' },
    
    // Bengali intents
    { input: 'হ্যাঁ', expected: 'YES', language: 'bn' },
    { input: 'না', expected: 'NO', language: 'bn' }
  ]
  
  for (const test_case of intentTests) {
    test(`should detect "${test_case.input}" as ${test_case.expected} intent (${test_case.language})`, async ({ page }) => {
      await page.goto('/onboarding')
      await page.waitForTimeout(3500)
      await page.click('[data-testid="manual-location-btn"]')
      await page.fill('[data-testid="city-input"]', 'Delhi')
      await page.click('[data-testid="continue-btn"]')
      
      // Mock STT with test input
      await mockSTTResponse(page, test_case.input)
      
      // Simulate voice input
      await simulateVoiceInput(page, test_case.input)
      
      // Verify intent detected correctly
      await verifyIntentDetection(page, test_case.expected)
    })
  }
})

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

test.describe('Error Handling Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await mockTTSResponse(page)
  })
  
  test('should handle low confidence STT response', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Mock STT with low confidence
    await mockSTTResponse(page, 'कुछ अस्पष्ट', 0.45)
    
    // Simulate voice input
    await simulateVoiceInput(page, 'कुछ अस्पष्ट')
    
    // Should show error overlay
    await page.waitForTimeout(2000)
    await expect(page.locator('[data-testid="error-overlay"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('फिर से बोलिए')
  })
  
  test('should handle STT timeout', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Click mic button
    await page.click('[data-testid="mic-btn"]')
    
    // Wait for timeout (10 seconds)
    await page.waitForTimeout(11000)
    
    // Should show timeout error
    await expect(page.locator('[data-testid="error-overlay"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('समय समाप्त')
  })
  
  test('should handle network error during TTS', async ({ page }) => {
    // Mock network error
    await page.route('**/api/tts', async (route) => {
      await route.abort('failed')
    })
    
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Should show network error gracefully
    await page.waitForTimeout(3000)
    await expect(page.locator('[data-testid="error-overlay"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network')
  })
  
  test('should handle STT API error', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Mock STT error
    await page.route('**/api/stt', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'STT service unavailable' })
      })
    })
    
    // Simulate voice input
    await simulateVoiceInput(page, 'test')
    
    // Should show error gracefully
    await page.waitForTimeout(2000)
    await expect(page.locator('[data-testid="error-overlay"]')).toBeVisible()
  })
})

// ============================================================================
// KEYBOARD FALLBACK TESTS
// ============================================================================

test.describe('Keyboard Fallback Tests', () => {
  
  test('should show keyboard option after 3 failed voice attempts', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Simulate 3 failed voice attempts
    for (let i = 0; i < 3; i++) {
      await mockSTTResponse(page, '', 0.3) // Low confidence
      await simulateVoiceInput(page, '')
      await page.waitForTimeout(2000)
    }
    
    // Should show keyboard fallback
    await expect(page.locator('[data-testid="keyboard-fallback"]')).toBeVisible()
    await expect(page.locator('[data-testid="type-response-btn"]')).toBeVisible()
  })
  
  test('should allow manual text input via keyboard fallback', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Trigger keyboard fallback
    await page.click('[data-testid="keyboard-fallback-btn"]')
    
    // Should show text input
    await expect(page.locator('[data-testid="text-input"]')).toBeVisible()
    
    // Enter response
    await page.fill('[data-testid="text-input"]', 'हाँ')
    await page.click('[data-testid="submit-btn"]')
    
    // Should process response
    await page.waitForTimeout(2000)
    await expect(page.locator('[data-testid="intent-display"]')).toContainText('YES')
  })
  
  test('should allow skipping via keyboard when voice fails', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Trigger keyboard fallback
    await page.click('[data-testid="keyboard-fallback-btn"]')
    
    // Click skip
    await page.click('[data-testid="skip-btn"]')
    
    // Should skip tutorial
    await expect(page.url()).toContain('/registration')
  })
})

// ============================================================================
// MULTI-LANGUAGE VOICE TESTS
// ============================================================================

test.describe('Multi-Language Voice Tests', () => {
  
  const languages = [
    { code: 'hi-IN', name: 'Hindi', testWord: 'हाँ' },
    { code: 'ta-IN', name: 'Tamil', testWord: 'ஆமாம்' },
    { code: 'te-IN', name: 'Telugu', testWord: 'అవును' },
    { code: 'bn-IN', name: 'Bengali', testWord: 'হ্যাঁ' },
    { code: 'mr-IN', name: 'Marathi', testWord: 'होय' }
  ]
  
  for (const lang of languages) {
    test.describe(`${lang.name} (${lang.code})`, () => {
      
      test(`should play TTS in ${lang.name}`, async ({ page }) => {
        await page.goto('/onboarding')
        await page.waitForTimeout(3500)
        await page.click('[data-testid="manual-location-btn"]')
        await page.fill('[data-testid="city-input"]', 'Delhi')
        await page.click('[data-testid="continue-btn"]')
        
        // Select language
        const langKey = lang.code.split('-')[0]
        await page.click(`[data-testid="lang-${langKey}"]`)
        await page.click('[data-testid="continue-btn"]')
        
        // Mock TTS for specific language
        await mockTTSResponse(page, lang.code)
        
        // Verify TTS plays in selected language
        await verifyTTSPlayback(page)
      })
      
      test(`should recognize ${lang.name} speech`, async ({ page }) => {
        await page.goto('/onboarding')
        await page.waitForTimeout(3500)
        await page.click('[data-testid="manual-location-btn"]')
        await page.fill('[data-testid="city-input"]', 'Delhi')
        await page.click('[data-testid="continue-btn"]')
        
        // Select language
        const langKey = lang.code.split('-')[0]
        await page.click(`[data-testid="lang-${langKey}"]`)
        await page.click('[data-testid="continue-btn"]')
        
        // Mock STT with language-specific word
        await mockSTTResponse(page, lang.testWord)
        
        // Simulate voice input
        await simulateVoiceInput(page, lang.testWord)
        
        // Verify intent detected
        await verifyIntentDetection(page, 'YES')
      })
    })
  }
})

// ============================================================================
// VOICE UI COMPONENT TESTS
// ============================================================================

test.describe('Voice UI Component Tests', () => {
  
  test('should display voice indicator during playback', async ({ page }) => {
    await mockTTSResponse(page)
    
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Voice indicator should be visible
    const voiceIndicator = page.locator('[data-testid="voice-indicator"]')
    await expect(voiceIndicator).toBeVisible()
    
    // Should have 5 waveform bars
    const waveformBars = voiceIndicator.locator('[data-testid="waveform-bar"]')
    await expect(waveformBars).toHaveCount(5)
    
    // Should be animated (pulsing)
    await expect(voiceIndicator).toHaveClass(/active|animating/)
  })
  
  test('should display interim transcript during speech', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Mock interim transcript
    await page.route('**/api/stt', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          transcript: 'हाँ',
          isFinal: false,
          confidence: 0.8
        })
      })
    })
    
    // Simulate voice input
    await simulateVoiceInput(page, 'हाँ')
    
    // Should display interim transcript
    await expect(page.locator('[data-testid="interim-transcript"]')).toBeVisible()
    await expect(page.locator('[data-testid="interim-transcript"]')).toContainText('हाँ')
  })
  
  test('should display noise warning in loud environment', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Mock high noise level
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('noise-level', { detail: { dB: 70 } }))
    })
    
    // Should show noise warning
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="noise-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="noise-warning"]')).toContainText('शोर')
  })
})
