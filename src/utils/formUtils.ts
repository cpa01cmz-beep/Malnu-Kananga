import { UI_SPACING } from '../constants';
import { buildIconClasses } from './iconUtils';

/**
 * Form field styling utilities with consistent spacing and mobile enhancements
 */

export const FORM_FIELD_BASE_CLASSES = "w-full rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:border-transparent";

export const FORM_FIELD_SIZES = {
  sm: `${UI_SPACING.PADDING_COMPACT} text-sm min-h-[40px]`,
  md: `${UI_SPACING.PADDING_NORMAL} text-base min-h-[44px]`, // Touch-friendly minimum
  lg: `${UI_SPACING.PADDING_COMFORTABLE} text-lg min-h-[48px]`,
} as const;

export const FORM_FIELD_STATES = {
  default: `border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 bg-white dark:bg-neutral-800`,
  error: `border-red-500 text-red-900 placeholder-red-300 dark:text-red-100 dark:placeholder-red-400 bg-red-50 dark:bg-red-900/20 focus:ring-red-500`,
  success: `border-green-500 text-green-900 placeholder-green-300 dark:text-green-100 dark:placeholder-green-400 bg-green-50 dark:bg-green-900/20 focus:ring-green-500`,
  disabled: `bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-60 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400`,
} as const;

export const FORM_FIELD_FOCUS = "focus:ring-primary-500 focus:border-primary-500";

export const FORM_LABEL_CLASSES = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1";

export const FORM_ERROR_CLASSES = "text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1";

export const FORM_SUCCESS_CLASSES = "text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1";

/**
 * Build consistent form field classes
 */
export function buildFormFieldClasses(options: {
  size?: keyof typeof FORM_FIELD_SIZES;
  state?: keyof typeof FORM_FIELD_STATES;
  disabled?: boolean;
  className?: string;
}) {
  const {
    size = 'md',
    state = 'default',
    disabled = false,
    className = ''
  } = options;

  const stateClasses = disabled ? FORM_FIELD_STATES.disabled : FORM_FIELD_STATES[state];
  
  return [
    FORM_FIELD_BASE_CLASSES,
    FORM_FIELD_SIZES[size],
    stateClasses,
    FORM_FIELD_FOCUS,
    className
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Validation feedback styling utilities
 */
export const VALIDATION_FEEDBACK_CLASSES = {
  base: "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200 animate-fade-in",
  success: "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
  error: "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
  info: "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
} as const;

/**
 * Icon sizing for validation indicators
 */
export const VALIDATION_ICON_SIZE = buildIconClasses({ size: 'md' });
export const VALIDATION_FEEDBACK_ICON_SIZE = buildIconClasses({ size: 'sm' });