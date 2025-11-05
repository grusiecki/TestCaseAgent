/**
 * Dashboard Page Object Model
 * Handles all interactions with the dashboard page
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly newProjectButton: Locator;
  readonly projectCards: Locator;
  readonly projectCard: (projectName: string) => Locator;
  readonly deleteButton: (projectName: string) => Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrevious: Locator;
  readonly searchInput: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;
  readonly projectStats: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.pageTitle = page.locator('h1, h2').first();
    this.newProjectButton = page.locator('button:has-text("New Project"), a:has-text("Create Project")');
    this.projectCards = page.locator('[data-testid="project-card"], .project-card');
    this.projectCard = (projectName: string) => 
      page.locator(`[data-testid="project-card"]:has-text("${projectName}"), .project-card:has-text("${projectName}")`);
    this.deleteButton = (projectName: string) => 
      this.projectCard(projectName).locator('button:has-text("Delete"), button[aria-label*="Delete"]');
    this.confirmDeleteButton = page.locator('button:has-text("Delete"), button:has-text("Confirm")').last();
    this.cancelDeleteButton = page.locator('button:has-text("Cancel")');
    this.paginationNext = page.locator('button:has-text("Next"), button[aria-label*="Next page"]');
    this.paginationPrevious = page.locator('button:has-text("Previous"), button[aria-label*="Previous page"]');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.loadingSpinner = page.locator('[role="progressbar"], .loading-spinner');
    this.emptyState = page.locator('.empty-state, [data-testid="empty-state"]');
    this.projectStats = page.locator('.stats, [data-testid="stats"]');
  }

  /**
   * Navigate to dashboard page
   */
  async navigate(): Promise<void> {
    await this.goto('/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Wait for projects to load
   */
  async waitForProjectsToLoad(): Promise<void> {
    // Wait for loading spinner to disappear
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 2000 });
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      // Loading might not appear if response is fast
    }
  }

  /**
   * Click new project button
   */
  async clickNewProject(): Promise<void> {
    await this.newProjectButton.click();
    await this.page.waitForURL('**/new', { timeout: 5000 });
  }

  /**
   * Get number of visible projects
   */
  async getProjectCount(): Promise<number> {
    await this.waitForProjectsToLoad();
    return await this.projectCards.count();
  }

  /**
   * Verify project exists on dashboard
   */
  async verifyProjectExists(projectName: string): Promise<void> {
    await expect(this.projectCard(projectName)).toBeVisible();
  }

  /**
   * Click on a specific project
   */
  async clickProject(projectName: string): Promise<void> {
    await this.projectCard(projectName).click();
  }

  /**
   * Delete a project
   */
  async deleteProject(projectName: string): Promise<void> {
    await this.deleteButton(projectName).click();
    await this.confirmDeleteButton.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
    
    // Wait for deletion to complete
    await this.waitForProjectsToLoad();
  }

  /**
   * Verify project does not exist
   */
  async verifyProjectNotExists(projectName: string): Promise<void> {
    await expect(this.projectCard(projectName)).not.toBeVisible();
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    await this.paginationNext.click();
    await this.waitForProjectsToLoad();
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.paginationPrevious.click();
    await this.waitForProjectsToLoad();
  }

  /**
   * Verify pagination controls are visible
   */
  async verifyPaginationVisible(): Promise<void> {
    await expect(this.paginationNext).toBeVisible();
  }

  /**
   * Verify empty state is shown
   */
  async verifyEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Get project statistics
   */
  async getProjectStatistics(): Promise<{ total: number; testCases: number }> {
    const statsText = await this.projectStats.textContent();
    // Parse statistics from text (implementation depends on actual format)
    return {
      total: 0,
      testCases: 0,
    };
  }

  /**
   * Search for projects
   */
  async searchProjects(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForProjectsToLoad();
  }

  /**
   * Verify dashboard page is loaded
   */
  async verifyDashboardLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.newProjectButton).toBeVisible();
  }
}

