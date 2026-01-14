# Task List

**Last Updated**: 2026-01-13
**Version**: 12.1.0

## Current Goals

### P0: Critical (Blockers)

- [ ] Fix test failures (27 failures, 1458 passing, 10 skipped)
  - Button (2 failures) - Focus styles
  - Card (2 failures) - Focus styles in dark mode
  - ErrorBoundary (1 failure) - Error handling
  - FileInput (1 failure) - Required indicator
  - IconButton (3 failures) - Focus ring styles
  - PermissionManager (6 failures) - Permission UI component
  - SmallActionButton (2 failures) - Focus styles
  - StudentPortalValidator (4 failures) - Validation logic
  - ProfileSection (3 failures) - Accessibility testing
  - Other components (3 failures) - Various accessibility issues
  - 2 unhandled errors in test framework (jsdom event dispatch)

### P1: High Priority

- [x] Complete UI component documentation
  - Document all 40 UI components from `src/components/ui/index.ts`
  - Status: COMPLETED (40/40 documented)
  - See `docs/UI_COMPONENTS.md` for complete list

- [ ] Implement backend WebSocket support
  - Frontend: Fully implemented (`webSocketService.ts`)
  - Backend: Missing `/ws` endpoint and `/api/updates` fallback
  - See `docs/WEBSOCKET_IMPLEMENTATION.md`

### P2: Medium Priority

- [ ] Optimize bundle size
   - Target: <500KB initial load
   - Current: ~506KB (slightly over target)
   - Consider code splitting for heavy modules
   - Lazy load non-critical components

- [ ] Reduce chunk size warnings
   - Several chunks exceed 300KB after minification
   - Implement better manual chunking strategy

- [ ] Complete notification system migration
   - Migrate from deprecated `pushNotificationService` to `unifiedNotificationManager`
   - Update test mocks and references
   - Remove deprecated services after migration complete

---

## System Status

| Metric | Status | Details |
|--------|--------|---------|
| TypeScript | ✅ Clean | No errors |
| Linting | ⚠️ 2 errors | False positives in worker.js |
| Tests | ❌ Failing | 27 failures, 1458 passing, 10 skipped |
| Security | ✅ Clean | 0 vulnerabilities |
| Dependencies | ✅ Up to date | No outdated packages |
| Build | ✅ Success | ~13s build time with chunk warnings |

---

## Milestones

### Q1 2026 (January - March)
- [x] Color system migration (gray → neutral)
- [x] Reusable UI component library (40 components)
- [x] CSS custom properties for theming
- [x] Semantic color system with WCAG compliance
- [x] Accessibility improvements (WCAG 2.1 AA)
- [x] Documentation consolidation and cleanup
- [x] Repository audit and cleanup
- [ ] Fix test failures
- [ ] Complete UI component documentation
- [ ] Bring test coverage to 80%+

### Q2 2026 (April - June)
- [ ] Implement backend WebSocket support
- [ ] Optimize bundle size to <500KB
- [ ] Database query optimization
- [ ] Reduce chunk sizes with better code splitting
- [ ] Complete notification system migration

---

## Version History

| Version | Date | Changes |
|---------|------|------|
| 12.1.0 | 2026-01-13 | Repository audit cleanup: Synthesized TASK.md for clarity, corrected test metrics (27 failures, 1458 passing), streamlined version history, added notification migration task |
| 12.0.0 | 2026-01-13 | Previous repository audit version |
