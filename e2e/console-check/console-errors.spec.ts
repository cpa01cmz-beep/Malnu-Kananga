import { test, expect, type ConsoleMessage } from '@playwright/test';

test.describe('Console Error Detection - BroCula', () => {
  const consoleErrors: ConsoleMessage[] = [];
  const consoleWarnings: ConsoleMessage[] = [];
  const consoleLogs: ConsoleMessage[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    consoleWarnings.length = 0;
    consoleLogs.length = 0;

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error') {
        consoleErrors.push(msg);
        console.error(`[BROWSER ERROR] ${msg.text()}`);
      } else if (type === 'warning') {
        consoleWarnings.push(msg);
        console.warn(`[BROWSER WARNING] ${msg.text()}`);
      } else {
        consoleLogs.push(msg);
      }
    });

    page.on('pageerror', (error) => {
      console.error(`[PAGE ERROR] ${error.message}`);
    });
  });

  test('Homepage should have no console errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    expect(consoleErrors).toHaveLength(0);
  });

  test('Login page should have no console errors', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    expect(consoleErrors).toHaveLength(0);
  });

  test('Documentation page should have no console errors', async ({ page }) => {
    await page.goto('/documentation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    expect(consoleErrors).toHaveLength(0);
  });

  test.afterEach(async (_testFixtures, testInfo) => {
    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS FOUND ===');
      consoleErrors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.text()}`);
      });
      console.log('===========================\n');
    }

    if (consoleWarnings.length > 0) {
      console.log('\n=== CONSOLE WARNINGS FOUND ===');
      consoleWarnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.text()}`);
      });
      console.log('=============================\n');
    }

    await testInfo.attach('console-report', {
      body: JSON.stringify({
        errors: consoleErrors.map(e => e.text()),
        warnings: consoleWarnings.map(w => w.text()),
      }, null, 2),
      contentType: 'application/json',
    });
  });
});
