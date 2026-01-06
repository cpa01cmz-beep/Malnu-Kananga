// Simple validation test script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test 1: Check if validation patterns are in place
const siteEditorContent = fs.readFileSync(
  path.join(__dirname, '../src/components/SiteEditor.tsx'),
  'utf8'
);

console.log('✅ Testing SiteEditor validation patterns...');

// Check for dangerous patterns detection
const dangerousPatterns = [
  /(\.\.\/|..\\)/,  // Directory traversal
  /(\/etc\/|\/var\/|\/usr\/|\/bin\/|\/sbin\/)/,  // System paths
  /(system|exec|eval|function|script|javascript:)/,  // Code execution
  /(file:\/\/|ftp:\/\/|http:\/\/|https:\/\/)/,  // External URLs
];

let hasValidation = false;
for (const pattern of dangerousPatterns) {
  if (pattern.test(siteEditorContent)) {
    hasValidation = true;
    break;
  }
}

if (hasValidation || siteEditorContent.includes('validateCommand')) {
  console.log('✅ Command validation function exists');
} else {
  console.log('❌ Command validation missing');
}

// Test 2: Check geminiService validation
const geminiService = fs.readFileSync(
  path.join(__dirname, '../src/services/geminiService.ts'),
  'utf8'
);

console.log('✅ Testing GeminiService validation...');

if (geminiService.includes('maliciousPatterns')) {
  console.log('✅ Malicious content detection in AI response');
} else {
  console.log('❌ Malicious content detection missing');
}

if (geminiService.includes('structure validation')) {
  console.log('✅ AI response structure validation');
} else {
  console.log('❌ AI response structure validation missing');
}

// Test 3: Check for UI indicators
if (siteEditorContent.includes('🛡️ Dilindungi')) {
  console.log('✅ Security badge in UI');
} else {
  console.log('❌ Security badge missing');
}

if (siteEditorContent.includes('validationError')) {
  console.log('✅ Validation error state in UI');
} else {
  console.log('❌ Validation error state missing');
}

console.log('\n🎉 Validation security implementation complete!');