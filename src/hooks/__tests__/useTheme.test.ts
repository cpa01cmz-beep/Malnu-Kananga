import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { ThemeManager } from '../../services/themeManager';

vi.mock('../../services/themeManager', () => ({
  ThemeManager: {
    getInstance: vi.fn(),
  },
}));

describe('useTheme Hook', () => {
  const mockAddListener = vi.fn();
  const mockRemoveListener = vi.fn();
  
  const createMockManager = () => ({
    getCurrentTheme: vi.fn().mockReturnValue({
      id: 'light',
      name: 'Light',
      displayName: 'Light Theme',
      description: 'Light theme description',
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#cccccc',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        textSecondary: '#666666',
        border: '#e0e0e0',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      isDark: false,
      icon: 'SunIcon',
    }),
    setTheme: vi.fn(),
    setThemeById: vi.fn().mockReturnValue(true),
    toggleDarkMode: vi.fn(),
    resetToDefault: vi.fn(),
    getSupportedThemes: vi.fn().mockReturnValue([]),
    addListener: mockAddListener,
    removeListener: mockRemoveListener,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockManager = createMockManager();
    (ThemeManager.getInstance as ReturnType<typeof vi.fn>).mockReturnValue(mockManager);
  });

  it('should initialize with theme manager', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.isReady).toBe(true);
  });

  it('should call setTheme when setTheme is invoked', async () => {
    const mockManager = createMockManager();
    (ThemeManager.getInstance as ReturnType<typeof vi.fn>).mockReturnValue(mockManager);
    
    const { result } = renderHook(() => useTheme());
    const testTheme = { id: 'dark', name: 'Dark', displayName: 'Dark', description: '', colors: {} as never, isDark: true, icon: '' };
    
    await act(async () => {
      result.current.setTheme(testTheme);
    });
    expect(mockManager.setTheme).toHaveBeenCalledWith(testTheme);
  });

  it('should call setThemeById when setThemeById is invoked', async () => {
    const mockManager = createMockManager();
    (ThemeManager.getInstance as ReturnType<typeof vi.fn>).mockReturnValue(mockManager);
    
    const { result } = renderHook(() => useTheme());
    
    await act(async () => {
      result.current.setThemeById('dark');
    });
    expect(mockManager.setThemeById).toHaveBeenCalledWith('dark');
  });

  it('should call toggleDarkMode when toggleDarkMode is invoked', async () => {
    const mockManager = createMockManager();
    (ThemeManager.getInstance as ReturnType<typeof vi.fn>).mockReturnValue(mockManager);
    
    const { result } = renderHook(() => useTheme());
    
    await act(async () => {
      result.current.toggleDarkMode();
    });
    expect(mockManager.toggleDarkMode).toHaveBeenCalled();
  });

  it('should call resetToDefault when resetToDefault is invoked', async () => {
    const mockManager = createMockManager();
    (ThemeManager.getInstance as ReturnType<typeof vi.fn>).mockReturnValue(mockManager);
    
    const { result } = renderHook(() => useTheme());
    
    await act(async () => {
      result.current.resetToDefault();
    });
    expect(mockManager.resetToDefault).toHaveBeenCalled();
  });

  it('should add listener on mount', () => {
    renderHook(() => useTheme());
    expect(mockAddListener).toHaveBeenCalled();
  });
});
