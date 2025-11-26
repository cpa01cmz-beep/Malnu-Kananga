import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add type assertion to fix type compatibility issues
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
import 'jest-extended/all';

// Suppress console logs during tests to reduce noise
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
  console.group = jest.fn();
  console.groupEnd = jest.fn();
});

afterAll(() => {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
  console.group = originalConsole.group;
  console.groupEnd = originalConsole.groupEnd;
});

// Mock environment variables for testing
process.env.API_KEY = process.env.TEST_API_KEY || 'mock-api-key-for-testing';

// Mock fetch for testing API calls
global.fetch = jest.fn();

// Mock global objects for TypeScript
declare global {
  var global: typeof globalThis;
  var HTMLInputElement: typeof HTMLInputElement;
  var HTMLDivElement: typeof HTMLDivElement;
  var HTMLImageElement: typeof HTMLImageElement;
  var HTMLFormElement: typeof HTMLFormElement;
  var HTMLElement: typeof HTMLElement;
  var IntersectionObserver: typeof IntersectionObserver;
  var TouchEvent: typeof TouchEvent;
  var AbortSignal: typeof AbortSignal;
  var URLSearchParams: typeof URLSearchParams;
}

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


