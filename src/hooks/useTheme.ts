import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../config/themes';
import { ThemeManager } from '../services/themeManager';

export const useTheme = () => {
  const [themeManager, setThemeManager] = useState<ThemeManager | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);

  // Initialize theme manager
  useEffect(() => {
    const manager = ThemeManager.getInstance();
    setThemeManager(manager);
    setCurrentTheme(manager.getCurrentTheme());

    // Listen for theme changes
    const handleThemeChange = (theme: Theme) => {
      setCurrentTheme(theme);
    };

    manager.addListener(handleThemeChange);

    return () => {
      manager.removeListener(handleThemeChange);
    };
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    if (themeManager) {
      themeManager.setTheme(theme);
    }
  }, [themeManager]);

  const setThemeById = useCallback((themeId: string): boolean => {
    if (themeManager) {
      return themeManager.setThemeById(themeId);
    }
    return false;
  }, [themeManager]);

  const toggleDarkMode = useCallback(() => {
    if (themeManager) {
      themeManager.toggleDarkMode();
    }
  }, [themeManager]);

  const resetToDefault = useCallback(() => {
    if (themeManager) {
      themeManager.resetToDefault();
    }
  }, [themeManager]);

  const getSupportedThemes = useCallback(() => {
    return themeManager?.getSupportedThemes() || [];
  }, [themeManager]);

  return {
    currentTheme,
    setTheme,
    setThemeById,
    toggleDarkMode,
    resetToDefault,
    getSupportedThemes,
    isReady: !!themeManager
  };
};