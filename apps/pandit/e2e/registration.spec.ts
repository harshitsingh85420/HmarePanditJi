import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Registration Flow
 * Tests mobile number entry, OTP verification, and profile creation
 * 
 * Updated with:
 * - Hindi text locators
 * - Role-based queries (getByRole, getByLabel)
 * - Accessibility-first selectors
 */

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to mobile number page
    await page.goto('/mobile')
  })

  test('should display mobile number input page', async ({ page }) => {
    // Verify page title using role and Hindi text
    await expect(page.getByRole('heading', { name: /mobile number|मोबाइल नंबर/i })).toBeVisible()

    // Verify input field is visible using role
    await expect(page.getByRole('textbox', { name: /mobile|मोबाइल/i })).toBeVisible()

    // Verify voice button is visible using role
    await expect(page.getByRole('button', { name: /voice|mic|माइक/i })).toBeVisible()
  })

  test('should accept manual mobile number input', async ({ page }) => {
    // Enter mobile number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')

    // Verify number is formatted (check input value)
    const inputValue = await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).inputValue()
    expect(inputValue).toContain('98765')

    // Click continue using role
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify OTP page is displayed using role
    await expect(page.getByRole('heading', { name: /otp/i })).toBeVisible()
  })

  test('should validate 10-digit mobile number', async ({ page }) => {
    // Enter short number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('12345')

    // Click continue
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify error message using role and Hindi text
    await expect(page.getByRole('alert')).toContainText(/10|दस|digits|अंक/i)

    // Enter valid number
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')

    // Verify no error (alert should not be visible)
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  test('should display OTP input after mobile number', async ({ page }) => {
    // Enter and submit mobile number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify OTP page using role
    await expect(page.getByRole('heading', { name: /otp/i })).toBeVisible()

    // Verify OTP input is visible using role
    await expect(page.getByRole('textbox', { name: /otp/i })).toBeVisible()

    // Verify resend button is visible using role
    await expect(page.getByRole('button', { name: /resend|again|दोबारा/i })).toBeVisible()
  })

  test('should validate 6-digit OTP', async ({ page }) => {
    // Enter and submit mobile number
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Enter short OTP using role
    await page.getByRole('textbox', { name: /otp/i }).fill('123')

    // Click verify using role
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Verify error message using role and Hindi text
    await expect(page.getByRole('alert')).toContainText(/6|छह|digits|अंक/i)
  })

  test('should accept manual OTP input', async ({ page }) => {
    // Enter and submit mobile number
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Enter OTP using role
    await page.getByRole('textbox', { name: /otp/i }).fill('123456')

    // Click verify using role
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Verify profile page is displayed using role
    await expect(page.getByRole('heading', { name: /name|नाम/i })).toBeVisible()
  })

  test('should display profile input page after OTP', async ({ page }) => {
    // Complete mobile and OTP using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()
    await page.getByRole('textbox', { name: /otp/i }).fill('123456')
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Verify profile page using role
    await expect(page.getByRole('heading', { name: /name|नाम/i })).toBeVisible()

    // Verify name input is visible using role
    await expect(page.getByRole('textbox', { name: /name|नाम/i })).toBeVisible()

    // Verify voice button is visible using role
    await expect(page.getByRole('button', { name: /voice|mic|माइक/i })).toBeVisible()
  })

  test('should validate profile name', async ({ page }) => {
    // Complete mobile and OTP using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()
    await page.getByRole('textbox', { name: /otp/i }).fill('123456')
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Leave name empty and click continue
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify error message using role and Hindi text
    await expect(page.getByRole('alert')).toContainText(/name|नाम/i)
  })

  test('should accept profile name and complete registration', async ({ page }) => {
    // Complete mobile and OTP using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()
    await page.getByRole('textbox', { name: /otp/i }).fill('123456')
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Enter name using role
    await page.getByRole('textbox', { name: /name|नाम/i }).fill('Ramesh Sharma')

    // Click continue using role
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Verify completion page using role
    await expect(page.getByRole('heading', { name: /बधाई हो|congratulations/i })).toBeVisible()

    // Verify celebration animation using role
    await expect(page.getByRole('status')).toBeVisible()
  })

  test('should capitalize profile name automatically', async ({ page }) => {
    // Complete mobile and OTP using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()
    await page.getByRole('textbox', { name: /otp/i }).fill('123456')
    await page.getByRole('button', { name: /verify|सत्यापित/i }).click()

    // Enter lowercase name using role
    await page.getByRole('textbox', { name: /name|नाम/i }).fill('ramesh sharma')

    // Blur the input
    await page.getByRole('textbox', { name: /name|नाम/i }).blur()

    // Verify capitalization (check input value)
    const inputValue = await page.getByRole('textbox', { name: /name|नाम/i }).inputValue()
    expect(inputValue).toMatch(/Ramesh Sharma/)
  })

  test('should allow resending OTP', async ({ page }) => {
    // Enter and submit mobile number using role
    await page.getByRole('textbox', { name: /mobile|मोबाइल/i }).fill('9876543210')
    await page.getByRole('button', { name: /continue|आगे|next/i }).click()

    // Wait for resend timer
    await page.waitForTimeout(30000)

    // Click resend using role
    await page.getByRole('button', { name: /resend|again|दोबारा/i }).click()

    // Verify success message using role
    await expect(page.getByRole('status')).toContainText(/resent|भेजा/i)
  })
})
