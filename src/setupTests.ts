import '@testing-library/jest-dom';

// Mock import.meta.env for Vite environment variables
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: true,
        VITE_WORKER_URL: 'http://localhost:8787',
        VITE_JWT_SECRET: 'test-secret-key',
        VITE_USE_SUPABASE: 'false',
        USE_SUPABASE: 'false'
      }
    }
  },
  writable: true
});

// Mock environment variables for testing
process.env.API_KEY = process.env.TEST_API_KEY || 'test-api-key-placeholder';

// Mock fetch for testing API calls
global.fetch = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));