/**
 * Typography system utilities with consistent sizing and mobile optimization
 */

export const TYPOGRAPHY_SIZES = {
  // Text sizes
  xs: 'text-xs',     // 12px
  sm: 'text-sm',     // 14px
  base: 'text-base', // 16px
  lg: 'text-lg',     // 18px
  xl: 'text-xl',     // 20px
  '2xl': 'text-2xl', // 24px
  '3xl': 'text-3xl', // 30px
  '4xl': 'text-4xl', // 36px
  '5xl': 'text-5xl', // 48px
  '6xl': 'text-6xl', // 60px
  '7xl': 'text-7xl', // 72px
  '8xl': 'text-8xl', // 96px
  
  // Hero-specific sizes
  hero: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
  subtitle: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
} as const;

export const TYPOGRAPHY_WEIGHTS = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
} as const;

export const TYPOGRAPHY_LEADING = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const;

export const TYPOGRAPHY_TRACKING = {
  tighter: 'tracking-tighter',
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
} as const;

/**
 * Responsive typography utilities
 */
export function buildResponsiveTypography(base: string, sm?: string, md?: string, lg?: string, xl?: string) {
  const classes = [base];
  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  if (xl) classes.push(`xl:${xl}`);
  return classes.join(' ');
}

/**
 * Common typography patterns
 */
export const TYPOGRAPHY_PATTERNS = {
  heading: {
    h1: `${TYPOGRAPHY_WEIGHTS.bold} ${TYPOGRAPHY_LEADING.tight} ${TYPOGRAPHY_TRACKING.tight}`,
    h2: `${TYPOGRAPHY_WEIGHTS.semibold} ${TYPOGRAPHY_LEADING.tight} ${TYPOGRAPHY_TRACKING.tight}`,
    h3: `${TYPOGRAPHY_WEIGHTS.semibold} ${TYPOGRAPHY_LEADING.snug} ${TYPOGRAPHY_TRACKING.tight}`,
    h4: `${TYPOGRAPHY_WEIGHTS.medium} ${TYPOGRAPHY_LEADING.snug} ${TYPOGRAPHY_TRACKING.normal}`,
  },
  body: {
    default: `${TYPOGRAPHY_WEIGHTS.normal} ${TYPOGRAPHY_LEADING.normal}`,
    large: `${TYPOGRAPHY_WEIGHTS.medium} ${TYPOGRAPHY_LEADING.relaxed}`,
    small: `${TYPOGRAPHY_WEIGHTS.normal} ${TYPOGRAPHY_LEADING.snug}`,
  },
  display: {
    hero: `${TYPOGRAPHY_WEIGHTS.bold} ${TYPOGRAPHY_LEADING.none} ${TYPOGRAPHY_TRACKING.tight}`,
    subtitle: `${TYPOGRAPHY_WEIGHTS.medium} ${TYPOGRAPHY_LEADING.relaxed} ${TYPOGRAPHY_TRACKING.tight}`,
  },
} as const;

/**
 * Build typography classes with consistent patterns
 */
export function buildTypographyClasses(options: {
  size?: keyof typeof TYPOGRAPHY_SIZES | string;
  weight?: keyof typeof TYPOGRAPHY_WEIGHTS;
  leading?: keyof typeof TYPOGRAPHY_LEADING;
  tracking?: keyof typeof TYPOGRAPHY_TRACKING;
  responsive?: {
    sm?: keyof typeof TYPOGRAPHY_SIZES;
    md?: keyof typeof TYPOGRAPHY_SIZES;
    lg?: keyof typeof TYPOGRAPHY_SIZES;
    xl?: keyof typeof TYPOGRAPHY_SIZES;
  };
}) {
  const {
    size = 'base',
    weight,
    leading,
    tracking,
    responsive
  } = options;

  const baseSize = typeof size === 'string' && size in TYPOGRAPHY_SIZES ? TYPOGRAPHY_SIZES[size as keyof typeof TYPOGRAPHY_SIZES] : size;
  
  let classes = [baseSize];
  
  if (weight) classes.push(TYPOGRAPHY_WEIGHTS[weight]);
  if (leading) classes.push(TYPOGRAPHY_LEADING[leading]);
  if (tracking) classes.push(TYPOGRAPHY_TRACKING[tracking]);

  // Add responsive sizes
  if (responsive) {
    if (responsive.sm) classes.push(`sm:${TYPOGRAPHY_SIZES[responsive.sm]}`);
    if (responsive.md) classes.push(`md:${TYPOGRAPHY_SIZES[responsive.md]}`);
    if (responsive.lg) classes.push(`lg:${TYPOGRAPHY_SIZES[responsive.lg]}`);
    if (responsive.xl) classes.push(`xl:${TYPOGRAPHY_SIZES[responsive.xl]}`);
  }

  return classes.join(' ').replace(/\s+/g, ' ').trim();
}