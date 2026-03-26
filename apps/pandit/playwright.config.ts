import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Testing Configuration
 * For HmarePanditJi voice-enabled onboarding system
 */
export default defineConfig({
  testDir: './e2e',
  
  // Timeout for each test
  timeout: 30 * 1000,
  
  // Timeout for each expectation
  expect: {
    timeout: 5000,
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'e2e/results/report.html' }],
    ['json', { outputFile: 'e2e/results/results.json' }],
    ['list'],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for relative URLs
    baseURL: process.env.BASE_URL || 'http://localhost:3002',
    
    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',
    
    // Capture video on first retry
    video: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Browser context options
    viewport: { width: 375, height: 667 }, // Mobile viewport
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'webkit',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'], channel: 'chrome' },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  // Output directory for test results
  outputDir: 'e2e/results/',
})
