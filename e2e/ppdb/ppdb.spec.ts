import { test, expect } from '@playwright/test';

test.describe('PPDB Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="username-input"]', 'admin');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);
  });

  test('should access PPDB registration page', async ({ page }) => {
    await page.goto('/ppdb');

    await expect(page.locator('h1')).toContainText('Penerimaan Peserta Didik Baru');
    await expect(page.locator('[data-testid="registration-form"]')).toBeVisible();
  });

  test('should validate required fields on PPDB registration', async ({ page }) => {
    await page.goto('/ppdb');
    await page.click('[data-testid="submit-registration"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
  });

  test('should submit PPDB registration with valid data', async ({ page }) => {
    await page.goto('/ppdb');

    const studentData = {
      name: 'John Doe',
      nisn: '1234567890',
      email: 'john.doe@example.com',
      phone: '081234567890',
      previousSchool: 'SMP Negeri 1 Jakarta',
      birthDate: '2010-01-15',
      address: 'Jl. Test No. 123, Jakarta'
    };

    await page.fill('[data-testid="student-name"]', studentData.name);
    await page.fill('[data-testid="nisn"]', studentData.nisn);
    await page.fill('[data-testid="email"]', studentData.email);
    await page.fill('[data-testid="phone"]', studentData.phone);
    await page.fill('[data-testid="previous-school"]', studentData.previousSchool);
    await page.fill('[data-testid="birth-date"]', studentData.birthDate);
    await page.fill('[data-testid="address"]', studentData.address);

    await page.setInputFiles('[data-testid="document-upload"]', 'tests/fixtures/test-document.pdf');

    await page.click('[data-testid="submit-registration"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Pendaftaran berhasil dikirim');
  });

  test('should validate document upload file type', async ({ page }) => {
    await page.goto('/ppdb');

    await page.fill('[data-testid="student-name"]', 'Test Student');
    await page.fill('[data-testid="nisn"]', '1234567890');
    await page.fill('[data-testid="email"]', 'test@example.com');

    await page.setInputFiles('[data-testid="document-upload"]', 'tests/fixtures/test-image.jpg');

    await page.click('[data-testid="submit-registration"]');

    await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-error"]')).toContainText('File harus berupa PDF');
  });

  test('should validate document upload file size', async ({ page }) => {
    await page.goto('/ppdb');

    await page.fill('[data-testid="student-name"]', 'Test Student');
    await page.fill('[data-testid="nisn"]', '1234567890');
    await page.fill('[data-testid="email"]', 'test@example.com');

    await page.setInputFiles('[data-testid="document-upload"]', 'tests/fixtures/large-file.pdf');

    await page.click('[data-testid="submit-registration"]');

    await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-error"]')).toContainText('Ukuran file maksimal 5MB');
  });

  test('should show registration status after submission', async ({ page }) => {
    await page.goto('/ppdb');
    await page.goto('/ppdb/status');

    await expect(page.locator('[data-testid="registration-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-card"]')).toBeVisible();
  });

  test('should allow admin to review PPDB applications', async ({ page }) => {
    await page.goto('/admin/ppdb');

    await expect(page.locator('h1')).toContainText('Manajemen PPDB');
    await expect(page.locator('[data-testid="applications-table"]')).toBeVisible();
  });

  test('should allow admin to approve PPDB application', async ({ page }) => {
    await page.goto('/admin/ppdb');

    await page.click('[data-testid="view-application"]:first-child');
    await page.waitForURL(/admin\/ppdb\/\d+/);

    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should allow admin to reject PPDB application', async ({ page }) => {
    await page.goto('/admin/ppdb');

    await page.click('[data-testid="view-application"]:first-child');
    await page.waitForURL(/admin\/ppdb\/\d+/);

    await page.click('[data-testid="reject-button"]');
    await expect(page.locator('[data-testid="confirmation-modal"]')).toBeVisible();

    await page.click('[data-testid="confirm-reject"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should allow admin to export PPDB application as PDF', async ({ page }) => {
    await page.goto('/admin/ppdb');

    await page.click('[data-testid="view-application"]:first-child');
    await page.waitForURL(/admin\/ppdb\/\d+/);

    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf-button"]');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/ppdb-application-\d+\.pdf/);
  });

  test('should filter PPDB applications by status', async ({ page }) => {
    await page.goto('/admin/ppdb');

    await page.click('[data-testid="status-filter"]');
    await page.click('[data-testid="filter-pending"]');

    await expect(page.locator('[data-testid="application-row"]')).toHaveCount(5);
  });

  test('should search PPDB applications by name', async ({ page }) => {
    await page.goto('/admin/ppdb');

    await page.fill('[data-testid="search-input"]', 'John');

    await expect(page.locator('[data-testid="application-row"]')).toHaveCount(3);
  });
});
