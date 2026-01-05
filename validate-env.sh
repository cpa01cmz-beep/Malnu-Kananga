#!/bin/bash

# Development Environment Validation Script
# Checks if all required environment variables are properly configured

echo "=== Development Environment Validation ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation function
validate_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name: Missing${NC}"
        return 1
    elif [[ "$var_value" == *"your_actual"* ]] || [[ "$var_value" == *"placeholder"* ]]; then
        echo -e "${YELLOW}⚠️  $var_name: Contains placeholder value${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $var_name: Configured${NC}"
        return 0
    fi
}

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ .env file loaded"
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Run './setup-env.sh' to create configuration"
    exit 1
fi

echo ""

# Critical variables
echo "🔑 Critical Configuration:"
validate_env_var "VITE_GEMINI_API_KEY"

echo ""

# Optional but recommended
echo "⚙️  Optional Configuration:"
validate_env_var "VITE_API_BASE_URL"
validate_env_var "NODE_ENV"

echo ""

# Feature flags
echo "🚀 Feature Flags:"
if [ "$VITE_ENABLE_AI_CHAT" = "true" ]; then
    echo -e "${GREEN}✅ AI Chat: Enabled${NC}"
else
    echo -e "${YELLOW}⚠️  AI Chat: Disabled${NC}"
fi

if [ "$VITE_DEV_MODE" = "true" ]; then
    echo -e "${GREEN}✅ Development Mode: Enabled${NC}"
else
    echo -e "${YELLOW}⚠️  Development Mode: Disabled${NC}"
fi

echo ""

# Next steps
echo "📋 Next Steps:"
if [ -n "$VITE_GEMINI_API_KEY" ] && [[ "$VITE_GEMINI_API_KEY" != *"your_actual"* ]]; then
    echo -e "${GREEN}→ Ready to start development with 'npm run dev'${NC}"
else
    echo -e "${YELLOW}→ Configure API keys in .env file${NC}"
    echo -e "${YELLOW}→ Run './setup-env.sh' for guided setup${NC}"
fi

echo ""