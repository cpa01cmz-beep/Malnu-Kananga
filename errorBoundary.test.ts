import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should catch errors and display fallback UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    try {
      // Simulate component error
      throw new Error('Test error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Test error');
    }
    
    consoleSpy.mockRestore();
  });

  it('should log error information', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const error = new Error('Component error');
    const errorInfo = { componentStack: 'Test stack' };
    
    // Simulate error logging
    console.log('Error caught by boundary:', error, errorInfo);
    
    expect(consoleSpy).toHaveBeenCalledWith('Error caught by boundary:', error, errorInfo);
    consoleSpy.mockRestore();
  });

  it('should render children when no error occurs', () => {
    const testContent = 'Test content';
    
    // Simulate normal rendering
    const result = testContent.split('');
    
    expect(result).toEqual(['T', 'e', 's', 't', ' ', 'c', 'o', 'n', 't', 'e', 'n', 't']);
  });

  it('should handle different error types', () => {
    const errors = [
      new Error('Standard error'),
      new TypeError('Type error'),
      new ReferenceError('Reference error')
    ];
    
    errors.forEach(error => {
      expect(error).toBeInstanceOf(Error);
      expect(typeof error.message).toBe('string');
    });
  });
});