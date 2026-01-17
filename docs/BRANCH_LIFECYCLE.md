# Branch Lifecycle Policy

**Created**: 2026-01-17
**Last Updated**: 2026-01-17
**Version**: 1.0.0
**Status**: Active

---

## Overview

This document defines the lifecycle management policy for Git branches in the Malnu-Kananga repository. It ensures clean repository state, reduces clutter, and maintains efficient Git operations.

---

## Branch Naming Conventions

### Standard Branch Types

| Branch Type | Prefix | Example | Description |
|-------------|--------|---------|-------------|
| Feature | `feature/` | `feature/websocket-backend` | New features under development |
| Bug Fix | `fix/` | `fix/circular-dependency` | Bug fixes and error corrections |
| Refactor | `refactor/` | `refactor/button-consistency` | Code restructuring without behavior change |
| UI/UX | `ux/` | `ux/visual-consistency-polish` | UI/UX improvements and design changes |
| Docs | `docs/` | `docs/ui-component-part-3` | Documentation updates and improvements |
| Release | `release/v` | `release/v2.1.0` | Release preparation branches |
| Hotfix | `hotfix/v` | `hotfix/v2.1.1` | Critical production fixes |

### Branch Naming Best Practices

1. **Use kebab-case**: `feature/websocket-backend` (not `feature/websocket_backend`)
2. **Be descriptive**: `fix/circular-dependency` (not `fix/bug-123`)
3. **Include issue number**: If applicable, `fix/518-gemini-api-error-recovery`
4. **Use date-based for time-sensitive**: `refactor/repository-cleanup-2026-01-07`
5. **Keep names concise**: Under 50 characters when possible

---

## Branch Lifecycle Stages

### Stage 1: Creation (Day 0)

**Action**: Create feature branch from `main`
```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-feature
```

**Requirements**:
- Branch must start from latest `main` commit
- Create corresponding task in `docs/TASK.md` with status "In Progress"
- Include clear description in branch name

### Stage 2: Development (Days 1-14)

**Action**: Active development and collaboration

**Guidelines**:
- Regular commits (at least daily for active features)
- Push to remote frequently
- Include clear commit messages
- Run tests before pushing
- Update TASK.md progress as work progresses

**Best Practices**:
- Use `npm run typecheck` before committing
- Use `npm run lint:fix` before committing
- Create Pull Request when feature is ready for review
- Link Pull Request to TASK.md entry

### Stage 3: Review & Merge (Days 15-21)

**Action**: Code review and merge preparation

**Requirements**:
- All tests passing (`npm test`)
- No TypeScript errors (`npm run typecheck`)
- No linting errors (`npm run lint`)
- Code review approved
- Documentation updated (if applicable)
- TASK.md task marked "Completed" after merge

**Merge Guidelines**:
- Use squash merge for feature branches
- Use merge commit for hotfix branches
- Delete branch after merge
- Update TASK.md with PR link

### Stage 4: Cleanup (Days 30+)

**Action**: Remove stale branches

**Cleanup Criteria**:
- Branches >30 days old without activity
- Branches that have been merged (should be deleted immediately after merge)
- Branches with no corresponding open Pull Request
- Abandoned branches (no commits for >14 days)

**Cleanup Process**:
1. Verify branch is not needed (check open PRs, TASK.md)
2. Coordinate with branch owner before deletion
3. Delete remote branch: `git push origin --delete branch-name`
4. Delete local branch: `git branch -D branch-name`

---

## Automation & Monitoring

### Weekly Branch Audit (Recommended)

Run weekly to identify branches needing attention:

```bash
# List branches >14 days old
git for-each-ref --sort=committerdate refs/remotes/ --format='%(committerdate:short) %(refname:short)' | \
  awk '$1 < "'"$(date -d '14 days ago' +%Y-%m-%d)"'"'
```

### Monthly Branch Cleanup

On the first of each month:
1. Review branches >30 days old
2. Contact branch owners for confirmation
3. Document deletion in TASK.md
4. Execute cleanup

---

## Current Branch Status (2026-01-17)

### Active Branches (0-30 days)

All remote branches are currently **0-12 days old** (as of 2026-01-17):

| Branch Name | Age (Days) | Last Commit | Status |
|------------|------------|-------------|--------|
| docs/ui-component-part-3 | 1 | 2026-01-16 | Active |
| fix/schedule-fetching-and-env-config | 2 | 2026-01-15 | Active |
| feature/database-optimization | 3 | 2026-01-14 | Active |
| fix/circular-dependency-and-security | 3 | 2026-01-14 | Active |
| fix/profilesection-accessibility-hover | 3 | 2026-01-14 | Active |
| fix/agents-documentation | 4 | 2026-01-13 | Active |
| cleanup-audit-validation-20260113 | 4 | 2026-01-13 | Active |
| fix/accessibility-test-focus-styles | 4 | 2026-01-13 | Active |
| fix/skiplink-accessibility-tabindex | 4 | 2026-01-13 | Active |
| feature/dimension-token-system | 4 | 2026-01-13 | Active |
| feature/extract-image-card-component | 4 | 2026-01-13 | Active |
| fix/hardcoded-dark-mode-gradients | 4 | 2026-01-13 | Active |
| fix/responsive-text-scaling | 4 | 2026-01-13 | Active |
| fix/button-icononly-accessibility | 4 | 2026-01-13 | Active |
| fix/test-failures-and-lint-errors | 4 | 2026-01-13 | Active |
| feature/accessibility-button-keyboard-nav | 4 | 2026-01-13 | Active |
| feature/consolidate-notification-systems | 5 | 2026-01-12 | Active |
| refactor/remove-redundant-tabindex-skiplink | 5 | 2026-01-12 | Active |
| feature/accessibility-semantc-html-improvements | 5 | 2026-01-12 | Active |
| feature/footer-accessibility-improvement | 5 | 2026-01-12 | Active |
| fix/bug-107-elibrary-mock-component | 5 | 2026-01-12 | Active |
| fix/icon-imports | 6 | 2026-01-11 | Active |
| feature/toast-accessibility-ux | 6 | 2026-01-11 | Active |
| feature/ui-documentation-update | 7 | 2026-01-10 | Active |
| feature/offline-queue-integration-issue-948 | 7 | 2026-01-10 | Active |
| feature/ocr-validation-parent-notifications | 7 | 2026-01-10 | Active |
| feature/websocket-realtime-sync | 7 | 2026-01-10 | Active |
| fix/styling-system-debug | 7 | 2026-01-10 | Active |
| fix/828-shared-reusable-components | 7 | 2026-01-10 | Active |
| feature/color-icon-system-accessibility | 7 | 2026-01-10 | Active |
| feature/search-input-component | 8 | 2026-01-10 | Active |
| fix/typescript-test-errors | 8 | 2026-01-09 | Active |
| refactor/button-consistency | 8 | 2026-01-09 | Active |
| feature/theme-selector-accessibility | 9 | 2026-01-08 | Active |
| fix/standardize-autosave-debouncing | 9 | 2026-01-08 | Active |
| feature/dashboard-action-card-component | 10 | 2026-01-07 | Active |
| feature/textarea-component-improvement | 10 | 2026-01-07 | Active |
| fix/storage-keys-and-lint | 10 | 2026-01-07 | Active |
| refactor/repository-cleanup-2026-01-07 | 10 | 2026-01-07 | Active |
| fix/docs-metrics | 10 | 2026-01-07 | Active |
| feature/advanced-theme-system | 10 | 2026-01-07 | Active |
| docs/remove-redundant-documentation | 11 | 2026-01-06 | Active |
| fix/643-failing-site-editor-tests | 11 | 2026-01-06 | Active |
| ux/visual-consistency-polish | 11 | 2026-01-06 | Active |
| fix/teacher-validation-error-handling | 11 | 2026-01-06 | Active |
| fix/opencode-installer | 11 | 2026-01-06 | Active |
| fix/518-gemini-api-error-recovery | 12 | 2026-01-05 | Active |
| feat/ai-learning-integration | 12 | 2026-01-05 | Active |
| fix/analyzer-workflow-2026-01-05 | 12 | 2026-01-05 | Active |

### Stale Branches (>30 days)

**None** - All branches are currently within the 30-day window.

---

## Branch Deletion Guidelines

### Safe to Delete Immediately

1. **Merged branches** - After successful merge to `main`
2. **Abandoned branches** - No commits for >14 days, no open PR
3. **Duplicate branches** - Multiple branches for same feature

### Requires Coordination

1. **Active development branches** (>30 days old) - Contact owner
2. **Blocked branches** - Waiting on dependencies - Verify status
3. **WIP branches** - Marked as work-in-progress - Confirm if still needed

### Never Delete

1. `main` branch
2. Active release branches (`release/v*`)
3. Active hotfix branches (`hotfix/v*`)
4. Branches with open Pull Requests
5. Branches linked to TASK.md entries

---

## GitHub Actions Integration

### Scheduled Branch Cleanup (Future Enhancement)

Consider adding a GitHub Action to automatically flag stale branches:

```yaml
# .github/workflows/branch-cleanup.yml
name: Branch Cleanup

on:
  schedule:
    - cron: '0 0 1 * *'  # First day of each month
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Identify stale branches
        run: |
          # Script to identify branches >30 days old
          # Create issue with list for manual review
```

---

## Enforcement & Compliance

### Developer Responsibilities

- Follow naming conventions
- Clean up branches after merge
- Update TASK.md when creating/deleting branches
- Respond to branch cleanup notifications

### Maintainer Responsibilities

- Review and approve branch deletions
- Monitor branch hygiene monthly
- Enforce naming conventions
- Update this policy as needed

---

## Summary

- **Total Remote Branches**: 52 branches
- **Active Branches (0-30 days)**: 52 branches
- **Stale Branches (>30 days)**: 0 branches
- **Next Cleanup Review**: 2026-02-17 (30 days from 2026-01-17)

**Repository Status**: ✅ Clean - No branches requiring immediate cleanup

---

**Last Updated**: 2026-01-17
**Next Review**: 2026-02-17
**Reviewed By**: Lead Autonomous Engineer
