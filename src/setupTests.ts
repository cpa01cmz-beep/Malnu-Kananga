import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.API_KEY = process.env.TEST_API_KEY || 'test-api-key-placeholder';

// Mock import.meta.env for Vite environment variables
// Map Vite env vars to process.env for Jest compatibility
process.env.DEV = 'true';
process.env.VITE_JWT_SECRET = 'test-secret';
process.env.VITE_USE_SUPABASE = 'false';
process.env.USE_SUPABASE = 'false';
process.env.VITE_WORKER_URL = 'http://localhost:8787';

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