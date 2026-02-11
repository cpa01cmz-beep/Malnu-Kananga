#!/usr/bin/env node
/**
 * BroCula Browser Console & Lighthouse Auditor
 * Strict workflow: Find errors/warnings → Fix immediately
 * 
 * Usage: npm run brocula:audit
 * 
 * This script:
 * 1. Builds the production app
 * 2. Starts preview server
 * 3. Checks browser console for errors/warnings (using Playwright)
 * 4. Runs Lighthouse audit
 * 5. Reports issues (exits with error code if console errors found)
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '..', 'lighthouse-reports');
const PORT = 4173; // Vite preview default port
const TIMEOUT = 60000;

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch (_e) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Server failed to start within timeout');
}

async function buildApp() {
  console.log('🔨 Building production app...');
  return new Promise((resolve, reject) => {
    const build = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true
    });

    build.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build successful');
        resolve();
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    build.on('error', reject);
  });
}

async function startPreviewServer() {
  console.log('🚀 Starting preview server on port ' + PORT + '...');
  const server = spawn('npx', ['vite', 'preview', '--port', PORT.toString()], {
    stdio: 'pipe',
    shell: true,
    detached: true
  });

  // Log server output for debugging
  server.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) console.log(`[server] ${output}`);
  });

  server.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) console.error(`[server] ${output}`);
  });

  // Wait for server to be ready by polling
  console.log('⏳ Waiting for server to be ready...');
  await waitForServer(`http://localhost:${PORT}`);
  console.log('✅ Preview server ready');

  return server;
}

async function checkBrowserConsoleErrors(url) {
  console.log(`🔍 Checking browser console errors at ${url}...`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/home/runner/.cache/ms-playwright/chromium-1208/chrome-linux/chrome'
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const warnings = [];

  // Capture console messages
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    // Filter out common non-error messages
    if (text.includes('Download the React DevTools') ||
        text.includes('[vite]') ||
        text.includes('hot-update') ||
        text.includes('React DevTools')) {
      return;
    }

    if (type === 'error') {
      errors.push({ type, text });
      console.error(`❌ Console Error: ${text.substring(0, 200)}`);
    } else if (type === 'warning') {
      warnings.push({ type, text });
      console.warn(`⚠️ Console Warning: ${text.substring(0, 200)}`);
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    errors.push({ type: 'pageerror', text: error.message });
    console.error(`❌ Page Error: ${error.message}`);
  });

  // Capture request failures
  page.on('requestfailed', (request) => {
    const url = request.url();
    // Filter out favicon and common non-critical failures
    if (url.includes('favicon') || url.includes('.map')) return;
    
    errors.push({
      type: 'requestfailed',
      text: `${url} - Request failed`
    });
    console.error(`❌ Request Failed: ${url}`);
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT });

    // Wait a bit for any async errors
    await new Promise(resolve => setTimeout(resolve, 3000));

    await browser.close();

    return { errors, warnings };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function runLighthouse(url) {
  console.log(`⚡ Running Lighthouse audit on ${url}...`);

  const chrome = await chromeLauncher.launch({ 
    chromeFlags: ['--headless', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    chromePath: process.env.CHROME_PATH || process.env.PLAYWRIGHT_CHROMIUM_PATH || '/home/runner/.cache/ms-playwright/chromium-1208/chrome-linux/chrome'
  });

  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port
  };

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();

  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `lighthouse-${timestamp}.json`);
  fs.writeFileSync(reportPath, runnerResult.report);
  console.log(`📄 Lighthouse report saved to: ${reportPath}`);

  return runnerResult.lhr;
}

function analyzeLighthouseResults(lhr) {
  const opportunities = [];

  // Performance opportunities
  const perfAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'efficiently-encode-images',
    'uses-text-compression',
    'uses-responsive-images',
    'prioritize-lcp-image',
    'preload-lcp-image'
  ];

  perfAudits.forEach(auditId => {
    const audit = lhr.audits[auditId];
    if (audit?.details?.items?.length > 0 && audit.score !== null && audit.score < 1) {
      opportunities.push({
        category: 'Performance',
        id: auditId,
        title: audit.title,
        savings: audit.displayValue || 'N/A',
        items: audit.details.items.length,
        score: audit.score
      });
    }
  });

  // Accessibility issues
  const accessibilityAudits = Object.values(lhr.audits).filter(
    audit => audit.details?.type === 'table' && 
             audit.score !== null && 
             audit.score < 1 &&
             lhr.categories.accessibility.auditRefs.some(ref => ref.id === audit.id && ref.weight > 0)
  );

  accessibilityAudits.forEach(audit => {
    if (audit.score < 1) {
      opportunities.push({
        category: 'Accessibility',
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score
      });
    }
  });

  // Best practices issues
  const bpAudits = Object.values(lhr.audits).filter(
    audit => audit.score !== null && 
             audit.score < 1 &&
             lhr.categories['best-practices'].auditRefs.some(ref => ref.id === audit.id && ref.weight > 0)
  );

  bpAudits.forEach(audit => {
    opportunities.push({
      category: 'Best Practices',
      id: audit.id,
      title: audit.title,
      description: audit.description,
      score: audit.score
    });
  });

  return opportunities;
}

function printResults(consoleResults, lighthouseResults, opportunities) {
  console.log('\n' + '='.repeat(80));
  console.log('🧛 BROCULA AUDIT RESULTS');
  console.log('='.repeat(80));

  // Console Errors
  console.log('\n🔴 CONSOLE ERRORS:');
  if (consoleResults.errors.length === 0) {
    console.log('   ✅ No console errors found!');
  } else {
    console.log(`   ❌ ${consoleResults.errors.length} error(s) found:`);
    consoleResults.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. [${error.type}] ${error.text.substring(0, 100)}${error.text.length > 100 ? '...' : ''}`);
    });
  }

  // Console Warnings
  console.log('\n🟡 CONSOLE WARNINGS:');
  if (consoleResults.warnings.length === 0) {
    console.log('   ✅ No console warnings found!');
  } else {
    console.log(`   ⚠️ ${consoleResults.warnings.length} warning(s) found:`);
    consoleResults.warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. [${warning.type}] ${warning.text.substring(0, 100)}${warning.text.length > 100 ? '...' : ''}`);
    });
  }

  // Lighthouse Scores
  console.log('\n⚡ LIGHTHOUSE SCORES:');
  const categories = lighthouseResults.categories;
  Object.entries(categories).forEach(([_key, category]) => {
    const score = Math.round(category.score * 100);
    const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
    console.log(`   ${emoji} ${category.title}: ${score}/100`);
  });

  // Opportunities
  console.log('\n💡 OPTIMIZATION OPPORTUNITIES:');
  if (opportunities.length === 0) {
    console.log('   ✅ No significant optimization opportunities found!');
  } else {
    const grouped = opportunities.reduce((acc, opp) => {
      acc[opp.category] = acc[opp.category] || [];
      acc[opp.category].push(opp);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([category, items]) => {
      console.log(`\n   ${category}:`);
      items.forEach((opp, i) => {
        console.log(`   ${i + 1}. ${opp.title}`);
        if (opp.savings && opp.savings !== 'N/A') console.log(`      Potential savings: ${opp.savings}`);
        if (opp.items) console.log(`      Items affected: ${opp.items}`);
      });
    });
  }

  console.log('\n' + '='.repeat(80));
}

async function main() {
  let server = null;

  try {
    // Build the app first
    await buildApp();

    // Start preview server
    server = await startPreviewServer();

    const url = `http://localhost:${PORT}`;

    // Wait for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check console errors
    const consoleResults = await checkBrowserConsoleErrors(url);

    // Run Lighthouse
    const lighthouseResults = await runLighthouse(url);

    // Analyze results
    const opportunities = analyzeLighthouseResults(lighthouseResults);

    // Print results
    printResults(consoleResults, lighthouseResults, opportunities);

    // Kill server
    if (server) {
      process.kill(-server.pid);
    }

    // Exit with error code if there are console errors (BroCula's strict rule)
    if (consoleResults.errors.length > 0) {
      console.log('❌ FATAL: Console errors detected! These must be fixed immediately.');
      console.log('='.repeat(80));
      process.exit(1);
    }

    console.log('✅ BroCula audit complete. No fatal errors found.');
    console.log('='.repeat(80));
    process.exit(0);

  } catch (error) {
    console.error('❌ Audit failed:', error.message);

    if (server) {
      try {
        process.kill(-server.pid);
      } catch (_e) {
        // Ignore kill errors
      }
    }

    process.exit(1);
  }
}

main();
