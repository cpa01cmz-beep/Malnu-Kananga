#!/bin/bash

# Environment Configuration Validation Script
# This script validates that required environment variables are properly configured

echo "🔍 Environment Configuration Validation"
echo "====================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "💡 Please copy .env.example to .env and configure your API keys"
    exit 1
fi

echo "✅ .env file found"

# Check for placeholder values
echo "🔍 Checking for placeholder values..."

if grep -q "your_actual_gemini_api_key_here" .env; then
    echo "❌ VITE_GEMINI_API_KEY contains placeholder value"
    PLACEHOLDER_FOUND=true
else
    echo "✅ VITE_GEMINI_API_KEY appears to be configured"
fi

if grep -q "your-google-gemini-api-key-here" .env; then
    echo "❌ API_KEY contains placeholder value"  
    PLACEHOLDER_FOUND=true
else
    echo "✅ API_KEY appears to be configured"
fi

# Check worker URL configuration
if grep -q "your-worker-subdomain.workers.dev" .env; then
    echo "❌ VITE_API_BASE_URL contains placeholder value"
    PLACEHOLDER_FOUND=true
else
    echo "✅ VITE_API_BASE_URL appears to be configured"
fi

# Validate API key format (basic pattern)
if ! grep -q "^VITE_GEMINI_API_KEY=[A-Za-z0-9_-].*" .env; then
    echo "⚠️  VITE_GEMINI_API_KEY format may be invalid"
fi

if [ "$PLACEHOLDER_FOUND" = true ]; then
    echo ""
    echo "🚨 ISSUE FOUND: Environment variables contain placeholder values"
    echo ""
    echo "📋 STEPS TO FIX:"
    echo "1. Get a Google Gemini API key from: https://makersuite.google.com/app/apikey"
    echo "2. Update VITE_GEMINI_API_KEY in your .env file with your actual API key"
    echo "3. Update VITE_API_BASE_URL with your deployed Cloudflare Worker URL"
    echo "4. Restart your development server"
    echo ""
    echo "📚 For detailed instructions, see issue #307"
    exit 1
fi

echo ""
echo "✅ Environment configuration appears valid!"
echo "🚀 You should now be able to use AI functionality"