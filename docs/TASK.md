# Task List

**Last Updated**: 2026-01-14
**Version**: 13.0.1

## Current Goals

### P0: Critical (Blockers)

- [x] Fix UI/UX accessibility test failures (10 failures fixed, 1466 passing)
- [x] Fix misleading hover effects on non-interactive cards (WCAG compliance)
- [x] Fix semantic HTML: Replace div role="button" with button element in OsisEvents.tsx (2026-01-14)
- [ ] Fix remaining test failures (17 failures, 1466 passing, 10 skipped)
  - emailService (4 failures) - API mock configuration issues
  - studentPortalValidator (13 failures) - Validation logic issues

### P1: High Priority

- [ ] Complete UI component documentation
  - Document all 40 UI components from `src/components/ui/index.ts`
  - Current: 7/40 documented
  - See `docs/UI_COMPONENTS.md` for complete list

- [ ] Implement backend WebSocket support
  - Frontend: Fully implemented (`webSocketService.ts`)
  - Backend: Missing `/ws` endpoint and `/api/updates` fallback

### P2: Medium Priority

- [ ] Optimize bundle size
  - Target: <500KB initial load
  - Current: ~506KB (slightly over target)
  - Consider code splitting for heavy modules

- [ ] Complete notification system migration
  - Migrate from deprecated `pushNotificationService` to `unifiedNotificationManager`
  - Update test mocks and references
  - Remove deprecated services after migration complete

---

## System Status

| Metric | Status | Details |
|--------|--------|---------|
| TypeScript | ✅ Clean | No errors |
| Linting | ✅ Clean | No errors |
| Tests | ⚠️ Mixed | 17 failing, 1466 passing, 10 skipped |
| Security | ✅ Clean | 0 vulnerabilities |
| Dependencies | ✅ Up to date | No outdated packages |
| Build | ✅ Success | ~13s build time |

---

## Milestones

### Q1 2026 (January - March)
- [x] Color system migration (gray → neutral)
- [x] Reusable UI component library (40 components)
- [x] CSS custom properties for theming
- [x] Semantic color system with WCAG compliance
- [x] Accessibility improvements (WCAG 2.1 AA)
- [x] Documentation consolidation and cleanup
- [x] Component semantic color integration
- [x] Height token system for design consistency
- [ ] Fix test failures
- [ ] Complete UI component documentation
- [ ] Bring test coverage to 80%+

### Q2 2026 (April - June)
- [ ] Implement backend WebSocket support
- [ ] Optimize bundle size to <500KB
- [ ] Database query optimization
- [ ] Complete notification system migration

---

## Completed (2026-01-14)

- [x] **Interaction Polish: Enhanced Card Interactivity** - Added optional click handlers and hover effects to ProgramCard and NewsCard
  - **ProgramCard Component** (`src/components/ProgramCard.tsx`):
    - Added optional `onClick` prop for navigation functionality
    - Added optional `ariaLabel` prop for accessibility customization
    - Uses Card's "hover" variant when onClick is provided
    - Image zooms slightly on hover (`group-hover:scale-105`)
    - Title color changes on hover (`group-hover:text-primary-600`)
    - Added "Lihat Selengkapnya" (See more) link with arrow icon
    - Arrow icon slides right on hover (`group-hover:translate-x-1`)
    - Full keyboard navigation support when interactive (Tab, Enter, Space)
    - Proper ARIA labels for screen readers
  - **NewsCard Component** (`src/components/NewsCard.tsx`):
    - Added optional `onClick` prop for navigation functionality
    - Added optional `ariaLabel` prop for accessibility customization
    - Card lifts slightly on hover (`hover:-translate-y-0.5`) with shadow enhancement
    - Image zooms on hover (`group-hover:scale-105`)
    - Title color changes on hover (`group-hover:text-primary-600`)
    - Added "Baca Selengkapnya" (Read more) link with arrow icon
    - Arrow icon slides right on hover (`group-hover:translate-x-1`)
    - Renders as button when interactive (`role="button"`, `tabIndex="0"`)
    - Full keyboard navigation support when interactive
    - Maintains semantic HTML (article element becomes interactive when needed)
  - **Test Coverage** (`src/components/__tests__/CardInteraction.test.tsx`):
    - Tests for both ProgramCard and NewsCard
    - Verifies static vs interactive rendering
    - Tests onClick handler invocation
    - Tests keyboard navigation (Enter, Space keys)
    - Tests ARIA labels generation
    - Tests conditional link display
  - **Benefits**:
    - Improved visual feedback for users (hover effects, animations)
    - Cards feel more alive and responsive
    - Optional navigation capability for program/news details
    - Consistent interaction patterns across card components
    - Better accessibility (keyboard support, ARIA labels)
    - Enhanced user experience through micro-interactions

- [x] **Semantic HTML Accessibility Fix** - Replaced div role="button" with semantic button element in OsisEvents.tsx
  - Changed `<div role="button">` to `<button type="button">` (line 715-755)
  - Removed manual keyboard handler (`onKeyDown`) since button handles Enter/Space automatically
  - Removed `tabIndex={0}` since button is automatically in tab order
  - Removed `role="button"` since button has this role implicitly
  - Added `text-left` and `w-full` to maintain visual layout
  - Improved accessibility by using semantic HTML
  - Better screen reader support and native keyboard navigation
  - Follows WCAG best practices for interactive elements
  - Aligns with project's "use semantic HTML" design principle
  - Verified with typecheck and lint (no regressions)

- [x] **Height Token System** - Created centralized height design token system
  - Added `src/config/heights.ts` with reusable height tokens
  - Eliminated 20+ arbitrary height values (e.g., `min-h-[90vh]`, `max-h-[80vh]`)
  - Refactored 15+ components to use height tokens:
    - HeroSection, LoginModal, MaterialSharing, NotificationHistory
    - ParentNotificationSettings, ParentScheduleView, StudentInsights
    - GradingManagement, MaterialUpload, PPDBRegistration
    - NotificationCenter, VoiceSettings, DocumentationPage
    - ConflictResolutionModal, RelatedLinksSection
  - Improved code maintainability and design system consistency
  - Enhanced UI/UX through unified spacing system
  - See `src/config/heights.ts` for complete token system

---

**Last Updated**: 2026-01-14
**Version**: 13.0.1
