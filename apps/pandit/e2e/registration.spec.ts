import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Registration Flow
 * Tests mobile number entry, OTP verification, and profile creation
 */

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to mobile number page
    await page.goto('/mobile')
  })

  test('should display mobile number input page', async ({ page }) => {
    // Verify page title
    await expect(page.locator('[data-testid="page-title"]')).toContainText('mobile number')
    
    // Verify input field is visible
    await expect(page.locator('[data-testid="mobile-input"]')).toBeVisible()
    
    // Verify voice button is visible
    await expect(page.locator('[data-testid="voice-btn"]')).toBeVisible()
  })

  test('should accept manual mobile number input', async ({ page }) => {
    // Enter mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    
    // Verify number is formatted
    await expect(page.locator('[data-testid="mobile-input"]')).toHaveValue('98765 43210')
    
    // Click continue
    await page.click('[data-testid="continue-btn"]')
    
    // Verify OTP page is displayed
    await expect(page.locator('[data-testid="otp-page"]')).toBeVisible()
  })

  test('should validate 10-digit mobile number', async ({ page }) => {
    // Enter short number
    await page.fill('[data-testid="mobile-input"]', '12345')
    
    // Click continue
    await page.click('[data-testid="continue-btn"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('10 digits')
    
    // Enter valid number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    
    // Verify no error
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible()
  })

  test('should display OTP input after mobile number', async ({ page }) => {
    // Enter and submit mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Verify OTP page
    await expect(page.locator('[data-testid="otp-page"]')).toBeVisible()
    
    // Verify OTP input is visible
    await expect(page.locator('[data-testid="otp-input"]')).toBeVisible()
    
    // Verify resend button is visible
    await expect(page.locator('[data-testid="resend-btn"]')).toBeVisible()
  })

  test('should validate 6-digit OTP', async ({ page }) => {
    // Enter and submit mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Enter short OTP
    await page.fill('[data-testid="otp-input"]', '123')
    
    // Click continue
    await page.click('[data-testid="verify-btn"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('6 digits')
  })

  test('should accept manual OTP input', async ({ page }) => {
    // Enter and submit mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Enter OTP
    await page.fill('[data-testid="otp-input"]', '123456')
    
    // Click verify
    await page.click('[data-testid="verify-btn"]')
    
    // Verify profile page is displayed
    await expect(page.locator('[data-testid="profile-page"]')).toBeVisible()
  })

  test('should display profile input page after OTP', async ({ page }) => {
    // Complete mobile and OTP
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    await page.fill('[data-testid="otp-input"]', '123456')
    await page.click('[data-testid="verify-btn"]')
    
    // Verify profile page
    await expect(page.locator('[data-testid="profile-page"]')).toBeVisible()
    
    // Verify name input is visible
    await expect(page.locator('[data-testid="name-input"]')).toBeVisible()
    
    // Verify voice button is visible
    await expect(page.locator('[data-testid="voice-btn"]')).toBeVisible()
  })

  test('should validate profile name', async ({ page }) => {
    // Complete mobile and OTP
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    await page.fill('[data-testid="otp-input"]', '123456')
    await page.click('[data-testid="verify-btn"]')
    
    // Leave name empty
    await page.click('[data-testid="continue-btn"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('name')
  })

  test('should accept profile name and complete registration', async ({ page }) => {
    // Complete mobile and OTP
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    await page.fill('[data-testid="otp-input"]', '123456')
    await page.click('[data-testid="verify-btn"]')
    
    // Enter name
    await page.fill('[data-testid="name-input"]', 'Ramesh Sharma')
    
    // Click continue
    await page.click('[data-testid="continue-btn"]')
    
    // Verify completion page
    await expect(page.locator('[data-testid="completion-page"]')).toBeVisible()
    
    // Verify celebration animation
    await expect(page.locator('[data-testid="celebration"]')).toBeVisible()
  })

  test('should capitalize profile name automatically', async ({ page }) => {
    // Complete mobile and OTP
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    await page.fill('[data-testid="otp-input"]', '123456')
    await page.click('[data-testid="verify-btn"]')
    
    // Enter lowercase name
    await page.fill('[data-testid="name-input"]', 'ramesh sharma')
    
    // Blur the input
    await page.locator('[data-testid="name-input"]').blur()
    
    // Verify capitalization
    await expect(page.locator('[data-testid="name-input"]')).toHaveValue('Ramesh Sharma')
  })

  test('should allow resending OTP', async ({ page }) => {
    // Enter and submit mobile number
    await page.fill('[data-testid="mobile-input"]', '9876543210')
    await page.click('[data-testid="continue-btn"]')
    
    // Wait for resend timer
    await page.waitForTimeout(30000)
    
    // Click resend
    await page.click('[data-testid="resend-btn"]')
    
    // Verify success message
    await expect(page.locator('[data-testid="resend-success"]')).toBeVisible()
  })
})
