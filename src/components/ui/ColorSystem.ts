/**
 * Enhanced Color System and Visual Hierarchy
 * Comprehensive color palette with accessibility, theming, and contrast ratios
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary colors
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
};

// Semantic color mappings
export const semanticColors = {
  background: {
    primary: colors.gray[50],
    secondary: colors.gray[100],
    tertiary: '#ffffff',
    inverse: colors.gray[900],
  },
  
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[500],
    inverse: '#ffffff',
    disabled: colors.gray[400],
  },
  
  border: {
    primary: colors.gray[200],
    secondary: colors.gray[300],
    focus: colors.primary[500],
    error: colors.error[500],
    success: colors.success[500],
  },
  
  interactive: {
    default: colors.primary[600],
    hover: colors.primary[700],
    active: colors.primary[800],
    disabled: colors.gray[300],
  },
};

// Dark theme colors
export const darkColors = {
  background: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[950],
    inverse: colors.gray[50],
  },
  
  text: {
    primary: colors.gray[100],
    secondary: colors.gray[300],
    tertiary: colors.gray[400],
    inverse: colors.gray[900],
    disabled: colors.gray[500],
  },
  
  border: {
    primary: colors.gray[700],
    secondary: colors.gray[600],
    focus: colors.primary[400],
    error: colors.error[400],
    success: colors.success[400],
  },
  
  interactive: {
    default: colors.primary[500],
    hover: colors.primary[400],
    active: colors.primary[300],
    disabled: colors.gray[600],
  },
};

// Color utilities
export const getColorShade = (colorName: string, shade: number): string => {
  const colorGroup = (colors as any)[colorName];
  return colorGroup?.[shade] || colorGroup?.[500] || '#000000';
};

export const getSemanticColor = (type: string, variant: string, isDark = false): string => {
  const theme = isDark ? darkColors : semanticColors;
  return (theme as any)[type]?.[variant] || '#000000';
};

// Contrast ratio utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = color.replace('#', '');
    const r = parseInt(rgb.substr(0, 2), 16) / 255;
    const g = parseInt(rgb.substr(2, 2), 16) / 255;
    const b = parseInt(rgb.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

export const getAccessibleTextColor = (backgroundColor: string): string => {
  const whiteContrast = getContrastRatio(backgroundColor, '#ffffff');
  const blackContrast = getContrastRatio(backgroundColor, '#000000');
  
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
};

// Gradient utilities
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
  secondary: `linear-gradient(135deg, ${colors.secondary[500]}, ${colors.secondary[600]})`,
  success: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`,
  warning: `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`,
  error: `linear-gradient(135deg, ${colors.error[500]}, ${colors.error[600]})`,
  info: `linear-gradient(135deg, ${colors.info[500]}, ${colors.info[600]})`,
  subtle: `linear-gradient(135deg, ${colors.gray[50]}, ${colors.gray[100]})`,
  dark: `linear-gradient(135deg, ${colors.gray[800]}, ${colors.gray[900]})`,
};

export const getGradient = (type: keyof typeof gradients): string => {
  return gradients[type] || gradients.primary;
};

// Shadow utilities
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Colored shadows
  primary: `0 10px 15px -3px ${colors.primary[500]}20`,
  secondary: `0 10px 15px -3px ${colors.secondary[500]}20`,
  success: `0 10px 15px -3px ${colors.success[500]}20`,
  warning: `0 10px 15px -3px ${colors.warning[500]}20`,
  error: `0 10px 15px -3px ${colors.error[500]}20`,
  info: `0 10px 15px -3px ${colors.info[500]}20`,
};

export const getShadow = (type: keyof typeof shadows): string => {
  return shadows[type] || shadows.md;
};

// Animation utilities
export const animations = {
  // Durations
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  
  // Easing functions
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Keyframes
  fadeIn: 'fadeIn 0.3s ease-out',
  fadeOut: 'fadeOut 0.3s ease-in',
  slideUp: 'slideUp 0.3s ease-out',
  slideDown: 'slideDown 0.3s ease-out',
  slideLeft: 'slideLeft 0.3s ease-out',
  slideRight: 'slideRight 0.3s ease-out',
  scaleIn: 'scaleIn 0.2s ease-out',
  scaleOut: 'scaleOut 0.2s ease-in',
  bounce: 'bounce 0.6s ease-out',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

// CSS custom properties generator
export const generateCSSCustomProperties = (isDark = false): string => {
  const theme = isDark ? darkColors : semanticColors;
  
  return `
    :root {
      /* Colors */
      --color-background-primary: ${theme.background.primary};
      --color-background-secondary: ${theme.background.secondary};
      --color-background-tertiary: ${theme.background.tertiary};
      --color-text-primary: ${theme.text.primary};
      --color-text-secondary: ${theme.text.secondary};
      --color-text-tertiary: ${theme.text.tertiary};
      --color-text-inverse: ${theme.text.inverse};
      --color-text-disabled: ${theme.text.disabled};
      --color-border-primary: ${theme.border.primary};
      --color-border-secondary: ${theme.border.secondary};
      --color-border-focus: ${theme.border.focus};
      --color-border-error: ${theme.border.error};
      --color-border-success: ${theme.border.success};
      --color-interactive-default: ${theme.interactive.default};
      --color-interactive-hover: ${theme.interactive.hover};
      --color-interactive-active: ${theme.interactive.active};
      --color-interactive-disabled: ${theme.interactive.disabled};
      
      /* Shadows */
      --shadow-xs: ${shadows.xs};
      --shadow-sm: ${shadows.sm};
      --shadow-md: ${shadows.md};
      --shadow-lg: ${shadows.lg};
      --shadow-xl: ${shadows.xl};
      --shadow-2xl: ${shadows['2xl']};
      --shadow-inner: ${shadows.inner};
      
      /* Animations */
      --animation-fast: ${animations.fast};
      --animation-normal: ${animations.normal};
      --animation-slow: ${animations.slow};
      --animation-ease-in: ${animations.easeIn};
      --animation-ease-out: ${animations.easeOut};
      --animation-ease-in-out: ${animations.easeInOut};
    }
  `;
};

// Type definitions
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type ColorName = keyof typeof colors;
export type SemanticColorType = keyof typeof semanticColors;
export type GradientType = keyof typeof gradients;
export type ShadowType = keyof typeof shadows;
export type AnimationType = keyof typeof animations;