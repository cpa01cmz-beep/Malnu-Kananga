/**
 * Comprehensive Design System Utilities - Palette 🎨
 * Centralized design tokens and utilities for consistent UI/UX
 */

export const DESIGN_SYSTEM = {
  // Spacing System - 8px grid
  spacing: {
    0: '0px',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    32: '8rem',    // 128px
  },

  // Typography Scale
  typography: {
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Animation Easing Curves
  easing: {
    // Linear
    linear: 'linear',
    // Ease-out for entrance animations
    easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    // Ease-in for exit animations  
    easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    // Ease-in-out for transitions
    easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    // Custom curves for specific interactions
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    subtle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Animation Durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '750ms',
  },

  // Border Radius Scale
  borderRadius: {
    none: '0px',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  },

  // Touch Target Sizes (WCAG compliant)
  touchTargets: {
    min: '2.75rem',    // 44px minimum
    comfortable: '3rem', // 48px comfortable
    large: '3.5rem',   // 56px large
  },

  // Z-index Scale
  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    skipLink: '1600',
    toast: '1700',
    tooltip: '1800',
    maximum: '9999',
  },

  // Focus Ring Styles
  focusRing: {
    offset: '2px',
    width: '2px',
    colors: {
      primary: 'rgba(79, 70, 229, 0.5)',
      secondary: 'rgba(107, 114, 128, 0.5)',
      error: 'rgba(239, 68, 68, 0.5)',
      warning: 'rgba(245, 158, 11, 0.5)',
      success: 'rgba(34, 197, 94, 0.5)',
    },
  },

  // Shadow Scale
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Backdrop Blur Levels
  backdropBlur: {
    none: 'none',
    sm: 'blur(4px)',
    base: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
    '3xl': 'blur(64px)',
  },
} as const;

// Utility Functions for Generating CSS Classes
export const cssUtils = {
  // Generate spacing class
  spacing: (value: keyof typeof DESIGN_SYSTEM.spacing) => DESIGN_SYSTEM.spacing[value],
  
  // Generate responsive spacing
  responsiveSpacing: (values: { base?: keyof typeof DESIGN_SYSTEM.spacing, sm?: keyof typeof DESIGN_SYSTEM.spacing, md?: keyof typeof DESIGN_SYSTEM.spacing, lg?: keyof typeof DESIGN_SYSTEM.spacing }) => {
    const classes = [];
    if (values.base) classes.push(DESIGN_SYSTEM.spacing[values.base]);
    // Note: In actual implementation, you'd combine with Tailwind responsive prefixes
    return classes.join(' ');
  },

  // Generate transition class
  transition: (properties: string[], duration: keyof typeof DESIGN_SYSTEM.duration = 'normal', easing: keyof typeof DESIGN_SYSTEM.easing = 'easeInOut') => 
    `${properties.join(', ')} ${DESIGN_SYSTEM.duration[duration]} ${DESIGN_SYSTEM.easing[easing]}`,

  // Generate focus ring class
  focusRing: (color: keyof typeof DESIGN_SYSTEM.focusRing.colors = 'primary') => 
    `focus:outline-none focus:ring-${DESIGN_SYSTEM.focusRing.width} focus:ring-${DESIGN_SYSTEM.focusRing.colors[color]} focus:ring-offset-${DESIGN_SYSTEM.focusRing.offset}`,

  // Generate touch target class
  touchTarget: (size: keyof typeof DESIGN_SYSTEM.touchTargets = 'min') => 
    `min-w-[${DESIGN_SYSTEM.touchTargets[size]}] min-h-[${DESIGN_SYSTEM.touchTargets[size]}]`,

  // Generate animation keyframes
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    slideInFromBottom: {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
    slideInFromTop: {
      from: { transform: 'translateY(-100%)' },
      to: { transform: 'translateY(0)' },
    },
    scaleIn: {
      from: { transform: 'scale(0.9)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: DESIGN_SYSTEM.easing.bounce },
      '50%': { transform: 'translateY(0)', animationTimingFunction: DESIGN_SYSTEM.easing.easeOut },
    },
  },
};

// Type definitions for better TypeScript support
export type SpacingValue = keyof typeof DESIGN_SYSTEM.spacing;
export type TypographySize = keyof typeof DESIGN_SYSTEM.typography.fontSize;
export type FontWeight = keyof typeof DESIGN_SYSTEM.typography.fontWeight;
export type LineHeight = keyof typeof DESIGN_SYSTEM.typography.lineHeight;
export type EasingCurve = keyof typeof DESIGN_SYSTEM.easing;
export type Duration = keyof typeof DESIGN_SYSTEM.duration;
export type BorderRadius = keyof typeof DESIGN_SYSTEM.borderRadius;
export type TouchTargetSize = keyof typeof DESIGN_SYSTEM.touchTargets;
export type ZIndex = keyof typeof DESIGN_SYSTEM.zIndex;
export type FocusRingColor = keyof typeof DESIGN_SYSTEM.focusRing.colors;
export type Shadow = keyof typeof DESIGN_SYSTEM.shadows;
export type BackdropBlur = keyof typeof DESIGN_SYSTEM.backdropBlur;

// Component-specific design tokens
export const componentDesign = {
  button: {
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    padding: {
      sm: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[4]}`,
      md: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[6]}`,
      lg: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[8]}`,
    },
    fontSize: {
      sm: DESIGN_SYSTEM.typography.fontSize.sm,
      md: DESIGN_SYSTEM.typography.fontSize.base,
      lg: DESIGN_SYSTEM.typography.fontSize.lg,
    },
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    transition: cssUtils.transition(['all'], 'fast', 'smooth'),
    focusRing: cssUtils.focusRing('primary'),
    touchTarget: cssUtils.touchTarget('min'),
    shadow: {
      default: DESIGN_SYSTEM.shadows.sm,
      hover: DESIGN_SYSTEM.shadows.md,
      active: DESIGN_SYSTEM.shadows.inner,
    },
  },

  input: {
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    padding: {
      sm: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[3]}`,
      md: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[4]}`,
      lg: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[5]}`,
    },
    fontSize: {
      sm: DESIGN_SYSTEM.typography.fontSize.sm,
      md: DESIGN_SYSTEM.typography.fontSize.base,
      lg: DESIGN_SYSTEM.typography.fontSize.lg,
    },
    transition: cssUtils.transition(['border-color', 'box-shadow', 'transform'], 'normal', 'easeInOut'),
    focusRing: cssUtils.focusRing('primary'),
    touchTarget: cssUtils.touchTarget('min'),
  },

  modal: {
    borderRadius: DESIGN_SYSTEM.borderRadius['2xl'],
    padding: DESIGN_SYSTEM.spacing[6],
    backdropBlur: DESIGN_SYSTEM.backdropBlur.md,
    shadow: DESIGN_SYSTEM.shadows['2xl'],
    transition: cssUtils.transition(['opacity', 'transform'], 'fast', 'smooth'),
  },

  card: {
    borderRadius: DESIGN_SYSTEM.borderRadius.xl,
    padding: DESIGN_SYSTEM.spacing[6],
    shadow: {
      default: DESIGN_SYSTEM.shadows.sm,
      hover: DESIGN_SYSTEM.shadows.lg,
    },
    transition: cssUtils.transition(['transform', 'box-shadow'], 'normal', 'smooth'),
  },
} as const;

// Responsive breakpoint utilities
const responsiveBreakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const responsive = {
  breakpoints: responsiveBreakpoints,
  
  // Generate media query
  up: (breakpoint: keyof typeof responsiveBreakpoints) => 
    `@media (min-width: ${responsiveBreakpoints[breakpoint]})`,
    
  down: (breakpoint: keyof typeof responsiveBreakpoints) => 
    `@media (max-width: ${responsiveBreakpoints[breakpoint]})`,
    
  between: (start: keyof typeof responsiveBreakpoints, end: keyof typeof responsiveBreakpoints) => 
    `@media (min-width: ${responsiveBreakpoints[start]}) and (max-width: ${responsiveBreakpoints[end]})`,
} as const;

// Dark mode utilities
export const darkMode = {
  // Dark mode color adjustments
  colors: {
    background: {
      light: 'rgb(255, 255, 255)',
      dark: 'rgb(17, 24, 39)',
    },
    text: {
      light: 'rgb(17, 24, 39)', 
      dark: 'rgb(243, 244, 246)',
    },
    border: {
      light: 'rgb(229, 231, 235)',
      dark: 'rgb(55, 65, 81)',
    },
  },
  
  // Smooth dark mode transition
  transition: cssUtils.transition(['background-color', 'border-color', 'color'], 'normal', 'easeInOut'),
} as const;

export default DESIGN_SYSTEM;