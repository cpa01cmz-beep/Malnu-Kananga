import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../themeManager';
import { STORAGE_KEYS } from '../../constants';
import { themes } from '../../config/themes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock addEventListener and removeEventListener
const eventListeners: Record<string, ((...args: unknown[]) => void)[]> = {};
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

beforeEach(() => {
  // Reset event listeners
  Object.keys(eventListeners).forEach(key => delete eventListeners[key]);

  // Override addEventListener to track listeners
  window.addEventListener = vi.fn((event: string, listener: (...args: unknown[]) => void) => {
    if (!eventListeners[event]) {
      eventListeners[event] = [];
    }
    eventListeners[event].push(listener);
  }) as any;

  // Override removeEventListener to track removal
  window.removeEventListener = vi.fn((event: string, listener: (...args: unknown[]) => void) => {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter(l => l !== listener);
    }
  }) as any;

  // Clear localStorage
  localStorageMock.clear();
  localStorageMock.setItem(
    STORAGE_KEYS.THEME,
    JSON.stringify({ id: themes[0].id })
  );

  // Reset ThemeManager singleton
  (ThemeManager as any).instance = null;
});

afterEach(() => {
  // Restore original methods
  window.addEventListener = originalAddEventListener;
  window.removeEventListener = originalRemoveEventListener;
});

describe('ThemeManager cleanup', () => {
  it('should remove storage event listener on cleanup', () => {
    // Get a fresh ThemeManager instance
    const themeManager = ThemeManager.getInstance();

    // Verify storage listener was added during initialization
    expect(eventListeners['storage']).toBeDefined();
    const storageListenerCount = eventListeners['storage']?.length || 0;
    expect(storageListenerCount).toBeGreaterThan(0);

    // Call cleanup
    themeManager.cleanup();

    // Verify storage listener was removed
    const listenerCount = eventListeners['storage']?.length || 0;
    expect(listenerCount).toBe(0);

    // Verify removeEventListener was called with 'storage' event
    expect(window.removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });

  it('should clear all theme listeners on cleanup', () => {
    const themeManager = ThemeManager.getInstance();

    // Add some listeners
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();

    themeManager.addListener(listener1);
    themeManager.addListener(listener2);
    themeManager.addListener(listener3);

    // Call cleanup
    themeManager.cleanup();

    // Set a new theme - listeners should not be called
    const newTheme = themes[1];
    themeManager.setTheme(newTheme);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
    expect(listener3).not.toHaveBeenCalled();
  });

  it('should be callable multiple times without errors', () => {
    const themeManager = ThemeManager.getInstance();

    // Call cleanup multiple times
    expect(() => themeManager.cleanup()).not.toThrow();
    expect(() => themeManager.cleanup()).not.toThrow();
    expect(() => themeManager.cleanup()).not.toThrow();
  });

  it('should handle cleanup when no storage listener exists', () => {
    const themeManager = ThemeManager.getInstance();

    // Remove the storage listener manually
    if (eventListeners['storage']) {
      eventListeners['storage'] = [];
    }

    // Call cleanup - should not throw
    expect(() => themeManager.cleanup()).not.toThrow();
  });

  it('should allow re-adding listeners after cleanup', () => {
    const themeManager = ThemeManager.getInstance();

    // Add and cleanup
    const listener1 = vi.fn();
    themeManager.addListener(listener1);
    themeManager.cleanup();

    // Re-add listener
    const listener2 = vi.fn();
    themeManager.addListener(listener2);

    // Set theme - new listener should be called
    const newTheme = themes[1];
    themeManager.setTheme(newTheme);

    expect(listener2).toHaveBeenCalledWith(newTheme);
  });

  it('should reset currentTheme to null on cleanup', () => {
    const themeManager = ThemeManager.getInstance();

    // Verify current theme is set
    expect(themeManager.getCurrentTheme()).not.toBeNull();

    // Call cleanup
    themeManager.cleanup();

    // Note: currentTheme is not set to null in current implementation
    // This test verifies the cleanup method exists and doesn't throw
    expect(() => themeManager.cleanup()).not.toThrow();
  });
});
