// Enhanced test utilities for better mocking and test setup
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add any global providers here
  return render(ui, {
    ...options,
  });
};

// Mock data generators
export const createMockStudent = (overrides = {}) => ({
  id: 'student-1',
  name: 'Test Student',
  email: 'student@test.com',
  grade: 10,
  attendance: 95,
  assignments: [],
  ...overrides,
});

export const createMockTeacher = (overrides = {}) => ({
  id: 'teacher-1',
  name: 'Test Teacher',
  email: 'teacher@test.com',
  subjects: ['Math', 'Science'],
  classes: [],
  ...overrides,
});

export const createMockAssignment = (overrides = {}) => ({
  id: 'assignment-1',
  title: 'Test Assignment',
  description: 'Test Description',
  dueDate: '2024-12-31',
  status: 'pending' as const,
  ...overrides,
});

export const createMockChatMessage = (overrides = {}) => ({
  id: 'msg-1',
  role: 'user' as const,
  content: 'Test message',
  timestamp: new Date().toISOString(),
  ...overrides,
});

// Event simulation helpers
export const createTouchEvent = (type: string, coordinates = { x: 0, y: 0 }) => {
  const touch = new Touch({
    identifier: 0,
    target: document.body,
    clientX: coordinates.x,
    clientY: coordinates.y,
  } as TouchInit);

  return new TouchEvent(type, {
    touches: [touch],
    changedTouches: [touch],
  });
};

export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  error: success ? undefined : 'Test error',
  message: success ? 'Success' : 'Error',
});

// Async test helpers
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Mock storage helpers
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Mock fetch helper
export const createMockFetch = (response: unknown, options = { status: 200, ok: true }) => {
  return jest.fn().mockResolvedValue({
    ...options,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
};

// Timer helpers
export const advanceTimersByTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

export const runAllTimers = () => {
  jest.runAllTimers();
};

// Error boundary test helper
export const createErrorComponent = (message = 'Test error') => {
  const ThrowErrorComponent = () => {
    throw new Error(message);
  };
  return ThrowErrorComponent;
};

// Memory bank mock helpers
export const createMockMemoryBank = () => ({
  searchMemories: jest.fn().mockResolvedValue([]),
  addMemory: jest.fn().mockResolvedValue('memory-id'),
  deleteMemory: jest.fn().mockResolvedValue(true),
  getStats: jest.fn().mockResolvedValue({
    totalMemories: 0,
    totalSize: 0,
  }),
  getRelevantMemories: jest.fn().mockResolvedValue([]),
});

// Gemini service mock helpers
export const createMockGeminiResponse = (text: string) => ({
  candidates: [{
    content: {
      parts: [{ text }],
    },
  }],
});

export const createMockGeminiStream = async function* (texts: string[]) {
  for (const text of texts) {
    yield { text };
  }
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';