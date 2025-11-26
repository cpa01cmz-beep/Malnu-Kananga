import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add type assertion to fix type compatibility issues
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
import 'jest-extended/all';

// Mock environment variables for testing
process.env.API_KEY = process.env.TEST_API_KEY || 'test-api-key-placeholder';

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

// Mock Touch and TouchEvent for touch gesture testing
global.Touch = jest.fn().mockImplementation((touchInitDict) => ({
  identifier: 0,
  target: document.createElement('div'),
  clientX: touchInitDict?.clientX || 0,
  clientY: touchInitDict?.clientY || 0,
  pageX: touchInitDict?.clientX || 0,
  pageY: touchInitDict?.clientY || 0,
  screenX: touchInitDict?.clientX || 0,
  screenY: touchInitDict?.clientY || 0,
  radiusX: 1,
  radiusY: 1,
  rotationAngle: 0,
  force: 1,
}));

// Mock TouchEvent for touch gesture testing
global.TouchEvent = jest.fn().mockImplementation((type, eventInitDict) => {
  const event = new Event(type, eventInitDict);
  
  // Define properties on the event object
  Object.defineProperty(event, 'touches', {
    value: eventInitDict?.touches || [],
    writable: true,
    enumerable: true,
    configurable: true
  });
  
  Object.defineProperty(event, 'targetTouches', {
    value: eventInitDict?.targetTouches || [],
    writable: true,
    enumerable: true,
    configurable: true
  });
  
  Object.defineProperty(event, 'changedTouches', {
    value: eventInitDict?.changedTouches || [],
    writable: true,
    enumerable: true,
    configurable: true
  });
  
  return event;
});

// Mock File for file upload testing
global.File = jest.fn().mockImplementation((bits, name, options) => ({
  name,
  size: bits?.length || 0,
  type: options?.type || '',
  lastModified: Date.now(),
  arrayBuffer: jest.fn(),
  slice: jest.fn(),
  stream: jest.fn(),
  text: jest.fn(),
}));

// Mock HTMLInputElement for file input testing
Object.defineProperty(HTMLInputElement.prototype, 'files', {
  get: jest.fn(() => []),
  set: jest.fn(),
});

// Mock setTimeout and clearTimeout for timer testing
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

global.setTimeout = jest.fn((fn, delay) => originalSetTimeout(fn, delay)) as any;
global.clearTimeout = jest.fn((id) => originalClearTimeout(id)) as any;

// Global DOM type definitions for testing
declare global {
  interface Window {
    // Add any test-specific window properties here
  }
  
  var global: typeof globalThis;
  
  // Extend Jest matchers for testing-library
  
}