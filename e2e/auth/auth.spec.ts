import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testUser = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@malnu.sch.id'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login modal by default', async ({ page }) => {
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Masuk');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', testUser.username);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', 'invalid');
    await page.fill('[data-testid="password-input"]', 'wrong');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Username atau password salah');
  });

  test('should show forgot password modal', async ({ page }) => {
    await page.click('[data-testid="forgot-password-link"]');

    await expect(page.locator('[data-testid="forgot-password-modal"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Reset Password');
  });

  test('should request password reset with valid email', async ({ page }) => {
    await page.click('[data-testid="forgot-password-link"]');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.click('[data-testid="reset-password-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Email reset password telah dikirim');
  });

  test('should logout successfully', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', testUser.username);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should validate required fields on login', async ({ page }) => {
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="username-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="password-input"]');
    const toggleButton = page.locator('[data-testid="toggle-password"]');

    await page.fill('[data-testid="password-input"]', testUser.password);
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
