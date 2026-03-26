import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Part 0 Onboarding Flow
 * Tests the complete onboarding experience from splash screen to registration
 */

test.describe('Part 0 Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding')
  })

  test('should display splash screen for 3 seconds', async ({ page }) => {
    // Verify splash screen is visible
    await expect(page.locator('[data-testid="splash-screen"]')).toBeVisible()
    
    // Wait for splash to disappear (3 seconds)
    await page.waitForTimeout(3500)
    
    // Verify splash is hidden
    await expect(page.locator('[data-testid="splash-screen"]')).not.toBeVisible()
  })

  test('should display location permission screen', async ({ page }) => {
    // Wait for splash to disappear
    await page.waitForTimeout(3500)
    
    // Verify location permission screen is visible
    await expect(page.locator('[data-testid="location-permission"]')).toBeVisible()
    
    // Verify voice prompt is present
    await expect(page.locator('[data-testid="voice-prompt"]')).toContainText('location')
  })

  test('should allow manual city entry', async ({ page }) => {
    // Wait for splash and navigate to location screen
    await page.waitForTimeout(3500)
    
    // Click manual entry button
    await page.click('[data-testid="manual-location-btn"]')
    
    // Verify city input is visible
    await expect(page.locator('[data-testid="city-input"]')).toBeVisible()
    
    // Enter city name
    await page.fill('[data-testid="city-input"]', 'Delhi')
    
    // Click continue
    await page.click('[data-testid="continue-btn"]')
    
    // Verify navigation to language selection
    await expect(page.locator('[data-testid="language-selection"]')).toBeVisible()
  })

  test('should display language selection screen', async ({ page }) => {
    // Wait for splash and navigate to language screen
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    
    // Verify language selection is visible
    await expect(page.locator('[data-testid="language-selection"]')).toBeVisible()
    
    // Verify Hindi is pre-selected
    await expect(page.locator('[data-testid="lang-hindi"]')).toHaveAttribute('data-selected', 'true')
  })

  test('should allow language change', async ({ page }) => {
    // Navigate to language screen
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    
    // Select English
    await page.click('[data-testid="lang-english"]')
    
    // Verify selection changed
    await expect(page.locator('[data-testid="lang-english"]')).toHaveAttribute('data-selected', 'true')
    
    // Click continue
    await page.click('[data-testid="continue-btn"]')
    
    // Verify tutorial starts in English
    await expect(page.locator('[data-testid="tutorial-screen"]')).toBeVisible()
  })

  test('should display all 12 tutorial screens', async ({ page }) => {
    // Navigate through onboarding to tutorial
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Verify first tutorial screen
    await expect(page.locator('[data-testid="tutorial-screen-1"]')).toBeVisible()
    
    // Click through all tutorial screens
    for (let i = 1; i <= 12; i++) {
      // Verify current screen
      await expect(page.locator(`[data-testid="tutorial-screen-${i}"]`)).toBeVisible()
      
      // Verify progress dots update
      const activeDot = page.locator(`[data-testid="progress-dot-${i}"]`)
      await expect(activeDot).toHaveClass(/active/)
      
      // Click next (except last screen)
      if (i < 12) {
        await page.click('[data-testid="next-btn"]')
      }
    }
  })

  test('should allow skipping tutorial', async ({ page }) => {
    // Navigate to tutorial
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Click skip
    await page.click('[data-testid="skip-btn"]')
    
    // Verify redirected to registration
    await expect(page.locator('[data-testid="registration-page"]')).toBeVisible()
  })

  test('should allow back navigation in tutorial', async ({ page }) => {
    // Navigate to tutorial
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
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

  test('should persist language selection across screens', async ({ page }) => {
    // Navigate to language screen
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    
    // Select Hindi
    await page.click('[data-testid="lang-hindi"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Navigate through tutorial
    await page.click('[data-testid="next-btn"]')
    await page.click('[data-testid="next-btn"]')
    
    // Verify language is still Hindi
    await expect(page.locator('[data-testid="current-lang"]')).toHaveText('हिंदी')
  })

  test('should redirect to mobile registration after completion', async ({ page }) => {
    // Complete full onboarding flow
    await page.waitForTimeout(3500)
    await page.click('[data-testid="manual-location-btn"]')
    await page.fill('[data-testid="city-input"]', 'Delhi')
    await page.click('[data-testid="continue-btn"]')
    await page.click('[data-testid="continue-btn"]')
    
    // Skip tutorial
    await page.click('[data-testid="skip-btn"]')
    
    // Verify redirected to mobile number page
    await expect(page.locator('[data-testid="mobile-number-page"]')).toBeVisible()
    await expect(page.url()).toContain('/mobile')
  })
})
