/**
 * E2E Tests for Dashboard
 * Tests project listing, deletion, pagination, and navigation
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { TEST_USERS } from '../fixtures/test-data.js';
import { clearBrowserState } from './helpers/test-helpers.js';

// Helper function to login before tests
async function loginAsTestUser(loginPage: LoginPage) {
        const email = process.env.TEST_USER_EMAIL || '';
     const password  = process.env.TEST_USER_PASSWORD || '';
 // const { email, password } = TEST_USERS.valid;
  await loginPage.navigate();
  await loginPage.login(email, password);
  await loginPage.verifySuccessfulLogin();
}

test.describe('Dashboard - Project Management', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage to ensure clean state between tests
    await clearBrowserState(page, context);
    
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Login and navigate to dashboard
    await loginAsTestUser(loginPage);
    await dashboardPage.navigate();
  });

  test('should display dashboard with project list', async () => {
    // Wait for projects to load
    await dashboardPage.waitForProjectsToLoad();
    
    // Verify dashboard is loaded
    await dashboardPage.verifyDashboardLoaded();
    
    // Verify new project button is visible
    await expect(dashboardPage.newProjectButton).toBeVisible();
  });

//   test('should display empty state when no projects exist', async ({ page }) => {
//     // This test assumes a fresh account or cleanup
//     // In real scenario, you might need to delete all projects first
    
//     const projectCount = await dashboardPage.getProjectCount();
    
//     if (projectCount === 0) {
//       await dashboardPage.verifyEmptyState();
//     }
//   });

//   test('should navigate to new project page', async () => {
//     // Act
//     await dashboardPage.clickNewProject();
    
//     // Assert
//     await expect(dashboardPage.page).toHaveURL(/\/new/);
//   });

//   test('should display project cards with correct information', async () => {
//     // Wait for projects to load
//     await dashboardPage.waitForProjectsToLoad();
    
//     const projectCount = await dashboardPage.getProjectCount();
    
//     if (projectCount > 0) {
//       // Verify at least one project card is visible
//       await expect(dashboardPage.projectCards.first()).toBeVisible();
      
//       // Verify project card contains expected information
//       // (name, date, test case count, etc.)
//       const firstCard = dashboardPage.projectCards.first();
//       await expect(firstCard).toContainText(/Test|Project/i);
//     }
//   });

//   test('should delete a project successfully', async ({ page }) => {
//     // Wait for projects to load
//     await dashboardPage.waitForProjectsToLoad();
    
//     const initialCount = await dashboardPage.getProjectCount();
    
//     if (initialCount > 0) {
//       // Get first project name
//       const firstProjectText = await dashboardPage.projectCards.first().textContent();
//       const projectName = firstProjectText?.split('\n')[0] || 'Test Project';
      
//       // Set up response listener to verify API call
//       const deletePromise = page.waitForResponse((response) => {
//         return response.url().includes('/api/projects') && response.request().method() === 'DELETE';
//       });
      
//       // Delete the project
//       await dashboardPage.deleteProject(projectName);
      
//       // Wait for API call
//       await deletePromise;
      
//       // Verify project count decreased
//       const newCount = await dashboardPage.getProjectCount();
//       expect(newCount).toBe(initialCount - 1);
//     }
//   });

//   test('should handle pagination correctly', async () => {
//     // Wait for projects to load
//     await dashboardPage.waitForProjectsToLoad();
    
//     // Check if pagination is visible (only if there are multiple pages)
//     const paginationVisible = await dashboardPage.paginationNext.isVisible();
    
//     if (paginationVisible) {
//       // Get projects on first page
//       const firstPageProjects = await dashboardPage.projectCards.allTextContents();
      
//       // Navigate to next page
//       await dashboardPage.goToNextPage();
      
//       // Get projects on second page
//       const secondPageProjects = await dashboardPage.projectCards.allTextContents();
      
//       // Verify different projects are shown
//       expect(firstPageProjects).not.toEqual(secondPageProjects);
      
//       // Navigate back to first page
//       await dashboardPage.goToPreviousPage();
      
//       // Verify we're back to first page projects
//       const backToFirstPage = await dashboardPage.projectCards.allTextContents();
//       expect(backToFirstPage).toEqual(firstPageProjects);
//     }
//   });

//   test('should handle clicking on a project', async ({ page }) => {
//     // Wait for projects to load
//     await dashboardPage.waitForProjectsToLoad();
    
//     const projectCount = await dashboardPage.getProjectCount();
    
//     if (projectCount > 0) {
//       // Get first project name
//       const firstProjectText = await dashboardPage.projectCards.first().textContent();
//       const projectName = firstProjectText?.split('\n')[0] || 'Test Project';
      
//       // Click on project
//       await dashboardPage.clickProject(projectName);
      
//       // Verify navigation to project detail page
//       await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+/);
//     }
//   });
// });

// test.describe('Dashboard - Loading States', () => {
//   test.beforeEach(async ({ page, context }) => {
//     // Clear all cookies and storage to ensure clean state between tests
//     await clearBrowserState(page, context);
//   });

//   test('should show loading state while fetching projects', async ({ page, context }) => {
//     const loginPage = new LoginPage(page);
//     const dashboardPage = new DashboardPage(page);
    
//     // Login
//     await loginAsTestUser(loginPage);
    
//     // Delay API response to see loading state
//     await context.route('**/api/projects**', async (route) => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       await route.continue();
//     });
    
//     // Navigate to dashboard
//     await dashboardPage.navigate();
    
//     // Verify loading spinner is visible
//     await expect(dashboardPage.loadingSpinner).toBeVisible();
    
//     // Wait for loading to complete
//     await dashboardPage.waitForProjectsToLoad();
    
//     // Verify loading spinner is hidden
//     await expect(dashboardPage.loadingSpinner).not.toBeVisible();
//   });
// });

// test.describe('Dashboard - Error Handling', () => {
//   test.beforeEach(async ({ page, context }) => {
//     // Clear all cookies and storage to ensure clean state between tests
//     await clearBrowserState(page, context);
//   });

//   test('should handle API errors gracefully', async ({ page, context }) => {
//     const loginPage = new LoginPage(page);
//     const dashboardPage = new DashboardPage(page);
    
//     // Login
//     await loginAsTestUser(loginPage);
    
//     // Simulate API error
//     await context.route('**/api/projects**', (route) => {
//       route.fulfill({
//         status: 500,
//         contentType: 'application/json',
//         body: JSON.stringify({ error: 'Internal Server Error' }),
//       });
//     });
    
//     // Navigate to dashboard
//     await dashboardPage.navigate();
    
//     // Verify error message is shown
//     const errorMessage = page.locator('[role="alert"], .error-message');
//     await expect(errorMessage).toBeVisible();
//   });
});

