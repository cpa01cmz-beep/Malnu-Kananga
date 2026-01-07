import { Theme, themes, getThemeById, getLightThemes, getDarkThemes } from '../config/themes';

export const THEMES_STORAGE_KEY = 'malnu_advanced_theme';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme | null = null;
  private listeners: ((theme: Theme) => void)[] = [];

  private constructor() {
    this.loadCurrentTheme();
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  public setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme(theme);
    this.notifyListeners(theme);
  }

  public setThemeById(themeId: string): boolean {
    const theme = getThemeById(themeId);
    if (theme) {
      this.setTheme(theme);
      return true;
    }
    return false;
  }

  public addListener(listener: (theme: Theme) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (theme: Theme) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => listener(theme));
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.className = root.className.replace(/theme-\S+/g, '').trim();
    
    // Add theme class
    root.classList.add(`theme-${theme.id}`);
    
    // Apply dark mode class for dark themes
    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set CSS variables for Tailwind custom colors
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
  }

  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify({
        id: theme.id,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  private loadCurrentTheme(): void {
    try {
      const stored = localStorage.getItem(THEMES_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const theme = getThemeById(data.id);
        if (theme) {
          this.currentTheme = theme;
          this.applyTheme(theme);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }

    // Fallback to default theme
    const defaultTheme = getThemeById('emerald-light');
    if (defaultTheme) {
      this.currentTheme = defaultTheme;
      this.applyTheme(defaultTheme);
    }
  }

  public getSupportedThemes(): Theme[] {
    return [...themes];
  }

  public toggleDarkMode(): void {
    if (!this.currentTheme) return;

    const isCurrentlyDark = this.currentTheme.isDark;
    
    if (isCurrentlyDark) {
      // Switch to a light theme
      const lightThemes = getLightThemes();
      const fallbackTheme = lightThemes.find((t: Theme) => t.id.includes('emerald')) || lightThemes[0];
      this.setTheme(fallbackTheme);
    } else {
      // Switch to a dark theme
      const darkThemes = getDarkThemes();
      const fallbackTheme = darkThemes.find((t: Theme) => t.id.includes('midnight')) || darkThemes[0];
      this.setTheme(fallbackTheme);
    }
  }

  public resetToDefault(): void {
    const defaultTheme = getThemeById('emerald-light');
    if (defaultTheme) {
      this.setTheme(defaultTheme);
    }
  }
}