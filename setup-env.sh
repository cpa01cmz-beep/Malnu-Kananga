#!/bin/bash

# Environment Setup Script for MA Malnu Kananga AI System
# This script helps configure the required environment variables

echo "=== MA Malnu Kananga - Environment Configuration Setup ==="
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
    echo ""
    echo "Current configuration (showing first 5 lines):"
    head -5 .env | grep -v "SECRET_KEY\|SUPABASE"
    echo ""
    read -p "Do you want to reconfigure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Current configuration preserved."
        exit 0
    fi
fi

echo "📋 Setting up environment configuration..."
echo ""

# Copy template if .env doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env from template"
fi

echo ""
echo "🔑 NEXT STEPS REQUIRED:"
echo "1. Get your Google Gemini API key:"
echo "   → Visit: https://makersuite.google.com/app/apikey"
echo "   → Create new API key"
echo "   → Copy the key"
echo ""
echo "2. Update .env file with your actual API key:"
echo "   → Replace 'your_actual_gemini_api_key_here' with your key"
echo ""
echo "3. Optional: Configure Cloudflare Worker (for RAG functionality):"
echo "   → Deploy worker and update VITE_API_BASE_URL"
echo ""
echo "4. Restart development server:"
echo "   → npm run dev"
echo ""

read -p "Press Enter to open .env file for editing..."
${EDITOR:-nano} .env

echo ""
echo "✅ Environment setup complete!"
echo "🚀 Run 'npm run dev' to start the development server"