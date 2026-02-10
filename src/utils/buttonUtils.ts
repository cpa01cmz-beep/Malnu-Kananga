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
  "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 disabled:border-neutral-200 dark:disabled:border-neutral-700 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 relative overflow-hidden group shadow-sm hover:shadow-lg active:shadow-sm border border-transparent backdrop-blur-sm",
  { variant: 'primary', requiresHaptic: true }
);

/**
 * Variant class definitions
 */
export const BUTTON_VARIANT_CLASSES = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 shadow-md hover:shadow-lg hover:shadow-primary-500/20 border-primary-600 hover:border-primary-700",
  secondary: "bg-white/95 dark:bg-neutral-800/95 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:shadow-md",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-700/80 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-neutral-500/50 hover:shadow-sm",
  destructive: "bg-red-600 text-white dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500/50 shadow-md hover:shadow-lg hover:shadow-red-500/20 border-red-600 hover:border-red-700 dark:border-red-500 dark:hover:border-red-600",
  outline: "bg-transparent text-neutral-600 dark:text-neutral-400 border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50/80 dark:hover:bg-neutral-700/80 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:shadow-md",
} as const;

/**
 * Intent class definitions
 */
export const BUTTON_INTENT_CLASSES = {
  default: "",
  success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50",
  warning: "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500/50",
  info: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50",
} as const;