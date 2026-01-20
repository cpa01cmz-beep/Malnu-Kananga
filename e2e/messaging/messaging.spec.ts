import { test, expect } from '@playwright/test';

test.describe('Messaging System', () => {
  const user1 = {
    username: 'guru1',
    password: 'password123'
  };

  const user2 = {
    username: 'siswa1',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should access messages page', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');

    await expect(page.locator('h1')).toContainText('Pesan');
    await expect(page.locator('[data-testid="conversation-list"]')).toBeVisible();
  });

  test('should create new conversation', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');
    await page.click('[data-testid="new-conversation-button"]');

    await expect(page.locator('[data-testid="user-select-modal"]')).toBeVisible();

    await page.click('[data-testid="user-search-input"]');
    await page.fill('[data-testid="user-search-input"]', 'siswa1');

    await page.click('[data-testid="user-option"]:first-child');
    await page.click('[data-testid="start-conversation"]');

    await expect(page.locator('[data-testid="message-thread"]')).toBeVisible();
  });

  test('should send text message', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');
    await page.click('[data-testid="conversation-item"]:first-child');

    await page.fill('[data-testid="message-input"]', 'Halo, bagaimana kabarnya?');
    await page.click('[data-testid="send-message-button"]');

    await expect(page.locator('[data-testid="message-sent"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-sent"]')).toContainText('Halo, bagaimana kabarnya?');
  });

  test('should send message with file attachment', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');
    await page.click('[data-testid="conversation-item"]:first-child');

    await page.setInputFiles('[data-testid="file-upload"]', 'tests/fixtures/test-document.pdf');

    await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-name"]')).toContainText('test-document.pdf');

    await page.fill('[data-testid="message-input"]', 'Lihat file ini');
    await page.click('[data-testid="send-message-button"]');

    await expect(page.locator('[data-testid="message-with-file"]')).toBeVisible();
  });

  test('should validate file attachment size limit', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');
    await page.click('[data-testid="conversation-item"]:first-child');

    await page.setInputFiles('[data-testid="file-upload"]', 'tests/fixtures/large-file.pdf');

    await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-error"]')).toContainText('Ukuran file maksimal 10MB');
  });

  test('should show typing indicator', async ({ page, context }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.fill('[data-testid="username-input"]', user2.username);
    await page2.fill('[data-testid="password-input"]', user2.password);
    await page2.click('[data-testid="login-button"]');
    await page2.waitForURL(/dashboard/);

    await page2.goto('/student/messages');
    await page2.click('[data-testid="conversation-item"]:first-child');

    await page2.fill('[data-testid="message-input"]', 'typing...');

    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
  });

  test('should mark message as read', async ({ page, context }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');
    await page.click('[data-testid="conversation-item"]:first-child');
    await page.fill('[data-testid="message-input"]', 'Test message');
    await page.click('[data-testid="send-message-button"]');

    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.fill('[data-testid="username-input"]', user2.username);
    await page2.fill('[data-testid="password-input"]', user2.password);
    await page2.click('[data-testid="login-button"]');
    await page2.waitForURL(/dashboard/);

    await page2.goto('/student/messages');
    await page2.click('[data-testid="conversation-item"]:first-child');

    await expect(page2.locator('[data-testid="read-receipt"]')).toBeVisible();

    await expect(page.locator('[data-testid="message-read"]')).toBeVisible();
  });

  test('should search conversations', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');

    await page.fill('[data-testid="search-input"]', 'siswa1');

    await expect(page.locator('[data-testid="conversation-item"]')).toHaveCount(3);
  });

  test('should filter conversations by unread', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');

    await page.click('[data-testid="filter-unread"]');

    await expect(page.locator('[data-testid="unread-badge"]')).toHaveCount(5);
  });

  test('should create group chat from class', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/groups');

    await page.click('[data-testid="create-group-button"]');

    await expect(page.locator('[data-testid="create-group-modal"]')).toBeVisible();

    await page.fill('[data-testid="group-name"]', 'Kelas X A');
    await page.selectOption('[data-testid="group-type"]', 'class');
    await page.selectOption('[data-testid="class-select"]', 'X A');

    await page.click('[data-testid="create-group"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Grup berhasil dibuat');
  });

  test('should send message in group chat', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/groups');
    await page.click('[data-testid="group-item"]:first-child');

    await page.fill('[data-testid="message-input"]', 'Pengumuman untuk semua siswa');
    await page.click('[data-testid="send-message-button"]');

    await expect(page.locator('[data-testid="group-message-sent"]')).toBeVisible();
  });

  test('should manage group participants', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/groups');
    await page.click('[data-testid="group-item"]:first-child');

    await page.click('[data-testid="manage-group-button"]');

    await expect(page.locator('[data-testid="group-settings-modal"]')).toBeVisible();

    await page.click('[data-testid="add-participant"]');
    await page.click('[data-testid="user-option"]:first-child');

    await page.click('[data-testid="save-group-settings"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should show unread count badge', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');

    await expect(page.locator('[data-testid="unread-count-badge"]')).toBeVisible();
  });

  test('should reply to message', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', user1.username);
    await page.fill('[data-testid="password-input"]', user1.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard/);

    await page.goto('/teacher/messages');
    await page.click('[data-testid="conversation-item"]:first-child');

    await page.click('[data-testid="message-item"]:first-child [data-testid="reply-button"]');

    await expect(page.locator('[data-testid="reply-preview"]')).toBeVisible();

    await page.fill('[data-testid="message-input"]', 'Terima kasih atas informasinya');
    await page.click('[data-testid="send-message-button"]');

    await expect(page.locator('[data-testid="reply-message"]')).toBeVisible();
  });
});
