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

// Mock Touch API for jsdom
interface TouchInit {
  identifier?: number;
  target?: EventTarget;
  clientX?: number;
  clientY?: number;
  screenX?: number;
  screenY?: number;
  pageX?: number;
  pageY?: number;
  radiusX?: number;
  radiusY?: number;
  rotationAngle?: number;
  force?: number;
}

class TouchMock {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
  pageX: number;
  pageY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;

  constructor(touchInit: TouchInit) {
    this.identifier = touchInit.identifier || 0;
    this.target = touchInit.target || window;
    this.clientX = touchInit.clientX || 0;
    this.clientY = touchInit.clientY || 0;
    this.screenX = touchInit.screenX || 0;
    this.screenY = touchInit.screenY || 0;
    this.pageX = touchInit.pageX || this.clientX;
    this.pageY = touchInit.pageY || this.clientY;
    this.radiusX = touchInit.radiusX || 0;
    this.radiusY = touchInit.radiusY || 0;
    this.rotationAngle = touchInit.rotationAngle || 0;
    this.force = touchInit.force || 1;
  }
}

// Make Touch available globally
Object.defineProperty(globalThis, 'Touch', { value: TouchMock });
