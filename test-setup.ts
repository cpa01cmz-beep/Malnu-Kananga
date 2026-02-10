import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock @google/genai package to prevent actual API calls
vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    constructor(_options: { apiKey: string }) {
      // Mock constructor
    }
    models = {
      generateContentStream: vi.fn().mockRejectedValue(new Error('Mock API error')),
      generateContent: vi.fn().mockRejectedValue(new Error('Mock API error'))
    };
  },
  Type: {
    OBJECT: 'OBJECT',
    ARRAY: 'ARRAY',
    STRING: 'STRING'
  }
}));

// Suppress console errors during tests to reduce noise
const originalError = console.error;
console.error = (...args) => {
  // Filter out expected mock errors
  if (typeof args[0] === 'string' && (
    args[0].includes('Mock API error') ||
    args[0].includes('RAG fetch failed') ||
    args[0].includes('Analysis failed') ||
    args[0].includes('Error calling Gemini API')
  )) {
    return;
  }
  originalError(...args);
};

// Mock logger utility globally to reduce console I/O overhead
// This significantly improves test performance by reducing log output
// Suppress all logger output to eliminate I/O overhead during test execution (Issue #1382)
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(() => undefined),
    info: vi.fn(() => undefined),
    warn: vi.fn(() => undefined),
    error: vi.fn(() => undefined),
    log: vi.fn(() => undefined),
  }
}));
