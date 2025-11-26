# 🧪 Testing Guide - MA Malnu Kananga

## 🌟 Overview

This comprehensive testing guide covers all aspects of testing for the MA Malnu Kananga School Portal, including unit tests, integration tests, E2E tests, and performance testing.

---

<<<<<<< HEAD
**Testing Guide Version: 1.3.1**  
**Last Updated: November 24, 2024**  
**Testing Status: Production Verified**
=======
**Testing Guide Version: 1.3.2**  
**Last Updated: November 25, 2025**  
**Testing Status: Basic Implementation**
>>>>>>> origin/main

## 🏗️ Testing Architecture

### Testing Stack
- **Jest**: Primary testing framework for unit and integration tests
- **Vitest**: Modern testing framework for Vite-based projects
- **React Testing Library**: Component testing utilities
- **ESLint + Prettier**: Code quality and formatting
- **GitHub Actions**: CI/CD pipeline for automated testing

### Test Coverage Goals
- **Unit Tests**: 90%+ coverage for all components and services
- **Integration Tests**: 80%+ coverage for API endpoints
- **E2E Tests**: Critical user journeys covered
- **Performance Tests**: Lighthouse scores 95+ maintained

### ⚠️ **Testing Implementation Reality Check**

#### ✅ **Actually Implemented Testing**
- **Basic Component Tests**: 9 test files for core components
- **Test Configuration**: Jest and React Testing Library setup
- **CI/CD Integration**: GitHub Actions testing pipeline
- **Code Quality**: ESLint and Prettier integration

#### 📊 **Current Test Coverage**
```bash
# Actual test files found:
src/__tests__/App.test.tsx                    ✅ Basic app test
src/components/__tests__/StudentSupport.test.tsx   ✅ Student support tests
src/components/ParentDashboard.test.tsx       ✅ Parent dashboard tests
src/components/AssignmentSubmission.test.tsx  ✅ Assignment submission tests
src/components/ChatWindow.test.tsx            ✅ Chat window tests
src/components/ChatWindow.qa.test.tsx         ✅ Chat QA tests
src/components/ErrorBoundary.qa.test.tsx      ✅ Error boundary QA tests
src/components/ErrorBoundary.test.tsx         ✅ Error boundary tests
src/components/LazyImage.test.tsx             ✅ Lazy image tests
src/components/Header.test.tsx                ✅ Header component tests
```

#### ❌ **Not Yet Implemented Testing**
- **API Integration Tests**: No API endpoint testing
- **E2E Tests**: No end-to-end testing framework
- **Performance Testing**: No automated performance testing
- **Security Testing**: No security vulnerability testing
- **Accessibility Testing**: No a11y testing implementation
- **Visual Regression Testing**: No visual testing framework
- **Load Testing**: No performance/load testing
- **Database Testing**: No database integration testing

#### 📈 **Actual vs Planned Coverage**
| Test Type | Planned | Actual | Gap |
|-----------|---------|--------|-----|
| Unit Tests | 90% | ~30% | 60% |
| Integration Tests | 80% | 0% | 80% |
| E2E Tests | Critical paths | 0% | 100% |
| Performance Tests | Lighthouse 95+ | Manual only | 100% |
| Security Tests | Comprehensive | None | 100% |

### Testing Pyramid
```
    E2E Tests (5%)
   ─────────────────
  Integration Tests (15%)
 ─────────────────────────
Unit Tests (80%)
```

### Technology Stack (Updated November 2024)
- **Jest 30.2**: Test runner with TypeScript support and modern ES modules
- **React Testing Library 16.3**: Component testing utilities with React 19 support
- **Vitest**: Fast unit testing with Vite integration (alternative to Jest)
- **ESLint 9.39**: Code quality during testing with TypeScript rules
- **Coverage Reports**: LCOV format with HTML reports and JSON output
- **GitHub Actions**: CI/CD pipeline with automated testing
- **Testing Library User Event 14.6**: Advanced user interaction simulation

### Test Structure
```
src/
├── __tests__/              # Global test files
├── components/
│   └── __tests__/          # Component tests
├── hooks/
│   └── __tests__/          # Hook tests
├── services/
│   └── __tests__/          # Service tests
└── utils/
    └── __tests__/          # Utility tests
```

---

## 🚀 Quick Start

### Installation
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# TypeScript support
npm install --save-dev @types/jest ts-jest

# Coverage reporting
npm install --save-dev @jest/transform
```

### Basic Test Commands
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- ChatWindow.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="ChatWindow"
```

---

## 📊 Test Configuration

### Jest Configuration (jest.config.js)
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx|js)'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Setup (src/setupTests.ts)
```typescript
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Web APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock fetch
global.fetch = jest.fn();
```

---

## 🧩 Unit Testing

### Component Testing

#### Basic Component Test
```typescript
// ChatWindow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWindow } from './ChatWindow';

describe('ChatWindow', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat window when open', () => {
    render(<ChatWindow {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ChatWindow {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ChatWindow {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
```

#### Form Testing
```typescript
// LoginModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginModal } from './LoginModal';

describe('LoginModal', () => {
  it('validates email input', async () => {
    const onLogin = jest.fn();
    render(<LoginModal isOpen={true} onClose={jest.fn()} onLogin={onLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send magic link/i });

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('submits form with valid email', async () => {
    const onLogin = jest.fn();
    render(<LoginModal isOpen={true} onClose={jest.fn()} onLogin={onLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send magic link/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('test@example.com');
    });
  });
});
```

### Hook Testing

#### Custom Hook Test
```typescript
// useWebP.test.tsx
import { renderHook } from '@testing-library/react';
import { useWebP } from './useWebP';

describe('useWebP', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => useWebP());
    expect(result.current).toBe(false);
  });

  it('detects WebP support', async () => {
    // Mock canvas toDataURL method
    const mockToDataURL = jest.fn().mockReturnValue('data:image/webp;base64,test');
    global.HTMLCanvasElement.prototype.toDataURL = mockToDataURL;

    const { result, waitForNextUpdate } = renderHook(() => useWebP());
    await waitForNextUpdate();
    
    expect(result.current).toBe(true);
    expect(mockToDataURL).toHaveBeenCalledWith('image/webp');
  });
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

#### Test Pipeline Configuration
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

#### Quality Gates
```yaml
# Quality gate checks
- name: Check coverage threshold
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% is below threshold 80%"
      exit 1
    fi

- name: Check bundle size
  run: |
    npm run build
    BUNDLE_SIZE=$(du -k dist/assets/*.js | awk '{sum+=$1} END {print sum}')
    if [ $BUNDLE_SIZE -gt 500 ]; then
      echo "Bundle size ${BUNDLE_SIZE}KB exceeds limit 500KB"
      exit 1
    fi
```

### Pre-commit Hooks

#### Husky Configuration
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "src/**/*.{ts,tsx}": [
      "npm run test -- --findRelatedTests"
    ]
  }
}
```

---

## 📊 Coverage Requirements

### Coverage Thresholds

#### Current Requirements
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  // Critical files have higher requirements
  './src/services/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  },
  './src/components/': {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85
  }
}
```

#### Coverage Reports
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Format**: `coverage/lcov.info` for CI/CD
- **JSON Summary**: `coverage/coverage-summary.json`
- **Text Summary**: Console output with detailed metrics

### Coverage Best Practices

#### What to Test
- **Business Logic**: All service functions and utilities
- **User Interactions**: Button clicks, form submissions, navigation
- **Data Flow**: API calls, state updates, side effects
- **Error Handling**: Error states, validation, edge cases
- **Accessibility**: ARIA attributes, keyboard navigation

#### What Not to Test
- **Third-party Libraries**: Assume they're well tested
- **Static Assets**: Images, fonts, CSS files
- **Configuration**: Build configuration, environment variables
- **Type Definitions**: TypeScript type definitions

---

## 🧪 Advanced Testing Patterns

### Mock Strategies

#### API Mocking
```typescript
// __mocks__/apiService.ts
export const mockApiService = {
  login: jest.fn(),
  getGrades: jest.fn(),
  submitAssignment: jest.fn()
};

// Test file
import { mockApiService } from '../__mocks__/apiService';
jest.mock('../services/apiService', () => mockApiService);

describe('Student Dashboard', () => {
  beforeEach(() => {
    mockApiService.getGrades.mockResolvedValue(mockGrades);
  });

  it('displays grades correctly', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });
  });
});
```

#### Component Mocking
```typescript
// Mock complex components
jest.mock('../components/ChatWindow', () => ({
  ChatWindow: ({ onMessage }: any) => (
    <div data-testid="chat-window">
      <button onClick={() => onMessage('test message')}>
        Send Message
      </button>
    </div>
  )
}));
```

### Integration Testing

#### Multi-component Tests
```typescript
// LoginFlow.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../App';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Flow Integration', () => {
  it('completes login flow successfully', async () => {
    renderWithRouter(<App />);
    
    // Start login
    const loginButton = screen.getByText(/login/i);
    await userEvent.click(loginButton);
    
    // Fill login form
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'student@example.com');
    
    const submitButton = screen.getByText(/send magic link/i);
    await userEvent.click(submitButton);
    
    // Verify redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/student dashboard/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🔧 Testing Tools & Utilities

### Custom Test Utilities

#### Render Helpers
```typescript
// src/__tests__/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

#### Mock Data Generators
```typescript
// src/__tests__/utils/mock-data.ts
export const createMockStudent = (overrides = {}) => ({
  id: 'student-1',
  name: 'John Doe',
  email: 'john@example.com',
  grade: '12',
  ...overrides
});

export const createMockGrades = (count = 5) => 
  Array.from({ length: count }, (_, i) => ({
    id: `grade-${i}`,
    subject: `Subject ${i + 1}`,
    score: Math.floor(Math.random() * 40) + 60,
    semester: '2024-1'
  }));
```

### Performance Testing

#### Load Testing Setup
```typescript
// performance.test.ts
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('renders dashboard within performance budget', async () => {
    const start = performance.now();
    
    render(<StudentDashboard />);
    await screen.findByTestId('dashboard-content');
    
    const end = performance.now();
    const renderTime = end - start;
    
    expect(renderTime).toBeLessThan(1000); // 1 second budget
  });
});
```

---

## 📋 Testing Checklist

### Pre-commit Checklist
- [ ] All new features have corresponding tests
- [ ] Test coverage meets minimum thresholds
- [ ] All tests pass on local machine
- [ ] Linting passes without errors
- [ ] Type checking passes without errors
- [ ] Integration tests cover critical user flows

### Pre-release Checklist
- [ ] Full test suite passes in CI/CD
- [ ] Coverage reports generated and reviewed
- [ ] Performance tests meet budgets
- [ ] E2E tests pass on multiple browsers
- [ ] Accessibility tests pass WCAG guidelines
- [ ] Security tests pass vulnerability scans

### Test Review Guidelines
- **Test Quality**: Tests should be readable and maintainable
- **Test Isolation**: Tests should not depend on each other
- **Mock Usage**: Use mocks appropriately for external dependencies
- **Assertion Quality**: Use specific assertions with clear expectations
- **Error Scenarios**: Test both happy path and error conditions

### Utility Testing

#### Pure Function Test
```typescript
// utils.test.ts
import { formatDate, validateEmail, calculateGPA } from './utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {

      const date = new Date('2024-11-24');
      expect(formatDate(date)).toBe('2025-11-24');

      const date = new Date('2025-11-24');
      expect(formatDate(date)).toBe('2025-11-24');

    });

    it('handles invalid dates', () => {
      expect(() => formatDate(new Date('invalid'))).toThrow();
    });
  });

  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('calculateGPA', () => {
    it('calculates GPA correctly', () => {
      const grades = [
        { subject: 'Math', score: 85, weight: 3 },
        { subject: 'English', score: 90, weight: 2 },
        { subject: 'Science', score: 80, weight: 3 }
      ];
      expect(calculateGPA(grades)).toBeCloseTo(3.47, 2);
    });

    it('handles empty grades array', () => {
      expect(calculateGPA([])).toBe(0);
    });
  });
});
```

---

## 🔗 Integration Testing

### API Integration Testing

#### Service Integration Test
```typescript
// authService.test.ts
import { authService } from './authService';
import { server } from '../mocks/server';
import { rest } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AuthService Integration', () => {
  it('requests magic link successfully', async () => {
    server.use(
      rest.post('/api/request-login-link', (req, res, ctx) => {
        return res(ctx.json({ success: true, message: 'Link sent' }));
      })
    );

    const result = await authService.requestLoginLink('test@example.com');
    expect(result.success).toBe(true);
  });

  it('handles API errors', async () => {
    server.use(
      rest.post('/api/request-login-link', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    await expect(
      authService.requestLoginLink('test@example.com')
    ).rejects.toThrow('Server error');
  });
});
```

### Component Integration Test

#### Multi-Component Integration
```typescript
// StudentDashboard.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { StudentDashboard } from './StudentDashboard';
import { AuthProvider } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ChatProvider>
        {component}
      </ChatProvider>
    </AuthProvider>
  );
};

describe('StudentDashboard Integration', () => {
  const mockUser = {
    id: '1',
    name: 'Test Student',
    email: 'student@example.com',
    role: 'student' as const
  };

  it('loads and displays student data', async () => {
    renderWithProviders(<StudentDashboard user={mockUser} />);

    expect(screen.getByText('Welcome, Test Student')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Grades')).toBeInTheDocument();
      expect(screen.getByText('Attendance')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    renderWithProviders(<StudentDashboard user={mockUser} />);

    const gradesTab = screen.getByRole('tab', { name: /grades/i });
    await userEvent.click(gradesTab);

    await waitFor(() => {
      expect(screen.getByText('Grade Summary')).toBeInTheDocument();
    });
  });
});
```

---

## 🌐 E2E Testing

### Playwright Configuration

#### Setup
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:9000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Example
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login with magic link', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Fill email form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="send-magic-link"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Magic link sent');
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="send-magic-link"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Please enter a valid email');
  });
});

test.describe('Student Dashboard', () => {
  test('displays student information', async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard');
    await page.evaluate(() => {
      localStorage.setItem('malnu_auth_current_user', JSON.stringify({
        id: '1',
        name: 'Test Student',
        role: 'student'
      }));
    });
    
    await page.reload();
    
    // Verify dashboard elements
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, Test Student');
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="grades-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="attendance-tab"]')).toBeVisible();
  });
});
```

---

## 🎭 Mocking & Fixtures

### Mock Services

#### API Mocking
```typescript
// __mocks__/authService.ts
export const authService = {
  requestLoginLink: jest.fn(),
  verifyLoginToken: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn()
};

export default authService;
```

#### Data Mocks
```typescript
// __mocks__/data.ts
export const mockStudent = {
  id: '1',
  name: 'Ahmad Fauzi Rahman',
  email: 'student@example.com',
  role: 'student' as const,
  class: 'XII IPA 1',
  gpa: 3.8,
  attendance: 95
};

export const mockTeacher = {
  id: '2',
  name: 'Dr. Siti Nurhaliza',
  email: 'teacher@example.com',
  role: 'teacher' as const,
  subject: 'Mathematics',
  department: 'Science'
};

export const mockGrades = [
  {
    id: '1',
    subject: 'Mathematics',
    uts: 85,
    uas: 88,
    tugas: 90,
    final_grade: 87,
    letter_grade: 'B+'
  },
  {
    id: '2',
    subject: 'Physics',
    uts: 82,
    uas: 85,
    tugas: 88,
    final_grade: 85,
    letter_grade: 'B+'
  }
];
```

### MSW for API Mocking

#### Server Setup
```typescript
// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

#### API Handlers
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Authentication endpoints
  rest.post('/api/request-login-link', (req, res, ctx) => {
    const { email } = req.body as { email: string };
    
    if (!email || !email.includes('@')) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Invalid email address' })
      );
    }
    
    return res(
      ctx.json({ 
        success: true, 
        message: 'Magic link sent successfully' 
      })
    );
  }),

  // Student data endpoints
  rest.get('/api/student/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === '1') {
      return res(
        ctx.json(mockStudent)
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Student not found' })
    );
  }),

  // Chat endpoint
  rest.post('/api/chat', (req, res, ctx) => {
    const { message } = req.body as { message: string };
    
    return res(
      ctx.json({
        response: `This is a mock response to: "${message}"`,
        context: 'Mock context from vector database'
      })
    );
  })
];
```

---

## 📊 Coverage Reports

### Generating Coverage
```bash
# Generate coverage report
npm run test:coverage

# Generate coverage with LCOV format
npm run test:coverage -- --coverageReporters=text-lcov | coveralls

# Open HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Configuration
```javascript
// jest.config.js coverage settings
collectCoverageFrom: [
  'src/**/*.(ts|tsx)',
  '!src/**/*.d.ts',
  '!src/index.tsx',
  '!src/vite-env.d.ts',
  '!src/**/*.stories.tsx',
  '!src/**/__tests__/**',
  '!src/**/__mocks__/**'
],
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/components/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
},
coverageReporters: [
  'text',
  'lcov',
  'html',
  'json-summary'
]
```

### Coverage Examples

#### High Coverage Component
```typescript
// Example: 95% coverage component
const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Comprehensive tests
describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-6 h-6'); // md size
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4 h-4');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-8 h-8');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

---

## 🔄 Continuous Integration

### GitHub Actions Workflow

#### Test Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: Run E2E tests
      run: npx playwright test
      env:
        CI: true
    
    - name: Upload E2E test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

### Quality Gates

#### Pre-commit Hooks
```json
// package.json scripts
{
  "scripts": {
    "pre-commit": "lint-staged",
    "pre-push": "npm run test:coverage"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests"
    ],
    "*.{js,jsx}": [
      "eslint --fix"
    ]
  }
}
```

---

## 🛠️ Testing Best Practices

### Test Writing Guidelines

#### 1. Test Structure (AAA Pattern)
```typescript
describe('Component', () => {
  it('should do something', () => {
    // Arrange
    const props = { /* test props */ };
    
    // Act
    render(<Component {...props} />);
    fireEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(screen.getByText('Expected result')).toBeInTheDocument();
  });
});
```

#### 2. Test Naming Conventions
```typescript
// Good: Descriptive and clear
it('should show error message when email is invalid');
it('should call onSubmit when form is valid');
it('should disable button while loading');

// Avoid: Vague or implementation-focused
it('works correctly');
it('calls the function');
it('returns true');
```

#### 3. Testing User Behavior
```typescript
// Test what user sees and does, not implementation details
it('allows user to submit form with valid data', async () => {
  render(<LoginForm />);
  
  // User actions
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  // User sees result
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// Avoid testing internal state
it('sets isValid to true when email is valid'); // Don't do this
```

### Mocking Guidelines

#### When to Mock
- External API calls
- Browser APIs (fetch, localStorage)
- Time-dependent functions
- Random values
- Complex dependencies

#### When Not to Mock
- Simple utility functions
- React components (test them directly)
- Business logic (test the real implementation)

### Accessibility Testing

#### Accessibility Tests
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should be accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it('should support keyboard navigation', () => {
  render(<Component />);
  
  const button = screen.getByRole('button');
  button.focus();
  expect(button).toHaveFocus();
  
  fireEvent.keyDown(button, { key: 'Enter' });
  expect(mockFunction).toHaveBeenCalled();
});
```

---

## 📈 Performance Testing

### Component Performance
```typescript
// Performance test example
it('should render efficiently with large data sets', () => {
  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }));

  const startTime = performance.now();
  render(<ComponentList items={largeData} />);
  const endTime = performance.now();

  expect(endTime - startTime).toBeLessThan(100); // Should render in < 100ms
});
```

### Bundle Size Testing
```bash
# Analyze bundle size
npm run build:analyze

# Check bundle size in CI
npm run bundle-size-check
```

---

## 🔍 Debugging Tests

### Common Issues & Solutions

#### 1. Test Timing Issues
```typescript
// Problem: Test fails due to timing
it('loads data asynchronously', async () => {
  render(<Component />);
  
  // Bad: Might fail due to timing
  expect(screen.getByText('Data')).toBeInTheDocument();
  
  // Good: Wait for element
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  });
});
```

#### 2. Mock Implementation Issues
```typescript
// Problem: Mock not working
jest.mock('./service', () => ({
  serviceFunction: jest.fn(() => Promise.resolve('data'))
}));

// Better: Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### 3. Act() Warning
```typescript
// Problem: React testing library warning
fireEvent.click(screen.getByRole('button'));
fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test' } });

// Solution: Wrap in act()
import { act } from '@testing-library/react';

await act(async () => {
  fireEvent.click(screen.getByRole('button'));
});
```

### Debugging Tools

#### Screen Debug
```typescript
// Debug current render state
screen.debug(); // Prints entire DOM
screen.debug(screen.getByRole('button')); // Prints specific element

// Log queries for debugging
console.log(screen.logTestingPlaygroundURL());
```

#### Test Utilities
```typescript
// Custom test utilities
export const waitForElement = async (selector: string) => {
  return await waitFor(() => screen.getByTestId(selector));
};

export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'student',
  ...overrides
});
```

---

## 📋 Testing Checklist

### Pre-commit Checklist
- [ ] All new components have tests
- [ ] Test coverage is above 80%
- [ ] No console errors in tests
- [ ] Accessibility tests pass
- [ ] Tests run in CI without failures
- [ ] Mocks are properly cleaned up
- [ ] Tests are deterministic (no random failures)

### Release Checklist
- [ ] Full test suite passes
- [ ] E2E tests pass in all browsers
- [ ] Coverage report meets thresholds
- [ ] Performance tests pass
- [ ] Accessibility audit passes
- [ ] Integration tests with backend pass

---

## 🔗 Related Documentation

- [Component Library](./COMPONENT_LIBRARY.md) - Component reference
- [API Documentation](./API_DOCUMENTATION.md) - Backend API testing
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - CI/CD testing
- [Security Guide](./SECURITY_GUIDE.md) - Security testing practices

---

## 📞 Support

For testing-related questions:
- **Email**: testing@ma-malnukananga.sch.id
- **Documentation**: Available in repository src/**/__tests__/
- **Issues**: Report via GitHub Issues
- **Coverage Reports**: Check coverage/ directory after running tests

---

 
*Testing Guide Version: 1.3.1*  
*Last Updated: 2025-11-24*  


*Testing Guide Version: 1.0.0*  
*Last Updated: 2025-11-24

*Test Framework: Jest + React Testing Library*  
*Coverage Target: 80%+*  
*E2E Tool: Playwright*