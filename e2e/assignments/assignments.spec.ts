import { test, expect } from '@playwright/test';

test.describe('Assignment Lifecycle', () => {
  const teacher = {
    username: 'guru1',
    password: 'password123'
  };

  const student = {
    username: 'siswa1',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Teacher: should create assignment', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/assignment-creation');

    await page.fill('[data-testid="assignment-title"]', 'Matematika - Latihan Soal');
    await page.fill('[data-testid="assignment-description"]', 'Latihan soal aljabar dasar');
    await page.selectOption('[data-testid="assignment-type"]', 'ASSIGNMENT');
    await page.selectOption('[data-testid="assignment-subject"]', 'Matematika');
    await page.selectOption('[data-testid="assignment-class"]', 'X A');
    await page.fill('[data-testid="max-score"]', '100');
    await page.fill('[data-testid="due-date"]', '2026-02-15');

    await page.click('[data-testid="add-criteria"]');
    await page.fill('[data-testid="criteria-name-0"]', 'Pemahaman konsep');
    await page.fill('[data-testid="criteria-weight-0"]', '40');

    await page.click('[data-testid="publish-assignment"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Tugas berhasil dipublikasikan');
  });

  test('Teacher: should save assignment as draft', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/assignment-creation');

    await page.fill('[data-testid="assignment-title"]', 'Draft Assignment');
    await page.fill('[data-testid="assignment-description"]', 'Draft description');
    await page.click('[data-testid="save-draft"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Draft berhasil disimpan');
  });

  test('Student: should submit assignment', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/assignments');

    await page.click('[data-testid="assignment-card"]:first-child');
    await page.waitForURL(/student\/assignments\/\d+/);

    await page.fill('[data-testid="submission-text"]', 'Ini adalah jawaban saya untuk tugas matematika');

    await page.setInputFiles('[data-testid="attachment-upload"]', 'tests/fixtures/test-submission.pdf');

    await page.click('[data-testid="submit-assignment"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Tugas berhasil dikirim');
  });

  test('Student: should see late submission warning', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/assignments');

    await page.click('[data-testid="assignment-card"]:first-child');
    await page.waitForURL(/student\/assignments\/\d+/);

    await expect(page.locator('[data-testid="late-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="late-warning"]')).toContainText('Terlambat');
  });

  test('Teacher: should grade assignment', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/assignment-grading');

    await page.click('[data-testid="assignment-item"]:first-child');
    await page.waitForURL(/teacher\/assignment-grading\/\d+/);

    await page.click('[data-testid="submission-item"]:first-child');
    await page.waitForURL(/teacher\/assignment-grading\/\d+\/\d+/);

    await page.fill('[data-testid="score-input"]', '85');
    await page.fill('[data-testid="feedback-textarea"]', 'Bagus! Perlu lebih teliti dalam perhitungan');

    await page.click('[data-testid="save-grade"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Nilai berhasil disimpan');
  });

  test('Teacher: should use AI feedback generation', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/assignment-grading');

    await page.click('[data-testid="assignment-item"]:first-child');
    await page.click('[data-testid="submission-item"]:first-child');

    await page.click('[data-testid="generate-ai-feedback"]');

    await expect(page.locator('[data-testid="ai-feedback-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-feedback-loading"]')).toBeVisible();

    await page.waitForSelector('[data-testid="ai-feedback-content"]', { timeout: 10000 });

    await expect(page.locator('[data-testid="ai-strengths"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-improvements"]')).toBeVisible();

    await page.click('[data-testid="apply-feedback"]');

    await expect(page.locator('[data-testid="feedback-textarea"]')).toHaveValue(/.+/);
  });

  test('Student: should view graded assignment', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/assignments');

    await page.click('[data-testid="assignment-card"][data-status="graded"]:first-child');
    await page.waitForURL(/student\/assignments\/\d+/);

    await expect(page.locator('[data-testid="score-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="feedback-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="graded-badge"]')).toBeVisible();
  });

  test('Teacher: should view grade analytics', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/analytics');

    await expect(page.locator('h1')).toContainText('Analisis Nilai');
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible();

    await expect(page.locator('[data-testid="average-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="grade-distribution-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-performers"]')).toBeVisible();
    await expect(page.locator('[data-testid="needs-attention"]')).toBeVisible();
  });

  test('Teacher: should export analytics report', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/analytics');

    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-analytics-button"]');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/analytics-report-\d+\.json/);
  });
});
