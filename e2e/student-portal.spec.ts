import { test, expect, type Page } from '@playwright/test';

test.describe('Student Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display student portal after login', async ({ page }) => {
    await performStudentLogin(page);
    
    await expect(page).toHaveURL(/\/portal\/student/);
    await expect(page.locator('h1:has-text("Portal Siswa")')).toBeVisible();
  });

  test('should display academic grades section', async ({ page }) => {
    await performStudentLogin(page);
    
    await expect(page.locator('text=Nilai Akademik')).toBeVisible();
  });

  test('should navigate to academic grades', async ({ page }) => {
    await performStudentLogin(page);
    
    await page.click('a:has-text("Nilai"), button:has-text("Nilai")');
    await expect(page).toHaveURL(/\/grades/);
    await expect(page.locator('h2:has-text("Nilai Akademik")')).toBeVisible();
  });

  test('should display learning modules section', async ({ page }) => {
    await performStudentLogin(page);
    
    await expect(page.locator('text=Modul Pembelajaran')).toBeVisible();
  });

  test('should navigate to E-Library', async ({ page }) => {
    await performStudentLogin(page);
    
    await page.click('a:has-text("Perpustakaan"), button:has-text("Perpustakaan")');
    await expect(page).toHaveURL(/\/elibrary/);
    await expect(page.locator('h2:has-text("Perpustakaan Digital")')).toBeVisible();
  });

  test('should display materials access', async ({ page }) => {
    await performStudentLogin(page);
    
    await expect(page.locator('text=Akses Materi')).toBeVisible();
  });
});

async function performStudentLogin(page: Page) {
  await page.click('button:has-text("Masuk")');
  await page.fill('input[name="username"]', 'siswa123');
  await page.fill('input[name="password"]', 'siswa123');
  await page.click('button:has-text("Login")');
  
  await page.waitForURL(/\/portal\/student/);
}
