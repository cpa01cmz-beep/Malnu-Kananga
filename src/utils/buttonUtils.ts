import { UI_SPACING } from '../constants';
import { enhanceInteractiveElement } from './accessibilityUtils';

/**
 * Utility function to build consistent button class names
 * Eliminates hardcoded values and ensures mobile-first accessibility
 */
export function buildButtonClasses(options: {
  baseClasses: string;
  variantClasses?: string;
  sizeClasses: string;
  fullWidth?: boolean;
  isLoading?: boolean;
  hasDisabledReason?: boolean;
  className?: string;
}) {
  const {
    baseClasses,
    variantClasses = '',
    sizeClasses,
    fullWidth = false,
    isLoading = false,
    hasDisabledReason = false,
    className = ''
  } = options;

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    fullWidth ? 'w-full' : '',
    isLoading ? 'cursor-wait' : '',
    hasDisabledReason ? 'group relative' : '',
    className
  ].filter(Boolean).join(' ');

  return classes.replace(/\s+/g, ' ').trim();
}

/**
 * Size class mapping using spacing constants
 */
export const BUTTON_SIZE_CLASSES = {
  icon: `p-3 text-sm ${UI_SPACING.TOUCH_TARGET_MIN} sm:${UI_SPACING.TOUCH_TARGET_NORMAL}`,
  sm: `px-4 py-2.5 text-sm min-h-[52px] sm:min-h-[56px] mobile-touch-target`,
  md: `px-5 py-3 text-sm sm:text-base min-h-[56px] sm:min-h-[60px] mobile-touch-target`,
  lg: `px-6 py-4 text-base sm:text-lg min-h-[60px] sm:min-h-[64px] mobile-touch-target`,
} as const;

/**
 * Icon-only size class mapping using spacing constants
 */
export const BUTTON_ICON_ONLY_SIZES = {
  icon: `p-3 ${UI_SPACING.TOUCH_TARGET_MIN} sm:${UI_SPACING.TOUCH_TARGET_NORMAL}`,
  sm: `p-3 min-w-[52px] min-h-[52px] sm:min-w-[56px] sm:min-h-[56px]`,
  md: `p-3 min-w-[56px] min-h-[56px] sm:min-w-[60px] sm:min-h-[60px]`,
  lg: `p-4 min-w-[60px] min-h-[60px] sm:min-w-[64px] sm:min-h-[64px]`,
} as const;

/**
 * Base button classes with mobile enhancements
 */
export const BUTTON_BASE_CLASSES = enhanceInteractiveElement(
  "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out disabled:opacity-60 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 disabled:border-neutral-200 dark:disabled:border-neutral-700 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 relative overflow-hidden group shadow-sm hover:shadow-lg active:shadow-sm border border-transparent backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98]",
  { variant: 'primary', requiresHaptic: true }
);

/**
 * Variant class definitions
 */
export const BUTTON_VARIANT_CLASSES = {
  primary: "bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 focus:ring-primary-500/50 shadow-md hover:shadow-lg hover:shadow-primary-500/25 border-primary-600 hover:border-primary-700 transition-all duration-300 ease-out",
  secondary: "bg-white/95 dark:bg-neutral-800/95 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:shadow-md transition-all duration-250 ease-out",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-700/80 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-neutral-500/50 hover:shadow-sm transition-all duration-200 ease-out",
  destructive: "bg-gradient-to-r from-red-600 to-red-500 text-white dark:from-red-500 dark:to-red-400 hover:from-red-700 hover:to-red-600 dark:hover:from-red-600 dark:hover:to-red-500 focus:ring-red-500/50 shadow-md hover:shadow-lg hover:shadow-red-500/25 border-red-600 hover:border-red-700 dark:border-red-500 dark:hover:border-red-600 transition-all duration-300 ease-out",
  outline: "bg-transparent text-neutral-600 dark:text-neutral-400 border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50/80 dark:hover:bg-neutral-700/80 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:shadow-md transition-all duration-250 ease-out",
} as const;

/**
 * Intent class definitions
 */
export const BUTTON_INTENT_CLASSES = {
  default: "",
  success: "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 focus:ring-green-500/50 shadow-md hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 ease-out",
  warning: "bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 focus:ring-orange-500/50 shadow-md hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 ease-out",
  info: "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 focus:ring-blue-500/50 shadow-md hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ease-out",
} as const;