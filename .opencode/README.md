# OpenCode Configuration for MA Malnu Kananga

This directory contains custom configurations to optimize OpenCode CLI for the MA Malnu Kananga project.

## Overview

The configuration includes:
- **AGENTS.md** - Project context and guidelines
- **commands.json** - Custom commands for common tasks
- **rules.json** - Code style and best practice rules
- **tools/** - Custom tools for code analysis
- **skills/** - Specialized skills for specific tasks
- **Oh My OpenCode** - Plugin and theme management system

## Setup

The configuration is automatically loaded by OpenCode when you run `/init` in the project root.

## Oh My OpenCode Plugin System 🚀

Oh My OpenCode is a powerful plugin and theme management system included in this project.

### Quick Start

```bash
# Show Oh My OpenCode status
npx ts-node .opencode/oh-my-opencode.ts status

# List available plugins
npx ts-node .opencode/oh-my-opencode.ts list-plugins

# Enable/disable plugins
npx ts-node .opencode/oh-my-opencode.ts enable security
npx ts-node .opencode/oh-my-opencode.ts disable testing

# Change themes
npx ts-node .opencode/oh-my-opencode.ts list-themes
npx ts-node .opencode/oh-my-opencode.ts set-theme dark
```

### Available Plugins

| Plugin | Status | Description |
|--------|--------|-------------|
| **core** | ✅ Enabled | Essential commands (test, typecheck, lint, deploy) |
| **performance** | ✅ Enabled | Performance optimization tools |
| **testing** | ✅ Enabled | Test generation and debugging |
| **security** | ❌ Disabled | Security analysis and vulnerability detection |

### Available Themes

- **default** - Standard theme (active)
- **dark** - Dark theme for low-light environments
- **minimal** - Minimal theme with subtle colors

For complete documentation, see [OH_MY_OPENCODE.md](./OH_MY_OPENCODE.md)

## Custom Commands

Use these commands from the OpenCode TUI:

### Quality Checks
```
/test                    - Run tests and verify everything passes
/typecheck / tc          - Run TypeScript type checking
/lint / lf               - Run linting and fix issues
/full-check / fc          - Run all quality checks
/build-verify / bd        - Build and verify production readiness
/security-check           - Run security audit
```

### Code Generation
```
/add-service            - Add a new service following conventions
/add-component          - Add a new React component with tests
/add-hook               - Add a new custom React hook
/api-endpoint           - Add a new API endpoint
/voice-feature          - Add voice recognition/synthesis
/ai-feature             - Add AI feature using Gemini
/pwa-feature            - Add PWA functionality
/migrate-storage        - Migrate localStorage to API
/test-generate          - Generate tests for existing code
/migration              - Create database or feature migration
```

### Code Quality
```
/review-code            - Review code for best practices
/refactor               - Refactor code following patterns
/debug-test             - Debug failing test
/optimize-performance   - Optimize component/service performance
/check-permissions      - Validate permission implementation
```

### Deployment
```
/deploy                 - Deploy to production (frontend + backend)
/deploy-checklist       - Generate deployment checklist
```

### Environment Setup
```
/env-setup              - Set up environment variables
/check-auth             - Review authentication implementation
```

### Code Analysis
```
/find-missing-tests     - Find files without tests
/find-urls              - Find hardcoded URLs
/check-storage          - Check localStorage key usage
/check-logs             - Check console.log usage
/check-errors           - Check missing error handling
/check-types            - Find 'any' type usage
```

## Skills

Specialized skills for common project tasks:

### service-generator.md
Generate TypeScript services following project patterns:
- Proper structure with types, logging, error handling
- API integration patterns
- Testing guidelines

### component-generator.md
Generate React components following best practices:
- Functional components with hooks
- TypeScript prop interfaces
- Tailwind CSS styling
- Performance optimization
- Testing with React Testing Library

### hook-generator.md
Generate custom React hooks:
- Hook structure and patterns
- Common hook templates (data fetching, localStorage, forms, debounce)
- Rules of hooks
- Testing patterns

### api-endpoint-generator.md
Add API endpoints for both frontend and backend:
- Frontend: apiService.ts patterns
- Backend: worker.js patterns
- Database schema
- Permissions and auth
- Testing for both sides

### voice-feature-generator.md
Implement voice features:
- Use speechRecognitionService and speechSynthesisService
- Browser compatibility checks
- Voice commands pattern
- Error handling
- Testing and accessibility

### test-generator.md (NEW)
Generate tests for existing code:
- Component tests with React Testing Library
- Service tests with mocking
- Hook tests with renderHook
- Best practices and anti-patterns
- Coverage guidelines

### migration-generator.md (NEW)
Create database and feature migrations:
- Database schema migrations
- Data transformation migrations
- Feature migrations (localStorage to API)
- Rollback procedures
- Cloudflare D1 patterns

### permission-validator.md (NEW)
Validate and implement permissions:
- Permission configuration in permissions.ts
- Permission service patterns
- Component permission checks
- Backend permission validation
- Role-based access control

### pwa-generator.md (NEW)
Add PWA functionality:
- Offline data storage
- Network status detection
- Push notifications
- Data sync mechanisms
- Service worker configuration
- Testing PWA features

## Tools

Code analysis and generation tools:

### Available Tools
- **check-storage-keys** - Verify localStorage usage
- **check-missing-tests** - Find files without tests
- **check-missing-error-handling** - Find async functions without error handling
- **check-console-logs** - Find console.log usage (should use logger)
- **find-untyped** - Find 'any' type usage
- **find-hardcoded-urls** - Find hardcoded API URLs
- **generate-deployment-checklist** - Generate deployment checklist
- **generate-types** - Generate TypeScript types from API (reference tool)

### Tools Status
✅ Implemented and ready to use
- check-storage-keys
- check-missing-tests
- check-missing-error-handling
- check-console-logs
- find-untyped
- find-hardcoded-urls
- generate-deployment-checklist
- generate-types

📋 Planned (not yet implemented)
- generate-permission-doc
- generate-service-structure
- check-env-vars
- analyze-imports
- find-unused-imports
- generate-component-doc
- check-voice-commands
- generate-api-client-code
- generate-test-mocks
- check-type-exports
- find-large-files
- analyze-voice-features
- check-pwa-compatibility
- generate-role-matrix
- find-security-issues
- check-naming-conventions
- generate-changelog

## Rules

Code style and best practice rules are automatically applied:

- TypeScript strict mode
- Use STORAGE_KEYS constants
- Centralized error handling
- Proper logging
- Service patterns
- Naming conventions (UPPER_SNAKE_CASE, camelCase, PascalCase)
- Voice feature patterns
- API service usage
- React hooks best practices
- Permission checks
- Component testing
- Service testing
- PWA offline support
- AI/LLM integration
- JWT authentication
- Notification patterns
- Type exports
- Environment variables
- Tailwind CSS usage
- React component structure
- Error boundaries
- Form validation
- Data migration
- Performance optimization
- Security
- Documentation

## Usage

1. **Initialize OpenCode for the project**:
   ```bash
   opencode
   /init
   ```

2. **Use custom commands**:
   ```
   Run tests: /test
   Typecheck: /typecheck
   Lint: /lint
   ```

3. **Ask OpenCode to use a skill**:
   ```
   "Create a new user service"
   "Add a login component"
   "Generate a useAuth hook"
   "Add a /api/users endpoint"
   "Implement voice search"
   ```

4. **Use tools for analysis**:
   ```
   "Check for any hardcoded localStorage keys"
   "Find files without tests"
   "Generate permission documentation"
   ```

## Project Structure Reference

```
src/
├── components/          # React components
├── config/             # Configuration files
├── constants.ts        # Centralized constants (STORAGE_KEYS, VOICE_CONFIG, etc.)
├── hooks/              # Custom React hooks
├── services/           # API and business logic services
│   ├── apiService.ts           # Main API service
│   ├── authService.ts          # Authentication
│   ├── geminiService.ts        # AI/LLM
│   ├── speechRecognitionService.ts  # Speech-to-text
│   ├── speechSynthesisService.ts    # Text-to-speech
│   ├── pushNotificationService.ts   # PWA notifications
│   ├── ocrService.ts           # OCR
│   └── permissionService.ts    # Permissions
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    ├── logger.ts               # Logging
    └── errorHandler.ts         # Error handling
```

## Common Workflows

### Adding a New Feature

1. Plan the feature (use Tab to switch to Plan mode)
2. Review similar existing features
3. Use `/add-service`, `/add-component`, or `/add-hook` as needed
4. If adding permissions, use `/check-permissions` to validate
5. If PWA features needed, use `/pwa-feature`
6. Implement following project patterns
7. Run `/fc` or `/full-check` to verify quality
8. Use `/test-generate` if tests are missing
9. Run `/find-missing-tests` to check coverage

### API Development

1. Define TypeScript types first
2. Add frontend API function to `apiService.ts`
3. Add backend route to `worker.js`
4. Update database schema if needed
5. Configure permissions
6. Add tests for both sides
7. Run `/api-endpoint` for guidance

### Voice Features

1. Import existing services
2. Use patterns from `/voice-feature`
3. Check browser compatibility
4. Handle errors properly
5. Provide visual feedback
6. Test on multiple browsers

### Testing

1. Always add tests for new code
2. Use `/test-generate` to create tests for existing code
3. Run `/find-missing-tests` to check test coverage
4. Use React Testing Library for components
5. Use vitest for services and hooks
6. Mock external dependencies
7. Run `/test` frequently
8. Check for test issues with `/debug-test`

## Notes

- The configuration is optimized for this specific project's tech stack
- Follow existing patterns when adding new features
- Always run typecheck and lint before committing
- Use AGENTS.md as reference for project context
- Commit `.opencode/` directory to share configuration with team

## New Features (Latest Update)

### New Tools
- **check-missing-tests** - Automatically finds files without corresponding test files
- **find-hardcoded-urls** - Detects hardcoded URLs that should be in constants
- **generate-deployment-checklist** - Creates comprehensive deployment checklist
- **generate-types** - Reference tool for generating TypeScript types from JSON

### New Skills
- **test-generator.md** - Comprehensive test generation guidelines
- **migration-generator.md** - Database and feature migration patterns
- **permission-validator.md** - Permission validation and implementation
- **pwa-generator.md** - PWA feature development guidelines

### New Commands
- **/deploy** - Complete deployment workflow (frontend + backend)
- **/test-generate** - Generate tests for existing code
- **/migration** - Create database/feature migrations
- **/check-permissions** - Validate permission implementation
- **/pwa-feature** - Add/optimize PWA functionality
- **/deploy-checklist** - Generate deployment checklist
- **/find-missing-tests** - Find files without tests
- **/find-urls** - Find hardcoded URLs
- **/check-storage** - Verify localStorage key usage
- **/check-logs** - Check console.log usage
- **/check-errors** - Check missing error handling
- **/check-types** - Find 'any' type usage

### Command Aliases (for faster workflow)
- **/tc** - Shortcut for /typecheck
- **/lf** - Shortcut for /lint and fix
- **/fc** - Shortcut for /full-check
- **/bd** - Shortcut for /build-verify

## Usage Examples

### Quick Quality Check
```
/fc  # Runs typecheck, lint, and tests
```

### Find Issues
```
/find-missing-tests  # Check test coverage
/find-urls          # Find hardcoded URLs
/check-storage      # Check localStorage usage
```

### Generate Code
```
/test-generate      # Generate tests for existing code
/migration          # Create migration script
/pwa-feature        # Add PWA functionality
```

### Deploy
```
/deploy-checklist   # Review before deploying
/deploy            # Deploy to production
```

## Updating Configuration

To add new commands, rules, or skills:
1. Edit the corresponding JSON/MD files in `.opencode/`
2. Test with OpenCode
3. Commit changes to share with team
