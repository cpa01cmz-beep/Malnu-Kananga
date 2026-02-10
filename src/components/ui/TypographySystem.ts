/**
 * Enhanced Typography and Spacing System
 * Comprehensive type scale, line heights, and spacing utilities
 */

// Type scale
export const typeScale = {
  // Display sizes
  'display-xs': {
    fontSize: '2.5rem',    // 40px
    lineHeight: '3rem',    // 48px
    letterSpacing: '-0.025em',
    fontWeight: 800,
  },
  'display-sm': {
    fontSize: '3rem',      // 48px
    lineHeight: '3.75rem', // 60px
    letterSpacing: '-0.025em',
    fontWeight: 800,
  },
  'display-md': {
    fontSize: '3.75rem',   // 60px
    lineHeight: '4.5rem',  // 72px
    letterSpacing: '-0.025em',
    fontWeight: 800,
  },
  'display-lg': {
    fontSize: '4.5rem',    // 72px
    lineHeight: '5.625rem', // 90px
    letterSpacing: '-0.025em',
    fontWeight: 800,
  },
  'display-xl': {
    fontSize: '6rem',      // 96px
    lineHeight: '7.5rem',  // 120px
    letterSpacing: '-0.025em',
    fontWeight: 800,
  },

  // Heading sizes
  'heading-6xl': {
    fontSize: '3.75rem',   // 60px
    lineHeight: '4.5rem',  // 72px
    letterSpacing: '-0.025em',
    fontWeight: 700,
  },
  'heading-5xl': {
    fontSize: '3rem',      // 48px
    lineHeight: '3.75rem', // 60px
    letterSpacing: '-0.025em',
    fontWeight: 700,
  },
  'heading-4xl': {
    fontSize: '2.25rem',   // 36px
    lineHeight: '2.75rem',  // 44px
    letterSpacing: '-0.025em',
    fontWeight: 700,
  },
  'heading-3xl': {
    fontSize: '1.875rem',  // 30px
    lineHeight: '2.25rem',  // 36px
    letterSpacing: '-0.025em',
    fontWeight: 700,
  },
  'heading-2xl': {
    fontSize: '1.5rem',    // 24px
    lineHeight: '2rem',    // 32px
    letterSpacing: '-0.025em',
    fontWeight: 700,
  },
  'heading-xl': {
    fontSize: '1.25rem',   // 20px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '-0.025em',
    fontWeight: 600,
  },
  'heading-lg': {
    fontSize: '1.125rem',  // 18px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '-0.025em',
    fontWeight: 600,
  },
  'heading-md': {
    fontSize: '1rem',      // 16px
    lineHeight: '1.5rem',   // 24px
    letterSpacing: '0em',
    fontWeight: 600,
  },
  'heading-sm': {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.25rem',  // 20px
    letterSpacing: '0em',
    fontWeight: 600,
  },
  'heading-xs': {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem',    // 16px
    letterSpacing: '0.025em',
    fontWeight: 600,
  },

  // Body text sizes
  'body-lg': {
    fontSize: '1.125rem',  // 18px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '0em',
    fontWeight: 400,
  },
  'body-md': {
    fontSize: '1rem',      // 16px
    lineHeight: '1.5rem',   // 24px
    letterSpacing: '0em',
    fontWeight: 400,
  },
  'body-sm': {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.25rem',  // 20px
    letterSpacing: '0em',
    fontWeight: 400,
  },
  'body-xs': {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem',    // 16px
    letterSpacing: '0.025em',
    fontWeight: 400,
  },

  // Caption and label sizes
  'caption-md': {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.25rem',  // 20px
    letterSpacing: '0.025em',
    fontWeight: 500,
  },
  'caption-sm': {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem',    // 16px
    letterSpacing: '0.025em',
    fontWeight: 500,
  },
  'caption-xs': {
    fontSize: '0.625rem',   // 10px
    lineHeight: '0.875rem', // 14px
    letterSpacing: '0.05em',
    fontWeight: 500,
  },
} as const;

// Line height scale
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

// Letter spacing scale
export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Font weights
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// Spacing scale (8pt grid system)
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  4.5: '1.125rem',   // 18px
  5: '1.25rem',      // 20px
  5.5: '1.375rem',   // 22px
  6: '1.5rem',       // 24px
  6.5: '1.625rem',   // 26px
  7: '1.75rem',      // 28px
  7.5: '1.875rem',   // 30px
  8: '2rem',         // 32px
  8.5: '2.125rem',   // 34px
  9: '2.25rem',      // 36px
  9.5: '2.375rem',   // 38px
  10: '2.5rem',      // 40px
  10.5: '2.625rem',  // 42px
  11: '2.75rem',     // 44px
  11.5: '2.875rem',  // 46px
  12: '3rem',        // 48px
  13: '3.25rem',     // 52px
  14: '3.5rem',      // 56px
  15: '3.75rem',     // 60px
  16: '4rem',        // 64px
  17: '4.25rem',     // 68px
  18: '4.5rem',      // 72px
  19: '4.75rem',     // 76px
  20: '5rem',        // 80px
  21: '5.25rem',     // 84px
  22: '5.5rem',      // 88px
  23: '5.75rem',     // 92px
  24: '6rem',        // 96px
  25: '6.25rem',     // 100px
  26: '6.5rem',      // 104px
  27: '6.75rem',     // 108px
  28: '7rem',        // 112px
  29: '7.25rem',     // 116px
  30: '7.5rem',      // 120px
  31: '7.75rem',     // 124px
  32: '8rem',        // 128px
  33: '8.25rem',     // 132px
  34: '8.5rem',      // 136px
  35: '8.75rem',     // 140px
  36: '9rem',        // 144px
  37: '9.25rem',     // 148px
  38: '9.5rem',      // 152px
  39: '9.75rem',     // 156px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px
} as const;

// Responsive spacing breakpoints
export const responsiveSpacing = {
  mobile: {
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[3],
    lg: spacing[4],
    xl: spacing[6],
    '2xl': spacing[8],
  },
  tablet: {
    xs: spacing[2],
    sm: spacing[3],
    md: spacing[4],
    lg: spacing[6],
    xl: spacing[8],
    '2xl': spacing[12],
  },
  desktop: {
    xs: spacing[3],
    sm: spacing[4],
    md: spacing[6],
    lg: spacing[8],
    xl: spacing[12],
    '2xl': spacing[16],
  },
} as const;

// Typography utilities
export const getTypographyClasses = (
  size: keyof typeof typeScale,
  weight?: keyof typeof fontWeights,
  leading?: keyof typeof lineHeights,
  tracking?: keyof typeof letterSpacings
): string => {
  const typography = typeScale[size];
  const fontWeight = weight ? fontWeights[weight] : typography.fontWeight;
  const lineHeight = leading ? lineHeights[leading] : typography.lineHeight;
  const letterSpacing = tracking ? letterSpacings[tracking] : typography.letterSpacing;

  return `
    text-[${typography.fontSize}]
    leading-[${lineHeight}]
    tracking-[${letterSpacing}]
    font-[${fontWeight}]
  `;
};

// Spacing utilities
export const getSpacingClasses = (
  property: 'm' | 'p' | 'mx' | 'my' | 'mt' | 'mr' | 'mb' | 'ml',
  size: keyof typeof spacing
): string => {
  return `${property}-[${spacing[size]}]`;
};

// Responsive typography utilities
export const getResponsiveTypographyClasses = (
  mobileSize: keyof typeof typeScale,
  tabletSize?: keyof typeof typeScale,
  desktopSize?: keyof typeof typeScale
): string => {
  const classes = [getTypographyClasses(mobileSize)];
  
  if (tabletSize) {
    classes.push(`sm:${getTypographyClasses(tabletSize)}`);
  }
  
  if (desktopSize) {
    classes.push(`lg:${getTypographyClasses(desktopSize)}`);
  }
  
  return classes.join(' ');
};

// Container max widths
export const containerMaxWidths = {
  xs: '20rem',     // 320px
  sm: '24rem',     // 384px
  md: '28rem',     // 448px
  lg: '32rem',     // 512px
  xl: '36rem',     // 576px
  '2xl': '42rem',  // 672px
  '3xl': '48rem',  // 768px
  '4xl': '56rem',  // 896px
  '5xl': '64rem',  // 1024px
  '6xl': '72rem',  // 1152px
  '7xl': '80rem',  // 1280px
  full: '100%',
} as const;

// Breakpoint utilities
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// CSS custom properties for typography and spacing
export const generateTypographyCSS = (): string => {
  const cssVariables: string[] = [];
  
  // Type scale variables
  Object.entries(typeScale).forEach(([name, styles]) => {
    cssVariables.push(`  --font-size-${name}: ${styles.fontSize};`);
    cssVariables.push(`  --line-height-${name}: ${styles.lineHeight};`);
    cssVariables.push(`  --letter-spacing-${name}: ${styles.letterSpacing};`);
    cssVariables.push(`  --font-weight-${name}: ${styles.fontWeight};`);
  });
  
  // Spacing variables
  Object.entries(spacing).forEach(([name, value]) => {
    cssVariables.push(`  --spacing-${name}: ${value};`);
  });
  
  // Line height variables
  Object.entries(lineHeights).forEach(([name, value]) => {
    cssVariables.push(`  --leading-${name}: ${value};`);
  });
  
  // Letter spacing variables
  Object.entries(letterSpacings).forEach(([name, value]) => {
    cssVariables.push(`  --tracking-${name}: ${value};`);
  });
  
  // Font weight variables
  Object.entries(fontWeights).forEach(([name, value]) => {
    cssVariables.push(`  --font-weight-${name}: ${value};`);
  });
  
  return `
:root {
${cssVariables.join('\n')}
  }
  `;
};

// Type definitions
export type TypeScale = keyof typeof typeScale;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacings;
export type FontWeight = keyof typeof fontWeights;
export type Spacing = keyof typeof spacing;
export type ResponsiveSpacing = keyof typeof responsiveSpacing;
export type ContainerMaxWidth = keyof typeof containerMaxWidths;
export type Breakpoint = keyof typeof breakpoints;