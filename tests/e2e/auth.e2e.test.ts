/**
 * E2E Tests for Authentication Flow
 * Tests login, logout, and password reset functionality
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TEST_USERS } from '../fixtures/test-data';
import { clearBrowserState } from './helpers/test-helpers';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page, context }) => {
    
    // Clear all cookies and storage to ensure clean state between tests
    await clearBrowserState(page, context);
    
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Navigate to login page before each test
    await loginPage.navigate();
  });

  test('should display login form', async () => {
    // Verify all form elements are visible
    await loginPage.verifyLoginFormVisible();
    
    // Verify page title
    const title = await loginPage.getTitle();
    expect(title).toContain('Sign In');
  });

  // test('should successfully login with valid credentials', async ({page}) => {
  //   // Arrange - test data from fixtures
  //   const email = process.env.TEST_USER_EMAIL || '';
  //   const password  = process.env.TEST_USER_PASSWORD || '';
  //   // Act - perform login
  //   await loginPage.login(email, password);

  //   // Assert - verify redirect to dashboard
  //   await loginPage.verifySuccessfulLogin();
  //   await dashboardPage.verifyDashboardLoaded();
    
  //   // await dashboardPage.logoutButton.click()
  //   // await page.waitForTimeout(1000);
  //   // const title = await loginPage.getTitle();
    
  //   //   expect(title).toContain('Sign In');
  // });

  test('should show error with invalid credentials', async () => {
    // Arrange
    const { email, password } = TEST_USERS.invalid;

    // Act
    await loginPage.login(email, password);

    // Assert - verify error message is shown
    await loginPage.verifyErrorMessageVisible();
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toContain('invalid');
    
    // Verify user stays on login page
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  test('should show validation error for empty email', async () => {
    // Act - try to login with empty email
    await loginPage.fillPassword('somepassword');
    await loginPage.clickLogin();

    // Assert - verify validation error
    await loginPage.verifyValidationError('email');
  });

  test('should show validation error for empty password', async () => {
    // Act - try to login with empty password
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickLogin();

    // Assert - verify validation error
    await loginPage.verifyValidationError('password');
  });

 



  test('should navigate to password reset page', async () => {
    // Act - click reset password link
    await loginPage.clickResetPassword();

    // Assert - verify navigation to reset password page
    await expect(loginPage.page).toHaveURL(/\/reset-password|\/forgot-password|\/change-password/);
  });

  // test('should persist session after page reload', async ({ page }) => {
  //   // Arrange - login first
  //   const { email, password } = TEST_USERS.valid;
  //   await loginPage.login(email, password);
  //   await loginPage.verifySuccessfulLogin();

  //   // Act - reload the page
  //   await page.reload();

  //   // Assert - user should still be on dashboard (not redirected to login)
  //   await expect(page).toHaveURL(/\/dashboard/);
  //   await dashboardPage.logoutButton.click()
  //   await page.waitForLoadState('networkidle');
  //   const title = await loginPage.getTitle();
    
  //    expect(title).toContain('Sign In');
  // });

  test('should redirect to dashboard if already logged in', async ({ page, context }) => {
    // Arrange - login and get session
    const { email, password } = TEST_USERS.valid;
    await loginPage.login(email, password);
    await loginPage.verifySuccessfulLogin();

    // Act - try to access login page again
    await loginPage.navigate();

    // Assert - should be redirected back to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await dashboardPage.logoutButton.click()
    await page.waitForLoadState('networkidle');
    const title = await loginPage.getTitle();
    
  
  });
});

// test.describe('Authentication - API Integration', () => {
//   test.beforeEach(async ({ page, context }) => {
//     // Clear all cookies and storage to ensure clean state between tests
//     await clearBrowserState(page, context);
//   });

//   test('should handle network errors gracefully', async ({ page, context }) => {
//     const loginPage = new LoginPage(page);
    
//     // Arrange - navigate to login
//     await loginPage.navigate();

//     // Simulate network failure
//     await context.route('**/api/auth/**', (route) => {
//       route.abort('failed');
//     });

//     // Act - try to login
//     await loginPage.login('test@example.com', 'password');

//     // Assert - should show error message
//     await loginPage.verifyErrorMessageVisible();
//   });

//   test('should handle slow API responses', async ({ page, context }) => {
//     const loginPage = new LoginPage(page);
    
//     // Arrange - navigate to login
//     await loginPage.navigate();

//     // Simulate slow API
//     await context.route('**/api/auth/**', async (route) => {
//       await new Promise((resolve) => setTimeout(resolve, 3000));
//       await route.continue();
//     });

//     // Act - perform login
//     const { email, password } = TEST_USERS.valid;
//     await loginPage.login(email, password);

//     // Assert - should eventually succeed or show timeout
//     // This test verifies the app handles slow responses gracefully
//   });
// });

