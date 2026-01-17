import { test, expect, type Page } from '@playwright/test';

test.describe('Admin Authentication and Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login modal', async ({ page }) => {
    await page.click('button:has-text("Masuk")');
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Login")')).toBeVisible();
  });

  test('should validate required login fields', async ({ page }) => {
    await page.click('button:has-text("Masuk")');
    await page.click('button:has-text("Login")');
    
    const usernameError = page.locator('text=NIS/NIP wajib diisi');
    const passwordError = page.locator('text=Password wajib diisi');
    
    await expect(usernameError.or(passwordError)).toBeVisible();
  });

  test('should navigate to admin dashboard after login', async ({ page }) => {
    await performAdminLogin(page);
    
    await expect(page).toHaveURL(/\/dashboard\/admin/);
    await expect(page.locator('h1:has-text("Dashboard Admin")')).toBeVisible();
  });

  test('should display admin dashboard sections', async ({ page }) => {
    await performAdminLogin(page);
    
    await expect(page.locator('text=Manajemen Pengguna')).toBeVisible();
    await expect(page.locator('text=Statistik Sistem')).toBeVisible();
    await expect(page.locator('text=Konten Situs')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await performAdminLogin(page);
    
    await page.click('[data-testid="logout-button"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('button:has-text("Masuk")')).toBeVisible();
  });
});

async function performAdminLogin(page: Page) {
  await page.click('button:has-text("Masuk")');
  await page.fill('input[name="username"]', 'admin123');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button:has-text("Login")');
  
  await page.waitForURL(/\/dashboard\/admin/);
}
