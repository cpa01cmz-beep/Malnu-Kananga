import { test, expect, type Page } from '@playwright/test';

test.describe('Parent Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display parent dashboard after login', async ({ page }) => {
    await performParentLogin(page);
    
    await expect(page).toHaveURL(/\/dashboard\/parent/);
    await expect(page.locator('h1:has-text("Dashboard Orang Tua")')).toBeVisible();
  });

  test('should display child overview section', async ({ page }) => {
    await performParentLogin(page);
    
    await expect(page.locator('text=Ringkasan Anak')).toBeVisible();
  });

  test('should navigate to attendance view', async ({ page }) => {
    await performParentLogin(page);
    
    await page.click('a:has-text("Absensi"), button:has-text("Absensi")');
    await expect(page).toHaveURL(/\/attendance/);
    await expect(page.locator('h2:has-text("Absensi Siswa")')).toBeVisible();
  });

  test('should navigate to grades view', async ({ page }) => {
    await performParentLogin(page);
    
    await page.click('a:has-text("Nilai"), button:has-text("Nilai")');
    await expect(page).toHaveURL(/\/grades/);
    await expect(page.locator('h2:has-text("Nilai Siswa")')).toBeVisible();
  });

  test('should navigate to payments view', async ({ page }) => {
    await performParentLogin(page);
    
    await page.click('a:has-text("Pembayaran"), button:has-text("Pembayaran")');
    await expect(page).toHaveURL(/\/payments/);
    await expect(page.locator('h2:has-text("Pembayaran")')).toBeVisible();
  });

  test('should navigate to schedule view', async ({ page }) => {
    await performParentLogin(page);
    
    await page.click('a:has-text("Jadwal"), button:has-text("Jadwal")');
    await expect(page).toHaveURL(/\/schedule/);
    await expect(page.locator('h2:has-text("Jadwal Pelajaran")')).toBeVisible();
  });
});

async function performParentLogin(page: Page) {
  await page.click('button:has-text("Masuk")');
  await page.fill('input[name="username"]', 'ortu123');
  await page.fill('input[name="password"]', 'ortu123');
  await page.click('button:has-text("Login")');
  
  await page.waitForURL(/\/dashboard\/parent/);
}
