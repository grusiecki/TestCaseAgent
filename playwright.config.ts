import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Playwright configuration for E2E testing
 * Following guidelines: Chromium only, Page Object Model, API testing
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Test file pattern
  testMatch: '**/*.e2e.test.ts',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI for stability
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
   
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4321/',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Maximum time each action such as `click()` can take
    actionTimeout: 10 * 1000,
    
    // Maximum time for navigation
    navigationTimeout: 15 * 1000,
  },

  // Configure projects for Chromium only as per guidelines
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Browser context options
        viewport: { width: 1280, height: 720 },
        // Emulate user preferences
        colorScheme: 'light',
        locale: 'en-US',
        timezoneId: 'America/New_York',
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // Output folder for test artifacts
  outputDir: 'test-results/',
});

