import { test, expect } from '@playwright/test';

test.describe('Browser Console Error Checker', () => {
  test('should have no console errors on homepage', async ({ page }) => {
    const consoleErrors: Array<{ type: string; message: string; location?: string }> = [];
    const consoleWarnings: Array<{ type: string; message: string; location?: string }> = [];

    // Listen to console messages
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location()?.url;
      
      // Filter out expected warnings
      const ignoredPatterns = [
        /Download the React DevTools/,
        /webpack-dev-server/,
        /Hot Module Replacement/,
        /\[vite\]/,
        /\[hmr\]/,
        /Notification permission denied/,
      ];
      
      const shouldIgnore = ignoredPatterns.some(pattern => pattern.test(text));
      
      if (!shouldIgnore) {
        if (type === 'error') {
          consoleErrors.push({ type, message: text, location });
        } else if (type === 'warning') {
          consoleWarnings.push({ type, message: text, location });
        }
      }
    });

    // Listen to page errors
    page.on('pageerror', (error) => {
      consoleErrors.push({ 
        type: 'pageerror', 
        message: error.message,
        location: error.stack 
      });
    });

    // Navigate to homepage
    await page.goto('http://localhost:4173');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Additional wait for any lazy loading

    // Log findings for debugging
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors Found:');
      consoleErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. [${err.type}] ${err.message}`);
        if (err.location) console.log(`     Location: ${err.location}`);
      });
    }

    if (consoleWarnings.length > 0) {
      console.log('\n⚠️  Console Warnings Found:');
      consoleWarnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. [${warn.type}] ${warn.message}`);
        if (warn.location) console.log(`     Location: ${warn.location}`);
      });
    }

    // Fail test if there are any console errors (warnings are logged but don't fail)
    expect(consoleErrors, `Found ${consoleErrors.length} console error(s)`).toHaveLength(0);
    
    // Log warning count for info
    if (consoleWarnings.length > 0) {
      console.log(`\n⚠️  Total warnings: ${consoleWarnings.length}`);
    }
  });

  test('should have no console errors on login page', async ({ page }) => {
    const consoleErrors: Array<{ type: string; message: string }> = [];

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      const ignoredPatterns = [
        /Download the React DevTools/,
        /webpack-dev-server/,
        /Hot Module Replacement/,
        /\[vite\]/,
        /\[hmr\]/,
        /Notification permission denied/,
      ];
      
      const shouldIgnore = ignoredPatterns.some(pattern => pattern.test(text));
      
      if (!shouldIgnore && type === 'error') {
        consoleErrors.push({ type, message: text });
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push({ type: 'pageerror', message: error.message });
    });

    await page.goto('http://localhost:4173/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(consoleErrors, `Found ${consoleErrors.length} console error(s) on login page`).toHaveLength(0);
  });

  test('should have no console errors on dashboard', async ({ page }) => {
    const consoleErrors: Array<{ type: string; message: string }> = [];

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      const ignoredPatterns = [
        /Download the React DevTools/,
        /webpack-dev-server/,
        /Hot Module Replacement/,
        /\[vite\]/,
        /\[hmr\]/,
        /Notification permission denied/,
      ];
      
      const shouldIgnore = ignoredPatterns.some(pattern => pattern.test(text));
      
      if (!shouldIgnore && type === 'error') {
        consoleErrors.push({ type, message: text });
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push({ type: 'pageerror', message: error.message });
    });

    await page.goto('http://localhost:4173/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(consoleErrors, `Found ${consoleErrors.length} console error(s) on dashboard`).toHaveLength(0);
  });
});
