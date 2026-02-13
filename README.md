 
# Website & Portal Pintar MA Malnu Kananga

 ![Version](https://img.shields.io/badge/version-3.10.6-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Test Coverage](https://img.shields.io/badge/coverage-31.4%25-yellow)

**Version**: 3.10.6 | **Last Updated**: 2026-02-12 | **Status**: ✅ Production Ready

Smart Portal MA Malnu Kananga - Modern school management system with AI integration.

> **A comprehensive PWA-based school management platform with AI-powered features, voice interaction, offline support, and multi-role dashboards for students, teachers, parents, and administrators.**

## Project Metrics

### Codebase Statistics
| Metric | Value |
|--------|-------|
|  **Version** | 3.10.6 |
| **Source Files** | 382 |
| **Test Files** | 158 |
| **Test Coverage** | 29.2% (158/540 files) |
| **Services** | 34 (18 with tests, 52.9%) |
| **Components** | 195+ (84 tested, 43.1%) |
| **Utilities** | 26+ (13 tested, 50%) |
| **STORAGE_KEYS** | 60+ centralized keys |
| **Lines of Code** | ~60,000+ |

### Test Coverage by Category
| Category | Files | Tested | Coverage |
|----------|-------|--------|----------|
| Services | 34 | 18 | 52.9% |
| Components | 195+ | 84 | 43.1% |
| Utils | 26+ | 13 | 50% |
| **Total** | **540** | **158** | **29.2%** |

### Code Quality
- ✅ **TypeScript Strict Mode**: Enabled (0% `any` usage achieved)
- ✅ **ESLint**: Configured with max 20 warnings threshold
- ✅ **Pre-commit Hooks**: Husky + lint-staged for automated quality checks
- ✅ **Security**: npm audit + detect-secrets integration

### Feature Completion Status (Q1 2026)
| Priority | Status | Notes |
|----------|--------|-------|
| **P1 (Critical)** | ✅ 100% | All P1 tasks completed |
| **P2 (High)** | ✅ 90% | 9/10 tasks completed |
| **P3 (Low)** | ✅ 100% | All P3 tasks completed |

### Recent Milestones (2026-01-22 to 2026-01-30)
- ✅ Parent-Teacher Communication Log (Issue #973)
- ✅ Voice Command Expansion for Teachers (Issue #1204)
- ✅ Enhanced Notification System (GAP-107)
- ✅ Material Upload Validation (GAP-108)
- ✅ Voice Settings Validation (GAP-109)
- ✅ Speech Recognition Error Recovery (GAP-110)
- ✅ Speech Synthesis Error Recovery (GAP-111)
- ✅ Test Coverage Analysis & Improvements
- ✅ Hardcoded Storage Keys Eliminated
- ✅ CI/CD Deadlock Fix (Issue #1258)

### Technical Debt Status
| Area | Status | Target | Deadline |
|------|--------|--------|----------|
| Test Coverage | 🟡 In Progress | > 80% | 2026-02-28 |
| Type Safety | ✅ Completed | 0% `any` | 2026-03-31 (Achieved) |
| Bundle Size | 🟡 Planned | Optimized | 2026-04-30 |
| Error Handling | 🟢 Stable | Consistent | 2026-03-15 |

## Quick Start

See [Documentation](./docs) for complete guides and API reference.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Documentation

### Core Documentation (Single Source of Truth)
- **[Features](./docs/FEATURES.md)** - Complete feature list, system architecture, and technical specifications
- **[API Reference](./docs/api-reference.md)** - Complete API documentation and endpoints
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Deployment procedures and infrastructure setup

### User Guides
- **[Documentation Index](./docs/README.md)** - Additional documentation guides
- **[User Guide](./docs/HOW_TO.md)** - How to use all features
- **[Features](./docs/FEATURES.md)** - Complete feature list and descriptions
- **[Voice Commands Guide](./docs/VOICE_COMMANDS_GUIDE.md)** - Voice interaction commands and best practices

### Developer Documentation
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Coding Standards](./docs/CODING_STANDARDS.md)** - Code style and conventions
- **[Contributing](./docs/CONTRIBUTING.md)** - Contribution guidelines
- **[Branch Lifecycle](./docs/BRANCH_LIFECYCLE.md)** - Git workflow and branching strategy

### Technical Documentation
- **[WebSocket Implementation](./docs/WEBSOCKET_IMPLEMENTATION.md)** - WebSocket architecture and usage
- **[Voice Interaction Architecture](./docs/VOICE_INTERACTION_ARCHITECTURE.md)** - Voice system design
- **[Email Service](./docs/EMAIL_SERVICE.md)** - Email delivery system
- **[API Rate Limiting](./docs/API_RATE_LIMITING.md)** - Rate limiting implementation
- **[Database Optimization Guide](./docs/DATABASE_OPTIMIZATION_GUIDE.md)** - D1 database best practices
- **[Security Audit Report](./docs/SECURITY_AUDIT_REPORT.md)** - Security findings and remediation
- **[Troubleshooting Guide](./docs/troubleshooting-guide.md)** - Common issues and solutions

### UI/UX Documentation
- **[UI Components](./docs/UI_COMPONENTS.md)** - Component library and usage
- **[Color Palette](./docs/COLOR_PALETTE.md)** - Design system colors
- **[Color Usage Guide](./docs/COLOR_USAGE_GUIDE.md)** - Color application guidelines
- **[Gradients](./docs/GRADIENTS.md)** - Gradient definitions and usage

## Features

### Core Management
- **Multi-Role Dashboard**: Admin, Teacher, Student, Parent, Staff, OSIS, Wakasek, Kepsek
- **Academic Management**: Grades, assignments, schedules, class management
- **Attendance Management**: Manual entry, batch operations, export capabilities
- **PPDB Online**: New student registration with OCR document processing

### AI-Powered Features
- **AI Chatbot**: RAG-powered assistant with vector search
- **AI Site Editor**: Natural language website content editing
- **AI Quiz Generator**: Automatic quiz creation with customizable parameters
- **AI Student Insights**: Performance analytics and recommendations
- **AI Study Plan Generator**: Personalized learning paths based on performance

### Communication & Collaboration
- **Parent-Teacher Messaging**: Direct communication with audit trail
- **Communication Log**: Complete history of messages, meetings, calls, notes
- **Activity Feed**: Real-time updates and notifications
- **Email Service**: Automated notifications with queue management

### E-Library & Resources
- **Material Sharing**: Upload, share, and organize educational materials
- **E-Library**: Centralized resource repository with search
- **Material Ratings & Favorites**: User feedback system
- **PDF Export**: Generate reports and documents

### Voice Interaction
- **Speech-to-Text**: Voice commands for navigation and operations
- **Text-to-Speech**: Screen reader support and TTS notifications
- **Voice Commands**: 40+ commands for teachers (attendance, grading, navigation)
- **Error Recovery**: Automatic retry and fallback for voice failures

### PWA & Offline Support
- **Offline Mode**: Full functionality without internet connection
- **Action Queue**: Background sync when online
- **Conflict Resolution**: Merge changes from multiple clients
- **Push Notifications**: Browser and voice notifications

### Analytics & Reporting
- **Grade Analytics**: Class performance, subject breakdown, individual insights
- **Attendance Analytics**: Trends, patterns, and summaries
- **Export Options**: PDF and CSV exports for all reports
- **Real-time Dashboard**: Live performance tracking

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start frontend dev server
npm run dev:backend      # Start backend dev server (Wrangler)

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                # Run unit tests (Vitest)
npm run test:ui         # Run tests with UI
npm run test:run        # Run tests without UI
npm run test:e2e        # Run E2E tests (Playwright)
npm run test:all        # Run all tests (unit + E2E)

# Code Quality
npm run typecheck        # Run TypeScript compiler
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix lint issues

# Deployment
npm run deploy:backend  # Deploy backend to Cloudflare Workers
npm run deploy:prod     # Deploy both frontend and backend

# Environment
npm run env:setup       # Setup environment files
npm run env:validate    # Validate environment configuration

# Security
npm run security:scan   # Run npm audit + audit-ci
npm run secrets:scan    # Detect secrets in codebase

# OpenCode CLI
npm run oh-my-opencode  # Launch OpenCode CLI tools
```

### Code Quality Checks

**Pre-commit** (automatic via Husky):
- ESLint auto-fix on all staged files
- Lint JSON, Markdown, YAML files

**CI/CD** (GitHub Actions):
- Type checking (TypeScript)
- Linting (ESLint)
- Unit tests (Vitest)
- E2E tests (Playwright)
- Security audit (npm audit)
- Turnstile workflow protection (same-branch-only enabled)

### Branch Naming Conventions

- **Features**: `feature/feature-name` or `feat/GAP-XXX`
- **Bug Fixes**: `fix/bug-description` or `fix/issue-number`
- **Chores**: `chore/task-description`
- **Refactoring**: `refactor/improvement-description`

### Branch Lifecycle

- Merged branches should be deleted immediately after merge
- See [BRANCH_LIFECYCLE.md](./docs/BRANCH_LIFECYCLE.md) for details

## OpenCode CLI Integration

This project includes optimized OpenCode CLI configuration in `.opencode/` directory:

- **Custom Commands**: `/test`, `/typecheck`, `/lint`, `/full-check`, `/build-verify`, etc.
- **Skills**: Specialized instructions for creating services, components, hooks, API endpoints
- **Rules**: Auto-applied coding standards and best practices
- **Tools**: Code analysis and generation utilities

See `.opencode/README.md` for detailed usage instructions.

## Tech Stack

### Frontend
- **Framework**: React 19.2.3
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router DOM 7.12.0
- **Charts**: Recharts 3.6.0
- **Icons**: Heroicons React 2.2.0

### Backend (Cloudflare Workers)
- **Runtime**: Serverless (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Deployment**: Wrangler 4.65.0

### AI & ML
- **LLM**: Google Gemini API (@google/genai 1.41.0)
- **OCR**: Tesseract.js 7.0.0

### PWA & Testing
- **PWA**: vite-plugin-pwa 1.2.0 with Workbox
- **Unit Testing**: Vitest 4.0.17 + React Testing Library 16.3.1
- **E2E Testing**: Playwright 1.57.0
- **Error Monitoring**: Sentry 10.34.0

### PDF & Document Processing
- **PDF Generation**: jsPDF 4.0.0 + jsPDF-AutoTable 5.0.7
- **Canvas**: html2canvas 1.4.1
- **CSV**: PapaParse 5.5.3
- **QR Code**: qrcode 1.5.4

## Contributing

We welcome contributions! Please follow these guidelines:

1. Read the [Contributing Guide](./docs/CONTRIBUTING.md)
2. Follow the [Coding Standards](./docs/CODING_STANDARDS.md)
3. Create feature branches from default branch
4. Write tests for new features
5. Ensure all tests pass before submitting PR
6. Run `npm run lint:fix` and `npm run typecheck` before committing

## Support & Contact

- **Website**: https://ma-malnukananga.sch.id
- **Email**: admin@malnu-kananga.sch.id
- **GitHub Issues**: https://github.com/anomalyco/opencode/issues
- **Documentation**: https://github.com/anomalyco/opencode/tree/main/docs

## License

© 2026 MA Malnu Kananga. All rights reserved.

---

 **Last Updated**: 2026-02-12
**Maintained By**: Lead Autonomous Engineer & System Guardian
