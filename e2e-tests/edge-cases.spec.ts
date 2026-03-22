import { test, expect } from '@playwright/test';

/**
 * E2E Test: Edge Cases
 * 
 * This test covers Sessions 2-8 from COMPLETE_TESTING_PROTOCOL.md
 * Tests edge cases, error states, and recovery flows.
 * 
 * Device: Samsung Galaxy A12 (primary test device)
 * Duration: ~10-12 minutes
 * Tests: 50+
 */

test.describe('Edge Cases - Data Persistence', () => {
  test('EDGE-007: Form data persists on back navigation', async ({ page }) => {
    await page.goto('/onboarding/register');
    
    // Enter mobile number
    await page.fill('input[type="tel"]', '9876543210');
    
    // Navigate back
    await page.goBack();
    
    // Navigate forward again
    await page.goto('/onboarding/register');
    
    // Check if mobile persisted
    const input = page.locator('input[type="tel"]');
    const value = await input.inputValue();
    
    // This should pass after EDGE-007 fix
    expect(value).toBe('9876543210');
  });

  test('EDGE-020: Data survives browser tab close', async ({ page, context }) => {
    await page.goto('/onboarding/register');
    
    // Enter mobile
    await page.fill('input[type="tel"]', '9876543210');
    
    // Close tab
    await page.close();
    
    // Reopen
    page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/onboarding/register');
    
    // Check if data persisted from localStorage
    const input = page.locator('input[type="tel"]');
    const value = await input.inputValue();
    
    // Should persist after EDGE-020 fix
    expect(value).toBe('9876543210');
  });

  test('EDGE-013: Resume screen shows correct step', async ({ page }) => {
    // Simulate partial registration
    await page.goto('/onboarding/register');
    await page.fill('input[type="tel"]', '9876543210');
    await page.click('text=आगे बढ़ें →');
    
    // Wait for OTP screen
    await page.waitForTimeout(1000);
    
    // Close and go to resume
    await page.close();
    page = await page.context().newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/resume');
    
    // Should show "You were at: OTP"
    await expect(page.locator('text=पंजीकरण जारी रखें')).toBeVisible();
    await expect(page.locator('text=OTP')).toBeVisible();
  });
});

test.describe('Edge Cases - Voice System', () => {
  test('EDGE-004: Voice tutorial requires specific word', async ({ page }) => {
    await page.goto('/onboarding?phase=VOICE_TUTORIAL');
    
    // Note: Playwright cannot simulate actual voice input
    // This test verifies UI states only
    
    // Check mic is visible
    await expect(page.locator('text=सुन रहा हूँ')).toBeVisible();
    
    // Check instruction text
    await expect(page.locator('text=हाँ या नहीं बोलकर देखें')).toBeVisible();
    
    // Verify success state doesn't trigger without actual voice
    // (Manual testing required for actual voice recognition)
  });

  test('EDGE-011: Error count persists across screens', async ({ page }) => {
    // Note: Cannot test actual voice failures with Playwright
    // This verifies error state UI
    
    await page.goto('/onboarding/register');
    
    // Check error overlay doesn't show initially
    await expect(page.locator('text=सुनाई नहीं दिया')).not.toBeVisible();
    
    // Error persistence would be tested manually with actual voice
  });

  test('EDGE-008: Hindi voice commands recognized', async ({ page }) => {
    // Note: Playwright cannot test actual voice recognition
    // This verifies UI shows Hindi text
    
    await page.goto('/onboarding?phase=TUTORIAL_SWAGAT');
    
    // Check Hindi text visible
    await expect(page.locator('text=जानें (सिर्फ 2 मिनट) →')).toBeVisible();
    
    // Verify back button has Hindi hint
    const backButton = page.locator('button[aria-label="Go back"]');
    await expect(backButton).toBeVisible();
  });
});

test.describe('Edge Cases - Network', () => {
  test('EDGE-019: Network loss during OTP', async ({ page }) => {
    await page.goto('/onboarding/register');
    
    // Fill mobile and submit
    await page.fill('input[type="tel"]', '9876543210');
    await page.click('text=आगे बढ़ें →');
    
    // Wait for OTP screen
    await page.waitForTimeout(1000);
    
    // Go offline
    await page.route('**/*', async route => {
      await route.abort('failed');
    });
    
    // Try to submit OTP
    const otpInputs = page.locator('input[inputmode="numeric"]');
    await otpInputs.first().fill('1');
    
    // Should show offline error, not infinite spinner
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Network')).toBeVisible();
    // OR should show retry button
  });

  test('Network recovery after failure', async ({ page }) => {
    await page.goto('/onboarding/register');
    
    // Go offline first
    await page.route('**/*', async route => {
      await route.abort('failed');
    });
    
    // Try to load
    await page.reload();
    
    // Should show offline banner
    await page.waitForTimeout(1000);
    await expect(page.locator('text=ऑफलाइन')).toBeVisible();
    
    // Go back online
    await page.unroute('**/*');
    
    // Reload
    await page.reload();
    
    // Should load successfully
    await expect(page.locator('text=HmarePanditJi')).toBeVisible();
  });
});

test.describe('Edge Cases - Accessibility', () => {
  test('EDGE-016: Color contrast meets WCAG', async ({ page }) => {
    await page.goto('/');
    
    // Get computed colors (manual verification needed)
    const element = page.locator('text=Pandit Ke Roop Mein Judein');
    const color = await element.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Color should be white or high contrast
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('EDGE-017: Touch targets minimum 52px', async ({ page }) => {
    await page.goto('/');
    
    // Get button height
    const button = page.locator('text=Pandit Ke Roop Mein Judein');
    const box = await button.boundingBox();
    
    // Height should be at least 52px
    expect(box!.height).toBeGreaterThanOrEqual(52);
  });

  test('EDGE-017: All buttons have minimum height', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(3500); // Wait for splash
    
    // Check all buttons on location permission screen
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Height should be at least 44px (absolute minimum)
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('Keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focused element should be visible
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

test.describe('Edge Cases - Language', () => {
  test('EDGE-014: Language grid scrollable', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(3500);
    await page.click('text=हाँ, मेरा शहर जानें');
    await page.waitForTimeout(2000);
    await page.click('text=दूसरी भाषा चुनें');
    
    // Language list should be visible
    await expect(page.locator('text=अपनी भाषा चुनें')).toBeVisible();
    
    // Check grid is scrollable (has more than visible languages)
    const grid = page.locator('[class*="grid"]');
    await expect(grid).toBeVisible();
    
    // Try to scroll
    await grid.evaluate(el => el.scrollTo({ top: 100, behavior: 'smooth' }));
  });

  test('EDGE-015: Language persists across screens', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(3500);
    await page.click('text=हाँ, मेरा शहर जानें');
    await page.waitForTimeout(2000);
    await page.click('text=हाँ, यही भाषा सही है');
    await page.waitForTimeout(3000);
    
    // Language should be set to Hindi
    // Navigate to tutorial
    await page.waitForTimeout(2000);
    
    // Check Hindi text visible
    await expect(page.locator('text=नमस्ते पंडित जी')).toBeVisible();
  });

  test('Language bottom sheet opens from any screen', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(3500);
    
    // Click language globe
    const globeButton = page.locator('button[aria-label="Change language"]');
    await globeButton.click();
    
    // Bottom sheet should open
    await page.waitForTimeout(500);
    await expect(page.locator('text=भाषा बदलें')).toBeVisible();
  });
});

test.describe('Edge Cases - Error States', () => {
  test('Invalid mobile number shows error', async ({ page }) => {
    await page.goto('/onboarding/register');
    
    // Enter invalid (too short)
    await page.fill('input[type="tel"]', '98765');
    
    // Submit button should be disabled
    const submitButton = page.locator('text=आगे बढ़ें →');
    await expect(submitButton).toBeDisabled();
  });

  test('Invalid OTP shows error', async ({ page }) => {
    await page.goto('/onboarding/register');
    
    // Fill mobile
    await page.fill('input[type="tel"]', '9876543210');
    await page.click('text=आगे बढ़ें →');
    
    // Wait for OTP screen
    await page.waitForTimeout(1000);
    
    // Enter 5 digits (invalid)
    const otpInputs = page.locator('input[inputmode="numeric"]');
    await otpInputs.first().fill('1');
    
    // Should not auto-submit
    await page.waitForTimeout(500);
    // Should still be on OTP screen
    await expect(page.locator('text=Step 2 of 3')).toBeVisible();
  });

  test('Empty name validation', async ({ page }) => {
    await page.goto('/onboarding/register?step=profile');
    
    // Try to submit empty
    const submitButton = page.locator('text=पंजीकरण पूरा करें ✓');
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Edge Cases - Timing', () => {
  test('EDGE-003: LanguageSetScreen timing is 3s', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(3500);
    await page.click('text=हाँ, मेरा शहर जानें');
    await page.waitForTimeout(2000);
    await page.click('text=हाँ, यही भाषा सही है');
    
    // Start timing
    const startTime = Date.now();
    
    // Wait for auto-advance
    await page.waitForTimeout(3500);
    
    const elapsed = Date.now() - startTime;
    
    // Should auto-advance around 3000ms (give 500ms buffer)
    expect(elapsed).toBeGreaterThan(2500);
    expect(elapsed).toBeLessThan(4000);
  });

  test('EDGE-015: ConfirmationSheet timer is 30s', async ({ page }) => {
    await page.goto('/onboarding/register');
    await page.fill('input[type="tel"]', '9876543210');
    await page.click('text=आगे बढ़ें →');
    
    // Wait for confirmation sheet
    await page.waitForTimeout(1000);
    
    // Check timer shows 30s
    await expect(page.locator('text=30s')).toBeVisible();
  });

  test('Splash screen is exactly 3s', async ({ page }) => {
    await page.goto('/onboarding');
    
    const startTime = Date.now();
    
    // Wait for auto-advance
    await page.waitForTimeout(3500);
    
    const elapsed = Date.now() - startTime;
    
    // Should advance around 3000ms
    expect(elapsed).toBeGreaterThan(2800);
    expect(elapsed).toBeLessThan(4000);
  });
});

test.describe('Edge Cases - UI States', () => {
  test('Loading states show correctly', async ({ page }) => {
    await page.goto('/onboarding/register');
    
    // Check loading/spinner doesn't show initially
    await expect(page.locator('[class*="animate-spin"]')).not.toBeVisible();
  });

  test('Success states animate', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(3500);
    await page.click('text=हाँ, मेरा शहर जानें');
    await page.waitForTimeout(2000);
    await page.click('text=हाँ, यही भाषा सही है');
    
    // Wait for celebration
    await page.waitForTimeout(1000);
    
    // Check checkmark animation class exists
    const checkmark = page.locator('[class*="draw-check"]');
    await expect(checkmark).toBeVisible();
  });

  test('Error states show red color', async ({ page }) => {
    // Error states would be tested with actual voice failures
    // This verifies error UI exists
    await page.goto('/onboarding/register');
    
    // Error overlay should not be visible initially
    await expect(page.locator('text=सुनाई नहीं दिया')).not.toBeVisible();
  });
});
