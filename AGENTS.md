# OpenCode Configuration for MA Malnu Kananga

**Last Updated**: 2026-01-06 (Updated user roles documentation)

## Project Overview

MA Malnu Kananga is a modern school management system with AI integration, built with React + TypeScript + Vite.

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend**: Cloudflare Workers (Serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **AI**: Google Gemini API
- **Testing**: Vitest, React Testing Library
- **PWA**: vite-plugin-pwa with Workbox

### Project Structure

```
src/
├── components/          # React components
├── config/             # Configuration files
├── constants.ts        # Centralized constants
├── data/              # Default data and static resources
├── hooks/             # Custom React hooks
├── services/          # API and business logic services
├── tests/             # Integration tests
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
└── config.ts          # Main configuration
```

### Key Services

- `apiService.ts` - Main API service with JWT auth
- `authService.ts` - Authentication service
- `geminiService.ts` - AI/LLM integration
- `speechRecognitionService.ts` - Voice recognition
- `speechSynthesisService.ts` - Text-to-speech
- `pushNotificationService.ts` - PWA notifications
- `ocrService.ts` - OCR for PPDB documents
- `permissionService.ts` - Role-based permissions

### Storage Keys

All localStorage keys use `malnu_` prefix:
- `malnu_site_content` - Site content
- `malnu_users` - User data
- `malnu_auth_session` - Auth session
- `malnu_materials` - Library materials
- `malnu_voice_settings` - Voice configuration
- See `src/constants.ts` for complete list

### User Roles

Primary roles: `admin`, `teacher`, `student`, `parent`
Extra roles: `staff`, `osis`, `wakasek`, `kepsek`

### Testing Guidelines

- Run tests with: `npm test` or `npm run test:ui`
- Test files are in `src/**/__tests__/` and `__tests__/`
- Use `vitest` as test runner
- Run type checking with: `npm run typecheck`
- Run linting with: `npm run lint`
- Fix lint issues with: `npm run lint:fix`

### Build & Deployment

- Development: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`
- Backend dev: `npm run dev:backend`
- Backend deploy: `npm run deploy:backend`

### Code Style

- Use TypeScript strict mode
- NEVER use "any", "unknown", or implicit types
- Follow existing naming conventions
- Constants use UPPER_SNAKE_CASE
- Services use camelCase
- React components use PascalCase
- Always run `npm run typecheck` before committing
- Always run `npm run lint:fix` before committing

### Important Notes

1. **Environment Variables**: The backend URL is configured via `VITE_API_BASE_URL`
2. **Auth**: JWT-based authentication with token refresh
3. **Voice Features**: Browser-based speech recognition/synthesis (Chrome/Edge/Safari)
4. **PWA**: Service worker configured for offline support
5. **API**: RESTful API endpoints on Cloudflare Workers
6. **Error Handling**: Centralized error handling in `errorHandler.ts`
7. **Logging**: Use `logger.ts` for consistent logging

### Common Tasks

When working on this codebase:

1. **Adding new API endpoints**: Update `apiService.ts` and backend worker
2. **Adding new features**: Check existing patterns in services/
3. **Modifying storage**: Use constants from `STORAGE_KEYS`
4. **Adding permissions**: Update `permissionService.ts` and `src/config/permissions.ts`
5. **Voice features**: Check `speechRecognitionService.ts` and `speechSynthesisService.ts`
6. **AI features**: Use `geminiService.ts`
7. **Testing**: Write tests alongside the code in `__tests__/` folders

### Git Workflow

- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Use husky pre-commit hooks (lint-staged)
- Run `npm run security:scan` for security checks

### OpenCode Configuration

This project includes optimized OpenCode CLI configuration in `.opencode/` directory:

- **Custom Commands**: Use `/test`, `/typecheck`, `/lint`, `/full-check`, `/build-verify`, etc.
- **Skills**: Specialized instructions for creating services, components, hooks, API endpoints, and voice features
- **Rules**: Auto-applied coding standards and best practices
- **Tools**: Code analysis and generation utilities

See `.opencode/README.md` for detailed usage instructions.
