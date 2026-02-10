import { chromium, Browser, Page, ConsoleMessage } from '@playwright/test';
import { createServer, Server } from 'http';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface ConsoleLog {
  type: string;
  text: string;
  location: string;
}

const consoleLogs: ConsoleLog[] = [];
const errors: string[] = [];
const warnings: string[] = [];

async function startStaticServer(): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let filePath = join('dist', req.url === '/' ? 'index.html' : req.url || 'index.html');
        
        // Remove query parameters
        filePath = filePath.split('?')[0];
        
        // Default to index.html for SPA routes
        if (!filePath.includes('.')) {
          filePath = join('dist', 'index.html');
        }
        
        const content = await readFile(filePath);
        const ext = filePath.split('.').pop() || '';
        const contentTypes: Record<string, string> = {
          'html': 'text/html',
          'js': 'application/javascript',
          'css': 'text/css',
          'json': 'application/json',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'svg': 'image/svg+xml',
          'ico': 'image/x-icon',
          'webmanifest': 'application/manifest+json',
        };
        
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(content);
      } catch {
        // Try to serve index.html for SPA fallback
        try {
          const content = await readFile(join('dist', 'index.html'));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        } catch {
          res.writeHead(404);
          res.end('Not found');
        }
      }
    });
    
    server.listen(3456, () => {
      console.log('Static server started on http://localhost:3456');
      resolve(server);
    });
  });
}

async function captureConsoleLogs(page: Page) {
  page.on('console', (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location().url || 'unknown';
    
    consoleLogs.push({ type, text, location });
    
    if (type === 'error') {
      errors.push(`[ERROR] ${text} (${location})`);
    } else if (type === 'warning') {
      warnings.push(`[WARNING] ${text} (${location})`);
    }
  });
  
  page.on('pageerror', (err) => {
    errors.push(`[PAGE ERROR] ${err.message}`);
  });
}

async function checkPage(browser: Browser, url: string, routeName: string) {
  const page = await browser.newPage();
  await captureConsoleLogs(page);
  
  console.log(`\nChecking ${routeName}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Wait a bit for any lazy-loaded content and console logs
  await page.waitForTimeout(2000);
  
  await page.close();
}

async function main() {
  console.log('🔍 BroCula: Starting browser console check...\n');
  
  const server = await startStaticServer();
  const browser = await chromium.launch();
  
  try {
    // Check main routes
    await checkPage(browser, 'http://localhost:3456/', 'Homepage');
    await checkPage(browser, 'http://localhost:3456/login', 'Login Page');
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONSOLE CHECK RESULTS');
    console.log('='.repeat(60));
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ No console errors or warnings found!');
    } else {
      if (errors.length > 0) {
        console.log(`\n❌ ERRORS FOUND (${errors.length}):`);
        errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      }
      
      if (warnings.length > 0) {
        console.log(`\n⚠️ WARNINGS FOUND (${warnings.length}):`);
        warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
      }
    }
    
    // Print all console logs for debugging
    console.log('\n' + '-'.repeat(60));
    console.log('📋 ALL CONSOLE LOGS:');
    console.log('-'.repeat(60));
    if (consoleLogs.length === 0) {
      console.log('No console logs captured.');
    } else {
      consoleLogs.forEach((log) => {
        const icon = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : '📝';
        console.log(`${icon} [${log.type.toUpperCase()}] ${log.text.substring(0, 100)}${log.text.length > 100 ? '...' : ''}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    if (errors.length > 0) {
      console.log('❌ BRO-CULA STATUS: FAIL - Errors detected in console');
      process.exit(1);
    } else if (warnings.length > 0) {
      console.log('⚠️ BRO-CULA STATUS: WARNING - Warnings detected in console');
    } else {
      console.log('✅ BRO-CULA STATUS: PASS - No console issues');
    }
    console.log('='.repeat(60));
    
  } finally {
    await browser.close();
    server.close();
    console.log('\n🧛 BroCula: Console check complete!');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
