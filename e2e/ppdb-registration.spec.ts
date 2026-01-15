import { test, expect } from '@playwright/test';

test.describe('PPDB Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open PPDB registration form', async ({ page }) => {
    await page.click('button:has-text("Daftar PPDB"), a:has-text("Daftar PPDB")');
    await expect(page.locator('[data-testid="ppdb-registration"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Pendaftaran Peserta Didik Baru")')).toBeVisible();
  });

  test('should validate required PPDB fields', async ({ page }) => {
    await page.click('button:has-text("Daftar PPDB"), a:has-text("Daftar PPDB")');
    await page.click('button:has-text("Kirim Pendaftaran"), button:has-text("Submit")');

    const nameError = page.locator('text=Nama lengkap wajib diisi');
    const phoneError = page.locator('text=Nomor telepon wajib diisi');
    const addressError = page.locator('text=Alamat wajib diisi');

    await expect(nameError.or(phoneError).or(addressError)).toBeVisible();
  });

  test('should fill PPDB registration form', async ({ page }) => {
    await page.click('button:has-text("Daftar PPDB"), a:has-text("Daftar PPDB")');

    await page.fill('input[name="fullName"]', 'Test Calon Siswa');
    await page.fill('input[name="phone"]', '081234567890');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="address"]', 'Jl. Test No. 123');
    await page.fill('input[name="schoolOrigin"]', 'SMP Test');
    await page.fill('input[name="parentName"]', 'Orang Tua Test');

    const submitButton = page.locator('button:has-text("Kirim Pendaftaran"), button:has-text("Submit")');
    await expect(submitButton).toBeEnabled();
  });

  test('should have document upload input available', async ({ page }) => {
    await page.click('button:has-text("Daftar PPDB"), a:has-text("Daftar PPDB")');

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute('accept', '.pdf,.jpg,.jpeg,.png');
  });

  test('should save draft registration', async ({ page }) => {
    await page.click('button:has-text("Daftar PPDB"), a:has-text("Daftar PPDB")');

    await page.fill('input[name="fullName"]', 'Draft Siswa');
    await page.click('button:has-text("Simpan Draft")');

    await expect(page.locator('text=Draft tersimpan')).toBeVisible();
  });

  test('should display registration confirmation', async ({ page }) => {
    await page.click('button:has-text("Daftar PPDB"), a:has-text("Daftar PPDB")');

    await page.fill('input[name="fullName"]', 'Test Calon Siswa');
    await page.fill('input[name="phone"]', '081234567890');
    await page.fill('textarea[name="address"]', 'Jl. Test No. 123');
    await page.fill('input[name="schoolOrigin"]', 'SMP Test');
    await page.fill('input[name="parentName"]', 'Orang Tua Test');

    await page.click('button:has-text("Kirim Pendaftaran"), button:has-text("Submit")');

    await expect(page.locator('text=Pendaftaran berhasil dikirim')).toBeVisible();
  });
});
