#!/usr/bin/env node

/**
 * Patch script to fix @opencode-ai/plugin package.json exports configuration
 *
 * This script fixes the "ERR_PACKAGE_PATH_NOT_EXPORTED" error by adding
 * comprehensive exports configuration to the package.json.
 *
 * Issue: #1274 - Custom Analysis Tools Package Configuration Error
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_PATH = path.join(__dirname, 'node_modules/@opencode-ai/plugin/package.json');
const BACKUP_PATH = PACKAGE_PATH + '.patched';

try {
  // Check if already patched
  if (fs.existsSync(BACKUP_PATH)) {
    console.log('✓ Package already patched, skipping...');
    process.exit(0);
  }

  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));

  // Backup original
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('✓ Backed up original package.json');

  // Apply patch - add comprehensive exports
  packageJson.main = './dist/index.js';
  packageJson.exports['.'].default = './dist/index.js';
  packageJson.exports['./tool'].default = './dist/tool.js';
  packageJson.exports['./dist/*'] = './dist/*';
  packageJson.exports['./package.json'] = './package.json';

  // Write patched package.json
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('✓ Patched package.json with comprehensive exports');
  console.log('✓ Custom tools can now be executed');

  // Also patch dist/index.js to add .js extension to import
  const indexPath = path.join(__dirname, 'node_modules/@opencode-ai/plugin/dist/index.js');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  if (indexContent.includes('from "./tool"') && !indexContent.includes('from "./tool.js"')) {
    const patchedContent = indexContent.replace('from "./tool"', 'from "./tool.js"');
    fs.writeFileSync(indexPath, patchedContent, 'utf8');
    console.log('✓ Patched dist/index.js to include .js extension');
  }

  console.log('✓ All patches applied successfully');

} catch (error) {
  console.error('✗ Patch failed:', error.message);
  process.exit(1);
}
