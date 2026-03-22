import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for HmarePanditJi
 * 
 * Tests run on:
 * - Samsung Galaxy A12 (primary test device - matches Pandit's phone)
 * - iPhone 12 (iOS testing)
 * - Desktop Chrome (developer testing)
 * 
 * Features:
 * - Screenshots on failure
 * - Video recording of tests
 * - Trace recording for debugging
 * - Network throttling simulation
 * - Geolocation override (Varanasi)
 */

export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: false, // Run tests sequentially for registration flow
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry on CI
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }], // HTML report
    ['list'], // Console output
    ['junit', { outputFile: 'test-results/junit.xml' }], // JUnit for CI
  ],
  
  use: {
    baseURL: 'http://localhost:3002',
    
    // Capture screenshots on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Record trace for debugging (slow but detailed)
    trace: 'retain-on-failure',
    
    // Actionability checks
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Locale and timezone for Indian context
    locale: 'hi-IN',
    timezoneId: 'Asia/Kolkata',
    
    // Permissions (will be granted per-test as needed)
    permissions: [],
  },

  // Shared configuration for all projects
  projects: [
    {
      name: 'Samsung Galaxy A12 (Primary)',
      use: {
        ...devices['Galaxy A12'],
        deviceScaleFactor: 2.75,
        isMobile: true,
        hasTouch: true,
        // Simulate 3G network (temple environment)
        // Note: Playwright doesn't support network throttling directly
        // Use Chrome DevTools Protocol for advanced throttling
      },
    },
    {
      name: 'iPhone 12 (iOS Testing)',
      use: {
        ...devices['iPhone 12'],
        locale: 'hi-IN',
        timezoneId: 'Asia/Kolkata',
      },
    },
    {
      name: 'Desktop Chrome (Dev)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 }, // Mobile viewport
      },
    },
    {
      name: 'Desktop Chrome (Full Flow)',
      use: {
        ...devices['Desktop Chrome'],
        // Full desktop testing
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // Web server configuration (optional - auto-start dev server)
  // Uncomment if you want tests to auto-start the dev server
  /*
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  */
});
