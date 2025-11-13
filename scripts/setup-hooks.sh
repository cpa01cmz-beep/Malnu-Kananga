#!/bin/bash
# Setup script for Husky git hooks

# Initialize Husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged && npm run type-check"

# Create pre-push hook for running tests
npx husky add .husky/pre-push "npm run test"

echo "✅ Git hooks have been set up successfully!"
echo "Pre-commit hook will run lint-staged and type checking"
echo "Pre-push hook will run tests"