import { vi } from 'vitest';

export const GoogleGenAI = vi.fn().mockImplementation(() => ({
  models: {
    generateContentStream: vi.fn().mockRejectedValue(new Error('Mock API error')),
    generateContent: vi.fn().mockRejectedValue(new Error('Mock API error'))
  }
}));

export const Type = {
  OBJECT: 'OBJECT',
  ARRAY: 'ARRAY',
  STRING: 'STRING',
  NUMBER: 'NUMBER'
};