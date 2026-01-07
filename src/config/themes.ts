export interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
  };
  isDark: boolean;
  icon: string;
}

export const themes: Theme[] = [
  {
    id: 'emerald-light',
    name: 'Emerald Light',
    displayName: 'Zamrud Terang',
    description: 'Tema segar dengan warna hijau zamrud yang menenangkan',
    colors: {
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
    },
    isDark: false,
    icon: '💎',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    displayName: 'Malam Tengah',
    description: 'Tema elegan dengan warna gelap yang nyaman untuk mata',
    colors: {
      primary: '#3b82f6',
      secondary: '#9ca3af',
      accent: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
    },
    isDark: true,
    icon: '🌙',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    displayName: 'Biru Lautan',
    description: 'Tema menenangkan dengan nuansa biru laut dalam',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#f8fafc',
      surface: '#f1f5f9',
      text: '#1e293b',
      textSecondary: '#475569',
      border: '#e2e8f0',
      error: '#dc2626',
      warning: '#ea580c',
      success: '#16a34a',
    },
    isDark: false,
    icon: '🌊',
  },
  {
    id: 'sunset-warm',
    name: 'Sunset Warm',
    displayName: 'Senja Hangat',
    description: 'Tema hangat dengan warna oranye senja yang memikat',
    colors: {
      primary: '#f97316',
      secondary: '#78716c',
      accent: '#ef4444',
      background: '#fffdf7',
      surface: '#fef3c7',
      text: '#1c1917',
      textSecondary: '#57534e',
      border: '#fde68a',
      error: '#dc2626',
      warning: '#d97706',
      success: '#059669',
    },
    isDark: false,
    icon: '🌅',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    displayName: 'Hijau Hutan',
    description: 'Tema alami dengan nuansa hijau hutan yang teduh',
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#84cc16',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      textSecondary: '#4b5563',
      border: '#bbf7d0',
      error: '#dc2626',
      warning: '#d97706',
      success: '#059669',
    },
    isDark: false,
    icon: '🌲',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    displayName: 'Ungu Kerajaan',
    description: 'Tema mewah dengan warna ungu kerajaan yang berkelas',
    colors: {
      primary: '#9333ea',
      secondary: '#9ca3af',
      accent: '#f43f5e',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#2e1065',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      error: '#dc2626',
      warning: '#ea580c',
      success: '#059669',
    },
    isDark: false,
    icon: '👑',
  },
  {
    id: 'obsidian-dark',
    name: 'Obsidian Dark',
    displayName: 'Obsidian Gelap',
    description: 'Tema modern dengan warna hitam obsidian yang stylish',
    colors: {
      primary: '#818cf8',
      secondary: '#a1a1aa',
      accent: '#f472b6',
      background: '#000000',
      surface: '#18181b',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      border: '#27272a',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#34d399',
    },
    isDark: true,
    icon: '⚫',
  },
];

export const getThemeById = (id: string): Theme | undefined => {
  return themes.find(theme => theme.id === id);
};

export const getThemeByName = (name: string): Theme | undefined => {
  return themes.find(theme => theme.name.toLowerCase().includes(name.toLowerCase()));
};

export const getLightThemes = (): Theme[] => {
  return themes.filter(theme => !theme.isDark);
};

export const getDarkThemes = (): Theme[] => {
  return themes.filter(theme => theme.isDark);
};

export const getRandomTheme = (): Theme => {
  return themes[Math.floor(Math.random() * themes.length)];
};