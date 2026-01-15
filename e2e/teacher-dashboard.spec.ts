import { test, expect, type Page } from '@playwright/test';

test.describe('Teacher Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display teacher dashboard after login', async ({ page }) => {
    await performTeacherLogin(page);

    await expect(page).toHaveURL(/\/dashboard\/teacher/);
    await expect(page.locator('h1:has-text("Dashboard Guru")')).toBeVisible();
  });

  test('should display attendance management section', async ({ page }) => {
    await performTeacherLogin(page);

    await expect(page.locator('text=Absensi')).toBeVisible();
    await expect(page.locator('text=Kelola Absensi')).toBeVisible();
  });

  test('should navigate to attendance view', async ({ page }) => {
    await performTeacherLogin(page);

    await page.click('a:has-text("Absensi"), button:has-text("Absensi")');
    await expect(page).toHaveURL(/\/attendance/);
    await expect(page.locator('h2:has-text("Kelola Absensi")')).toBeVisible();
  });

  test('should display grading management section', async ({ page }) => {
    await performTeacherLogin(page);

    await expect(page.locator('text=Nilai')).toBeVisible();
    await expect(page.locator('text=Kelola Nilai')).toBeVisible();
  });

  test('should display material management section', async ({ page }) => {
    await performTeacherLogin(page);

    await expect(page.locator('text=Materi')).toBeVisible();
    await expect(page.locator('text=Kelola Materi')).toBeVisible();
  });

  test('should navigate to grading management', async ({ page }) => {
    await performTeacherLogin(page);

    await page.click('a:has-text("Nilai"), button:has-text("Nilai")');
    await expect(page).toHaveURL(/\/grades/);
    await expect(page.locator('h2:has-text("Kelola Nilai")')).toBeVisible();
  });
});

async function performTeacherLogin(page: Page) {
  await page.click('button:has-text("Masuk")');
  await page.fill('input[name="username"]', 'guru123');
  await page.fill('input[name="password"]', 'guru123');
  await page.click('button:has-text("Login")');

  await page.waitForURL(/\/dashboard\/teacher/);
}
