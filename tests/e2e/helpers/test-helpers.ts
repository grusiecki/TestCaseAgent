/**
 * Helper functions for E2E tests
 * Provides utilities for test setup, cleanup, and common operations
 */

import { Page, BrowserContext } from '@playwright/test';

/**
 * Clear all browser state (cookies, storage, permissions)
 * Use this in beforeEach to ensure tests start with clean state
 * 
 * @param page - Playwright Page object
 * @param context - Playwright BrowserContext object
 * 
 * @example
 * test.beforeEach(async ({ page, context }) => {
 *   await clearBrowserState(page, context);
 * });
 */
export async function clearBrowserState(page: Page, context: BrowserContext): Promise<void> {
  // Clear all cookies
  await context.clearCookies();
  
  // Clear permissions
  await context.clearPermissions();
}

/**
 * Wait for all network requests to complete
 * Useful for ensuring page is fully loaded before assertions
 * 
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Take a screenshot with a descriptive name
 * Automatically creates screenshots in test-results directory
 * 
 * @param page - Playwright Page object
 * @param name - Descriptive name for the screenshot
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await page.screenshot({
    path: `test-results/screenshots/${sanitizedName}.png`,
    fullPage: true,
  });
}

/**
 * Check if an element is visible and enabled
 * Common assertion pattern for interactive elements
 * 
 * @param page - Playwright Page object
 * @param selector - CSS selector for the element
 * @returns Promise<boolean>
 */
export async function isElementVisibleAndEnabled(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  const isVisible = await element.isVisible();
  const isEnabled = await element.isEnabled();
  return isVisible && isEnabled;
}

/**
 * Wait for a specific URL pattern
 * Useful for verifying navigation after actions
 * 
 * @param page - Playwright Page object
 * @param urlPattern - RegExp or string to match against URL
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 */
export async function waitForUrl(
  page: Page,
  urlPattern: RegExp | string,
  timeout = 10000
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Get all console messages from the page
 * Useful for debugging and checking for errors
 * 
 * @param page - Playwright Page object
 * @returns Promise<string[]> Array of console message texts
 */
export async function getConsoleMessages(page: Page): Promise<string[]> {
  const messages: string[] = [];
  
  page.on('console', (msg) => {
    messages.push(`${msg.type()}: ${msg.text()}`);
  });
  
  return messages;
}

/**
 * Check if the page has any console errors
 * Useful for catching JavaScript errors during tests
 * 
 * @param page - Playwright Page object
 * @returns Promise<string[]> Array of error messages
 */
export async function captureConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  return errors;
}

