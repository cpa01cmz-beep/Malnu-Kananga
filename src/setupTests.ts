import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.API_KEY = process.env.TEST_API_KEY || 'test-api-key-placeholder';

// Mock import.meta.env for Node.js environment
global.import = {
  meta: {
    env: {
      DEV: true,
      VITE_JWT_SECRET: 'test-jwt-secret',
      VITE_USE_SUPABASE: 'false',
      USE_SUPABASE: 'false',
      VITE_WORKER_URL: 'http://localhost:8787'
    }
  }
};

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