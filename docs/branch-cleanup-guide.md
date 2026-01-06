# Repository Branch Cleanup Guide

## Overview
This document outlines the process for cleaning up stale and merged branches in the MA Malnu Kananga repository.

## Current Status
- All previously listed merged branches have been automatically cleaned up
- Remote references have been pruned
- Repository is now in a clean state

## Branch Cleanup Criteria

### Safe to Delete (Merged)
- Branches fully merged into `main` branch
- No active development
- No open pull requests

### Review Required (Stale)
- Branches inactive for >30 days
- Should be evaluated for potential reuse before deletion

## Automated Cleanup Process

```bash
# List merged branches (excluding main and HEAD)
git branch -r --merged main | grep -v 'origin/main\|origin/HEAD'

# Check branch activity dates
git for-each-ref --sort=-committerdate --format='%(refname:short) %(committerdate:iso8601)' refs/remotes/origin/

# Prune stale remote references
git remote prune origin
```

## Branch Naming Convention

- **Features**: `feature/feature-name`
- **Bug fixes**: `fix/bug-description`  
- **Hotfixes**: `hotfix/critical-fix`
- **Documentation**: `docs/update-description`
- **Chores**: `chore/maintenance-task`

## Maintenance Schedule

- **Weekly**: Check for newly merged branches
- **Monthly**: Review stale branches (>30 days)
- **Quarterly**: Complete branch audit

## Safety Measures

1. **Never** delete branches without verification
2. Always check for open PRs before deletion
3. Use branch protection settings for critical branches
4. Document the deletion reason

## Automation Opportunities

Consider implementing:
- GitHub Actions to auto-delete merged branches after 7 days
- Stale bot to mark inactive branches
- Branch policies to enforce naming conventions

---

Last Updated: 2026-01-06
Repository: MA Malnu Kananga