import { test, expect } from '@playwright/test';

test.describe('AI Features', () => {
  const student = {
    username: 'siswa1',
    password: 'password123'
  };

  const teacher = {
    username: 'guru1',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Teacher: should generate AI quiz from material', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/quiz-generator');

    await page.click('[data-testid="material-select"]');

    await page.click('[data-testid="material-option"]:first-child');

    await page.fill('[data-testid="question-count"]', '10');
    await page.selectOption('[data-testid="quiz-difficulty"]', 'medium');
    await page.fill('[data-testid="points-per-question"]', '5');
    await page.fill('[data-testid="focus-areas"]', 'aljabar, persamaan linear');

    await page.click('[data-testid="generate-quiz-button"]');

    await expect(page.locator('[data-testid="ai-loading"]')).toBeVisible();

    await page.waitForSelector('[data-testid="quiz-preview"]', { timeout: 30000 });

    await expect(page.locator('[data-testid="quiz-questions-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(10);
  });

  test('Teacher: should preview and edit generated quiz', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/quiz-generator');

    await page.click('[data-testid="material-select"]');
    await page.click('[data-testid="material-option"]:first-child');
    await page.fill('[data-testid="question-count"]', '5');
    await page.click('[data-testid="generate-quiz-button"]');

    await page.waitForSelector('[data-testid="quiz-preview"]', { timeout: 30000 });

    await page.fill('[data-testid="quiz-title"]', 'Kuis Matematika Aljabar');
    await page.fill('[data-testid="quiz-description"]', 'Kuis untuk menguji pemahaman aljabar dasar');
    await page.fill('[data-testid="quiz-duration"]', '60');
    await page.fill('[data-testid="passing-score"]', '70');

    await page.click('[data-testid="question-item"]:first-child [data-testid="edit-question"]');

    await page.fill('[data-testid="question-text"]', 'Apa hasil dari 2x + 5 = 15?');

    await page.click('[data-testid="add-question"]');

    await expect(page.locator('[data-testid="new-question-form"]')).toBeVisible();
  });

  test('Student: should generate AI study plan', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan');

    await expect(page.locator('h1')).toContainText('Rencana Belajar AI');

    await page.selectOption('[data-testid="plan-duration"]', '4');

    await page.click('[data-testid="generate-study-plan-button"]');

    await expect(page.locator('[data-testid="ai-loading"]')).toBeVisible();

    await page.waitForSelector('[data-testid="study-plan-overview"]', { timeout: 30000 });

    await expect(page.locator('[data-testid="plan-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="subjects-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="weekly-schedule"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-recommendations"]')).toBeVisible();
  });

  test('Student: should view study plan subjects', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan');
    await page.click('[data-testid="generate-study-plan-button"]');
    await page.waitForSelector('[data-testid="study-plan-overview"]', { timeout: 30000 });

    await page.click('[data-testid="subjects-tab"]');

    await expect(page.locator('[data-testid="subject-item"]')).toBeVisible();

    await expect(page.locator('[data-testid="subject-priority"]')).toBeVisible();
    await expect(page.locator('[data-testid="focus-areas"]')).toBeVisible();
  });

  test('Student: should view weekly schedule', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan');
    await page.click('[data-testid="generate-study-plan-button"]');
    await page.waitForSelector('[data-testid="study-plan-overview"]', { timeout: 30000 });

    await page.click('[data-testid="schedule-tab"]');

    await expect(page.locator('[data-testid="weekly-schedule-grid"]')).toBeVisible();

    await expect(page.locator('[data-testid="day-schedule"]')).toBeVisible();
  });

  test('Student: should view AI recommendations', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan');
    await page.click('[data-testid="generate-study-plan-button"]');
    await page.waitForSelector('[data-testid="study-plan-overview"]', { timeout: 30000 });

    await page.click('[data-testid="recommendations-tab"]');

    await expect(page.locator('[data-testid="ai-recommendations"]')).toBeVisible();

    await expect(page.locator('[data-testid="recommendation-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendation-priority"]')).toBeVisible();
  });

  test('Student: should view study plan analytics', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan-analytics');

    await expect(page.locator('h1')).toContainText('Analisis Rencana Belajar');

    await expect(page.locator('[data-testid="progress-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-progress-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="weekly-activity"]')).toBeVisible();
  });

  test('Student: should export study plan analytics', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan-analytics');

    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-analytics-button"]');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/study-plan-analytics-\d+\.json/);
  });

  test('Student: should view effectiveness score', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan-analytics');

    await expect(page.locator('[data-testid="effectiveness-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="effectiveness-bar"]')).toBeVisible();
  });

  test('Student: should view progress over time', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan-analytics');

    await expect(page.locator('[data-testid="progress-over-time-chart"]')).toBeVisible();
  });

  test('Student: should delete study plan', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan');

    await page.click('[data-testid="delete-plan-button"]');

    await expect(page.locator('[data-testid="confirmation-modal"]')).toBeVisible();

    await page.click('[data-testid="confirm-delete"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });
});
