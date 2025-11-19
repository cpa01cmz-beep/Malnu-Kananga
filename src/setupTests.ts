import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.API_KEY = 'test-api-key';

// Mock import.meta.env for all tests
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: false,
        VITE_JWT_SECRET: 'test-secret-key',
        VITE_USE_SUPABASE: 'false',
        USE_SUPABASE: 'false',
        VITE_WORKER_URL: 'http://localhost:8787'
      }
    }
  },
  writable: true
});

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