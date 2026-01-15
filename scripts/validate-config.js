#!/usr/bin/env node

/**
 * Pre-Deployment Configuration Validator
 * 
 * This script validates that all required configuration values are set before deployment.
 * It checks for placeholder values in wrangler.toml and environment files.
 * 
 * Usage: node scripts/validate-config.js
 * Exit codes: 0 = valid, 1 = invalid
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Placeholder patterns to detect
const PLACEHOLDER_PATTERNS = [
  'placeholder-database-id',
  'your-production-gemini-api-key-here',
  'your-super-secret-jwt-key-change-this-in-production',
  'your-dev-d1-database-id-here',
  'dev-jwt-secret-change-for-production',
  'your_actual_gemini_api_key_here',
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let hasErrors = false;
let hasWarnings = false;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateWranglerConfig() {
  log('\n=== Validating wrangler.toml ===', 'blue');
  
  const wranglerPath = join(rootDir, 'wrangler.toml');
  let content;
  
  try {
    content = readFileSync(wranglerPath, 'utf-8');
  } catch (error) {
    log(`✗ Failed to read wrangler.toml: ${error.message}`, 'red');
    hasErrors = true;
    return;
  }
  
  // Check for placeholder values
  PLACEHOLDER_PATTERNS.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    const matches = content.match(regex);
    
    if (matches) {
      log(`✗ Found placeholder "${pattern}" in wrangler.toml`, 'red');
      hasErrors = true;
      
      // Show line numbers
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          log(`  Line ${index + 1}: ${line.trim()}`, 'yellow');
        }
      });
    }
  });
  
  // Check for required environment bindings
  const requiredBindings = ['DB', 'BUCKET'];
  requiredBindings.forEach(binding => {
    const regex = new RegExp(`binding\\s*=\\s*["']${binding}["']`, 'gi');
    if (!regex.test(content)) {
      log(`⚠ Warning: Required binding "${binding}" not found`, 'yellow');
      hasWarnings = true;
    }
  });
  
  if (!hasErrors && !content.match(/placeholder/gi)) {
    log('✓ No placeholder values found in wrangler.toml', 'green');
  }
}

function validateEnvironmentFiles() {
  log('\n=== Validating Environment Files ===', 'blue');
  
  const envFiles = ['.env', '.env.production', '.env.local'];
  
  envFiles.forEach(envFile => {
    const envPath = join(rootDir, envFile);
    
    try {
      const content = readFileSync(envPath, 'utf-8');
      log(`\nChecking ${envFile}...`, 'blue');
      
      // Check for placeholder values
      PLACEHOLDER_PATTERNS.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        if (regex.test(content)) {
          log(`✗ Found placeholder "${pattern}" in ${envFile}`, 'red');
          hasErrors = true;
        }
      });
      
      // Check for empty required variables
      const requiredVars = [
        'VITE_GEMINI_API_KEY',
        'VITE_API_BASE_URL',
      ];
      
      requiredVars.forEach(variable => {
        const regex = new RegExp(`^${variable}=\\s*$`, 'gm');
        if (regex.test(content)) {
          log(`⚠ Warning: Required variable "${variable}" is empty in ${envFile}`, 'yellow');
          hasWarnings = true;
        }
      });
      
      if (!content.match(/placeholder/gi) && !content.match(/your_.*here/gi)) {
        log(`✓ ${envFile} looks properly configured`, 'green');
      }
    } catch (error) {
      // File doesn't exist is OK for development
      if (error.code === 'ENOENT') {
        log(`ℹ ${envFile} does not exist (OK for development)`, 'blue');
      } else {
        log(`✗ Error reading ${envFile}: ${error.message}`, 'red');
        hasErrors = true;
      }
    }
  });
}

function validateWorkerSeedEndpoint() {
  log('\n=== Validating worker.js seed endpoint ===', 'blue');

  const workerPath = join(rootDir, 'worker.js');

  try {
    const content = readFileSync(workerPath, 'utf-8');

    if (content.includes('handleSeed') && content.includes("'/seed'")) {
      log('✓ worker.js contains /seed endpoint', 'green');
    } else {
      log('✗ worker.js missing /seed endpoint', 'red');
      hasErrors = true;
    }
  } catch (error) {
    log(`✗ Error reading worker.js: ${error.message}`, 'red');
    hasErrors = true;
  }
}

function printSummary() {
  log('\n=== Validation Summary ===', 'blue');

  if (hasErrors) {
    log('\n✗ VALIDATION FAILED - Please fix the errors above before deploying', 'red');
    log('\nNext steps:', 'yellow');
    log('1. Replace all placeholder values in wrangler.toml', 'yellow');
    log('2. Set up actual environment variables in .env.production', 'yellow');
    log('3. Review DEPLOYMENT_GUIDE.md for detailed setup instructions', 'yellow');
    process.exit(1);
  } else if (hasWarnings) {
    log('\n⚠ VALIDATION PASSED WITH WARNINGS - Review the warnings above', 'yellow');
    process.exit(0);
  } else {
    log('\n✓ ALL VALIDATIONS PASSED - Ready for deployment', 'green');
    process.exit(0);
  }
}

// Run validation
try {
  validateWranglerConfig();
  validateEnvironmentFiles();
  validateWorkerSeedEndpoint();
  printSummary();
} catch (error) {
  log(`\n✗ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}
