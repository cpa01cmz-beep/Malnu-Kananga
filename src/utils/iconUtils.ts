/**
 * Icon sizing utilities for consistent visual hierarchy and accessibility
 */

export const ICON_SIZES = {
  xs: 'w-3 h-3',      // 12px
  sm: 'w-4 h-4',      // 16px
  md: 'w-5 h-5',      // 20px
  lg: 'w-6 h-6',      // 24px
  xl: 'w-8 h-8',      // 32px
  '2xl': 'w-10 h-10', // 40px
  '3xl': 'w-12 h-12', // 48px
  '4xl': 'w-16 h-16', // 64px
} as const;

export const ICON_TOUCH_SIZES = {
  sm: 'w-8 h-8',      // 32px - minimum touch target
  md: 'w-10 h-10',    // 40px - comfortable touch
  lg: 'w-12 h-12',    // 48px - large touch target
  xl: 'w-14 h-14',    // 56px - extra large
} as const;

/**
 * Icon size mapping for different contexts
 */
export const CONTEXTUAL_ICON_SIZES = {
  // Button icons
  buttonSmall: ICON_SIZES.sm,
  buttonMedium: ICON_SIZES.md,
  buttonLarge: ICON_SIZES.lg,
  
  // Navigation icons
  navigation: ICON_SIZES.md,
  mobileNavigation: ICON_TOUCH_SIZES.md,
  
  // Status indicators
  status: ICON_SIZES.sm,
  statusLarge: ICON_SIZES.md,
  
  // Form icons
  formField: ICON_SIZES.md,
  formLabel: ICON_SIZES.sm,
  
  // Card/Content icons
  card: ICON_SIZES.lg,
  cardLarge: ICON_SIZES.xl,
  
  // Hero/Display icons
  hero: ICON_SIZES['2xl'],
  heroLarge: ICON_SIZES['3xl'],
  
  // Utility icons
  utility: ICON_SIZES.sm,
  utilityLarge: ICON_SIZES.md,
} as const;

/**
 * Responsive icon sizing
 */
export const RESPONSIVE_ICON_SIZES = {
  auto: `${ICON_SIZES.sm} sm:${ICON_SIZES.md} md:${ICON_SIZES.lg}`,
  button: `${ICON_SIZES.sm} sm:${ICON_SIZES.md}`,
  navigation: `${ICON_TOUCH_SIZES.sm} sm:${ICON_SIZES.md} md:${ICON_SIZES.lg}`,
} as const;

/**
 * Build icon classes with consistent sizing
 */
export function buildIconClasses(options: {
  size?: keyof typeof ICON_SIZES | string;
  touchTarget?: boolean;
  responsive?: boolean;
  className?: string;
}) {
  const {
    size = 'md',
    touchTarget = false,
    responsive = false,
    className = ''
  } = options;

  let sizeClass = '';
  
  if (typeof size === 'string' && size in ICON_SIZES) {
    sizeClass = ICON_SIZES[size as keyof typeof ICON_SIZES];
  } else if (typeof size === 'string' && size in ICON_TOUCH_SIZES) {
    sizeClass = ICON_TOUCH_SIZES[size as keyof typeof ICON_TOUCH_SIZES];
  } else if (typeof size === 'string' && size in CONTEXTUAL_ICON_SIZES) {
    sizeClass = CONTEXTUAL_ICON_SIZES[size as keyof typeof CONTEXTUAL_ICON_SIZES];
  } else if (typeof size === 'string' && size in RESPONSIVE_ICON_SIZES) {
    sizeClass = RESPONSIVE_ICON_SIZES[size as keyof typeof RESPONSIVE_ICON_SIZES];
  } else {
    sizeClass = size; // Custom size
  }

  const classes = [
    sizeClass,
    touchTarget ? 'touch-manipulation' : '',
    responsive ? 'transition-all duration-200' : '',
    className
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

  return classes;
}

/**
 * Icon accessibility utilities
 */
export const ICON_ACCESSIBILITY = {
  decorative: 'aria-hidden="true"',
  semantic: '',
  button: 'role="img"',
  status: 'role="img" aria-live="polite"',
} as const;

/**
 * Build icon accessibility attributes
 */
export function buildIconAccessibility(options: {
  decorative?: boolean;
  label?: string;
  role?: 'img' | 'status';
  describedBy?: string;
}) {
  const {
    decorative = false,
    label,
    role,
    describedBy
  } = options;

  const attributes: Record<string, string | boolean> = {};

  if (decorative) {
    attributes['aria-hidden'] = 'true';
  } else if (label) {
    attributes['aria-label'] = label;
  }

  if (role) {
    attributes['role'] = role;
  }

  if (describedBy) {
    attributes['aria-describedby'] = describedBy;
  }

  if (role === 'status') {
    attributes['aria-live'] = 'polite';
  }

  return attributes;
}

/**
 * Icon animation utilities
 */
export const ICON_ANIMATIONS = {
  spin: 'animate-spin',
  ping: 'animate-ping',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  fade: 'animate-fade-in',
  scale: 'animate-scale-in',
  slide: 'animate-slide-in',
} as const;

/**
 * Build icon with animation
 */
export function buildAnimatedIconClasses(baseClasses: string, animation?: keyof typeof ICON_ANIMATIONS) {
  if (!animation) return baseClasses;
  
  return `${baseClasses} ${ICON_ANIMATIONS[animation]}`;
}