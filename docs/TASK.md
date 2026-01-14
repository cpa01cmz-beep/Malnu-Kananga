# Task List

**Last Updated**: 2026-01-14
**Version**: 13.1.0

---

## Current Goals

### P0: Critical (Blockers)

- [ ] Fix remaining test failures (17 failures, 1466 passing, 10 skipped)
  - emailService (4 failures) - API mock configuration issues
  - studentPortalValidator (13 failures) - Validation logic issues

### P1: High Priority

- [ ] Complete UI component documentation
  - Document all 41 UI components from `src/components/ui/index.ts`
  - Current: 7/41 documented
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
- [x] Reusable UI component library (41 components)
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

### Semantic HTML Accessibility Fix
- Replaced `div role="button"` with semantic `<button>` element in OsisEvents.tsx (line 715-755)
- Removed manual keyboard handler (onKeyDown) since button handles Enter/Space automatically
- Removed `tabIndex={0}` and `role="button"` (button has implicit support)
- Added `text-left` and `w-full` to maintain visual layout
- Improved WCAG compliance and screen reader support

### Height Token System
- Created centralized height token system in `src/config/heights.ts`
- Eliminated 20+ arbitrary height values (e.g., `min-h-[90vh]`, `max-h-[80vh]`)
- Refactored 15+ components to use height tokens:
  - HeroSection, LoginModal, MaterialSharing, NotificationHistory
  - ParentNotificationSettings, ParentScheduleView, StudentInsights
  - GradingManagement, MaterialUpload, PPDBRegistration
  - NotificationCenter, VoiceSettings, DocumentationPage
  - ConflictResolutionModal, RelatedLinksSection
- Enhanced code maintainability and design consistency

---

**Note**: See [docs/README.md](./docs/README.md) for complete project documentation.
