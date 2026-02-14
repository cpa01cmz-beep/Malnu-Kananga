import { chromium } from 'playwright';
import { test } from '@playwright/test';

test('brocula audit - check for console errors', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleMessages: Array<{type: string, text: string}> = [];
  const pageErrors: Array<{message: string, stack?: string}> = [];
  
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  page.on('pageerror', error => {
    pageErrors.push({ message: error.message, stack: error.stack });
  });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  console.log('=== CONSOLE MESSAGES ===');
  console.log(JSON.stringify(consoleMessages, null, 2));
  
  console.log('=== PAGE ERRORS ===');
  console.log(JSON.stringify(pageErrors, null, 2));
  
  const errors = consoleMessages.filter(m => m.type === 'error');
  const warnings = consoleMessages.filter(m => m.type === 'warning');
  
  console.log(`\nFound ${errors.length} console errors`);
  console.log(`Found ${warnings.length} console warnings`);
  console.log(`Found ${pageErrors.length} page errors`);
  
  await browser.close();
});
