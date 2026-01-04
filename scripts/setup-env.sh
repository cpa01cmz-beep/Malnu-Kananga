#!/bin/bash

# Environment Setup Helper Script
# This script helps users properly configure their environment for AI functionality

echo "🛠️  MA Malnu Kananga - Environment Setup Helper"
echo "==============================================="
echo ""

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found"
    exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Copy .env.example to .env
echo "📋 Creating .env file from template..."
cp .env.example .env
echo "✅ .env file created"

echo ""
echo "📝 NEXT STEPS:"
echo "=============="
echo ""
echo "1. 🤖 Get Google Gemini API Key:"
echo "   - Go to: https://makersuite.google.com/app/apikey"
echo "   - Create a new API key"
echo "   - Copy the key"
echo ""
echo "2. ⚙️  Configure your .env file:"
echo "   - Replace 'your_actual_gemini_api_key_here' with your API key"
echo "   - Update VITE_API_BASE_URL if you have a custom Worker URL"
echo ""
echo "3. 🚀 Start development:"
echo "   - Run: npm run dev"
echo "   - OR: npm start"
echo ""
echo "4. ✅ Validate configuration:"
echo "   - Run: ./scripts/validate-env.sh"
echo ""
echo "🔒 IMPORTANT:"
echo "============="
echo "- NEVER commit your .env file to version control"
echo "- Keep your API keys secure and private"
echo "- Use different keys for development and production"
echo ""

read -p "🔍 Do you want to test your configuration now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔍 Running validation..."
    ./scripts/validate-env.sh
fi

echo ""
echo "✅ Setup complete! Your AI chat functionality will work once you've configured your API key."