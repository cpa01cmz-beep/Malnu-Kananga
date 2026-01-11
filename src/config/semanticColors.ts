import { themes, type Theme } from './themes';

export interface SemanticColorConfig {
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  neutral: string;
  neutralLight: string;
  neutralDark: string;
}

export const SEMANTIC_COLORS: SemanticColorConfig = {
  success: 'hsl(var(--color-green-600))',
  successLight: 'hsl(var(--color-green-100))',
  successDark: 'hsl(var(--color-green-800))',
  warning: 'hsl(var(--color-yellow-600))',
  warningLight: 'hsl(var(--color-yellow-100))',
  warningDark: 'hsl(var(--color-yellow-800))',
  error: 'hsl(var(--color-red-600))',
  errorLight: 'hsl(var(--color-red-100))',
  errorDark: 'hsl(var(--color-red-800))',
  info: 'hsl(var(--color-blue-600))',
  infoLight: 'hsl(var(--color-blue-100))',
  infoDark: 'hsl(var(--color-blue-800))',
  neutral: 'hsl(var(--color-neutral-600))',
  neutralLight: 'hsl(var(--color-neutral-100))',
  neutralDark: 'hsl(var(--color-neutral-800))',
} as const;

export const SEMANTIC_COLORS_DARK: SemanticColorConfig = {
  success: 'hsl(var(--color-green-500))',
  successLight: 'hsl(var(--color-green-600))',
  successDark: 'hsl(var(--color-green-400))',
  warning: 'hsl(var(--color-yellow-500))',
  warningLight: 'hsl(var(--color-yellow-600))',
  warningDark: 'hsl(var(--color-yellow-400))',
  error: 'hsl(var(--color-red-500))',
  errorLight: 'hsl(var(--color-red-600))',
  errorDark: 'hsl(var(--color-red-400))',
  info: 'hsl(var(--color-blue-500))',
  infoLight: 'hsl(var(--color-blue-600))',
  infoDark: 'hsl(var(--color-blue-400))',
  neutral: 'hsl(var(--color-neutral-400))',
  neutralLight: 'hsl(var(--color-neutral-500))',
  neutralDark: 'hsl(var(--color-neutral-300))',
} as const;

export type SemanticColorKey = keyof SemanticColorConfig;

export function getSemanticColor(
  key: SemanticColorKey,
  isDark: boolean = false,
  variant: 'default' | 'light' | 'dark' = 'default'
): string {
  const config = isDark ? SEMANTIC_COLORS_DARK : SEMANTIC_COLORS;

  if (variant === 'light') {
    const lightKey = `${key}Light` as keyof typeof config;
    return config[lightKey];
  }

  if (variant === 'dark') {
    const darkKey = `${key}Dark` as keyof typeof config;
    return config[darkKey];
  }

  return config[key];
}

export function getSuccessColor(isDark: boolean = false, variant: 'default' | 'light' | 'dark' = 'default'): string {
  return getSemanticColor('success', isDark, variant);
}

export function getWarningColor(isDark: boolean = false, variant: 'default' | 'light' | 'dark' = 'default'): string {
  return getSemanticColor('warning', isDark, variant);
}

export function getErrorColor(isDark: boolean = false, variant: 'default' | 'light' | 'dark' = 'default'): string {
  return getSemanticColor('error', isDark, variant);
}

export function getInfoColor(isDark: boolean = false, variant: 'default' | 'light' | 'dark' = 'default'): string {
  return getSemanticColor('info', isDark, variant);
}

export function getNeutralColor(isDark: boolean = false, variant: 'default' | 'light' | 'dark' = 'default'): string {
  return getSemanticColor('neutral', isDark, variant);
}

export function getThemeSemanticColors(themeId: string): SemanticColorConfig {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) {
    return SEMANTIC_COLORS;
  }

  return {
    success: theme.colors.success,
    successLight: theme.colors.success,
    successDark: theme.colors.success,
    warning: theme.colors.warning,
    warningLight: theme.colors.warning,
    warningDark: theme.colors.warning,
    error: theme.colors.error,
    errorLight: theme.colors.error,
    errorDark: theme.colors.error,
    info: theme.colors.accent,
    infoLight: theme.colors.accent,
    infoDark: theme.colors.accent,
    neutral: theme.colors.secondary,
    neutralLight: theme.colors.textSecondary,
    neutralDark: theme.colors.border,
  };
}

export const SEMANTIC_COLOR_VARIANTS = {
  success: ['success', 'successLight', 'successDark'] as const,
  warning: ['warning', 'warningLight', 'warningDark'] as const,
  error: ['error', 'errorLight', 'errorDark'] as const,
  info: ['info', 'infoLight', 'infoDark'] as const,
  neutral: ['neutral', 'neutralLight', 'neutralDark'] as const,
} as const;

export type SemanticColorVariant = typeof SEMANTIC_COLOR_VARIANTS[keyof typeof SEMANTIC_COLOR_VARIANTS][number];
