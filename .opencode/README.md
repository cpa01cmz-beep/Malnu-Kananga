# OpenCode Configuration for MA Malnu Kananga

This directory contains custom configurations to optimize OpenCode CLI for the MA Malnu Kananga project.

## Overview

The configuration includes:
- **AGENTS.md** - Project context and guidelines
- **commands.json** - Custom commands for common tasks
- **rules.json** - Code style and best practice rules
- **tools.json** - Custom tools for code analysis
- **skills/** - Specialized skills for specific tasks

## Setup

The configuration is automatically loaded by OpenCode when you run `/init` in the project root.

## Custom Commands

Use these commands from the OpenCode TUI:

```
/test                    - Run tests and verify everything passes
/typecheck              - Run TypeScript type checking
/lint                   - Run linting and fix issues
/full-check             - Run all quality checks
/build-verify           - Build and verify production readiness
/security-check         - Run security audit
/add-service            - Add a new service following conventions
/add-component          - Add a new React component with tests
/add-hook               - Add a new custom React hook
/api-endpoint           - Add a new API endpoint
/voice-feature          - Add voice recognition/synthesis
/ai-feature             - Add AI feature using Gemini
/pwa-feature            - Add PWA functionality
/migrate-storage        - Migrate localStorage to API
/review-code            - Review code for best practices
/refactor               - Refactor code following patterns
/debug-test             - Debug failing test
/env-setup              - Set up environment variables
/check-auth             - Review authentication implementation
/optimize-performance   - Optimize component/service performance
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

## Tools

Code analysis and generation tools:

- **generate-types** - Generate TypeScript types from API
- **check-storage-keys** - Verify localStorage usage
- **generate-permission-doc** - Document permissions and roles
- **find-untyped** - Find 'any' type usage
- **check-missing-tests** - Find files without tests
- **generate-service-structure** - Template for new services
- **find-hardcoded-urls** - Find hardcoded API URLs
- **check-env-vars** - Find environment variable usage
- **analyze-imports** - Analyze import patterns
- **find-unused-imports** - Find potentially unused imports
- **generate-component-doc** - Document React components
- **check-voice-commands** - Verify voice command registration
- **generate-api-client-code** - Generate API client code
- **find-missing-error-handling** - Find async functions without error handling
- **check-console-logs** - Find console.log usage (should use logger)
- **generate-test-mocks** - Generate test mocks
- **check-type-exports** - Find types that should be exported
- **find-large-files** - Find files needing refactoring
- **generate-deployment-checklist** - Generate deployment checklist
- **analyze-voice-features** - Analyze voice implementation
- **check-pwa-compatibility** - Check PWA implementation
- **generate-role-matrix** - Generate role permission matrix
- **find-security-issues** - Find potential security issues
- **check-naming-conventions** - Check naming violations
- **generate-changelog** - Generate changelog from git

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
4. Implement following project patterns
5. Run `/full-check` to verify quality
6. Add tests

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
2. Use React Testing Library for components
3. Use vitest for services and hooks
4. Mock external dependencies
5. Run `/test` frequently

## Notes

- The configuration is optimized for this specific project's tech stack
- Follow existing patterns when adding new features
- Always run typecheck and lint before committing
- Use AGENTS.md as reference for project context
- Commit `.opencode/` directory to share configuration with team

## Updating Configuration

To add new commands, rules, or skills:
1. Edit the corresponding JSON/MD files in `.opencode/`
2. Test with OpenCode
3. Commit changes to share with team
