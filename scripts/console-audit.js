import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/home/runner/.cache/ms-playwright/chromium-1208/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      errors.push(text);
      console.log('❌ CONSOLE ERROR:', text);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log('⚠️ CONSOLE WARNING:', text);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('❌ PAGE ERROR:', err.message);
  });
  
  console.log('Navigating to http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('\n=== CONSOLE AUDIT RESULTS ===');
  console.log(`Total Errors: ${errors.length}`);
  console.log(`Total Warnings: ${warnings.length}`);
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No console errors or warnings found!');
  }
  
  await browser.close();
})();
