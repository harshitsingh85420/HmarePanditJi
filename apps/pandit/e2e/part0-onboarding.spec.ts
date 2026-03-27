import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Part 0 Onboarding Flow
 * Tests the complete onboarding experience from splash screen to registration
 * 
 * Updated with:
 * - Hindi text locators
 * - Role-based queries (getByRole, getByLabel)
 * - Accessibility-first selectors
 */

test.describe('Part 0 Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding')
  })

  test('should display splash screen for 3 seconds', async ({ page }) => {
    // Verify splash screen is visible using role
    await expect(page.getByRole('img', { name: /ॐ |Om symbol/i })).toBeVisible()

    // Wait for splash to disappear (3 seconds)
    await page.waitForTimeout(3500)

    // Verify splash is hidden
    await expect(page.locator('[data-testid="splash-screen"]')).not.toBeVisible()
  })

  test('should display location permission screen', async ({ page }) => {
    // Wait for splash and navigate to location screen
    await page.waitForTimeout(3500)

    // Verify location permission screen is visible using role
    await expect(page.getByRole('heading', { name: /location/i })).toBeVisible()

    // Verify voice prompt is present
    await expect(page.getByRole('status')).toContainText(/location|स्थान/i)
  })

  test('should allow manual city entry', async ({ page }) => {
    // Wait for splash and navigate to location screen
    await page.waitForTimeout(3500)

    // Click manual entry button using role
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()

    // Verify city input is visible
    await expect(page.getByRole('textbox', { name: /city|शहर/i })).toBeVisible()

    // Enter city name
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')

    // Click continue using role
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Verify navigation to language selection
    await expect(page.getByRole('heading', { name: /language|भाषा/i })).toBeVisible()
  })

  test('should display language selection screen', async ({ page }) => {
    // Navigate to language screen
    await page.waitForTimeout(3500)
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Verify language selection is visible
    await expect(page.getByRole('heading', { name: /language|भाषा/i })).toBeVisible()

    // Verify Hindi is pre-selected using role and Hindi text
    await expect(page.getByRole('button', { name: /हिंदी|hindi/i })).toHaveAttribute('data-selected', 'true')
  })

  test('should allow language change', async ({ page }) => {
    // Navigate to language screen
    await page.waitForTimeout(3500)
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Select English using role
    await page.getByRole('button', { name: /english|अंग्रेजी/i }).click()

    // Verify selection changed
    await expect(page.getByRole('button', { name: /english|अंग्रेजी/i })).toHaveAttribute('data-selected', 'true')

    // Click continue
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Verify tutorial starts
    await expect(page.getByRole('heading', { name: /tutorial|स्वागत/i })).toBeVisible()
  })

  test('should display all 12 tutorial screens', async ({ page }) => {
    // Navigate through onboarding to tutorial
    await page.waitForTimeout(3500)
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')
    await page.getByRole('button', { name: /continue|आगे/i }).click()
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Verify first tutorial screen using role
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Click through all tutorial screens
    for (let i = 1; i <= 12; i++) {
      // Verify current screen heading
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // Verify progress dots update using role
      const activeDot = page.getByRole('listitem').nth(i - 1)
      await expect(activeDot).toHaveClass(/active|current/i)

      // Click next (except last screen)
      if (i < 12) {
        await page.getByRole('button', { name: /next|आगे/i }).click()
      }
    }
  })

  test('should allow skipping tutorial', async ({ page }) => {
    // Navigate to tutorial
    await page.waitForTimeout(3500)
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')
    await page.getByRole('button', { name: /continue|आगे/i }).click()
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Click skip using role and Hindi text
    await page.getByRole('button', { name: /skip|skip करें/i }).click()

    // Verify redirected to registration using role
    await expect(page.getByRole('heading', { name: /mobile|मोबाइल/i })).toBeVisible()
  })

  test('should allow back navigation in tutorial', async ({ page }) => {
    // Navigate to tutorial
    await page.waitForTimeout(3500)
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')
    await page.getByRole('button', { name: /continue|आगे/i }).click()
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Go to screen 3
    await page.getByRole('button', { name: /next|आगे/i }).click()
    await page.getByRole('button', { name: /next|आगे/i }).click()

    // Verify screen 3
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Go back using role
    await page.getByRole('button', { name: /back|पीछे/i }).click()

    // Verify previous screen
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should persist language selection across screens', async ({ page }) => {
    // Navigate to language screen
    await page.waitForTimeout(3500)
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Select Hindi
    await page.getByRole('button', { name: /हिंदी|hindi/i }).click()
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Navigate through tutorial
    await page.getByRole('button', { name: /next|आगे/i }).click()
    await page.getByRole('button', { name: /next|आगे/i }).click()

    // Verify language is still Hindi using role
    await expect(page.getByText(/हिंदी|hindi/i)).toBeVisible()
  })

  test('should redirect to mobile registration after completion', async ({ page }) => {
    // Complete full onboarding flow
    await page.waitForTimeout(3500)
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')
    await page.getByRole('button', { name: /continue|आगे/i }).click()
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Skip tutorial using role and Hindi text
    await page.getByRole('button', { name: /skip|skip करें/i }).click()

    // Verify redirected to mobile number page using role
    await expect(page.getByRole('heading', { name: /mobile number|मोबाइल नंबर/i })).toBeVisible()
    await expect(page).toHaveURL(/\/mobile/)
  })
})
