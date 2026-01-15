# E2E Tests

This directory contains end-to-end tests using Playwright.

## Test Structure

```
e2e/
├── admin-dashboard.spec.ts    # Admin authentication and dashboard tests
├── teacher-dashboard.spec.ts   # Teacher dashboard functionality tests
├── parent-dashboard.spec.ts    # Parent dashboard functionality tests
├── student-portal.spec.ts     # Student portal functionality tests
├── ppdb-registration.spec.ts  # PPDB registration flow tests
├── accessibility.spec.ts       # Accessibility E2E tests
├── visual-regression.spec.ts  # Visual regression tests
└── utils.ts                   # Test utilities and helpers
```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in headed mode (with browser window)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test admin-dashboard.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Update visual regression screenshots
```bash
npx playwright test --update-snapshots
```

### View test report
```bash
npx playwright show-report
```

## Test Data

E2E tests use the following test credentials:

| Role       | Username | Password |
|------------|----------|----------|
| Admin      | admin123 | admin123 |
| Teacher    | guru123  | guru123  |
| Parent     | ortu123  | ortu123  |
| Student    | siswa123 | siswa123 |

## Configuration

Playwright is configured in `playwright.config.ts`:

- **Test Timeout**: 30 seconds
- **Action Timeout**: 10 seconds
- **Navigation Timeout**: 30 seconds
- **Retry on CI**: 2 retries
- **Projects**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: http://localhost:5173 (configurable via BASE_URL env var)

## Visual Regression Tests

Visual regression tests take screenshots of key pages and components:

- Homepage
- Login modal
- Admin dashboard
- Teacher dashboard
- Parent dashboard
- Student portal
- PPDB registration form
- Mobile views (iPhone/Pixel)

To update screenshots after UI changes:
```bash
npx playwright test --update-snapshots
```

## Accessibility Tests

Accessibility E2E tests verify:
- Skip links availability
- Keyboard navigation
- ARIA labels on interactive elements
- Heading hierarchy
- Alt text on images
- Color contrast
- Focus management
- Live region announcements

## CI/CD Integration

E2E tests are configured to run in CI/CD pipelines:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
```

## Debugging Failed Tests

When a test fails:
1. Screenshots are saved in `test-results/`
2. Videos are saved for failed tests
3. Traces are saved for first retry
4. Run `npx playwright show-report` to view the HTML report

## Test Coverage

Current E2E test coverage includes:
- Authentication flows (4 roles)
- Dashboard navigation (4 dashboards)
- Critical user journeys:
  - Admin login and dashboard
  - Teacher attendance marking
  - Parent viewing grades
  - Student accessing materials
  - PPDB registration flow
- Accessibility compliance
- Visual regression across devices

## Adding New Tests

1. Create a new `.spec.ts` file in the `e2e/` directory
2. Import test utilities from `utils.ts`
3. Write tests using Playwright's API
4. Run tests to verify they pass
5. Commit the test file

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## Best Practices

1. **Use data-testid attributes** for selecting elements
2. **Wait for elements** before interacting with them
3. **Use page.waitForURL()** for navigation assertions
4. **Keep tests isolated** - each test should be independent
5. **Use page.waitForLoadState('networkidle')** for complex pages
6. **Add assertions** for all important states
7. **Test error cases** alongside happy paths
8. **Use descriptive test names** that explain what is being tested
