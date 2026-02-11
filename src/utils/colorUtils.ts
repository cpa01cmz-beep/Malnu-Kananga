/**
 * Enhanced Color contrast utilities for WCAG compliance and visual accessibility
 */

export const CONTRAST_RATIOS = {
  WCAG_AA_NORMAL: 4.5,      // 7:1 contrast ratio
  WCAG_AA_LARGE: 3.0,       // 4.5:1 contrast ratio
  WCAG_AAA_NORMAL: 7.0,      // 7:1 contrast ratio
  WCAG_AAA_LARGE: 4.5,       // 4.5:1 contrast ratio
} as const;

export const TEXT_SIZES = {
  LARGE: '18px',              // 14pt bold or 18pt normal
  NORMAL: '16px',            // Default body text
  SMALL: '14px',             // Small text
} as const;

// Enhanced color intensity types
export type ColorIntensity = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type SemanticColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Color combinations that meet WCAG AA standards
 */
export const ACCESSIBLE_COLOR_COMBINATIONS = {
  primary: {
    background: 'bg-primary-600',
    text: 'text-white',
    hover: 'hover:bg-primary-700',
    focus: 'focus:ring-primary-500/50',
  },
  secondary: {
    background: 'bg-white dark:bg-neutral-800',
    text: 'text-neutral-700 dark:text-neutral-200',
    border: 'border-neutral-200 dark:border-neutral-600',
    hover: 'hover:bg-neutral-50 dark:hover:bg-neutral-700',
    focus: 'focus:ring-primary-500/50',
  },
  success: {
    background: 'bg-green-600',
    text: 'text-white',
    hover: 'hover:bg-green-700',
    focus: 'focus:ring-green-500/50',
  },
  warning: {
    background: 'bg-orange-600',
    text: 'text-white',
    hover: 'hover:bg-orange-700',
    focus: 'focus:ring-orange-500/50',
  },
  error: {
    background: 'bg-red-600',
    text: 'text-white',
    hover: 'hover:bg-red-700',
    focus: 'focus:ring-red-500/50',
  },
  info: {
    background: 'bg-blue-600',
    text: 'text-white',
    hover: 'hover:bg-blue-700',
    focus: 'focus:ring-blue-500/50',
  },
} as const;

/**
 * Build accessible color combinations
 */
export function buildAccessibleColorClasses(intent: keyof typeof ACCESSIBLE_COLOR_COMBINATIONS, variant: 'solid' | 'outline' | 'ghost' = 'solid') {
  const colors = ACCESSIBLE_COLOR_COMBINATIONS[intent];
  
  switch (variant) {
    case 'outline':
      return [
        `text-${intent}-600 dark:text-${intent}-400`,
        `border-${intent}-300 dark:border-${intent}-600`,
        `hover:bg-${intent}-50 dark:hover:bg-${intent}-900/20`,
        `hover:border-${intent}-500`,
        colors.focus,
      ].join(' ');
      
    case 'ghost':
      return [
        `text-${intent}-600 dark:text-${intent}-400`,
        `hover:bg-${intent}-50 dark:hover:bg-${intent}-900/20`,
        colors.focus,
      ].join(' ');
      
    default:
      return [
        colors.background,
        colors.text,
        colors.hover,
        colors.focus,
      ].join(' ');
  }
}

/**
 * High contrast mode utilities
 */
export const HIGH_CONTRAST_MODE = {
  enabled: 'dark:contrast-more',
  text: 'dark:contrast-more:dark:text-white',
  border: 'dark:contrast-more:dark:border-white',
  background: 'dark:contrast-more:dark:bg-black',
  interactive: 'dark:contrast-more:dark:bg-white dark:contrast-more:dark:text-black',
} as const;

/**
 * Reduced motion utilities for accessibility
 */
export const MOTION_PREFERENCES = {
  reduced: 'motion-reduce',
  reducedClasses: 'motion-reduce:transition-none motion-reduce:transform-none',
  noAnimation: 'motion-reduce:animate-none',
} as const;

/**
 * Enhanced contrast classes for better readability
 */
export const ENHANCED_CONTRAST = {
  text: {
    primary: 'text-neutral-900 dark:text-white',
    secondary: 'text-neutral-700 dark:text-neutral-200',
    muted: 'text-neutral-500 dark:text-neutral-400',
  },
  background: {
    primary: 'bg-white dark:bg-neutral-900',
    secondary: 'bg-neutral-50 dark:bg-neutral-800',
    muted: 'bg-neutral-100 dark:bg-neutral-700',
  },
  border: {
    primary: 'border-neutral-300 dark:border-neutral-600',
    secondary: 'border-neutral-200 dark:border-neutral-700',
    muted: 'border-neutral-100 dark:border-neutral-800',
  },
} as const;

/**
 * Build contrast-enhanced text classes
 */
export function buildContrastClasses(element: 'text' | 'background' | 'border', level: keyof typeof ENHANCED_CONTRAST.text) {
  const contrastMap = ENHANCED_CONTRAST[element] as Record<keyof typeof ENHANCED_CONTRAST.text, string>;
  return contrastMap[level];
}

/**
 * Color blind friendly palette adjustments
 */
export const COLOR_BLIND_FRIENDLY = {
  patterns: {
    avoidRedGreen: 'focus:ring-blue-500', // Use blue instead of red/green for focus
    usePatterns: 'border-2', // Add borders to colors that might be confusing
    enhanceBlueYellow: 'text-blue-600', // Ensure blues are strong enough
  },
  alternatives: {
    success: 'bg-blue-600', // Blue instead of green
    error: 'bg-orange-600',   // Orange instead of red
  },
} as const;

/**
 * Validate color combinations for accessibility
 */
export function isAccessibleCombination(
  foreground: string,
  background: string,
  _isLargeText = false
): boolean {
  // This is a simplified check - in production, you'd use a proper contrast calculation
  const _threshold = CONTRAST_RATIOS.WCAG_AA_NORMAL;
  
  // List of known accessible combinations
  const accessibleCombos = [
    ['text-white', 'bg-primary-600'],
    ['text-white', 'bg-green-600'],
    ['text-white', 'bg-red-600'],
    ['text-white', 'bg-blue-600'],
    ['text-white', 'bg-orange-600'],
    ['text-neutral-700', 'bg-white'],
    ['text-neutral-200', 'bg-neutral-800'],
  ];
  
  return accessibleCombos.some(([fg, bg]) => 
    fg === foreground && bg === background
  );
}