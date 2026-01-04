#!/bin/bash

# Security Audit Script for MA Malnu Kananga
# This script performs comprehensive security checks

set -e

echo "🔒 Starting Security Audit for MA Malnu Kananga..."

# Check for exposed API keys
echo "🔍 Checking for exposed API keys..."
if grep -r "API_KEY\|SECRET\|TOKEN" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" src/ | grep -v "example\|template\|placeholder"; then
    echo "⚠️  Potential exposed API keys found!"
else
    echo "✅ No exposed API keys detected"
fi

# Check for hardcoded credentials
echo "🔍 Checking for hardcoded credentials..."
if grep -r "password\|secret\|credential" --include="*.js" --include="*.ts" src/ | grep -v "example\|template\|placeholder"; then
    echo "⚠️  Potential hardcoded credentials found!"
else
    echo "✅ No hardcoded credentials detected"
fi

# Check for XSS vulnerabilities
echo "🔍 Checking for XSS vulnerabilities..."
if grep -r "innerHTML\|outerHTML\|document.write" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" src/; then
    echo "⚠️  Potential XSS vulnerabilities found!"
else
    echo "✅ No obvious XSS vulnerabilities detected"
fi

# Check for SQL injection patterns
echo "🔍 Checking for SQL injection patterns..."
if grep -r "SELECT\|INSERT\|UPDATE\|DELETE" --include="*.js" --include="*.ts" src/ | grep -v "comment\|TODO\|FIXME"; then
    echo "⚠️  Potential SQL injection patterns found!"
else
    echo "✅ No obvious SQL injection patterns detected"
fi

# Check for insecure HTTP usage
echo "🔍 Checking for insecure HTTP usage..."
if grep -r "http://" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" src/ | grep -v "localhost\|127.0.0.1\|example"; then
    echo "⚠️  Insecure HTTP usage found!"
else
    echo "✅ No insecure HTTP usage detected"
fi

# Check for console.log in production
echo "🔍 Checking for console.log statements..."
if grep -r "console.log" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" src/; then
    echo "⚠️  Console.log statements found (should be removed in production)"
else
    echo "✅ No console.log statements detected"
fi

# Check dependencies for known vulnerabilities
echo "🔍 Checking dependencies for vulnerabilities..."
if command -v npm &> /dev/null; then
    npm audit --audit-level=moderate || echo "⚠️  Vulnerabilities found in dependencies"
else
    echo "❌ npm not found, skipping dependency check"
fi

# Check file permissions
echo "🔍 Checking file permissions..."
find . -type f -name "*.key" -o -name "*.pem" -o -name "*.crt" 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
        permissions=$(stat -c "%a" "$file")
        if [ "$permissions" != "600" ] && [ "$permissions" != "400" ]; then
            echo "⚠️  Insecure permissions on $file: $permissions"
        fi
    fi
done

# Check environment files
echo "🔍 Checking environment files..."
if [ -f ".env" ]; then
    echo "⚠️  .env file found (should not be in production)"
    # Check if .env contains real API keys
    if grep -E "(AIza[0-9A-Za-z_-]{35}|sk-[a-zA-Z0-9]{48}|ghp_[a-zA-Z0-9]{36})" .env >/dev/null 2>&1; then
        echo "❌ CRITICAL: Real API keys detected in .env file!"
    fi
fi

if [ -f ".env.production" ]; then
    echo "✅ .env.production file found"
fi

# Check .env.example for security issues
if [ -f ".env.example" ]; then
    echo "🔍 Checking .env.example for security issues..."
    # Check for potential real keys in template
    if grep -E "(AIza[0-9A-Za-z_-]{35}|sk-[a-zA-Z0-9]{48}|ghp_[a-zA-Z0-9]{36})" .env.example >/dev/null 2>&1; then
        echo "❌ Potential real API keys found in .env.example!"
    else
        echo "✅ .env.example appears safe"
    fi
    
    # Check for too-realistic placeholders
    if grep -q "your_google_gemini_api_key_here" .env.example; then
        echo "⚠️  Replace realistic placeholder with generic description"
    fi
fi

# Check for debug mode
echo "🔍 Checking for debug mode..."
if grep -r "DEBUG\|NODE_ENV=development" --include="*.js" --include="*.ts" --include="*.json" . | grep -v "node_modules"; then
    echo "⚠️  Debug mode configurations found"
else
    echo "✅ No debug mode configurations detected"
fi

echo "✅ Security audit completed!"
echo "📊 Review the warnings above and address any security concerns"