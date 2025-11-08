/**
 * Login Page Object Model
 * Handles all interactions with the login page
 */

import { type Page, type Locator, expect } from '@playwright/test';  
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly resetPasswordLink: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]:has-text("Login"), button:has-text("Sign in")');
    this.errorMessage = page.locator('[role="alert"], .error-message, .alert-error');
    this.resetPasswordLink = page.getByRole('button', { name: 'Forgot your password?' })
    this.successMessage = page.locator('.success-message, .alert-success');
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    await this.goto('/login');
    await this.waitForPageLoad();
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Perform complete login action
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * Verify user is redirected to dashboard after successful login
   */
  async verifySuccessfulLogin(): Promise<void> {
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return (await this.errorMessage.textContent()) || '';
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessageVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  /**
   * Click reset password link
   */
  async clickResetPassword(): Promise<void> {
    await this.resetPasswordLink.click();
  }

  /**
   * Verify login form is visible
   */
  async verifyLoginFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  /**
   * Verify validation errors
   */
  async verifyValidationError(fieldName: string): Promise<void> {
    const validationError = this.page.locator(`text=/.*${fieldName}.*/i`).first();
    await expect(validationError).toBeVisible();
  }
}

