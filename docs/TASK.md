# Task List

**Last Updated**: 2026-01-13
**Version**: 10.0.0

## Current Goals

### P0: Critical (Blockers)

- [ ] Fix test failures (35 failures across 11 test files)
  - Button (2 failures) - Focus styles
  - Card (2 failures) - Focus styles in dark mode
  - ErrorBoundary (1 failure) - Error handling
  - FileInput (1 failure) - Required indicator
  - IconButton (3 failures) - Focus ring styles
  - PermissionManager (3 failures) - Permission UI component
  - SmallActionButton (2 failures) - Focus styles
  - Other components (21 failures) - Various accessibility issues
  - StudentPortalValidator (4 failures) - Validation logic
  - PermissionManager (3 failures) - Permission UI component
  - ErrorBoundary (1 failure) - Error handling
  - Button (2 failures) - Focus styles
  - Card (2 failures) - Focus styles in dark mode
  - FileInput (1 failure) - Required indicator
  - IconButton (3 failures) - Focus ring styles
  - SmallActionButton (2 failures) - Focus styles
  - Other components (17 failures) - Various accessibility issues

### P1: High Priority

- [ ] Complete UI component documentation
  - Document all 40 UI components from `src/components/ui/index.ts`
  - Current: 7/40 documented
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

---

## System Status

| Metric | Status | Details |
|--------|--------|---------|
| TypeScript | ✅ Clean | No errors |
| Linting | ⚠️ 2 errors | False positives in worker.js |
| Tests | ❌ Failing | 35 failures, 1450 passing, 10 skipped |
| Security | ✅ Clean | 0 vulnerabilities |
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
- [ ] Fix test failures
- [ ] Complete UI component documentation
- [ ] Bring test coverage to 80%+

### Q2 2026 (April - June)
- [ ] Implement backend WebSocket support
- [ ] Optimize bundle size to <500KB
- [ ] Database query optimization
- [ ] Reduce chunk sizes with better code splitting

---

## Version History

| Version | Date | Changes |
|---------|------|------|
| 11.0.0 | 2026-01-13 | Repository audit: Corrected test metrics (35 failures, 1450 passing), corrected source file count (327 total/246 source), streamlined version history |
| 10.0.0 | 2026-01-13 | Repository cleanup: Synthesized TASK.md for clarity, removed verbose version history, consolidated documentation structure |
