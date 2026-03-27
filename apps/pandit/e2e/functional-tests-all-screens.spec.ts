import { test, expect, Page } from '@playwright/test'

/**
 * Functional Test Scripts for All Screens
 * 
 * This file contains comprehensive test cases for all 30+ screens
 * in the HmarePanditJi application.
 * 
 * Coverage:
 * - Part 0.0: 9 screens (S-0.0.1 to S-0.0.8)
 * - Part 0: 12 screens (S-0.1 to S-0.12)
 * - Part 1: 9 screens (Homepage to Profile Complete)
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Navigate through onboarding to reach a specific screen
 */
async function navigateToScreen(page: Page, screenId: string) {
  // Start from onboarding
  await page.goto('/onboarding')
  
  // Wait for splash screen (3 seconds)
  await page.waitForTimeout(3500)
  
  // Location permission screen (S-0.0.2)
  if (screenId.startsWith('S-0.0.2')) {
    return
  }
  
  // Click manual location entry
  await page.click('[data-testid="manual-location-btn"]')
  
  // Enter city
  await page.fill('[data-testid="city-input"]', 'Delhi')
  await page.click('[data-testid="continue-btn"]')
  
  // Language selection (S-0.0.3)
  if (screenId.startsWith('S-0.0.3')) {
    return
  }
  
  // Select language and continue
  await page.click('[data-testid="lang-hindi"]')
  await page.click('[data-testid="continue-btn"]')
  
  // Tutorial screens (S-0.1 to S-0.12)
  const tutorialScreenNum = parseInt(screenId.split('-')[2])
  if (tutorialScreenNum >= 1 && tutorialScreenNum <= 12) {
    for (let i = 1; i < tutorialScreenNum; i++) {
      await page.click('[data-testid="next-btn"]')
      await page.waitForTimeout(500)
    }
    return
  }
}

/**
 * Verify common screen elements
 */
async function verifyCommonElements(page: Page, screenId: string) {
  // TopBar should be present
  await expect(page.locator('[data-testid="topbar"]')).toBeVisible()
  
  // Progress dots should be present
  await expect(page.locator('[data-testid="progress-dots"]')).toBeVisible()
  
  // Voice indicator should be present
  await expect(page.locator('[data-testid="voice-indicator"]')).toBeVisible()
  
  // CTA button should be present
  await expect(page.locator('[data-testid="cta-btn"]')).toBeVisible()
  
  // Skip button should be present
  await expect(page.locator('[data-testid="skip-btn"]')).toBeVisible()
}

/**
 * Verify voice playback
 */
async function verifyVoicePlayback(page: Page) {
  // Wait for voice to start playing (should start within 500ms)
  await page.waitForTimeout(1000)
  
  // Voice indicator should be active
  const voiceIndicator = page.locator('[data-testid="voice-indicator"]')
  await expect(voiceIndicator).toHaveClass(/active|playing/)
  
  // Wait for voice to complete (max 10 seconds)
  await page.waitForTimeout(10000)
  
  // Voice indicator should be inactive
  await expect(voiceIndicator).not.toHaveClass(/active|playing/)
}

// ============================================================================
// PART 0.0: SPLASH & PERMISSION SCREENS (S-0.0.1 to S-0.0.8)
// ============================================================================

test.describe('Part 0.0: Splash & Permission Screens', () => {
  
  // S-0.0.1: Splash Screen
  test('S-0.0.1: Splash Screen should display for 3 seconds', async ({ page }) => {
    await page.goto('/onboarding')
    
    // Verify splash screen is visible
    await expect(page.locator('[data-testid="splash-screen"]')).toBeVisible()
    
    // Verify app logo is visible
    await expect(page.locator('[data-testid="app-logo"]')).toBeVisible()
    
    // Verify app name is visible
    await expect(page.locator('[data-testid="app-name"]')).toContainText('HmarePanditJi')
    
    // Verify splash displays for 3 seconds
    await page.waitForTimeout(3500)
    await expect(page.locator('[data-testid="splash-screen"]')).not.toBeVisible()
  })
  
  // S-0.0.2: Location Permission
  test('S-0.0.2: Location Permission screen should request location', async ({ page }) => {
    await navigateToScreen(page, 'S-0.0.2')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="location-permission"]')).toBeVisible()
    
    // Verify voice prompt
    await expect(page.locator('[data-testid="voice-prompt"]')).toBeVisible()
    
    // Verify location request button
    await expect(page.locator('[data-testid="request-location-btn"]')).toBeVisible()
    
    // Verify manual entry button
    await expect(page.locator('[data-testid="manual-location-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.0.2B: Manual City Entry
  test('S-0.0.2B: Manual City Entry should accept city name', async ({ page }) => {
    await navigateToScreen(page, 'S-0.0.2')
    
    // Click manual entry
    await page.click('[data-testid="manual-location-btn"]')
    
    // Verify city input is visible
    await expect(page.locator('[data-testid="city-input"]')).toBeVisible()
    
    // Enter city name
    await page.fill('[data-testid="city-input"]', 'Varanasi')
    
    // Verify continue button
    await expect(page.locator('[data-testid="continue-btn"]')).toBeVisible()
    
    // Click continue
    await page.click('[data-testid="continue-btn"]')
    
    // Should navigate to language selection
    await expect(page.locator('[data-testid="language-selection"]')).toBeVisible()
  })
  
  // S-0.0.3: Language Selection
  test('S-0.0.3: Language Selection should display 15 languages', async ({ page }) => {
    await navigateToScreen(page, 'S-0.0.3')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="language-selection"]')).toBeVisible()
    
    // Verify all 15 languages are present
    const languages = [
      'hindi', 'tamil', 'telugu', 'bengali', 'marathi',
      'gujarati', 'kannada', 'malayalam', 'punjabi', 'odia',
      'english', 'bhojpuri', 'maithili', 'sanskrit', 'assamese'
    ]
    
    for (const lang of languages) {
      await expect(page.locator(`[data-testid="lang-${lang}"]`)).toBeVisible()
    }
    
    // Verify Hindi is pre-selected
    await expect(page.locator('[data-testid="lang-hindi"]')).toHaveAttribute('data-selected', 'true')
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.0.4: Language Confirmation
  test('S-0.0.4: Language Confirmation should show selected language', async ({ page }) => {
    await navigateToScreen(page, 'S-0.0.3')
    
    // Select Tamil
    await page.click('[data-testid="lang-tamil"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Verify confirmation screen
    await expect(page.locator('[data-testid="language-confirmation"]')).toBeVisible()
    
    // Verify selected language is displayed
    await expect(page.locator('[data-testid="selected-language"]')).toContainText('தமிழ்')
    
    // Verify voice plays in selected language
    await verifyVoicePlayback(page)
  })
  
  // S-0.0.5: Voice Permission
  test('S-0.0.5: Voice Permission should request microphone access', async ({ page }) => {
    await navigateToScreen(page, 'S-0.0.5')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="voice-permission"]')).toBeVisible()
    
    // Verify permission request
    await expect(page.locator('[data-testid="permission-request"]')).toBeVisible()
    
    // Verify allow button
    await expect(page.locator('[data-testid="allow-btn"]')).toBeVisible()
    
    // Verify skip button
    await expect(page.locator('[data-testid="skip-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.0.6: Welcome & Celebration
  test('S-0.0.6: Welcome & Celebration should show confetti', async ({ page }) => {
    await navigateToScreen(page, 'S-0.0.6')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="welcome-screen"]')).toBeVisible()
    
    // Verify welcome message
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible()
    
    // Verify confetti animation starts
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="confetti"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.0.7: Tutorial Introduction
  test('S-0.0.7: Tutorial Introduction should explain app features', async ({ page }) => {
    await navigateToScreen(page, 'S-0.0.7')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="tutorial-intro"]')).toBeVisible()
    
    // Verify introduction text
    await expect(page.locator('[data-testid="intro-text"]')).toBeVisible()
    
    // Verify start tutorial button
    await expect(page.locator('[data-testid="start-tutorial-btn"]')).toBeVisible()
    
    // Verify skip tutorial button
    await expect(page.locator('[data-testid="skip-tutorial-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.0.8: Tutorial Start
  test('S-0.0.8: Tutorial Start should begin tutorial flow', async ({ page }) => {
    await navigateToScreen(page, 'S-0.0.8')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="tutorial-start"]')).toBeVisible()
    
    // Click start tutorial
    await page.click('[data-testid="start-tutorial-btn"]')
    
    // Should navigate to first tutorial screen
    await expect(page.locator('[data-testid="tutorial-screen-1"]')).toBeVisible()
  })
})

// ============================================================================
// PART 0: TUTORIAL SCREENS (S-0.1 to S-0.12)
// ============================================================================

test.describe('Part 0: Tutorial Screens', () => {
  
  // S-0.1: Tutorial Screen 1 - Introduction
  test('S-0.1: Tutorial Screen 1 should introduce the app', async ({ page }) => {
    await navigateToScreen(page, 'S-0.1')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.1')
    
    // Verify tutorial content
    await expect(page.locator('[data-testid="tutorial-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="tutorial-description"]')).toBeVisible()
    
    // Verify illustration
    await expect(page.locator('[data-testid="tutorial-illustration"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.2: Tutorial Screen 2 - Income Hook
  test('S-0.2: Tutorial Screen 2 should explain income features', async ({ page }) => {
    await navigateToScreen(page, 'S-0.2')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.2')
    
    // Verify income tiles
    const incomeTiles = page.locator('[data-testid="income-tile"]')
    await expect(incomeTiles).toHaveCount(4)
    
    // Verify testimonial
    await expect(page.locator('[data-testid="testimonial"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.3: Tutorial Screen 3 - Fixed Dakshina
  test('S-0.3: Tutorial Screen 3 should explain fixed dakshina', async ({ page }) => {
    await navigateToScreen(page, 'S-0.3')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.3')
    
    // Verify before/after cards
    await expect(page.locator('[data-testid="before-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="after-card"]')).toBeVisible()
    
    // Verify "मोलभाव खत्म" highlight
    await expect(page.locator('[data-testid="no-bargaining"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.4: Tutorial Screen 4 - Online Revenue
  test('S-0.4: Tutorial Screen 4 should explain online revenue', async ({ page }) => {
    await navigateToScreen(page, 'S-0.4')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.4')
    
    // Verify dual cards
    await expect(page.locator('[data-testid="ghar-baithe-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="consultancy-card"]')).toBeVisible()
    
    // Verify income calculation
    await expect(page.locator('[data-testid="income-calculation"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.5: Tutorial Screen 5 - Backup Pandit
  test('S-0.5: Tutorial Screen 5 should explain backup pandit feature', async ({ page }) => {
    await navigateToScreen(page, 'S-0.5')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.5')
    
    // Verify 3-step explanation flow
    for (let i = 1; i <= 3; i++) {
      await expect(page.locator(`[data-testid="step-${i}"]`)).toBeVisible()
    }
    
    // Verify skepticism handling
    await expect(page.locator('[data-testid="skepticism-handling"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.6: Tutorial Screen 6 - Instant Payment
  test('S-0.6: Tutorial Screen 6 should explain instant payment', async ({ page }) => {
    await navigateToScreen(page, 'S-0.6')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.6')
    
    // Verify payment breakdown
    await expect(page.locator('[data-testid="payment-breakdown"]')).toBeVisible()
    
    // Verify bank transfer visualization
    await expect(page.locator('[data-testid="bank-transfer"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.7: Tutorial Screen 7 - Voice Nav Demo
  test('S-0.7: Tutorial Screen 7 should demonstrate voice navigation', async ({ page }) => {
    await navigateToScreen(page, 'S-0.7')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.7')
    
    // Verify interactive voice demo
    await expect(page.locator('[data-testid="voice-demo"]')).toBeVisible()
    
    // Verify mic button
    await expect(page.locator('[data-testid="mic-btn"]')).toBeVisible()
    
    // Verify transcript display
    await expect(page.locator('[data-testid="transcript-display"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.8: Tutorial Screen 8 - Dual Mode
  test('S-0.8: Tutorial Screen 8 should explain dual mode', async ({ page }) => {
    await navigateToScreen(page, 'S-0.8')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.8')
    
    // Verify smartphone vs keypad comparison
    await expect(page.locator('[data-testid="smartphone-mode"]')).toBeVisible()
    await expect(page.locator('[data-testid="keypad-mode"]')).toBeVisible()
    
    // Verify family help message
    await expect(page.locator('[data-testid="family-help"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.9: Tutorial Screen 9 - Travel Calendar
  test('S-0.9: Tutorial Screen 9 should explain travel calendar', async ({ page }) => {
    await navigateToScreen(page, 'S-0.9')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.9')
    
    // Verify map animation
    await expect(page.locator('[data-testid="map-animation"]')).toBeVisible()
    
    // Verify calendar integration
    await expect(page.locator('[data-testid="calendar-integration"]')).toBeVisible()
    
    // Verify double booking prevention
    await expect(page.locator('[data-testid="no-double-booking"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.10: Tutorial Screen 10 - Video Verification
  test('S-0.10: Tutorial Screen 10 should explain video verification', async ({ page }) => {
    await navigateToScreen(page, 'S-0.10')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.10')
    
    // Verify badge animation
    await expect(page.locator('[data-testid="badge-animation"]')).toBeVisible()
    
    // Verify privacy assurance
    await expect(page.locator('[data-testid="privacy-assurance"]')).toBeVisible()
    
    // Verify social proof
    await expect(page.locator('[data-testid="social-proof"]')).toContainText('3 lakh')
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.11: Tutorial Screen 11 - 4 Guarantees
  test('S-0.11: Tutorial Screen 11 should display 4 guarantees', async ({ page }) => {
    await navigateToScreen(page, 'S-0.11')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.11')
    
    // Verify 4 guarantee cards
    for (let i = 1; i <= 4; i++) {
      await expect(page.locator(`[data-testid="guarantee-${i}"]`)).toBeVisible()
    }
    
    // Verify animated reveal
    await page.waitForTimeout(2000)
    await expect(page.locator('[data-testid="guarantee-4"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-0.12: Tutorial Screen 12 - Final CTA
  test('S-0.12: Tutorial Screen 12 should present final CTA', async ({ page }) => {
    await navigateToScreen(page, 'S-0.12')
    
    // Verify common elements
    await verifyCommonElements(page, 'S-0.12')
    
    // Verify decision screen
    await expect(page.locator('[data-testid="decision-screen"]')).toBeVisible()
    
    // Verify helpline number
    await expect(page.locator('[data-testid="helpline-number"]')).toBeVisible()
    
    // Verify Yes button
    await expect(page.locator('[data-testid="yes-btn"]')).toBeVisible()
    
    // Verify No button
    await expect(page.locator('[data-testid="no-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
    
    // Click Yes - should show confetti
    await page.click('[data-testid="yes-btn"]')
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="confetti"]')).toBeVisible()
  })
})

// ============================================================================
// PART 1: REGISTRATION & PROFILE (S-1.1 to S-1.9)
// ============================================================================

test.describe('Part 1: Registration & Profile', () => {
  
  // S-1.1: Mobile Number Entry
  test('S-1.1: Mobile Number Entry should accept phone number', async ({ page }) => {
    await page.goto('/registration/mobile')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="mobile-entry"]')).toBeVisible()
    
    // Verify phone input
    await expect(page.locator('[data-testid="phone-input"]')).toBeVisible()
    
    // Verify country code selector
    await expect(page.locator('[data-testid="country-code"]')).toHaveValue('+91')
    
    // Enter phone number
    await page.fill('[data-testid="phone-input"]', '9876543210')
    
    // Verify continue button
    await expect(page.locator('[data-testid="continue-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-1.2: OTP Verification
  test('S-1.2: OTP Verification should verify OTP', async ({ page }) => {
    await page.goto('/registration/otp')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="otp-verification"]')).toBeVisible()
    
    // Verify OTP input fields
    for (let i = 1; i <= 6; i++) {
      await expect(page.locator(`[data-testid="otp-digit-${i}"]`)).toBeVisible()
    }
    
    // Verify resend OTP button
    await expect(page.locator('[data-testid="resend-otp-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-1.3: Basic Info - Name
  test('S-1.3: Basic Info - Name should accept full name', async ({ page }) => {
    await page.goto('/registration/name')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="name-entry"]')).toBeVisible()
    
    // Verify name input
    await expect(page.locator('[data-testid="name-input"]')).toBeVisible()
    
    // Enter name
    await page.fill('[data-testid="name-input"]', 'Ramesh Sharma')
    
    // Verify continue button
    await expect(page.locator('[data-testid="continue-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-1.4: Basic Info - Gotra
  test('S-1.4: Basic Info - Gotra should accept gotra', async ({ page }) => {
    await page.goto('/registration/gotra')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="gotra-entry"]')).toBeVisible()
    
    // Verify gotra dropdown
    await expect(page.locator('[data-testid="gotra-select"]')).toBeVisible()
    
    // Verify other option
    await expect(page.locator('[data-testid="gotra-other"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-1.5: Basic Info - Specialization
  test('S-1.5: Basic Info - Specialization should accept specialization', async ({ page }) => {
    await page.goto('/registration/specialization')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="specialization-entry"]')).toBeVisible()
    
    // Verify specialization options
    const specializations = ['puja', 'havan', 'katha', 'jyotish', 'vastu']
    for (const spec of specializations) {
      await expect(page.locator(`[data-testid="spec-${spec}"]`)).toBeVisible()
    }
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-1.6: Basic Info - Experience
  test('S-1.6: Basic Info - Experience should accept experience', async ({ page }) => {
    await page.goto('/registration/experience')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="experience-entry"]')).toBeVisible()
    
    // Verify experience options
    const experiences = ['0-2', '3-5', '6-10', '10+']
    for (const exp of experiences) {
      await expect(page.locator(`[data-testid="exp-${exp}"]`)).toBeVisible()
    }
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-1.7: Profile Photo
  test('S-1.7: Profile Photo should accept photo upload', async ({ page }) => {
    await page.goto('/registration/photo')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="photo-entry"]')).toBeVisible()
    
    // Verify camera button
    await expect(page.locator('[data-testid="camera-btn"]')).toBeVisible()
    
    // Verify upload button
    await expect(page.locator('[data-testid="upload-btn"]')).toBeVisible()
    
    // Verify skip button
    await expect(page.locator('[data-testid="skip-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-1.8: Bank Details
  test('S-1.8: Bank Details should accept bank information', async ({ page }) => {
    await page.goto('/registration/bank')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="bank-entry"]')).toBeVisible()
    
    // Verify account number input
    await expect(page.locator('[data-testid="account-number"]')).toBeVisible()
    
    // Verify IFSC input
    await expect(page.locator('[data-testid="ifsc-code"]')).toBeVisible()
    
    // Verify account holder name input
    await expect(page.locator('[data-testid="account-holder"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
  
  // S-1.9: Profile Complete
  test('S-1.9: Profile Complete should show success', async ({ page }) => {
    await page.goto('/registration/complete')
    
    // Verify screen is visible
    await expect(page.locator('[data-testid="profile-complete"]')).toBeVisible()
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // Verify confetti animation
    await expect(page.locator('[data-testid="confetti"]')).toBeVisible()
    
    // Verify go to dashboard button
    await expect(page.locator('[data-testid="dashboard-btn"]')).toBeVisible()
    
    // Verify voice plays on load
    await verifyVoicePlayback(page)
  })
})

// ============================================================================
// NAVIGATION TESTS
// ============================================================================

test.describe('Navigation Tests', () => {
  
  test('should navigate through complete onboarding flow', async ({ page }) => {
    await page.goto('/onboarding')
    
    // Wait for splash
    await page.waitForTimeout(3500)
    
    // Manual location entry
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    
    // Language selection
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Navigate through all 12 tutorial screens
    for (let i = 1; i <= 12; i++) {
      // Verify current screen
      await expect(page.locator(`[data-testid="tutorial-screen-${i}"]`)).toBeVisible()
      
      // Verify progress dots
      const activeDot = page.locator(`[data-testid="progress-dot-${i}"]`)
      await expect(activeDot).toHaveClass(/active/)
      
      // Click next (except last screen)
      if (i < 12) {
        await page.click('[data-testid="next-btn"]')
        await page.waitForTimeout(500)
      }
    }
    
    // Click Yes on final screen
    await page.click('[data-testid="yes-btn"]')
    
    // Should navigate to registration
    await expect(page.url()).toContain('/registration')
  })
  
  test('should allow back navigation in tutorial', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Go to screen 3
    await page.click('[data-testid="next-btn"]')
    await page.click('[data-testid="next-btn"]')
    
    // Verify screen 3
    await expect(page.locator('[data-testid="tutorial-screen-3"]')).toBeVisible()
    
    // Go back
    await page.click('[data-testid="back-btn"]')
    
    // Verify screen 2
    await expect(page.locator('[data-testid="tutorial-screen-2"]')).toBeVisible()
  })
  
  test('should allow skipping tutorial', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Click skip
    await page.click('[data-testid="skip-btn"]')
    
    // Should redirect to registration
    await expect(page.url()).toContain('/registration')
  })
})

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

test.describe('Error Handling Tests', () => {

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true)

    await page.goto('/onboarding')

    // Should show offline banner
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible()

    // Should not crash
    await expect(page.locator('[data-testid="splash-screen"]')).toBeVisible()
  })
  
  test('should handle invalid phone number', async ({ page }) => {
    await page.goto('/registration/mobile')
    
    // Enter invalid phone number
    await page.fill('[data-testid="phone-input"]', '123')
    
    // Click continue
    await page.click('[data-testid="continue-btn"]')
    
    // Should show error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid phone number')
  })
  
  test('should handle invalid OTP', async ({ page }) => {
    await page.goto('/registration/otp')
    
    // Enter invalid OTP
    for (let i = 1; i <= 6; i++) {
      await page.fill(`[data-testid="otp-digit-${i}"]`, '0')
    }
    
    // Click verify
    await page.click('[data-testid="verify-btn"]')
    
    // Should show error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid OTP')
  })
})
