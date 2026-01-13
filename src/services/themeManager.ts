import { Theme, themes, getThemeById } from '../config/themes';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme | null = null;
  private listeners: ((theme: Theme) => void)[] = [];

  private constructor() {
    this.loadCurrentTheme();
    this.setupStorageListener();
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

  private hexToHsl(hex: string): string {
    let r = 0, g = 0, b = 0;

    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

  private generateColorScale(baseColor: string, steps: number): Record<string, string> {
    const hsl = this.hexToHsl(baseColor);
    const [h, s] = hsl.split(' ').map((v, i) => i === 0 ? parseInt(v) : parseInt(v));
    
    const scale: Record<string, string> = {};
    const lightnessSteps = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10];
    
    for (let i = 0; i < steps; i++) {
      const step = 50 + i * 50;
      const lightness = i < 5 ? lightnessSteps[i] : lightnessSteps[i];
      scale[`${step}`] = `${h} ${s}% ${lightness}%`;
    }
    
    scale['DEFAULT'] = hsl;
    
    return scale;
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

    // Generate and apply color scales for primary
    const primaryScale = this.generateColorScale(theme.colors.primary, 10);
    Object.entries(primaryScale).forEach(([key, value]) => {
      if (key !== 'DEFAULT') {
        root.style.setProperty(`--theme-primary-${key}`, value);
      }
    });

    // Generate and apply color scales for neutral (using base neutral color)
    const neutralScale = this.generateColorScale(theme.colors.border, 10);
    Object.entries(neutralScale).forEach(([key, value]) => {
      if (key !== 'DEFAULT') {
        root.style.setProperty(`--theme-neutral-${key}`, value);
      }
    });

    // Generate and apply semantic color scales
    const semanticColors = [
      { name: 'red', color: theme.colors.error },
      { name: 'green', color: theme.colors.success },
      { name: 'orange', color: theme.colors.warning },
      { name: 'blue', color: theme.colors.accent },
    ];

    semanticColors.forEach(({ name, color }) => {
      const scale = this.generateColorScale(color, 10);
      Object.entries(scale).forEach(([key, value]) => {
        if (key !== 'DEFAULT') {
          root.style.setProperty(`--theme-${name}-${key}`, value);
        }
      });
    });

    // Generate and apply indigo scale (using secondary color as base)
    const indigoScale = this.generateColorScale(theme.colors.secondary, 10);
    Object.entries(indigoScale).forEach(([key, value]) => {
      if (key !== 'DEFAULT') {
        root.style.setProperty(`--theme-indigo-${key}`, value);
      }
    });

    // Generate and apply purple scale (using accent color as base)
    const purpleScale = this.generateColorScale(theme.colors.accent, 10);
    Object.entries(purpleScale).forEach(([key, value]) => {
      if (key !== 'DEFAULT') {
        root.style.setProperty(`--theme-purple-${key}`, value);
      }
    });

    // Generate and apply pink scale
    const pinkScale = this.generateColorScale('#db2777', 10);
    Object.entries(pinkScale).forEach(([key, value]) => {
      if (key !== 'DEFAULT') {
        root.style.setProperty(`--theme-pink-${key}`, value);
      }
    });

    // Generate and apply cyan scale
    const cyanScale = this.generateColorScale('#06b6d4', 10);
    Object.entries(cyanScale).forEach(([key, value]) => {
      if (key !== 'DEFAULT') {
        root.style.setProperty(`--theme-cyan-${key}`, value);
      }
    });

    // Generate and apply emerald scale
    const emeraldScale = this.generateColorScale('#10b981', 10);
    Object.entries(emeraldScale).forEach(([key, value]) => {
      if (key !== 'DEFAULT') {
        root.style.setProperty(`--theme-emerald-${key}`, value);
      }
    });

    // Generate and apply sky scale
    const skyScale = this.generateColorScale('#0ea5e9', 10);
    Object.entries(skyScale).forEach(([key, value]) => {
      if (key !== 'DEFAULT') {
        root.style.setProperty(`--theme-sky-${key}`, value);
      }
    });

    // Apply progress bar striped overlay color based on theme brightness
    const overlayColor = theme.isDark ? '0 0 0' : '255 255 255';
    root.style.setProperty('--progress-bar-striped-overlay', overlayColor);
  }

  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify({
        id: theme.id,
        timestamp: Date.now()
      }));
    } catch (error) {
      logger.error('Failed to save theme:', error);
    }
  }

  private loadCurrentTheme(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
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
      logger.error('Failed to load theme:', error);
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

    const allThemes = themes;
    const currentIndex = allThemes.findIndex(theme => theme.id === this.currentTheme!.id);
    const nextIndex = (currentIndex + 1) % allThemes.length;
    const nextTheme = allThemes[nextIndex];
    
    this.setTheme(nextTheme);
  }

  public resetToDefault(): void {
    const defaultTheme = getThemeById('emerald-light');
    if (defaultTheme) {
      this.setTheme(defaultTheme);
    }
  }

  private setupStorageListener(): void {
    // Listen for changes to theme in localStorage from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.THEME && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          const theme = getThemeById(data.id);
          if (theme && theme.id !== this.currentTheme?.id) {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.notifyListeners(theme);
          }
        } catch (error) {
          logger.error('Failed to sync theme from storage event:', error);
        }
      }
    });
  }
}