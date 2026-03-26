import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Error Scenarios
 * Tests network failures, voice failures, and session timeouts
 */

test.describe('Error Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mobile')
  })

  test('should show amber banner on network loss', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    
    // Try to submit mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Verify amber banner is shown
    await expect(page.locator('[data-testid="network-amber-banner"]')).toBeVisible()
    
    // Verify state is preserved
    await expect(page.locator('[data-testid="mobile-input"]')).toHaveValue('98765 43210')
  })

  test('should show green banner on network restore', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    
    // Try to submit
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Go online
    await context.setOffline(false)
    
    // Verify green banner is shown
    await expect(page.locator('[data-testid="network-green-banner"]')).toBeVisible()
  })

  test('should continue flow after network restore', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    
    // Submit mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Go online
    await context.setOffline(false)
    
    // Wait for banner to disappear
    await page.waitForTimeout(3000)
    
    // Click continue again
    await page.click('[data-testid="continue-btn"]')
    
    // Verify OTP page is displayed
    await expect(page.locator('[data-testid="otp-page"]')).toBeVisible()
  })

  test('should show keyboard after 3 voice failures', async ({ page }) => {
    // Click voice button
    await page.click('[data-testid="voice-btn"]')
    
    // Simulate 3 voice failures
    for (let i = 0; i < 3; i++) {
      // Wait for voice timeout
      await page.waitForTimeout(8000)
    }
    
    // Verify keyboard fallback is shown
    await expect(page.locator('[data-testid="keyboard-fallback"]')).toBeVisible()
    
    // Verify manual input works
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await expect(page.locator('[data-testid="mobile-input"]')).toHaveValue('98765 43210')
  })

  test('should show session timeout sheet after 30 minutes', async ({ page }) => {
    // Mock time to fast-forward 30 minutes
    await page.evaluate(() => {
      // Simulate session timeout
      window.dispatchEvent(new CustomEvent('session-timeout'))
    })
    
    // Verify timeout sheet is shown
    await expect(page.locator('[data-testid="timeout-sheet"]')).toBeVisible()
  })

  test('should resume session from timeout', async ({ page }) => {
    // Trigger timeout
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('session-timeout'))
    })
    
    // Click resume
    await page.click('[data-testid="resume-btn"]')
    
    // Verify sheet is closed
    await expect(page.locator('[data-testid="timeout-sheet"]')).not.toBeVisible()
    
    // Verify user can continue
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Verify OTP page
    await expect(page.locator('[data-testid="otp-page"]')).toBeVisible()
  })

  test('should handle browser back button', async ({ page }) => {
    // Complete mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Verify OTP page
    await expect(page.locator('[data-testid="otp-page"]')).toBeVisible()
    
    // Go back
    await page.goBack()
    
    // Verify back on mobile page
    await expect(page.locator('[data-testid="mobile-number-page"]')).toBeVisible()
    
    // Verify number is preserved
    await expect(page.locator('[data-testid="mobile-input"]')).toHaveValue('98765 43210')
  })

  test('should preserve state on tab close/reopen', async ({ page, context }) => {
    // Enter mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    
    // Close tab
    await page.close()
    
    // Reopen tab
    const newPage = await context.newPage()
    await newPage.goto('/mobile')
    
    // Verify state is preserved from session storage
    await expect(newPage.locator('[data-testid="mobile-input"]')).toHaveValue('98765 43210')
  })

  test('should show error for invalid mobile number format', async ({ page }) => {
    // Enter invalid characters
    await page.fill('[data-testid="mobile-input"]', 'abcdefghij')
    
    // Click continue
    await page.click('[data-testid="continue-btn"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('valid number')
  })

  test('should show error for invalid OTP', async ({ page }) => {
    // Enter mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Enter wrong OTP length
    await page.fill('[data-testid="otp-input"]', '9999999')
    
    // Click verify
    await page.click('[data-testid="verify-btn"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('6 digits')
  })

  test('should show error for empty profile name', async ({ page }) => {
    // Complete mobile and OTP
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    await page.fill('[data-testid="otp-input"]', '123456')
    await page.click('[data-testid="verify-btn"]')
    
    // Leave name empty and continue
    await page.click('[data-testid="continue-btn"]')
    
    // Verify error message in Hindi
    await expect(page.locator('[data-testid="error-message"]')).toContainText('नाम')
  })

  test('should handle voice timeout correctly (8s for numbers)', async ({ page }) => {
    // Click voice button
    await page.click('[data-testid="voice-btn"]')
    
    // Wait for 8 second timeout
    await page.waitForTimeout(8500)
    
    // Verify timeout message or fallback
    await expect(page.locator('[data-testid="voice-timeout"]')).toBeVisible()
  })

  test('should handle voice timeout correctly (12s for names)', async ({ page }) => {
    // Complete to profile page
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    await page.fill('[data-testid="otp-input"]', '123456')
    await page.click('[data-testid="verify-btn"]')
    
    // Click voice button on profile page
    await page.click('[data-testid="voice-btn"]')
    
    // Wait for 12 second timeout
    await page.waitForTimeout(12500)
    
    // Verify timeout message or fallback
    await expect(page.locator('[data-testid="voice-timeout"]')).toBeVisible()
  })
})
