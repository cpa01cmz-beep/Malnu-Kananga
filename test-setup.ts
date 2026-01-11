import { vi } from 'vitest';
import '@testing-library/jest-dom';

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
