# E2E Test Fixtures

This directory contains test fixtures for Playwright E2E tests.

## Files

- `test-document.pdf` - Sample PDF document for file upload tests
- `test-image.jpg` - Sample image for validation tests
- `large-file.pdf` - Large PDF file (5MB+) for size validation tests

## Usage

Fixtures are automatically detected by Playwright tests in the `e2e/` directory.

```typescript
await page.setInputFiles('[data-testid="file-upload"]', 'tests/fixtures/test-document.pdf');
```
