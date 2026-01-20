import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control', () => {
  const roles = [
    { username: 'admin', password: 'admin123', role: 'admin', dashboard: 'admin' },
    { username: 'guru1', password: 'password123', role: 'teacher', dashboard: 'teacher' },
    { username: 'siswa1', password: 'password123', role: 'student', dashboard: 'student' },
    { username: 'ortu1', password: 'password123', role: 'parent', dashboard: 'parent' }
  ];

  test('Admin: should access admin dashboard', async ({ page }) => {
    const admin = roles.find(r => r.role === 'admin');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', admin.username);
    await page.fill('[data-testid="password-input"]', admin.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(new RegExp(`/${admin.dashboard}/dashboard`));
    await expect(page.locator('h1')).toContainText('Dashboard Admin');
  });

  test('Teacher: should access teacher dashboard', async ({ page }) => {
    const teacher = roles.find(r => r.role === 'teacher');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(new RegExp(`/${teacher.dashboard}/dashboard`));
    await expect(page.locator('h1')).toContainText('Dashboard Guru');
  });

  test('Student: should access student portal', async ({ page }) => {
    const student = roles.find(r => r.role === 'student');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(new RegExp(`/${student.dashboard}/dashboard`));
    await expect(page.locator('h1')).toContainText('Portal Siswa');
  });

  test('Parent: should access parent portal', async ({ page }) => {
    const parent = roles.find(r => r.role === 'parent');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', parent.username);
    await page.fill('[data-testid="password-input"]', parent.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(new RegExp(`/${parent.dashboard}/dashboard`));
    await expect(page.locator('h1')).toContainText('Portal Orang Tua');
  });

  test('Non-admin: should be denied access to admin dashboard', async ({ page }) => {
    const teacher = roles.find(r => r.role === 'teacher');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/admin/dashboard');

    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });

  test('Non-teacher: should be denied access to teacher dashboard', async ({ page }) => {
    const student = roles.find(r => r.role === 'student');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/dashboard');

    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });

  test('Admin: should access user management', async ({ page }) => {
    const admin = roles.find(r => r.role === 'admin');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', admin.username);
    await page.fill('[data-testid="password-input"]', admin.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/admin/users');

    await expect(page.locator('h1')).toContainText('Manajemen Pengguna');
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });

  test('Admin: should access PPDB management', async ({ page }) => {
    const admin = roles.find(r => r.role === 'admin');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', admin.username);
    await page.fill('[data-testid="password-input"]', admin.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/admin/ppdb');

    await expect(page.locator('h1')).toContainText('Manajemen PPDB');
  });

  test('Teacher: should access assignment creation', async ({ page }) => {
    const teacher = roles.find(r => r.role === 'teacher');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/assignment-creation');

    await expect(page.locator('h1')).toContainText('Buat Tugas');
    await expect(page.locator('[data-testid="assignment-form"]')).toBeVisible();
  });

  test('Teacher: should access assignment grading', async ({ page }) => {
    const teacher = roles.find(r => r.role === 'teacher');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/assignment-grading');

    await expect(page.locator('h1')).toContainText('Penilaian Tugas');
    await expect(page.locator('[data-testid="assignments-list"]')).toBeVisible();
  });

  test('Teacher: should access quiz generator', async ({ page }) => {
    const teacher = roles.find(r => r.role === 'teacher');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', teacher.username);
    await page.fill('[data-testid="password-input"]', teacher.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/quiz-generator');

    await expect(page.locator('h1')).toContainText('Generator Kuis AI');
    await expect(page.locator('[data-testid="material-select"]')).toBeVisible();
  });

  test('Student: should access assignments', async ({ page }) => {
    const student = roles.find(r => r.role === 'student');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/assignments');

    await expect(page.locator('h1')).toContainText('Tugas Saya');
    await expect(page.locator('[data-testid="assignments-list"]')).toBeVisible();
  });

  test('Student: should access grades', async ({ page }) => {
    const student = roles.find(r => r.role === 'student');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/grades');

    await expect(page.locator('h1')).toContainText('Nilai Akademik');
    await expect(page.locator('[data-testid="grades-table"]')).toBeVisible();
  });

  test('Student: should access study plan generator', async ({ page }) => {
    const student = roles.find(r => r.role === 'student');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', student.username);
    await page.fill('[data-testid="password-input"]', student.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/student/study-plan');

    await expect(page.locator('h1')).toContainText('Rencana Belajar AI');
    await expect(page.locator('[data-testid="study-plan-form"]')).toBeVisible();
  });

  test('Parent: should access child grades', async ({ page }) => {
    const parent = roles.find(r => r.role === 'parent');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', parent.username);
    await page.fill('[data-testid="password-input"]', parent.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/parent/grades');

    await expect(page.locator('h1')).toContainText('Nilai Anak');
    await expect(page.locator('[data-testid="child-select"]')).toBeVisible();
  });

  test('Parent: should access child attendance', async ({ page }) => {
    const parent = roles.find(r => r.role === 'parent');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', parent.username);
    await page.fill('[data-testid="password-input"]', parent.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/parent/attendance');

    await expect(page.locator('h1')).toContainText('Kehadiran Anak');
    await expect(page.locator('[data-testid="attendance-chart"]')).toBeVisible();
  });

  test('Parent: should access child schedule', async ({ page }) => {
    const parent = roles.find(r => r.role === 'parent');

    await page.goto('/');
    await page.fill('[data-testid="username-input"]', parent.username);
    await page.fill('[data-testid="password-input"]', parent.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/parent/schedule');

    await expect(page.locator('h1')).toContainText('Jadwal Anak');
    await expect(page.locator('[data-testid="schedule-table"]')).toBeVisible();
  });
});
