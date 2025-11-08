/**
 * Utility functions for tests
 */

import {  expect, type Page } from '@playwright/test';

/**
 * Wait for element to be visible with custom timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Fill form field and wait for it to be filled
 */
export async function fillField(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await page.fill(selector, value);
  await expect(page.locator(selector)).toHaveValue(value);
}

/**
 * Click element and wait for navigation
 */
export async function clickAndWaitForNavigation(
  page: Page,
  selector: string,
  urlPattern?: string | RegExp
): Promise<void> {
  await Promise.all([
    page.waitForURL(urlPattern || '**', { waitUntil: 'networkidle' }),
    page.click(selector),
  ]);
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Wait for multiple API responses
 */
export async function waitForMultipleAPIResponses(
  page: Page,
  urlPatterns: (string | RegExp)[],
  timeout: number = 10000
): Promise<void> {
  const promises = urlPatterns.map((pattern) =>
    waitForAPIResponse(page, pattern, timeout)
  );
  await Promise.all(promises);
}

/**
 * Check if element exists (without throwing)
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    const element = await page.locator(selector).first();
    return (await element.count()) > 0;
  } catch {
    return false;
  }
}

/**
 * Get element text content
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string> {
  const element = page.locator(selector);
  return (await element.textContent()) || '';
}

/**
 * Wait for loading to complete (useful for spinners/skeletons)
 */
export async function waitForLoadingComplete(
  page: Page,
  loadingSelector: string = '[role="progressbar"]',
  timeout: number = 10000
): Promise<void> {
  try {
    await page.waitForSelector(loadingSelector, {
      state: 'visible',
      timeout: 2000,
    });
  } catch {
    // Loading might not appear if response is fast
    return;
  }

  await page.waitForSelector(loadingSelector, {
    state: 'hidden',
    timeout,
  });
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: any,
  status: number = 200
): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Clear local storage and session storage
 */
export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Set local storage item
 */
export async function setLocalStorageItem(
  page: Page,
  key: string,
  value: any
): Promise<void> {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key, value }
  );
}

/**
 * Get local storage item
 */
export async function getLocalStorageItem(
  page: Page,
  key: string
): Promise<any> {
  return page.evaluate((key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, key);
}

/**
 * Retry action with exponential backoff
 */
export async function retryWithBackoff<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

