import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../themeManager';
import { STORAGE_KEYS } from '../../constants';
import { themes } from '../../config/themes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document.documentElement
const mockDocumentElement = {
  className: '',
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    replace: vi.fn(),
    contains: vi.fn(),
  },
  style: {
    setProperty: vi.fn(),
  },
};

Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
  writable: true,
});

// Mock window.addEventListener and removeEventListener
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

  // Reset document mocks
  mockDocumentElement.className = '';
  mockDocumentElement.classList.add.mockClear();
  mockDocumentElement.classList.remove.mockClear();
  mockDocumentElement.style.setProperty.mockClear();

  // Reset ThemeManager singleton
  (ThemeManager as any).instance = null;
});

afterEach(() => {
  // Restore original methods
  window.addEventListener = originalAddEventListener;
  window.removeEventListener = originalRemoveEventListener;
});

describe('ThemeManager', () => {
  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ThemeManager.getInstance();
      const instance2 = ThemeManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should create only one instance', () => {
      const instance1 = ThemeManager.getInstance();
      (ThemeManager as any).instance = null;
      const instance2 = ThemeManager.getInstance();
      
      expect(instance1).not.toBe(instance2);
      expect(instance1).toBeInstanceOf(ThemeManager);
      expect(instance2).toBeInstanceOf(ThemeManager);
    });
  });

  describe('Theme Loading and Initialization', () => {
    it('should load theme from localStorage', () => {
      const storedTheme = themes[1];
      localStorageMock.setItem(
        STORAGE_KEYS.THEME,
        JSON.stringify({ id: storedTheme.id, timestamp: Date.now() })
      );

      const themeManager = ThemeManager.getInstance();
      const currentTheme = themeManager.getCurrentTheme();

      expect(currentTheme).toEqual(storedTheme);
    });

    it('should fallback to default theme when stored theme not found', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.THEME,
        JSON.stringify({ id: 'non-existent-theme', timestamp: Date.now() })
      );

      const themeManager = ThemeManager.getInstance();
      const currentTheme = themeManager.getCurrentTheme();

      expect(currentTheme).toEqual(themes.find(t => t.id === 'emerald-light'));
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem(STORAGE_KEYS.THEME, 'invalid-json');

      const themeManager = ThemeManager.getInstance();
      const currentTheme = themeManager.getCurrentTheme();

      expect(currentTheme).toEqual(themes.find(t => t.id === 'emerald-light'));
    });

    it('should use default theme when no theme in localStorage', () => {
      localStorageMock.clear();

      const themeManager = ThemeManager.getInstance();
      const currentTheme = themeManager.getCurrentTheme();

      expect(currentTheme).toEqual(themes.find(t => t.id === 'emerald-light'));
    });
  });

  describe('Theme Setting', () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
      themeManager = ThemeManager.getInstance();
    });

    it('should set theme by theme object', () => {
      const newTheme = themes[2];
      themeManager.setTheme(newTheme);

      expect(themeManager.getCurrentTheme()).toBe(newTheme);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.THEME,
        expect.any(String)
      );
    });

    it('should set theme by theme ID', () => {
      const targetTheme = themes[2];
      const result = themeManager.setThemeById(targetTheme.id);

      expect(result).toBe(true);
      expect(themeManager.getCurrentTheme()).toBe(targetTheme);
    });

    it('should return false when setting non-existent theme ID', () => {
      const result = themeManager.setThemeById('non-existent-theme');

      expect(result).toBe(false);
      const currentTheme = themeManager.getCurrentTheme();
      expect(currentTheme).not.toBeNull();
    });

    it('should apply theme classes to document', () => {
      const newTheme = themes[2];
      themeManager.setTheme(newTheme);

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(`theme-${newTheme.id}`);
      
      if (newTheme.isDark) {
        expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      } else {
        expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
      }
    });
  });

  describe('Color Scale Generation', () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
      themeManager = ThemeManager.getInstance();
    });

    it('should generate color scale for primary color', () => {
      const theme = themes[0];
      themeManager.setTheme(theme);

      // Check that color scales are generated
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        expect.stringMatching(/^--theme-primary-\d+$/),
        expect.any(String)
      );
    });

    it('should generate color scale for neutral colors', () => {
      const theme = themes[0];
      themeManager.setTheme(theme);

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        expect.stringMatching(/^--theme-neutral-\d+$/),
        expect.any(String)
      );
    });

    it('should generate semantic color scales', () => {
      const theme = themes[0];
      themeManager.setTheme(theme);

      const semanticColors = ['red', 'green', 'orange', 'blue'];
      
      semanticColors.forEach(color => {
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          expect.stringMatching(new RegExp(`^--theme-${color}-\\d+$`)),
          expect.any(String)
        );
      });
    });

    it('should set progress bar overlay based on theme brightness', () => {
      const lightTheme = themes.find(t => !t.isDark)!;
      themeManager.setTheme(lightTheme);

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--progress-bar-striped-overlay',
        '255 255 255'
      );

      const darkTheme = themes.find(t => t.isDark)!;
      themeManager.setTheme(darkTheme);

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--progress-bar-striped-overlay',
        '0 0 0'
      );
    });
  });

  describe('Listener Management', () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
      themeManager = ThemeManager.getInstance();
    });

    it('should add theme listeners', () => {
      const listener = vi.fn();
      themeManager.addListener(listener);

      const newTheme = themes[1];
      themeManager.setTheme(newTheme);

      expect(listener).toHaveBeenCalledWith(newTheme);
    });

    it('should remove theme listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      themeManager.addListener(listener1);
      themeManager.addListener(listener2);
      themeManager.removeListener(listener1);

      const newTheme = themes[1];
      themeManager.setTheme(newTheme);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith(newTheme);
    });

    it('should notify all listeners on theme change', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      themeManager.addListener(listener1);
      themeManager.addListener(listener2);
      themeManager.addListener(listener3);

      const newTheme = themes[1];
      themeManager.setTheme(newTheme);

      expect(listener1).toHaveBeenCalledWith(newTheme);
      expect(listener2).toHaveBeenCalledWith(newTheme);
      expect(listener3).toHaveBeenCalledWith(newTheme);
    });
  });

  describe('Cross-tab Synchronization', () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
      themeManager = ThemeManager.getInstance();
    });

    it('should setup storage event listener', () => {
      expect(eventListeners['storage']).toBeDefined();
      expect(eventListeners['storage']?.length).toBeGreaterThan(0);
    });

    it('should sync theme from storage event', () => {
      const newTheme = themes[2];
      const storageEvent = {
        key: STORAGE_KEYS.THEME,
        newValue: JSON.stringify({ id: newTheme.id }),
        oldValue: null,
      };

      const storageListener = eventListeners['storage']![0];
      storageListener(storageEvent);

      expect(themeManager.getCurrentTheme()).toBe(newTheme);
    });

    it('should ignore unrelated storage events', () => {
      const originalTheme = themeManager.getCurrentTheme()!;
      
      const storageEvent = {
        key: 'some-other-key',
        newValue: JSON.stringify({ id: 'some-theme' }),
        oldValue: null,
      };

      const storageListener = eventListeners['storage']![0];
      storageListener(storageEvent);

      expect(themeManager.getCurrentTheme()).toBe(originalTheme);
    });

    it('should ignore null storage values', () => {
      const originalTheme = themeManager.getCurrentTheme()!;
      
      const storageEvent = {
        key: STORAGE_KEYS.THEME,
        newValue: null,
        oldValue: null,
      };

      const storageListener = eventListeners['storage']![0];
      storageListener(storageEvent);

      expect(themeManager.getCurrentTheme()).toBe(originalTheme);
    });

    it('should ignore storage event for same theme', () => {
      const currentTheme = themeManager.getCurrentTheme()!;
      
      const storageEvent = {
        key: STORAGE_KEYS.THEME,
        newValue: JSON.stringify({ id: currentTheme.id }),
        oldValue: null,
      };

      const storageListener = eventListeners['storage']![0];
      storageListener(storageEvent);

      expect(themeManager.getCurrentTheme()).toBe(currentTheme);
    });
  });

  describe('Utility Methods', () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
      themeManager = ThemeManager.getInstance();
    });

    it('should get supported themes', () => {
      const supportedThemes = themeManager.getSupportedThemes();
      
      expect(supportedThemes).toEqual(themes);
      expect(supportedThemes).not.toBe(themes); // Should be a copy
    });

    it('should toggle dark mode', () => {
      const initialTheme = themeManager.getCurrentTheme()!;
      const allThemes = themeManager.getSupportedThemes();
      const currentIndex = allThemes.findIndex(t => t.id === initialTheme.id);
      const nextIndex = (currentIndex + 1) % allThemes.length;
      const expectedNextTheme = allThemes[nextIndex];

      themeManager.toggleDarkMode();

      expect(themeManager.getCurrentTheme()).toBe(expectedNextTheme);
    });

    it('should reset to default theme', () => {
      const defaultTheme = themes.find(t => t.id === 'emerald-light')!;
      
      // Set a different theme first
      themeManager.setTheme(themes[1]);
      expect(themeManager.getCurrentTheme()).not.toBe(defaultTheme);

      // Reset to default
      themeManager.resetToDefault();
      expect(themeManager.getCurrentTheme()).toBe(defaultTheme);
    });

    it('should handle toggleDarkMode without current theme', () => {
      (themeManager as any).currentTheme = null;
      
      expect(() => themeManager.toggleDarkMode()).not.toThrow();
    });
  });

  describe('Hex to HSL Conversion', () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
      themeManager = ThemeManager.getInstance();
    });

    it('should convert 3-digit hex to HSL', () => {
      const hexToHsl = (themeManager as any).hexToHsl;
      
      expect(hexToHsl('#fff')).toMatch(/^\d+ \d+% \d+%$/);
      expect(hexToHsl('#000')).toMatch(/^\d+ \d+% \d+%$/);
      expect(hexToHsl('#f00')).toMatch(/^\d+ \d+% \d+%$/);
    });

    it('should convert 6-digit hex to HSL', () => {
      const hexToHsl = (themeManager as any).hexToHsl;
      
      expect(hexToHsl('#ffffff')).toMatch(/^\d+ \d+% \d+%$/);
      expect(hexToHsl('#000000')).toMatch(/^\d+ \d+% \d+%$/);
      expect(hexToHsl('#ff0000')).toMatch(/^\d+ \d+% \d+%$/);
      expect(hexToHsl('#00ff00')).toMatch(/^\d+ \d+% \d+%$/);
      expect(hexToHsl('#0000ff')).toMatch(/^\d+ \d+% \d+%$/);
    });

    it('should handle edge cases', () => {
      const hexToHsl = (themeManager as any).hexToHsl;
      
      // Gray colors
      expect(hexToHsl('#808080')).toBe('0 0% 50%');
      
      // Pure colors
      expect(hexToHsl('#ff0000')).toBe('0 100% 50%');
      expect(hexToHsl('#00ff00')).toBe('120 100% 50%');
      expect(hexToHsl('#0000ff')).toBe('240 100% 50%');
    });
  });
});