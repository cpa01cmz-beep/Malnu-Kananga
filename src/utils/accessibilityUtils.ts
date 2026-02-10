/**
 * Accessibility utilities for enhanced focus management and ARIA support
 */

export const FOCUS_STYLES = {
  base: "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  primary: "focus-visible:ring-primary-500/50 dark:focus-visible:ring-offset-neutral-900",
  secondary: "focus-visible:ring-secondary-500/50 dark:focus-visible:ring-offset-neutral-900",
  success: "focus-visible:ring-green-500/50 dark:focus-visible:ring-offset-neutral-900",
  warning: "focus-visible:ring-orange-500/50 dark:focus-visible:ring-offset-neutral-900",
  error: "focus-visible:ring-red-500/50 dark:focus-visible:ring-offset-neutral-900",
  info: "focus-visible:ring-blue-500/50 dark:focus-visible:ring-offset-neutral-900",
} as const;

export const FOCUS_VISIBLE_CLASSES = "focus-visible";

export const SKIP_LINK_CLASSES = "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary-500";

/**
 * Build consistent focus classes
 */
export function buildFocusClasses(options: {
  variant?: keyof typeof FOCUS_STYLES;
  custom?: string;
}) {
  const {
    variant = 'primary',
    custom = ''
  } = options;

  return [
    FOCUS_STYLES.base,
    FOCUS_STYLES[variant],
    custom
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Screen reader utilities
 */
export const SCREEN_READER_ONLY = "sr-only";
export const SCREEN_READER_FOCUSABLE = "sr-only focus:not-sr-only focus:absolute";

/**
 * ARIA utilities
 */
export function buildAriaAttributes(options: {
  label?: string;
  labelledby?: string;
  describedby?: string;
  required?: boolean;
  invalid?: boolean;
  expanded?: boolean;
  hidden?: boolean;
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  busy?: boolean;
}) {
  const aria: Record<string, string | boolean> = {};

  if (options.label) aria['aria-label'] = options.label;
  if (options.labelledby) aria['aria-labelledby'] = options.labelledby;
  if (options.describedby) aria['aria-describedby'] = options.describedby;
  if (options.required !== undefined) aria['aria-required'] = options.required;
  if (options.invalid !== undefined) aria['aria-invalid'] = options.invalid;
  if (options.expanded !== undefined) aria['aria-expanded'] = options.expanded;
  if (options.hidden !== undefined) aria['aria-hidden'] = options.hidden;
  if (options.live) aria['aria-live'] = options.live;
  if (options.atomic !== undefined) aria['aria-atomic'] = options.atomic;
  if (options.busy !== undefined) aria['aria-busy'] = options.busy;

  return aria;
}

/**
 * Role utilities
 */
export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  banner: 'banner',
  search: 'search',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  tooltip: 'tooltip',
  listbox: 'listbox',
  option: 'option',
  combobox: 'combobox',
  textbox: 'textbox',
  checkbox: 'checkbox',
  radio: 'radio',
  switch: 'switch',
  slider: 'slider',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
} as const;

/**
 * Keyboard navigation utilities
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Enhanced focus management for interactive elements
 */
export function enhanceInteractiveElement(baseClasses: string, options: {
  variant?: keyof typeof FOCUS_STYLES;
  requiresHaptic?: boolean;
} = {}) {
  const { variant = 'primary', requiresHaptic = false } = options;
  
  const classes = [
    baseClasses,
    buildFocusClasses({ variant }),
    'touch-manipulation', // Better touch interaction
    requiresHaptic ? 'haptic-feedback' : '',
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

  return classes;
}

/**
 * Generate unique IDs for accessibility
 */
export function generateAccessibleId(prefix: string, suffix?: string) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}${suffix ? `-${suffix}` : ''}`;
}

/**
 * High contrast mode support
 */
export const HIGH_CONTRAST_CLASSES = {
  text: 'dark:contrast-more:dark:text-white',
  border: 'dark:contrast-more:dark:border-white',
  background: 'dark:contrast-more:dark:bg-black',
} as const;