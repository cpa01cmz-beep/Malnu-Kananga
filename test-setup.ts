import { vi } from 'vitest';

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