import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Error Scenarios
 * Tests network failures, voice failures, and session timeouts
 * 
 * Updated with:
 * - Hindi text locators
 * - Role-based queries (getByRole, getByLabel)
 * - Accessibility-first selectors
 */

test.describe('Error Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mobile')
  })

  test('should show amber banner on network loss', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Try to submit mobile number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify amber banner is shown using role
    await expect(page.getByRole('status', { name: /network|नेटवर्क/i })).toBeVisible()

    // Verify state is preserved
    await expect(page.getByRole('textbox', { name: /mobile|मोबाइल/i })).toHaveValue(/98765/)
  })

  test('should show green banner on network restore', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Try to submit using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Go online
    await context.setOffline(false)

    // Verify green banner is shown using role
    await expect(page.getByRole('status', { name: /reconnected|connected/i })).toBeVisible()
  })

  test('should continue flow after network restore', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Submit mobile number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Go online
    await context.setOffline(false)

    // Wait for banner to disappear
    await page.waitForTimeout(3000)

    // Click continue again using role
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify OTP page is displayed using role
    await expect(page.getByRole('heading', { name: /otp/i })).toBeVisible()
  })

  test('should show keyboard after 3 voice failures', async ({ page }) => {
    // Click voice button using role
    await page.getByRole('button', { name: /voice|mic|माइक/i }).click()

    // Simulate 3 voice failures
    for (let i = 0; i < 3; i++) {
      // Wait for voice timeout
      await page.waitForTimeout(8000)
    }

    // Verify keyboard fallback is shown using role
    await expect(page.getByRole('button', { name: /keyboard|कीबोर्ड/i })).toBeVisible()

    // Verify manual input works using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await expect(page.getByRole('textbox', { name: /mobile|मोबाइल/i })).toHaveValue(/98765/)
  })

  test('should show session timeout sheet after 30 minutes', async ({ page }) => {
    // Mock time to fast-forward 30 minutes
    await page.evaluate(() => {
      // Simulate session timeout
      window.dispatchEvent(new CustomEvent('session-timeout'))
    })

    // Verify timeout sheet is shown using role
    await expect(page.getByRole('dialog', { name: /timeout|समाप्त/i })).toBeVisible()
  })

  test('should resume session from timeout', async ({ page }) => {
    // Trigger timeout
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('session-timeout'))
    })

    // Click resume using role
    await page.getByRole('button', { name: /resume|जारी/i }).click()

    // Verify sheet is closed
    await expect(page.getByRole('dialog', { name: /timeout|समाप्त/i })).not.toBeVisible()

    // Verify user can continue using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify OTP page using role
    await expect(page.getByRole('heading', { name: /otp/i })).toBeVisible()
  })

  test('should handle browser back button', async ({ page }) => {
    // Complete mobile number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify OTP page using role
    await expect(page.getByRole('heading', { name: /otp/i })).toBeVisible()

    // Go back
    await page.goBack()

    // Verify back on mobile page using role
    await expect(page.getByRole('heading', { name: /mobile number|मोबाइल नंबर/i })).toBeVisible()

    // Verify number is preserved using role
    await expect(page.getByRole('textbox', { name: /mobile|मोबाइल/i })).toHaveValue(/98765/)
  })

  test('should preserve state on tab close/reopen', async ({ page, context }) => {
    // Enter mobile number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')

    // Close tab
    await page.close()

    // Reopen tab
    const newPage = await context.newPage()
    await newPage.goto('/mobile')

    // Verify state is preserved from session storage using role
    await expect(newPage.getByRole('textbox', { name: /mobile|मोबाइल/i })).toHaveValue(/98765/)
  })

  test('should show error for invalid mobile number format', async ({ page }) => {
    // Enter invalid characters using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('abcdefghij')

    // Click continue using role
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify error message using role and Hindi text
    await expect(page.getByRole('alert')).toContainText(/valid|मान्य|i/i)
  })

  test('should show error for invalid OTP', async ({ page }) => {
    // Enter mobile number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Enter wrong OTP length using role
    await page.getByRole('textbox', { name: /otp/i }).fill('9999999')

    // Click verify using role
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Verify error message using role and Hindi text
    await expect(page.getByRole('alert')).toContainText(/6|छह|digits|अंक/i)
  })

  test('should show error for empty profile name', async ({ page }) => {
    // Complete mobile and OTP using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()
    await page.getByRole('textbox', { name: /otp/i }).fill('123456')
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Leave name empty and continue using role
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify error message in Hindi using role
    await expect(page.getByRole('alert')).toContainText(/नाम|name/i)
  })

  test('should handle voice timeout correctly (8s for numbers)', async ({ page }) => {
    // Click voice button using role
    await page.getByRole('button', { name: /voice|mic|माइक/i }).click()

    // Wait for 8 second timeout
    await page.waitForTimeout(8500)

    // Verify timeout message or fallback using role
    await expect(page.getByRole('alert', { name: /timeout|समय/i })).toBeVisible()
  })

  test('should handle voice timeout correctly (12s for names)', async ({ page }) => {
    // Complete to profile page using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()
    await page.getByRole('textbox', { name: /otp/i }).fill('123456')
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Click voice button on profile page using role
    await page.getByRole('button', { name: /voice|mic|माइक/i }).click()

    // Wait for 12 second timeout
    await page.waitForTimeout(12500)

    // Verify timeout message or fallback using role
    await expect(page.getByRole('alert', { name: /timeout|समय/i })).toBeVisible()
  })
})
