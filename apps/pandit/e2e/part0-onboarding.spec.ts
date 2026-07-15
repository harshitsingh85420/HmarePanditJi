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

  test('should display every tutorial screen (deck-driven, gate-aware)', async ({ page }) => {
    // Navigate through onboarding to tutorial
    await page.waitForTimeout(3500)
    await page.getByRole('button', { name: /manual|मैन्युअल/i }).click()
    await page.getByRole('textbox', { name: /city|शहर/i }).fill('Delhi')
    await page.getByRole('button', { name: /continue|आगे/i }).click()
    await page.getByRole('button', { name: /continue|आगे/i }).click()

    // Verify first tutorial screen using role
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Deck size is DECK-DRIVEN, not hardcoded — the "boring fix" deck is the
    // 6-scene set (कमाई → नई बुकिंग → आवाज़ → सो जाओ/जागो → सत्यापन → स्वागत),
    // but this test asserts against however many progress dots the deck
    // actually renders, so it never re-rots on a re-count.
    const total = await page.getByRole('listitem').count()
    expect(total).toBeGreaterThan(0)

    // Click through every screen. GATE-AWARE: the सो जाओ/जागो (mute) slide
    // disables Next until the mute→unmute cycle OR its 10s timeout opens the
    // gate — so we wait for the Next control to become enabled instead of
    // blind-clicking a locked button. (The आवाज़ mic slide never gates Next.)
    for (let i = 1; i <= total; i++) {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      const activeDot = page.getByRole('listitem').nth(i - 1)
      await expect(activeDot).toHaveClass(/active|current/i)

      if (i < total) {
        // Next reads "⏳ …" while the gate is locked, then reverts to "आगे".
        const next = page.getByRole('button', { name: /next|आगे|⏳/i })
        await expect(next).toBeEnabled({ timeout: 12000 })
        await next.click()
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
