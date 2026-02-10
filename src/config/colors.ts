/**
 * Semantic Color Configuration
 *
 * Centralized color definitions with type-safe access to colors.
 * Maps semantic purposes to specific color scales for consistency.
 *
 * Usage:
 *   import { SEMANTIC_COLORS, getColorClasses } from '@/config/colors';
 *
 *   const successClasses = getColorClasses('success', 'background');
 *   // Returns: 'bg-green-50 dark:bg-green-900/20'
 */

export type ColorScale = 'neutral' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary';

export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export type SemanticPurpose = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'secondary';

export type ColorUsage = 'background' | 'text' | 'border' | 'button' | 'badge' | 'alert';

/**
 * Semantic color mapping - defines which color scale to use for each purpose
 */
export const SEMANTIC_COLORS: Record<SemanticPurpose, ColorScale> = {
  primary: 'primary',
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  neutral: 'neutral',
  secondary: 'secondary',
} as const;

/**
 * Color scale configurations with Tailwind class mappings
 */
export const COLOR_SCALES: Record<
  ColorScale,
  {
    light: Record<ColorShade, string>;
    dark: Record<ColorShade, string>;
  }
> = {
  neutral: {
    light: {
      50: 'bg-neutral-50',
      100: 'bg-neutral-100',
      200: 'bg-neutral-200',
      300: 'bg-neutral-300',
      400: 'bg-neutral-400',
      500: 'bg-neutral-500',
      600: 'bg-neutral-600',
      700: 'bg-neutral-700',
      800: 'bg-neutral-800',
      900: 'bg-neutral-900',
      950: 'bg-neutral-950',
    },
    dark: {
      50: 'bg-neutral-50',
      100: 'bg-neutral-100',
      200: 'bg-neutral-200',
      300: 'bg-neutral-300',
      400: 'bg-neutral-400',
      500: 'bg-neutral-500',
      600: 'bg-neutral-600',
      700: 'bg-neutral-700',
      800: 'bg-neutral-800',
      900: 'bg-neutral-900',
      950: 'bg-neutral-950',
    },
  },
  primary: {
    light: {
      50: 'bg-primary-50',
      100: 'bg-primary-100',
      200: 'bg-primary-200',
      300: 'bg-primary-300',
      400: 'bg-primary-400',
      500: 'bg-primary-500',
      600: 'bg-primary-600',
      700: 'bg-primary-700',
      800: 'bg-primary-800',
      900: 'bg-primary-900',
      950: 'bg-primary-900',
    },
    dark: {
      50: 'bg-primary-50',
      100: 'bg-primary-100',
      200: 'bg-primary-200',
      300: 'bg-primary-300',
      400: 'bg-primary-400',
      500: 'bg-primary-500',
      600: 'bg-primary-600',
      700: 'bg-primary-700',
      800: 'bg-primary-800',
      900: 'bg-primary-900',
      950: 'bg-primary-900',
    },
  },
  success: {
    light: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      200: 'bg-green-200',
      300: 'bg-green-300',
      400: 'bg-green-400',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700',
      800: 'bg-green-800',
      900: 'bg-green-900',
      950: 'bg-green-900',
    },
    dark: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      200: 'bg-green-200',
      300: 'bg-green-300',
      400: 'bg-green-400',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700',
      800: 'bg-green-800',
      900: 'bg-green-900',
      950: 'bg-green-900',
    },
  },
  error: {
    light: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      200: 'bg-red-200',
      300: 'bg-red-300',
      400: 'bg-red-400',
      500: 'bg-red-500',
      600: 'bg-red-600',
      700: 'bg-red-700',
      800: 'bg-red-800',
      900: 'bg-red-900',
      950: 'bg-red-900',
    },
    dark: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      200: 'bg-red-200',
      300: 'bg-red-300',
      400: 'bg-red-400',
      500: 'bg-red-500',
      600: 'bg-red-600',
      700: 'bg-red-700',
      800: 'bg-red-800',
      900: 'bg-red-900',
      950: 'bg-red-900',
    },
  },
  warning: {
    light: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      200: 'bg-yellow-200',
      300: 'bg-yellow-300',
      400: 'bg-yellow-400',
      500: 'bg-yellow-500',
      600: 'bg-yellow-600',
      700: 'bg-yellow-700',
      800: 'bg-yellow-800',
      900: 'bg-yellow-900',
      950: 'bg-yellow-900',
    },
    dark: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      200: 'bg-yellow-200',
      300: 'bg-yellow-300',
      400: 'bg-yellow-400',
      500: 'bg-yellow-500',
      600: 'bg-yellow-600',
      700: 'bg-yellow-700',
      800: 'bg-yellow-800',
      900: 'bg-yellow-900',
      950: 'bg-yellow-900',
    },
  },
  info: {
    light: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      200: 'bg-blue-200',
      300: 'bg-blue-300',
      400: 'bg-blue-400',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
      800: 'bg-blue-800',
      900: 'bg-blue-900',
      950: 'bg-blue-900',
    },
    dark: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      200: 'bg-blue-200',
      300: 'bg-blue-300',
      400: 'bg-blue-400',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
      800: 'bg-blue-800',
      900: 'bg-blue-900',
      950: 'bg-blue-900',
    },
  },
  secondary: {
    light: {
      50: 'bg-purple-50',
      100: 'bg-purple-100',
      200: 'bg-purple-200',
      300: 'bg-purple-300',
      400: 'bg-purple-400',
      500: 'bg-purple-500',
      600: 'bg-purple-600',
      700: 'bg-purple-700',
      800: 'bg-purple-800',
      900: 'bg-purple-900',
      950: 'bg-purple-900',
    },
    dark: {
      50: 'bg-purple-50',
      100: 'bg-purple-100',
      200: 'bg-purple-200',
      300: 'bg-purple-300',
      400: 'bg-purple-400',
      500: 'bg-purple-500',
      600: 'bg-purple-600',
      700: 'bg-purple-700',
      800: 'bg-purple-800',
      900: 'bg-purple-900',
      950: 'bg-purple-900',
    },
  },
} as const;

/**
 * Pre-defined color combinations for common use cases
 * Provides consistent styling across components
 */
export const COLOR_COMBINATIONS: Record<
  SemanticPurpose,
  {
    background: string;
    text: string;
    border: string;
    button: string;
    badge: string;
    alert: string;
  }
> = {
  primary: {
    background: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-700 dark:text-primary-300',
    border: 'border-primary-200 dark:border-primary-800',
    button: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50',
    badge: 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white',
    alert: 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 border-primary-200 dark:border-primary-800',
  },
  success: {
    background: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    button: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50',
    badge: 'bg-green-700 text-white dark:bg-green-600 dark:text-white',
    alert: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  },
  error: {
    background: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    button: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50',
    badge: 'bg-red-700 text-white dark:bg-red-600 dark:text-white',
    alert: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  },
  warning: {
    background: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    button: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500/50',
    badge: 'bg-yellow-600 text-white dark:bg-yellow-500 dark:text-white',
    alert: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  },
  info: {
    background: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
    button: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50',
    badge: 'bg-blue-700 text-white dark:bg-blue-600 dark:text-white',
    alert: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  neutral: {
    background: 'bg-neutral-50 dark:bg-neutral-900/50',
    text: 'text-neutral-700 dark:text-neutral-300',
    border: 'border-neutral-200 dark:border-neutral-700',
    button: 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600',
    badge: 'bg-neutral-700 text-white dark:bg-neutral-600 dark:text-white',
    alert: 'bg-neutral-50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
  },
  secondary: {
    background: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    button: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500/50',
    badge: 'bg-purple-700 text-white dark:bg-purple-600 dark:text-white',
    alert: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
} as const;

/**
 * Get color classes for a specific purpose and usage
 *
 * @example
 *   getColorClasses('success', 'background')
 *   // Returns: 'bg-green-50 dark:bg-green-900/20'
 *
 *   getColorClasses('error', 'button')
 *   // Returns: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
 */
export function getColorClasses(purpose: SemanticPurpose, usage: ColorUsage): string {
  return COLOR_COMBINATIONS[purpose][usage];
}

/**
 * Get semantic color scale for a purpose
 *
 * @example
 *   getColorScale('success')
 *   // Returns: 'success'
 */
export function getColorScale(purpose: SemanticPurpose): ColorScale {
  return SEMANTIC_COLORS[purpose];
}

/**
 * Check if a color is dark (for text contrast decisions)
 */
export function isDarkColor(purpose: SemanticPurpose, shade: ColorShade): boolean {
  const darkThresholds: Record<ColorScale, number> = {
    neutral: 600,
    primary: 600,
    success: 600,
    error: 600,
    warning: 600,
    info: 600,
    secondary: 600,
  };

  const scale = getColorScale(purpose);
  return shade >= darkThresholds[scale];
}

/**
 * Get text color class based on background color
 * Automatically determines light or dark text for contrast
 */
export function getTextColorForBackground(purpose: SemanticPurpose, shade: ColorShade): string {
  return isDarkColor(purpose, shade) ? 'text-white' : 'text-neutral-900';
}

/**
 * Color scale aliases for backward compatibility
 * Maps deprecated colors to their new semantic equivalents
 */
export const COLOR_ALIASES: Record<string, SemanticPurpose> = {
  emerald: 'success',
  teal: 'success',
  sky: 'info',
  indigo: 'info',
  cyan: 'info',
  rose: 'error',
  amber: 'warning',
  pink: 'secondary',
} as const;

/**
 * Migration helper: Get semantic purpose from deprecated color
 */
export function migrateColorScale(deprecatedScale: string): SemanticPurpose {
  return COLOR_ALIASES[deprecatedScale] || 'neutral';
}

/**
 * Enhanced UI state colors with micro-interactions - Palette 🎨
 * Provides consistent color utilities for enhanced UX
 */
export const ENHANCED_UI_COLORS = {
  // Hover states with subtle transitions
  hover: {
    lift: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    glow: {
      primary: 'hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:shadow-primary-500/20 hover:shadow-lg',
      success: 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-green-500/20 hover:shadow-lg',
      warning: 'hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:shadow-amber-500/20 hover:shadow-lg',
      error: 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-red-500/20 hover:shadow-lg',
      info: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-blue-500/20 hover:shadow-lg',
    },
  },

  // Active states with tactile feedback
  active: {
    press: 'active:scale-95 active:bg-neutral-100 dark:active:bg-neutral-700 transition-all duration-150',
    sink: 'active:translate-y-0.5 active:shadow-sm transition-all duration-150',
  },

  // Focus states with accessibility improvements
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
    colored: {
      primary: 'focus:ring-primary-500/50',
      success: 'focus:ring-green-500/50',
      warning: 'focus:ring-amber-500/50',
      error: 'focus:ring-red-500/50',
      info: 'focus:ring-blue-500/50',
      neutral: 'focus:ring-neutral-500/50',
    },
  },

  // Selection states for interactive elements
  selected: {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700',
    secondary: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600',
  },

  // Disabled states with proper contrast
  disabled: {
    opacity: 'opacity-50 cursor-not-allowed',
    subtle: 'opacity-60 cursor-not-allowed hover:opacity-60',
    interactive: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:scale-100',
  },

  // Loading states with visual feedback
  loading: {
    skeleton: 'bg-neutral-200 dark:bg-neutral-700 animate-pulse',
    shimmer: 'bg-gradient-to-r from-transparent via-neutral-200 to-transparent animate-shimmer',
    spinner: {
      primary: 'text-primary-600 dark:text-primary-400',
      secondary: 'text-neutral-600 dark:text-neutral-400',
      white: 'text-white',
    },
  },

  // Gradient overlays for depth
  overlay: {
    glass: 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-white/20 dark:border-neutral-700/20',
    subtle: 'bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800',
    vignette: 'bg-gradient-to-t from-black/20 via-transparent to-transparent',
  },

  // Shadow system for depth hierarchy
  depth: {
    flat: 'shadow-none',
    raised: 'shadow-sm',
    elevated: 'shadow-md',
    floating: 'shadow-lg',
    modal: 'shadow-xl',
    popup: 'shadow-2xl',
  },
} as const;

/**
 * Accessibility color utilities for enhanced contrast
 */
export const ACCESSIBILITY_COLORS = {
  // High contrast for better visibility
  highContrast: {
    text: 'text-black dark:text-white',
    background: 'bg-white dark:bg-black',
    border: 'border-black dark:border-white',
    focus: 'focus:ring-2 focus:ring-black dark:focus:ring-white',
  },

  // Color blind friendly combinations
  colorblindSafe: {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-blue-600 text-white',
    info: 'bg-orange-600 text-white',
  },

  // Reduced motion friendly
  reducedMotion: {
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
    hover: 'hover:opacity-80',
    active: 'active:opacity-60',
  },
} as const;

/**
 * Component-specific color enhancements
 */
export const COMPONENT_COLOR_ENHANCEMENTS: {
  button: string;
  input: {
    default: string;
    error: string;
    success: string;
  };
  card: {
    default: string;
    interactive: string;
  };
  navigation: {
    active: string;
    hover: string;
    focus: string;
  };
} = {
  // Enhanced button states
  button: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 active:bg-neutral-100 dark:active:bg-neutral-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:scale-100',

  // Enhanced input states
  input: {
    default: 'focus:ring-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:shadow-primary-500/20 hover:shadow-lg',
    error: 'focus:ring-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-red-500/20 hover:shadow-lg',
    success: 'focus:ring-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-green-500/20 hover:shadow-lg',
  },

  // Enhanced card states
  card: {
    default: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm',
    interactive: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-lg',
  },

  // Enhanced navigation states
  navigation: {
    active: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700',
    hover: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
  },
} as const;

/**
 * Get enhanced UI color classes for specific purposes
 */
export function getEnhancedColorClasses(type: keyof typeof ENHANCED_UI_COLORS, subtype?: string): string {
  const colorSet = ENHANCED_UI_COLORS[type];
  
  if (subtype && typeof colorSet === 'object' && subtype in colorSet) {
    return (colorSet as Record<string, string>)[subtype];
  }
  
  if (typeof colorSet === 'string') {
    return colorSet;
  }
  
  return '';
}

/**
 * Get component enhancement color classes
 */
export function getComponentColorClasses(component: keyof typeof COMPONENT_COLOR_ENHANCEMENTS): string {
  const classes = COMPONENT_COLOR_ENHANCEMENTS[component];
  if (typeof classes === 'string') {
    return classes;
  }
  // For object types, return default class based on component type
  if (component === 'input') {
    return (classes as { default: string; error: string; success: string }).default;
  }
  if (component === 'card') {
    return (classes as { default: string; interactive: string }).default;
  }
  if (component === 'navigation') {
    return (classes as { active: string; hover: string; focus: string }).hover;
  }
  return '';
}
