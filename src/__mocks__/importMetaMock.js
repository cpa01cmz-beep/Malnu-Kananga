// Mock import.meta.env for all tests
const mockImportMeta = {
  env: {
    DEV: true,
    MODE: 'test',
    PROD: false,
    SSR: false,
    VITE_JWT_SECRET: 'test-secret-key',
    VITE_WORKER_URL: 'http://localhost:8787',
    VITE_USE_SUPABASE: 'false',
    USE_SUPABASE: 'false',
    VITE_API_KEY: 'test_api_key_placeholder'
  }
};

// Mock import.meta globally
Object.defineProperty(global, 'import', {
  value: {
    meta: mockImportMeta
  },
  writable: true
});

// Also set it on window for browser environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'import', {
    value: {
      meta: mockImportMeta
    },
    writable: true
  });
}

// Mock process.env for fallback
process.env.NODE_ENV = 'test';
process.env.VITE_API_KEY = 'test_api_key_placeholder';
process.env.VITE_WORKER_URL = 'http://localhost:8787';
process.env.JEST_WORKER_ID = '1';

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  warn: jest.fn(),
  error: jest.fn()
};