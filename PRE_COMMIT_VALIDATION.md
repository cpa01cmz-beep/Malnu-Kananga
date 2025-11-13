# Pre-Commit Validation Configuration

This document outlines the pre-commit validation system that integrates with our multi-agent code review system.

## Overview

The pre-commit validation system ensures code quality at the earliest stage of development by running automated checks before commits are accepted. This system includes:

- Code linting with ESLint
- Code formatting with Prettier
- Type checking with TypeScript
- Integration with multi-agent code review system

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up git hooks:
   ```bash
   # On Unix/Linux/Mac:
   ./scripts/setup-hooks.sh

   # On Windows:
   scripts\setup-hooks.bat
   ```

## Configuration Files

### package.json
- Added linting, formatting, and validation scripts
- Added ESLint, Prettier, and related dependencies
- Added Husky and lint-staged for git hook management

### .eslintrc.json
- Configured ESLint with recommended React and TypeScript rules
- Integrated with Prettier for formatting consistency
- Included accessibility rules (jsx-a11y)

### .prettierrc
- Standardized code formatting rules
- Set print width to 100 characters
- Configured for consistent code style

### .lintstagedrc.json
- Specifies which files to process and what commands to run
- Applies linting and formatting to TypeScript/JS files
- Applies formatting to JSON, CSS, and Markdown files

## Pre-Commit Hook

The pre-commit hook performs the following checks:

1. **Lint-Staged**:
   - Runs ESLint with --fix on staged TypeScript/JS files
   - Runs Prettier formatting on staged files
   - Applies formatting to JSON, CSS, and Markdown files

2. **Type Checking**:
   - Runs TypeScript compiler to check for type errors
   - Prevents commits with type errors

## Pre-Push Hook

The pre-push hook runs tests to ensure code quality before pushing:

1. **Test Execution**:
   - Runs all project tests using Jest
   - Prevents pushes if tests fail

## Integration with Multi-Agent Code Review

The pre-commit validation serves as the first line of defense in the multi-agent code review process:

1. **Prevents Basic Issues**: Catches syntax errors, formatting issues, and basic linting problems before they reach the code review stage
2. **Ensures Consistent Style**: Maintains consistent code formatting across the entire codebase
3. **Type Safety**: Validates type correctness before code review agents analyze the code
4. **Performance**: Reduces the load on code review agents by addressing simple issues early

## Manual Commands

For manual validation (useful for CI/CD or when bypassing git hooks):

```bash
# Run all validation checks
npm run validate

# Run only linting
npm run lint

# Run only linting with auto-fix
npm run lint:fix

# Run only formatting
npm run format

# Run only format check (no changes)
npm run format:check

# Run only type checking
npm run type-check
```

## CI/CD Integration

The validation commands can be integrated into CI/CD pipelines:

```bash
# In CI environment, run validation checks
npm run validate

# This ensures code quality is maintained across all environments
```

## Troubleshooting

If you need to bypass the pre-commit hook temporarily (not recommended for production code):

```bash
git commit --no-verify -m "Your commit message"
```

## Maintenance

- Regularly update linting rules to match evolving best practices
- Review new ESLint and Prettier recommendations
- Adjust rules based on project-specific needs
- Monitor performance of validation checks