# BroCula Run #138 - Detailed Task Graph

**Repository**: MA Malnu Kananga  
**Run Number**: #138  
**Date**: 2026-02-15  
**Status**: GOLD STANDARD (Zero Console Errors Maintained)

---

## Executive Summary

BroCula Run #138 is a comprehensive browser console and Lighthouse audit following the successful Run #137. The repository currently maintains GOLD STANDARD status with zero console errors. This task graph provides a parallel-executable work plan for conducting the audit and maintaining optimal browser hygiene.

**Baseline Metrics**:
- Build Time: 27.26s (optimal)
- Total Chunks: 33 (optimized code splitting)
- PWA Precache: 21 entries (1.82 MB)
- Main Bundle: 89.43 kB (gzip: 27.06 kB)
- Console Errors: 0 (target)
- Console Warnings: 0 (target)
- Lighthouse Performance: 71/100
- Lighthouse Accessibility: 100/100
- Lighthouse Best Practices: 100/100
- Lighthouse SEO: 100/100

---

## Task Graph Architecture

```
Wave 1: Pre-flight Checks (Sequential)
├── Task 1.1: Environment Verification
├── Task 1.2: Dependency Check
├── Task 1.3: Build Readiness Test
└── SUCCESS_GATE: All checks pass

Wave 2: Parallel Browser Audits (Parallel Execution)
├── Task 2.1: Console Error Scan [depends: Wave 1]
├── Task 2.2: Console Warning Scan [depends: Wave 1]
├── Task 2.3: Lighthouse Performance Audit [depends: Wave 1]
├── Task 2.4: Lighthouse Accessibility Audit [depends: Wave 1]
├── Task 2.5: Lighthouse Best Practices Audit [depends: Wave 1]
├── Task 2.6: Lighthouse SEO Audit [depends: Wave 1]
├── Task 2.7: Memory Leak Detection [depends: Wave 1]
└── Task 2.8: PWA Compliance Check [depends: Wave 1]

Wave 3: Issue Categorization (Sequential Analysis)
├── Task 3.1: Aggregate Findings [depends: Wave 2]
├── Task 3.2: Severity Classification
├── Task 3.3: Dependency Mapping
└── SUCCESS_GATE: Issues categorized

Wave 4: Fix Implementation Wave 1 - FATAL (Critical Path)
├── Task 4.1: Fix Console Errors [depends: Wave 3, if FATAL found]
├── Task 4.2: Fix Build Blockers [depends: Wave 3, if FATAL found]
└── VERIFICATION_GATE: Re-run build/lint/typecheck

Wave 5: Fix Implementation Wave 2 - Warnings (Parallel)
├── Task 5.1: Fix Console Warnings [depends: Wave 4]
├── Task 5.2: Fix Deprecation Notices [depends: Wave 4]
└── VERIFICATION_GATE: Console clean

Wave 6: Fix Implementation Wave 3 - Performance (Parallel)
├── Task 6.1: Optimize Code Splitting [depends: Wave 4]
├── Task 6.2: Optimize CSS Loading [depends: Wave 4]
├── Task 6.3: Optimize Image Loading [depends: Wave 4]
├── Task 6.4: Optimize Bundle Size [depends: Wave 4]
└── VERIFICATION_GATE: Lighthouse score improved

Wave 7: Fix Implementation Wave 4 - PWA/Accessibility (Parallel)
├── Task 7.1: PWA Manifest Validation [depends: Wave 4]
├── Task 7.2: Service Worker Optimization [depends: Wave 4]
├── Task 7.3: ARIA Compliance Check [depends: Wave 4]
└── VERIFICATION_GATE: PWA and a11y scores maintained

Wave 8: Comprehensive Verification (Sequential)
├── Task 8.1: Full Build Verification [depends: Waves 4-7]
├── Task 8.2: Lint Verification [depends: Waves 4-7]
├── Task 8.3: TypeScript Check [depends: Waves 4-7]
├── Task 8.4: Test Suite Execution [depends: Waves 4-7]
├── Task 8.5: Final Console Audit [depends: Waves 4-7]
└── SUCCESS_GATE: All verification passed

Wave 9: Documentation (Sequential)
├── Task 9.1: Create Audit Report [depends: Wave 8]
├── Task 9.2: Update AGENTS.md [depends: Wave 8]
└── SUCCESS_GATE: Documentation complete

Wave 10: PR Creation (Sequential)
├── Task 10.1: Branch Synchronization [depends: Wave 9]
├── Task 10.2: Commit Changes [depends: Wave 9]
├── Task 10.3: Create PR [depends: Wave 9]
└── SUCCESS_GATE: PR submitted
```

---

## Detailed Task Specifications

### Wave 1: Pre-flight Checks

#### Task 1.1: Environment Verification
**Category**: Infrastructure  
**Skills**: bash, git-master  
**Dependencies**: None  
**Parallel**: No  
**Prompt**:
```
Verify the development environment is ready for BroCula audit:
1. Check Node.js version (should be 18+)
2. Check npm version
3. Verify git repository status is clean
4. Confirm current branch is 'main'
5. Verify branch is up to date with origin/main
6. Check that no uncommitted changes exist

Success Criteria:
- Node.js >= 18.0.0
- Git status: clean
- Branch: main
- Up to date with origin/main
```

#### Task 1.2: Dependency Check
**Category**: Infrastructure  
**Skills**: bash  
**Dependencies**: Task 1.1  
**Parallel**: No  
**Prompt**:
```
Verify all dependencies are installed and up to date:
1. Run 'npm ci' to ensure clean install
2. Check for security vulnerabilities with 'npm audit'
3. Verify all required binaries are available
4. Check that playwright browsers are installed

Success Criteria:
- npm ci completes without errors
- npm audit shows 0 critical vulnerabilities
- All binaries available in node_modules/.bin
```

#### Task 1.3: Build Readiness Test
**Category**: Build  
**Skills**: bash  
**Dependencies**: Task 1.2  
**Parallel**: No  
**Prompt**:
```
Verify the codebase is in build-ready state:
1. Run TypeScript typecheck: 'npm run typecheck'
2. Run ESLint: 'npm run lint'
3. Run a quick build test: 'npm run build' (with CI=true)
4. Record baseline build metrics

Success Criteria:
- TypeScript: 0 errors
- ESLint: 0 warnings (max 20 allowed)
- Build: successful completion
- Build time recorded
```

---

### Wave 2: Parallel Browser Audits

#### Task 2.1: Console Error Scan
**Category**: Browser Audit  
**Skills**: playwright, dev-browser  
**Dependencies**: Wave 1  
**Parallel**: Yes (with 2.2-2.8)  
**Prompt**:
```
Scan for console errors across all major application routes:
1. Start development server: 'npm run dev'
2. Wait for server ready
3. Navigate to each route using playwright:
   - / (home)
   - /login
   - /dashboard (each role: admin, teacher, student, parent)
   - /e-library
   - /ppdb
   - /academic/grades
   - /communication/chat
   - /settings
4. Capture all console.error() calls
5. Capture all console.exception() calls
6. Check for unhandled promise rejections
7. Check for React error boundaries triggered

Tools to use:
- skill_mcp(mcp_name="playwright", tool_name="browser_navigate")
- skill_mcp(mcp_name="playwright", tool_name="browser_console_logs")
- skill_mcp(mcp_name="playwright", tool_name="browser_evaluate")

Success Criteria:
- Zero console.error() calls
- Zero unhandled promise rejections
- Zero React error boundary triggers
```

#### Task 2.2: Console Warning Scan
**Category**: Browser Audit  
**Skills**: playwright, dev-browser  
**Dependencies**: Wave 1  
**Parallel**: Yes (with 2.1, 2.3-2.8)  
**Prompt**:
```
Scan for console warnings across all major application routes:
1. Navigate to each route (same as Task 2.1)
2. Capture all console.warn() calls
3. Capture all console.info() calls in production mode
4. Check for React deprecation warnings
5. Check for browser API deprecation warnings
6. Check for performance warnings
7. Check for accessibility warnings

Tools to use:
- skill_mcp(mcp_name="playwright", tool_name="browser_navigate")
- skill_mcp(mcp_name="playwright", tool_name="browser_console_logs")

Success Criteria:
- Zero console.warn() calls in production paths
- Zero deprecation warnings
- All logging properly gated by isDevelopment
```

#### Task 2.3: Lighthouse Performance Audit
**Category**: Lighthouse  
**Skills**: playwright  
**Dependencies**: Wave 1  
**Parallel**: Yes (with 2.1-2.2, 2.4-2.8)  
**Prompt**:
```
Run Lighthouse performance audit:
1. Build production bundle: 'npm run build'
2. Start preview server: 'npm run preview'
3. Run Lighthouse on key pages:
   - Home page (/)
   - Login page (/login)
   - Dashboard (each role)
4. Record metrics:
   - Performance score
   - First Contentful Paint
   - Speed Index
   - Largest Contentful Paint
   - Cumulative Layout Shift
   - Total Blocking Time

Tools to use:
- skill_mcp(mcp_name="playwright", tool_name="browser_lighthouse")

Success Criteria:
- Performance >= 70/100
- LCP < 2.5s
- CLS < 0.1
- TBT < 200ms
```

#### Task 2.4: Lighthouse Accessibility Audit
**Category**: Lighthouse  
**Skills**: playwright  
**Dependencies**: Wave 1  
**Parallel**: Yes (with 2.1-2.3, 2.5-2.8)  
**Prompt**:
```
Run Lighthouse accessibility audit:
1. Run audit on same pages as Task 2.3
2. Check for:
   - Missing alt text on images
   - Poor color contrast
   - Missing form labels
   - Missing ARIA attributes
   - Keyboard navigation issues
   - Focus management problems

Tools to use:
- skill_mcp(mcp_name="playwright", tool_name="browser_lighthouse")

Success Criteria:
- Accessibility = 100/100
- Zero critical accessibility issues
- Zero serious accessibility issues
```

#### Task 2.5: Lighthouse Best Practices Audit
**Category**: Lighthouse  
**Skills**: playwright  
**Dependencies**: Wave 1  
**Parallel**: Yes (with 2.1-2.4, 2.6-2.8)  
**Prompt**:
```
Run Lighthouse best practices audit:
1. Check for:
   - HTTPS usage
   - HTTP/2 support
   - Image optimization
   - JavaScript libraries vulnerabilities
   - Browser errors logged
   - Deprecated APIs usage
   - Password input security

Tools to use:
- skill_mcp(mcp_name="playwright", tool_name="browser_lighthouse")

Success Criteria:
- Best Practices = 100/100
- Zero security vulnerabilities
- Zero deprecated API usage
```

#### Task 2.6: Lighthouse SEO Audit
**Category**: Lighthouse  
**Skills**: playwright  
**Dependencies**: Wave 1  
**Parallel**: Yes (with 2.1-2.5, 2.7-2.8)  
**Prompt**:
```
Run Lighthouse SEO audit:
1. Check for:
   - Meta descriptions
   - Title elements
   - HTTP status code
   - Links crawlable
   - robots.txt valid
   - hreflang valid
   - Canonical links
   - Mobile viewport

Tools to use:
- skill_mcp(mcp_name="playwright", tool_name="browser_lighthouse")

Success Criteria:
- SEO = 100/100
- All pages have proper meta tags
- All pages have proper title elements
```

#### Task 2.7: Memory Leak Detection
**Category**: Browser Audit  
**Skills**: playwright, dev-browser  
**Dependencies**: Wave 1  
**Parallel**: Yes (with 2.1-2.6, 2.8)  
**Prompt**:
```
Detect memory leaks in the application:
1. Navigate to a page
2. Record initial heap snapshot
3. Perform actions (open modals, navigate, etc.)
4. Force garbage collection
5. Record final heap snapshot
6. Compare snapshots
7. Check for:
   - Event listeners not cleaned up
   - DOM nodes not released
   - setInterval/setTimeout not cleared
   - useEffect cleanup functions missing

Tools to use:
- skill_mcp(mcp_name="playwright", tool_name="browser_evaluate")

Success Criteria:
- No memory growth after GC
- All event listeners properly cleaned up
- All useEffect hooks have cleanup functions
```

#### Task 2.8: PWA Compliance Check
**Category**: PWA  
**Skills**: playwright  
**Dependencies**: Wave 1  
**Parallel**: Yes (with 2.1-2.7)  
**Prompt**:
```
Verify PWA compliance:
1. Check manifest.json validity
2. Verify service worker registration
3. Check offline functionality
4. Verify icons exist in all required sizes
5. Check theme-color meta tag
6. Verify display mode (standalone)
7. Check start_url
8. Verify background_color and theme_color

Tools to use:
- skill_mcp(mcp_name="playwright", tool_name="browser_navigate")
- skill_mcp(mcp_name="playwright", tool_name="browser_evaluate")

Success Criteria:
- Manifest valid JSON
- Service worker registered
- Offline functionality works
- All icons present
```

---

### Wave 3: Issue Categorization

#### Task 3.1: Aggregate Findings
**Category**: Analysis  
**Skills**: None (data aggregation)  
**Dependencies**: Wave 2  
**Parallel**: No  
**Prompt**:
```
Aggregate all findings from Wave 2 audits:
1. Collect console errors from Task 2.1
2. Collect console warnings from Task 2.2
3. Collect Lighthouse findings from Tasks 2.3-2.6
4. Collect memory leak findings from Task 2.7
5. Collect PWA issues from Task 2.8
6. Create consolidated issue list

Output Format:
```json
{
  "console_errors": [],
  "console_warnings": [],
  "lighthouse_performance": [],
  "lighthouse_accessibility": [],
  "lighthouse_best_practices": [],
  "lighthouse_seo": [],
  "memory_leaks": [],
  "pwa_issues": []
}
```

Success Criteria:
- All findings documented
- Categorized by source
```

#### Task 3.2: Severity Classification
**Category**: Analysis  
**Skills**: None  
**Dependencies**: Task 3.1  
**Parallel**: No  
**Prompt**:
```
Classify all issues by severity:

FATAL (Blocks build/release):
- Console errors in production code
- Build failures
- TypeScript errors
- Security vulnerabilities

HIGH (Must fix):
- Console warnings in production
- Lighthouse score < 90
- Memory leaks
- PWA compliance failures

MEDIUM (Should fix):
- Deprecation warnings
- Lighthouse score < 95
- Minor accessibility issues

LOW (Nice to have):
- Code style issues
- Minor optimizations
- Documentation improvements

Output Format:
```json
{
  "fatal": [],
  "high": [],
  "medium": [],
  "low": []
}
```

Success Criteria:
- All issues classified
- FATAL issues identified for immediate fixing
```

#### Task 3.3: Dependency Mapping
**Category**: Analysis  
**Skills**: None  
**Dependencies**: Task 3.2  
**Parallel**: No  
**Prompt**:
```
Map dependencies between issues:
1. Identify issues that block others
2. Group related issues for batch fixing
3. Identify independent issues for parallel fixing
4. Create fix order based on dependencies

Output Format:
```json
{
  "independent": [],
  "blocked_by_fatal": [],
  "related_groups": []
}
```

Success Criteria:
- Dependency graph created
- Fix order determined
```

---

### Wave 4: Fix Implementation Wave 1 - FATAL

#### Task 4.1: Fix Console Errors
**Category**: Bug Fix  
**Skills**: frontend-ui-ux, git-master  
**Dependencies**: Wave 3 (if FATAL issues found)  
**Parallel**: No  
**Prompt**:
```
Fix all FATAL console errors:
1. Identify source of each console.error
2. Determine root cause:
   - Missing error handling
   - Uninitialized variables
   - API failures not caught
   - Third-party library issues
3. Implement fixes:
   - Add proper try-catch blocks
   - Add null checks
   - Add error boundaries
   - Gate console statements with isDevelopment
4. Verify fixes don't introduce new issues

Success Criteria:
- Zero console.error in production
- All error handling follows codebase patterns
- No new TypeScript errors
```

#### Task 4.2: Fix Build Blockers
**Category**: Build Fix  
**Skills**: bash, git-master  
**Dependencies**: Task 4.1  
**Parallel**: No  
**Prompt**:
```
Fix any build-blocking issues:
1. Run full build: 'npm run build'
2. Address any build errors
3. Run lint: 'npm run lint'
4. Address any lint errors
5. Run typecheck: 'npm run typecheck'
6. Address any type errors

Success Criteria:
- Build: PASS
- Lint: PASS (0 warnings)
- Typecheck: PASS (0 errors)
```

---

### Wave 5: Fix Implementation Wave 2 - Warnings

#### Task 5.1: Fix Console Warnings
**Category**: Bug Fix  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 5.2)  
**Prompt**:
```
Fix all console warnings:
1. Identify source of each console.warn
2. Common warning types:
   - Deprecation warnings
   - Prop type warnings
   - Missing key in list
   - Unused variables
3. Implement fixes:
   - Update deprecated APIs
   - Add proper PropTypes or TypeScript types
   - Add keys to list items
   - Remove unused code
4. Verify warnings are resolved

Success Criteria:
- Zero console.warn in production
- All warnings properly addressed
```

#### Task 5.2: Fix Deprecation Notices
**Category**: Maintenance  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 5.1)  
**Prompt**:
```
Fix all deprecation warnings:
1. Identify deprecated APIs/libraries
2. Common deprecations:
   - React lifecycle methods
   - Browser APIs
   - Third-party library features
3. Update to recommended alternatives:
   - componentWillMount → componentDidMount
   - UNSAFE_ methods → modern alternatives
   - Deprecated browser APIs → modern equivalents
4. Update dependencies if needed

Success Criteria:
- Zero deprecation warnings
- All APIs using current versions
```

---

### Wave 6: Fix Implementation Wave 3 - Performance

#### Task 6.1: Optimize Code Splitting
**Category**: Performance  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 6.2-6.4)  
**Prompt**:
```
Optimize code splitting:
1. Review vite.config.ts manualChunks
2. Check for oversized chunks (>500KB)
3. Identify opportunities for:
   - Additional lazy loading
   - Route-based splitting
   - Vendor separation
4. Implement optimizations:
   - Add more dynamic imports
   - Refine chunk boundaries
   - Move heavy libraries to separate chunks
5. Measure improvement

Success Criteria:
- No chunk > 500KB
- Main bundle < 100KB
- Build time maintained or improved
```

#### Task 6.2: Optimize CSS Loading
**Category**: Performance  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 6.1, 6.3-6.4)  
**Prompt**:
```
Optimize CSS loading:
1. Check for render-blocking CSS
2. Review async CSS plugin configuration
3. Identify critical CSS to inline
4. Implement optimizations:
   - Inline critical CSS
   - Async load non-critical CSS
   - Purge unused CSS
5. Verify no FOUC (Flash of Unstyled Content)

Success Criteria:
- Zero render-blocking CSS
- No FOUC
- Lighthouse "Eliminate render-blocking resources" passed
```

#### Task 6.3: Optimize Image Loading
**Category**: Performance  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 6.1-6.2, 6.4)  
**Prompt**:
```
Optimize image loading:
1. Check all images for:
   - loading="lazy" attribute
   - width and height attributes
   - proper format (WebP where possible)
   - compression
2. Implement lazy loading for below-fold images
3. Add responsive images where appropriate
4. Verify ImageWithFallback component usage

Success Criteria:
- All below-fold images have loading="lazy"
- All images have dimensions
- Lighthouse image optimization score improved
```

#### Task 6.4: Optimize Bundle Size
**Category**: Performance  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 6.1-6.3)  
**Prompt**:
```
Optimize bundle size:
1. Analyze bundle composition
2. Check for:
   - Duplicate dependencies
   - Large unused code
   - Unnecessary polyfills
   - Dev-only code in production
3. Implement optimizations:
   - Tree shaking verification
   - Remove unused imports
   - Dynamic imports for heavy features
4. Verify bundle size reduction

Success Criteria:
- Main bundle < 90KB gzipped
- Total JS < 500KB gzipped
- No duplicate dependencies
```

---

### Wave 7: Fix Implementation Wave 4 - PWA/Accessibility

#### Task 7.1: PWA Manifest Validation
**Category**: PWA  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 7.2-7.3)  
**Prompt**:
```
Validate and fix PWA manifest:
1. Check manifest.json for:
   - Valid JSON syntax
   - Required fields: name, short_name, start_url, display, icons
   - Icon sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
   - Theme colors
   - Background color
2. Fix any missing or invalid fields
3. Verify icons exist in public folder

Success Criteria:
- Manifest valid
- All required fields present
- All icons exist
```

#### Task 7.2: Service Worker Optimization
**Category**: PWA  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 7.1, 7.3)  
**Prompt**:
```
Optimize service worker:
1. Review workbox configuration
2. Check precache manifest
3. Verify runtime caching strategies
4. Optimize:
   - Cache expiration policies
   - Background sync (if used)
   - Offline page fallback
5. Test offline functionality

Success Criteria:
- Service worker registers successfully
- Offline functionality works
- Cache strategies optimal
```

#### Task 7.3: ARIA Compliance Check
**Category**: Accessibility  
**Skills**: frontend-ui-ux  
**Dependencies**: Wave 4  
**Parallel**: Yes (with 7.1-7.2)  
**Prompt**:
```
Verify ARIA compliance:
1. Check all interactive elements for:
   - Proper role attributes
   - aria-label or aria-labelledby
   - aria-expanded for expandable content
   - aria-hidden for decorative elements
   - aria-live for dynamic content
2. Check form elements for:
   - Associated labels
   - aria-describedby for hints
   - aria-invalid for errors
3. Fix any missing ARIA attributes

Success Criteria:
- All interactive elements have proper ARIA
- Forms properly labeled
- Lighthouse accessibility = 100
```

---

### Wave 8: Comprehensive Verification

#### Task 8.1: Full Build Verification
**Category**: Verification  
**Skills**: bash  
**Dependencies**: Waves 4-7  
**Parallel**: No  
**Prompt**:
```
Verify production build:
1. Clean dist folder: 'rm -rf dist'
2. Run production build: 'npm run build'
3. Record metrics:
   - Build time
   - Number of chunks
   - Main bundle size
   - Total bundle size
   - PWA precache entries
4. Verify no build errors

Success Criteria:
- Build completes successfully
- Build time < 40s
- No errors or warnings
```

#### Task 8.2: Lint Verification
**Category**: Verification  
**Skills**: bash  
**Dependencies**: Waves 4-7  
**Parallel**: Yes (with 8.1, 8.3-8.5)  
**Prompt**:
```
Verify lint compliance:
1. Run ESLint: 'npm run lint'
2. Address any new warnings
3. Verify max 20 warnings allowed

Success Criteria:
- Lint: PASS
- Warnings <= 20
```

#### Task 8.3: TypeScript Check
**Category**: Verification  
**Skills**: bash  
**Dependencies**: Waves 4-7  
**Parallel**: Yes (with 8.1-8.2, 8.4-8.5)  
**Prompt**:
```
Verify TypeScript compliance:
1. Run typecheck: 'npm run typecheck'
2. Address any type errors
3. Verify both tsconfig.json and tsconfig.test.json

Success Criteria:
- Typecheck: PASS
- Zero type errors
```

#### Task 8.4: Test Suite Execution
**Category**: Verification  
**Skills**: bash  
**Dependencies**: Waves 4-7  
**Parallel**: Yes (with 8.1-8.3, 8.5)  
**Prompt**:
```
Run full test suite:
1. Run tests: 'npm test'
2. Record results:
   - Total tests
   - Passed
   - Failed
   - Coverage
3. Address any failing tests

Success Criteria:
- All tests pass
- No test failures introduced
```

#### Task 8.5: Final Console Audit
**Category**: Verification  
**Skills**: playwright  
**Dependencies**: Waves 4-7  
**Parallel**: Yes (with 8.1-8.4)  
**Prompt**:
```
Final console audit:
1. Start production preview: 'npm run preview'
2. Navigate to all major routes
3. Verify zero console errors
4. Verify zero console warnings
5. Check that all console.* statements are properly gated

Success Criteria:
- Zero console errors
- Zero console warnings
- All logging properly gated
```

---

### Wave 9: Documentation

#### Task 9.1: Create Audit Report
**Category**: Documentation  
**Skills**: None  
**Dependencies**: Wave 8  
**Parallel**: No  
**Prompt**:
```
Create comprehensive audit report:
1. Document all findings from Wave 2
2. Document all fixes from Waves 4-7
3. Record metrics:
   - Before/after build time
   - Before/after bundle sizes
   - Before/after Lighthouse scores
   - Before/after console status
4. Create markdown report

Output: docs/BROCULA_REPORTS/BROCULA_AUDIT_20260215_RUN138.md

Success Criteria:
- Report created
- All metrics documented
- Comparison with Run #137 included
```

#### Task 9.2: Update AGENTS.md
**Category**: Documentation  
**Skills**: None  
**Dependencies**: Wave 8  
**Parallel**: Yes (with 9.1)  
**Prompt**:
```
Update AGENTS.md:
1. Add BroCula Run #138 section
2. Include:
   - Current status
   - Key findings
   - Build metrics
   - Lighthouse scores
   - Console status
   - Comparison with previous runs
3. Update "Last Updated" timestamp

Success Criteria:
- AGENTS.md updated
- Run #138 status documented
```

---

### Wave 10: PR Creation

#### Task 10.1: Branch Synchronization
**Category**: Git  
**Skills**: git-master  
**Dependencies**: Wave 9  
**Parallel**: No  
**Prompt**:
```
Synchronize branch:
1. Ensure branch is up to date with main
2. Run: 'git fetch origin main'
3. Run: 'git rebase origin/main' or 'git merge origin/main'
4. Resolve any conflicts
5. Verify clean working tree

Success Criteria:
- Branch up to date with main
- No merge conflicts
- Clean working tree
```

#### Task 10.2: Commit Changes
**Category**: Git  
**Skills**: git-master  
**Dependencies**: Task 10.1  
**Parallel**: No  
**Prompt**:
```
Commit all changes:
1. Stage changes: 'git add .'
2. Create commit with message:
   ```
   fix(brocula): BroCula Browser Console & Lighthouse Audit - Run #138
   
   - Fixed [number] console errors
   - Fixed [number] console warnings
   - Optimized [specific optimizations]
   - Improved Lighthouse performance score
   - Maintained GOLD STANDARD console hygiene
   
   Build Metrics:
   - Build time: [time]s
   - Main bundle: [size] kB (gzip: [size] kB)
   - Total chunks: [number]
   
   Lighthouse Scores:
   - Performance: [score]/100
   - Accessibility: [score]/100
   - Best Practices: [score]/100
   - SEO: [score]/100
   
   Closes #[issue number]
   ```
3. Push branch: 'git push origin [branch-name]'

Success Criteria:
- Commit created
- Commit pushed to remote
```

#### Task 10.3: Create PR
**Category**: Git  
**Skills**: git-master  
**Dependencies**: Task 10.2  
**Parallel**: No  
**Prompt**:
```
Create Pull Request:
1. Use gh CLI to create PR:
   ```bash
   gh pr create \
     --title "fix(brocula): BroCula Browser Console & Lighthouse Audit - Run #138" \
     --body "$(cat <<'EOF'
   ## Summary
   
   BroCula Run #138 Browser Console & Lighthouse Audit completed successfully.
   
   ### Changes Made
   - [List specific fixes]
   
   ### Build Metrics
   | Metric | Before | After |
   |--------|--------|-------|
   | Build Time | 26.50s | [new time]s |
   | Main Bundle | 89.32 kB | [new size] kB |
   | Total Chunks | 33 | [new count] |
   
   ### Lighthouse Scores
   | Category | Before | After |
   |----------|--------|-------|
   | Performance | 71/100 | [new score]/100 |
   | Accessibility | 100/100 | 100/100 |
   | Best Practices | 100/100 | 100/100 |
   | SEO | 100/100 | 100/100 |
   
   ### Console Status
   - Errors: 0 ✓
   - Warnings: 0 ✓
   
   ### Checklist
   - [x] TypeScript compiles without errors
   - [x] ESLint passes with 0 warnings
   - [x] Production build successful
   - [x] All tests passing
   - [x] Console errors: 0
   - [x] Console warnings: 0
   - [x] Lighthouse scores maintained/improved
   
   EOF
   )" \
     --base main \
     --head [branch-name]
   ```

Success Criteria:
- PR created
- PR URL returned
```

---

## Execution Order Summary

```
SEQUENTIAL PHASES:
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Pre-flight (3 tasks, sequential)                  │
│ → Environment → Dependencies → Build Readiness             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Parallel Audits (8 tasks, parallel)               │
│ → Console Error + Warning + 4x Lighthouse + Memory + PWA   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Issue Categorization (3 tasks, sequential)        │
│ → Aggregate → Severity → Dependencies                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: Fix Wave 1 - FATAL (2 tasks, critical path)       │
│ → Console Errors → Build Blockers                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: Fix Wave 2 - Warnings (2 tasks, parallel)         │
│ → Console Warnings + Deprecation Notices                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 6: Fix Wave 3 - Performance (4 tasks, parallel)      │
│ → Code Splitting + CSS Loading + Images + Bundle Size      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 7: Fix Wave 4 - PWA/A11y (3 tasks, parallel)         │
│ → Manifest + Service Worker + ARIA                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 8: Verification (5 tasks, parallel)                  │
│ → Build + Lint + TypeScript + Tests + Console Audit        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 9: Documentation (2 tasks, parallel)                 │
│ → Audit Report + AGENTS.md Update                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 10: PR Creation (3 tasks, sequential)                │
│ → Sync → Commit → Create PR                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Criteria Summary

### Global Success Criteria
1. **Build**: PASS (0 errors, build time < 40s)
2. **Lint**: PASS (0-20 warnings max)
3. **TypeScript**: PASS (0 errors)
4. **Tests**: PASS (all tests passing)
5. **Console Errors**: 0
6. **Console Warnings**: 0
7. **Lighthouse Performance**: >= 70/100 (target: maintain or improve)
8. **Lighthouse Accessibility**: 100/100
9. **Lighthouse Best Practices**: 100/100
10. **Lighthouse SEO**: 100/100

### Per-Wave Success Criteria

| Wave | Success Criteria |
|------|------------------|
| Wave 1 | All pre-flight checks pass |
| Wave 2 | All 8 audits complete, data collected |
| Wave 3 | All issues categorized, severity assigned |
| Wave 4 | All FATAL issues fixed, build passes |
| Wave 5 | All warnings resolved |
| Wave 6 | Performance metrics improved or maintained |
| Wave 7 | PWA and a11y scores maintained or improved |
| Wave 8 | All verification checks pass |
| Wave 9 | Documentation complete |
| Wave 10 | PR created and submitted |

---

## Risk Mitigation

### FATAL Failure Scenarios
1. **Build fails** → STOP, fix in Wave 4, re-verify
2. **Lint errors** → STOP, fix in Wave 4, re-verify
3. **TypeScript errors** → STOP, fix in Wave 4, re-verify
4. **Tests fail** → STOP, fix in Wave 8, re-verify

### Rollback Strategy
- All changes committed incrementally
- Each wave can be rolled back independently
- Main branch always preserved

### Contingency Plans
- **No FATAL issues found**: Skip Wave 4, proceed to Wave 5
- **No warnings found**: Skip Wave 5, proceed to Wave 6
- **No optimizations needed**: Skip Waves 6-7, proceed to Wave 8
- **Build time regression**: Investigate and optimize in Wave 6

---

## Tools & Resources

### Required Tools
- Node.js 18+
- npm 9+
- git
- playwright MCP tools
- bash

### Optional Tools
- Chrome DevTools (for manual verification)
- Lighthouse CLI (for additional audits)

### Reference Documents
- AGENTS.md (current status)
- docs/BROCULA_REPORTS/BROCULA_AUDIT_20260215_RUN137.md (previous run)
- vite.config.ts (build configuration)
- src/utils/logger.ts (logging utilities)

---

## Current Status (Pre-Audit)

**Pre-flight Results**:
- ✅ TypeScript: PASS (0 errors)
- ✅ Lint: PASS (0 warnings)
- ✅ Build: PASS (27.26s)
- ✅ Git: Clean, up to date with main

**Baseline Metrics**:
- Build Time: 27.26s
- Total Chunks: 33
- PWA Precache: 21 entries
- Main Bundle: 89.43 kB (gzip: 27.06 kB)

**Console Scan Results**:
- ✅ No direct console.log/warn/error/debug found
- ✅ No window.onerror handlers found
- ✅ All logging properly gated by logger utility

---

## Next Steps

1. **Execute Wave 1**: Pre-flight checks (already completed)
2. **Execute Wave 2**: Parallel browser audits
3. **Execute Wave 3**: Issue categorization
4. **Execute Waves 4-7**: Fix implementation (conditional on findings)
5. **Execute Wave 8**: Comprehensive verification
6. **Execute Wave 9**: Documentation
7. **Execute Wave 10**: PR creation

**Expected Outcome**: GOLD STANDARD maintained with zero console errors and optimized Lighthouse scores.

---

*Document Version: 1.0*  
*Created: 2026-02-15*  
*Run: #138*  
*Status: Ready for execution*
