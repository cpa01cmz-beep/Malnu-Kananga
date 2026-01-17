import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.describe('Home Page', () => {
    test('should match homepage screenshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Login Modal', () => {
    test('should match login modal screenshot', async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Masuk")');
      await page.waitForSelector('[data-testid="login-modal"]');
      await expect(page.locator('[data-testid="login-modal"]')).toHaveScreenshot('login-modal.png', {
        maxDiffPixels: 50,
      });
    });
  });

  test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Masuk")');
      await page.fill('input[name="username"]', 'admin123');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button:has-text("Login")');
      await page.waitForURL(/\/dashboard\/admin/);
    });

    test('should match admin dashboard screenshot', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('admin-dashboard.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    });
  });

  test.describe('Teacher Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Masuk")');
      await page.fill('input[name="username"]', 'guru123');
      await page.fill('input[name="password"]', 'guru123');
      await page.click('button:has-text("Login")');
      await page.waitForURL(/\/dashboard\/teacher/);
    });

    test('should match teacher dashboard screenshot', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('teacher-dashboard.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    });
  });

  test.describe('Parent Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Masuk")');
      await page.fill('input[name="username"]', 'ortu123');
      await page.fill('input[name="password"]', 'ortu123');
      await page.click('button:has-text("Login")');
      await page.waitForURL(/\/dashboard\/parent/);
    });

    test('should match parent dashboard screenshot', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('parent-dashboard.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    });
  });

  test.describe('Student Portal', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Masuk")');
      await page.fill('input[name="username"]', 'siswa123');
      await page.fill('input[name="password"]', 'siswa123');
      await page.click('button:has-text("Login")');
      await page.waitForURL(/\/portal\/student/);
    });

    test('should match student portal screenshot', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('student-portal.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    });
  });

  test.describe('PPDB Registration', () => {
    test('should match PPDB registration form screenshot', async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Daftar PPDB"), a:has-text("Daftar PPDB")');
      await page.waitForSelector('[data-testid="ppdb-registration"]');
      await expect(page.locator('[data-testid="ppdb-registration"]')).toHaveScreenshot('ppdb-registration.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Mobile Views', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should match mobile homepage screenshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });

    test('should match mobile admin dashboard screenshot', async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Masuk")');
      await page.fill('input[name="username"]', 'admin123');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button:has-text("Login")');
      await page.waitForURL(/\/dashboard\/admin/);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('admin-dashboard-mobile.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    });
  });
});
