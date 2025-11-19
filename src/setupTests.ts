import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.API_KEY = process.env.TEST_API_KEY || 'test-api-key-placeholder';
process.env.NODE_ENV = 'development';
process.env.VITE_JWT_SECRET = 'dev-secret-key';

// Mock import.meta.env for Vite compatibility
(global as any).import = {
  meta: {
    env: {
      DEV: true,
      VITE_JWT_SECRET: 'dev-secret-key',
      VITE_USE_SUPABASE: 'false',
      USE_SUPABASE: 'false'
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